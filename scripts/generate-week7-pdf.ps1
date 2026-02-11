param(
    [string]$HtmlPath = "week7_logic_beginner_guide.html",
    [string]$PdfPath = "week7_logic_beginner_guide.pdf"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Escape-PdfText {
    param([string]$Text)

    return $Text.Replace('\', '\\').Replace('(', '\(').Replace(')', '\)')
}

function Wrap-TextLine {
    param(
        [string]$Line,
        [int]$MaxChars = 100
    )

    if ([string]::IsNullOrWhiteSpace($Line)) {
        return @("")
    }

    $words = $Line -split '\s+'
    $result = New-Object System.Collections.Generic.List[string]
    $current = ""

    foreach ($word in $words) {
        if ($current.Length -eq 0) {
            $current = $word
            continue
        }

        $candidate = "$current $word"
        if ($candidate.Length -le $MaxChars) {
            $current = $candidate
        } else {
            $result.Add($current)
            $current = $word
        }
    }

    if ($current.Length -gt 0) {
        $result.Add($current)
    }

    return $result.ToArray()
}

function Convert-HtmlToPlainText {
    param([string]$HtmlRaw)

    $plain = $HtmlRaw
    $plain = [regex]::Replace($plain, '(?is)<style.*?</style>', '')
    $plain = [regex]::Replace($plain, '(?is)<script.*?</script>', '')
    $plain = $plain -replace '(?i)<br\s*/?>', "`n"
    $plain = $plain -replace '(?i)</(p|h1|h2|h3|li|ul|ol|div|section|head|title|body|html)>', "`n"
    $plain = $plain -replace '(?i)<li>', "- "
    $plain = $plain -replace '(?i)<[^>]+>', ''
    $plain = [System.Net.WebUtility]::HtmlDecode($plain)

    # Keep ASCII-only for a clean minimal PDF text stream.
    $plain = [regex]::Replace($plain, '[^\u0000-\u007F]', '')

    $lines = $plain -split "`r?`n"
    $cleanLines = New-Object System.Collections.Generic.List[string]
    $lastWasBlank = $false

    foreach ($line in $lines) {
        $trim = $line.Trim()

        if ($trim.Length -eq 0) {
            if (-not $lastWasBlank) {
                $cleanLines.Add("")
                $lastWasBlank = $true
            }
            continue
        }

        $cleanLines.Add($trim)
        $lastWasBlank = $false
    }

    return $cleanLines.ToArray()
}

if (-not (Test-Path $HtmlPath)) {
    throw "Input HTML file not found: $HtmlPath"
}

$htmlRaw = Get-Content -Raw -Path $HtmlPath
$plainLines = Convert-HtmlToPlainText -HtmlRaw $htmlRaw

$wrapped = New-Object System.Collections.Generic.List[string]
foreach ($line in $plainLines) {
    foreach ($part in (Wrap-TextLine -Line $line -MaxChars 102)) {
        $wrapped.Add($part)
    }
}

# Pagination setup for A4 portrait.
$linesPerPage = 52
$pages = @()
for ($i = 0; $i -lt $wrapped.Count; $i += $linesPerPage) {
    $pages += ,($wrapped[$i..([Math]::Min($i + $linesPerPage - 1, $wrapped.Count - 1))])
}

$objects = New-Object System.Collections.Generic.List[pscustomobject]

function Add-PdfObject {
    param([int]$Id, [string]$Content)
    $script:objects.Add([pscustomobject]@{ Id = $Id; Content = $Content })
}

$catalogId = 1
$pagesId = 2
$nextId = 3
$pageObjectIds = New-Object System.Collections.Generic.List[int]
$contentObjectIds = New-Object System.Collections.Generic.List[int]

foreach ($page in $pages) {
    $pageId = $nextId
    $nextId++
    $contentId = $nextId
    $nextId++

    $pageObjectIds.Add($pageId)
    $contentObjectIds.Add($contentId)
}

$fontId = $nextId

# Content objects
for ($p = 0; $p -lt $pages.Count; $p++) {
    $lines = $pages[$p]
    $contentLines = New-Object System.Collections.Generic.List[string]
    $contentLines.Add("BT")
    $contentLines.Add("/F1 11 Tf")
    $contentLines.Add("14 TL")
    $contentLines.Add("46 800 Td")

    for ($i = 0; $i -lt $lines.Count; $i++) {
        $escaped = Escape-PdfText -Text $lines[$i]
        $contentLines.Add("($escaped) Tj")
        if ($i -lt $lines.Count - 1) {
            $contentLines.Add("T*")
        }
    }

    $contentLines.Add("ET")
    $stream = ($contentLines -join "`n")
    $streamAscii = [System.Text.Encoding]::ASCII.GetBytes($stream)
    $length = $streamAscii.Length
    $contentObj = "<< /Length $length >>`nstream`n$stream`nendstream"
    Add-PdfObject -Id $contentObjectIds[$p] -Content $contentObj
}

# Page objects
for ($p = 0; $p -lt $pages.Count; $p++) {
    $pageObj = "<< /Type /Page /Parent $pagesId 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 $fontId 0 R >> >> /Contents $($contentObjectIds[$p]) 0 R >>"
    Add-PdfObject -Id $pageObjectIds[$p] -Content $pageObj
}

# Pages object
$kids = ($pageObjectIds | ForEach-Object { "$_ 0 R" }) -join " "
$pagesObj = "<< /Type /Pages /Count $($pageObjectIds.Count) /Kids [ $kids ] >>"
Add-PdfObject -Id $pagesId -Content $pagesObj

# Font + catalog
Add-PdfObject -Id $fontId -Content "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
Add-PdfObject -Id $catalogId -Content "<< /Type /Catalog /Pages $pagesId 0 R >>"

$sorted = $objects | Sort-Object Id

$pdfBuilder = New-Object System.Text.StringBuilder
[void]$pdfBuilder.Append("%PDF-1.4`n")

$offsets = @{}
foreach ($obj in $sorted) {
    $offsets[$obj.Id] = [System.Text.Encoding]::ASCII.GetByteCount($pdfBuilder.ToString())
    [void]$pdfBuilder.Append("$($obj.Id) 0 obj`n")
    [void]$pdfBuilder.Append($obj.Content)
    [void]$pdfBuilder.Append("`nendobj`n")
}

$xrefOffset = [System.Text.Encoding]::ASCII.GetByteCount($pdfBuilder.ToString())
$maxId = ($sorted | Measure-Object -Property Id -Maximum).Maximum

[void]$pdfBuilder.Append("xref`n")
[void]$pdfBuilder.Append("0 $($maxId + 1)`n")
[void]$pdfBuilder.Append("0000000000 65535 f `n")

for ($id = 1; $id -le $maxId; $id++) {
    $off = $offsets[$id]
    if ($null -eq $off) {
        [void]$pdfBuilder.Append("0000000000 00000 f `n")
    } else {
        [void]$pdfBuilder.Append(("{0:D10} 00000 n `n" -f [int]$off))
    }
}

[void]$pdfBuilder.Append("trailer << /Size $($maxId + 1) /Root $catalogId 0 R >>`n")
[void]$pdfBuilder.Append("startxref`n$xrefOffset`n")
[void]$pdfBuilder.Append("%%EOF")

$ascii = [System.Text.Encoding]::ASCII.GetBytes($pdfBuilder.ToString())
[System.IO.File]::WriteAllBytes((Resolve-Path ".").Path + [System.IO.Path]::DirectorySeparatorChar + $PdfPath, $ascii)

Write-Output "PDF generated: $PdfPath"
