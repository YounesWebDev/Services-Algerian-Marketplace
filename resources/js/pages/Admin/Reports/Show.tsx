import { Head, useForm } from "@inertiajs/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { close as reportClose, index as reportsIndex } from "@/routes/admin/reports";
type Report = {
  id: number;
  target_type: "service" | "provider" | "request";
  target_id: number;
  reason: string;
  description?: string | null;
  status: "open" | "closed";
  created_at: string;
  reporter: { name: string };
};

export default function Show({
  report,
  targetTitle,
}: {
  report: Report;
  targetTitle?: string | null;
}) {
  const { post, processing, errors } = useForm({});
  const formErrors = errors as {
    report?: string;
  };

  const typeLabel =
    report.target_type === "service"
      ? "Service"
      : report.target_type === "provider"
      ? "Provider"
      : "Request";

  const close = () => {
    post(reportClose(report.id).url);
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Reports", href: reportsIndex().url },
        { title: `Report #${report.id}`, href: reportsIndex().url },
      ]}
    >
      <Head title={`Report #${report.id}`} />

      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Report #{report.id}</h1>
            <p className="text-sm text-muted-foreground">
              {typeLabel} #{report.target_id} • {targetTitle ?? "Unknown target"}
            </p>
          </div>

          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Details</CardTitle>
              <Badge variant={report.status === "open" ? "destructive" : "secondary"}>
                {report.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Reporter:</span>{" "}
              <span className="font-medium">{report.reporter.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Reason:</span>{" "}
              <span className="font-medium">{report.reason}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Description:</span>{" "}
              <span className="font-medium">
                {report.description ?? "—"}
              </span>
            </div>

            {formErrors.report && (
              <p className="text-sm font-medium text-red-600">{formErrors.report}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Admin action</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.status === "closed" ? (
              <p className="text-sm text-muted-foreground">This report is closed.</p>
            ) : (
              <Button disabled={processing} onClick={close}>
                Close report
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

