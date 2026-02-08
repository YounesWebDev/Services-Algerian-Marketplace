import { Head, Link } from "@inertiajs/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as providerPayoutsIndex, show as providerPayoutsShow } from "@/routes/provider/payouts";

type Payout = {
  id: number;
  amount: string | number;
  status: "pending" | "sent" | string;
  sent_at: string | null;
  method: string | null;
  metadata: unknown;
  created_at: string | null;
};

type Props = {
  payouts: {
    data: Payout[];
    links: Array<{ url: string | null; label: string; active: boolean }>;
    meta?: unknown;
  };
  filters: {
    status?: string;
    q?: string;
  };
  earnings: {
    online: number;
    cash: number;
    total: number;
  };
};

const money = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v ?? NaN);
  if (Number.isFinite(n)) return `${n.toFixed(2)} DZD`;
  return `${v ?? ""} DZD`;
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  if (s === "sent") return <Badge>Sent</Badge>;
  if (s === "pending") return <Badge variant="secondary">Pending</Badge>;
  return <Badge variant="outline">{status}</Badge>;
};

export default function ProviderPayoutsIndex({ payouts: list, filters, earnings }: Props) {
  const q = filters?.q ?? "";
  const status = filters?.status ?? "";

  const submit = (next: { q?: string; status?: string }) => {
    window.location.href = providerPayoutsIndex({
      query: {
        q: next.q ?? q,
        status: next.status ?? status,
      },
    }).url;
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Payouts", href: providerPayoutsIndex().url },
      ]}
    >
      <Head title="Payouts" />

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Online earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{money(earnings.online)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cash earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{money(earnings.cash)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{money(earnings.total)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Your Payouts</CardTitle>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Input
                value={q}
                onChange={(e) => submit({ q: e.target.value })}
                placeholder="Search method / reference..."
                className="sm:w-64"
              />

              <Select
                value={status === "" ? "all" : status}
                onValueChange={(v) => submit({ status: v === "all" ? "" : v })}
              >
                <SelectTrigger className="sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => submit({ q: "", status: "" })}>
                Reset
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {list.data.length === 0 ? (
              <div className="text-sm text-muted-foreground">No payouts yet.</div>
            ) : (
              <div className="divide-y rounded-md border">
                {list.data.map((p) => {
                  const ref =
                    p?.metadata && typeof p.metadata === "object" && p.metadata
                      ? ((p.metadata as { reference?: unknown; ref?: unknown }).reference ??
                          (p.metadata as { reference?: unknown; ref?: unknown }).ref) ??
                        null
                      : null;

                  return (
                    <div
                      key={p.id}
                      className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={p.status} />
                          <div className="text-sm font-medium">{money(p.amount)}</div>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {p.method ? `Method: ${p.method}` : "Method: -"}
                          {ref ? ` • Ref: ${ref}` : ""}
                        </div>

                        <div className="text-xs text-muted-foreground">
                          Created: {p.created_at ?? "-"}
                          {p.sent_at ? ` • Sent: ${p.sent_at}` : ""}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link className="inline-flex" href={providerPayoutsShow(p.id).url}>
                          <Button variant="secondary">Open</Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* If you already have a Pagination component, use it here.
                Otherwise keep it simple for now. */}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
