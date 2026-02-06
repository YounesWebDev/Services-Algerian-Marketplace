import { Head, Link } from "@inertiajs/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as reportsIndex, show as reportsShow } from "@/routes/admin/reports";
type Report = {
  id: number;
  target_type: "service" | "provider" | "request";
  target_id: number;
  reason: string;
  description?: string | null;
  status: "open" | "closed";
  created_at: string;
  target_title?: string | null;
  reporter: { name: string };
};

export default function Index({
  reports,
  filters,
}: {
  reports: { data: Report[] };
  filters: { status: string };
}) {
  const typeLabel = (t: Report["target_type"]) =>
    t === "service" ? "Service" : t === "provider" ? "Provider" : "Request";

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Reports", href: reportsIndex().url },
      ]}
    >
      <Head title="Reports" />

      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Reports</h1>
            <p className="text-sm text-muted-foreground">
              Moderation reports (spam, scam, abuse).
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant={filters.status === "open" ? "default" : "outline"} asChild>
              <Link href={reportsIndex({ query: { status: "open" } }).url}>Open</Link>
            </Button>
            <Button variant={filters.status === "closed" ? "default" : "outline"} asChild>
              <Link href={reportsIndex({ query: { status: "closed" } }).url}>Closed</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>List</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {reports.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reports found.</p>
            ) : (
              <div className="space-y-3">
                {reports.data.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-start justify-between gap-4 rounded-lg border p-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate">Report #{r.id}</div>
                        <Badge variant={r.status === "open" ? "destructive" : "secondary"}>
                          {r.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground truncate">
                        {typeLabel(r.target_type)} #{r.target_id} •{" "}
                        {r.target_title ?? "Unknown target"}
                      </div>

                      <div className="text-sm">
                        <span className="text-muted-foreground">Reason:</span>{" "}
                        <span className="font-medium">{r.reason}</span>
                      </div>

                      {r.description ? (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Description:</span>{" "}
                          <span className="font-medium">{r.description}</span>
                        </div>
                      ) : null}

                      <div className="text-xs text-muted-foreground">
                        Reporter: {r.reporter.name}
                      </div>
                    </div>

                    <Button asChild>
                      <Link href={reportsShow(r.id).url}>Open</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
