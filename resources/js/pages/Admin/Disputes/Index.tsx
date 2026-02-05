import { Head, Link } from "@inertiajs/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import PaginationLinks from "@/components/pagination-links";
import { index as disputesIndex, show as disputesShow } from "@/routes/admin/disputes";

type Dispute = {
  id: number;
  reason: string;
  status: "open" | "resolved";
  created_at: string;
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
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function Index({
  disputes,
  filters,
}: {
  disputes: { data: Dispute[]; links: PaginationLink[] };
  filters: { status: string };
}) {
  return (
    <AppLayout>
      <Head title="Disputes" />

      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Disputes</h1>
            <p className="text-sm text-muted-foreground">
              Handle booking problems (admin resolution).
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant={filters.status === "open" ? "default" : "outline"} asChild>
              <Link href={disputesIndex({ query: { status: "open" } }).url}>Open</Link>
            </Button>
            <Button variant={filters.status === "resolved" ? "default" : "outline"} asChild>
              <Link href={disputesIndex({ query: { status: "resolved" } }).url}>Resolved</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>List</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {disputes.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">No disputes found.</p>
            ) : (
              <div className="space-y-3">
                {disputes.data.map((d) => {
                  const title =
                    d.booking.source === "service"
                      ? d.booking.service?.title ?? "Service booking"
                      : d.booking.offer?.request?.title ?? "Request-offer booking";

                  return (
                    <div
                      key={d.id}
                      className="flex items-start justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-medium truncate">
                            Dispute #{d.id} • Booking #{d.booking.id}
                          </div>
                          <Badge variant={d.status === "open" ? "destructive" : "secondary"}>
                            {d.status}
                          </Badge>
                        </div>

                        <div className="text-sm text-muted-foreground truncate">{title}</div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Reason:</span>{" "}
                          <span className="font-medium">{d.reason}</span>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Client: {d.booking.client.name} • Provider: {d.booking.provider.name} •{" "}
                          {d.booking.total_amount} {d.booking.currency}
                        </div>
                      </div>

                      <Button asChild>
                        <Link href={disputesShow(d.id).url}>Open</Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {disputes.links?.length > 1 && (
              <div className="pt-3">
                <PaginationLinks links={disputes.links} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}


