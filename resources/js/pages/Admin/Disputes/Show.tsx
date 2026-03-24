import { Head, useForm } from "@inertiajs/react";

import InputError from "@/components/input-error";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as disputesIndex, resolve as disputesResolve } from "@/routes/admin/disputes";
type Dispute = {
  id: number;
  reason: string;
  description?: string | null;
  status: "open" | "resolved";
  resolution_note?: string | null;
  opened_by: number;
  resolved_by?: number | null;

  booking: {
    id: number;
    source: "service" | "request_offer";
    status: string;
    total_amount: string | number;
    currency: string;
    service?: { title: string; slug: string } | null;
    offer?: { request?: { title: string } | null } | null;
    client: { name: string };
    provider: { name: string };
  };

  opener?: { name: string } | null;
  resolver?: { name: string } | null;
};

export default function Show({ dispute }: { dispute: Dispute }) {
  const { data, setData, post, processing, errors } = useForm({
    resolution_note: "",
  });
  const formErrors = errors as {
    resolution_note?: string;
    dispute?: string;
  };

  const title =
    dispute.booking.source === "service"
      ? dispute.booking.service?.title ?? "Service booking"
      : dispute.booking.offer?.request?.title ?? "Request-offer booking";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    post(disputesResolve(dispute.id).url);
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Disputes", href: disputesIndex().url },
        { title: `Dispute #${dispute.id}`, href: disputesIndex().url },
      ]}
    >
      <Head title={`Dispute #${dispute.id}`} />

      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Dispute #{dispute.id}</h1>
            <p className="text-sm text-muted-foreground">
              Booking #{dispute.booking.id} • {title}
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
              <Badge variant={dispute.status === "open" ? "destructive" : "secondary"}>
                {dispute.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Client:</span>{" "}
              <span className="font-medium">{dispute.booking.client.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Provider:</span>{" "}
              <span className="font-medium">{dispute.booking.provider.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Booking status:</span>{" "}
              <span className="font-medium">{dispute.booking.status}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>{" "}
              <span className="font-medium">
                {dispute.booking.total_amount} {dispute.booking.currency}
              </span>
            </div>

            <div className="pt-2">
              <div className="text-muted-foreground">Reason</div>
              <div className="font-medium">{dispute.reason}</div>
            </div>

            <div>
              <div className="text-muted-foreground">Description</div>
              <div className="whitespace-pre-line">
                {dispute.description ? dispute.description : <span className="italic">No description</span>}
              </div>
            </div>

            {formErrors.dispute && (
              <p className="text-sm font-medium text-red-600">{formErrors.dispute}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resolution</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {dispute.status === "resolved" ? (
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Resolved by:</span>{" "}
                  <span className="font-medium">{dispute.resolver?.name ?? "Admin"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Note:</span>
                  <div className="whitespace-pre-line mt-1">
                    {dispute.resolution_note ?? "—"}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resolution_note">Resolution note</Label>
                  <Textarea
                    id="resolution_note"
                    value={data.resolution_note}
                    onChange={(e) => setData("resolution_note", e.target.value)}
                    rows={6}
                    placeholder="Explain the decision: refund, partial refund, warning, payout hold, etc..."
                    required
                  />
                  <InputError message={formErrors.resolution_note} />
                </div>

                <Button disabled={processing}>Resolve dispute</Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
