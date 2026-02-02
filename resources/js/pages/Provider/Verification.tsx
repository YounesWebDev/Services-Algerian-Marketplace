import { Head, Link, useForm, usePage } from "@inertiajs/react";

import InputError from "@/components/input-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { store as providerVerificationStore } from "@/routes/provider/verification";

type Verification = {
  id: number;
  doc_type: string;
  doc_number: string;
  doc_path: string;
  status: "pending" | "approved" | "rejected";
  created_at?: string | null;
  updated_at?: string | null;
} | null;

type PageProps = {
  verification: Verification;
  is_verified: boolean;
  flash?: { success?: string };
  errors?: { verification?: string };
};

const publicFilePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

function statusBadge(status: string) {
  if (status === "approved") return <Badge>Approved</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function ProviderVerification() {
  const { props } = usePage<PageProps>();

  const verification = props.verification;
  const isVerified = props.is_verified;

  // middleware errors like withErrors(['verification' => '...'])
  const middlewareError = props.errors?.verification;

  const flashSuccess = props.flash?.success;

  const form = useForm<{
    doc_type: string;
    doc_number: string;
    doc_file: File | null;
  }>({
    doc_type: verification?.doc_type ?? "",
    doc_number: verification?.doc_number ?? "",
    doc_file: null,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    form.post(providerVerificationStore().url, {
      forceFormData: true,
      preserveScroll: true,
    });
  };

  const canSubmit =
    !isVerified && (!verification || verification.status !== "pending");

  const docUrl = publicFilePath(verification?.doc_path ?? null);

  return (
    <AppLayout>
      <Head title="Provider verification" />

      <div className="p-6 max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Provider verification</h1>
            <p className="text-sm text-muted-foreground">
              To use provider features (create services, send offers, manage bookings),
              you must verify your account.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href={dashboard().url}>Skip for now</Link>
          </Button>
        </div>

        {middlewareError ? (
          <Alert variant="destructive">
            <AlertTitle>Verification required</AlertTitle>
            <AlertDescription>{middlewareError}</AlertDescription>
          </Alert>
        ) : null}

        {flashSuccess ? (
          <Alert>
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{flashSuccess}</AlertDescription>
          </Alert>
        ) : null}

        {/* Current status card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div className="font-medium">Current status</div>
              {isVerified ? <Badge>Verified</Badge> : <Badge variant="outline">Not verified</Badge>}
            </div>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            {verification ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Submission:</span>
                  {statusBadge(verification.status)}
                </div>

                <div>
                  <span className="text-muted-foreground">Document type:</span>{" "}
                  <span className="font-medium">{verification.doc_type}</span>
                </div>

                <div>
                  <span className="text-muted-foreground">Document number:</span>{" "}
                  <span className="font-medium">{verification.doc_number}</span>
                </div>

                {docUrl ? (
                  <div>
                    <span className="text-muted-foreground">Uploaded file:</span>{" "}
                    <a className="underline" href={docUrl} target="_blank" rel="noreferrer">
                      View
                    </a>
                    <span className="text-muted-foreground"> / </span>
                    <a className="underline" href={docUrl} download>
                      Download
                    </a>
                  </div>
                ) : null}

                {verification.status === "pending" ? (
                  <p className="text-muted-foreground">
                    Your verification is pending. Please wait for admin review.
                  </p>
                ) : null}

                {verification.status === "rejected" ? (
                  <Alert variant="destructive">
                    <AlertTitle>Rejected</AlertTitle>
                    <AlertDescription>
                      Your verification was rejected. Please submit again with correct details.
                    </AlertDescription>
                  </Alert>
                ) : null}

                {verification.status === "approved" ? (
                  <Alert>
                    <AlertTitle>Approved</AlertTitle>
                    <AlertDescription>
                      Your verification is approved. You can use all provider features now.
                    </AlertDescription>
                  </Alert>
                ) : null}
              </>
            ) : (
              <p className="text-muted-foreground">
                You have not submitted verification yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Submit form */}
        <Card>
          <CardHeader>
            <div className="font-medium">Submit verification</div>
          </CardHeader>

          <CardContent className="space-y-4">
            {!canSubmit ? (
              <Alert>
                <AlertTitle>Submission disabled</AlertTitle>
                <AlertDescription>
                  {isVerified
                    ? "You are already verified."
                    : "You already have a pending verification request."}
                </AlertDescription>
              </Alert>
            ) : null}

            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="doc_type">Document type</Label>
                <Input
                  id="doc_type"
                  value={form.data.doc_type}
                  onChange={(e) => form.setData("doc_type", e.target.value)}
                  placeholder="Example: National ID, Passport..."
                  disabled={!canSubmit}
                />
                <InputError message={form.errors.doc_type} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="doc_number">Document number</Label>
                <Input
                  id="doc_number"
                  value={form.data.doc_number}
                  onChange={(e) => form.setData("doc_number", e.target.value)}
                  placeholder="Enter the number on your document"
                  disabled={!canSubmit}
                />
                <InputError message={form.errors.doc_number} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="doc_file">Upload document</Label>
                <Input
                  id="doc_file"
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/webp,application/pdf"
                  onChange={(e) => form.setData("doc_file", e.target.files?.[0] ?? null)}
                  disabled={!canSubmit}
                />
                <InputError message={form.errors.doc_file} />
                <p className="text-xs text-muted-foreground">
                  Accepted: PNG/JPG/WEBP/PDF up to 4MB.
                </p>
              </div>

              <div className="flex gap-2">
                <Button disabled={!canSubmit || form.processing}>
                  Submit
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset("doc_file")}
                  disabled={!canSubmit || form.processing}
                >
                  Reset file
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
