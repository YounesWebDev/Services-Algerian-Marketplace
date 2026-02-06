import { Head, Link, router } from "@inertiajs/react";
import * as React from "react";

import PaginationLinks from "@/components/pagination-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as adminPayoutsIndex, show as adminPayoutsShow } from "@/routes/admin/payouts";
type UserLite = {
  id: number;
  name: string;
  email: string;
  avatar_path?: string | null;
};

type Payout = {
  id: number;
  provider_id: number;
  amount: string | number;
  status: "pending" | "sent" | string;
  sent_at?: string | null;
  method?: string | null;
  metadata?: unknown;
  provider?: UserLite;
};

type Paginated<T> = {
  data: T[];
  links: Array<{ url: string | null; label: string; active: boolean }>;
};

type Props = {
  payouts: Paginated<Payout>;
  filters: {
    status?: string;
    q?: string;
  };
};

const money = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v ?? NaN);
  if (Number.isFinite(n)) return n.toFixed(2);
  return String(v ?? "");
};

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case "sent":
      return "default";
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
};

export default function PayoutsIndex({ payouts, filters }: Props) {
  const [q, setQ] = React.useState(filters.q ?? "");
  const [status, setStatus] = React.useState(filters.status ?? "");

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.get(
      adminPayoutsIndex().url,
      { q: q || undefined, status: status || undefined },
      { preserveState: true, replace: true }
    );
  };

  const resetFilters = () => {
    setQ("");
    setStatus("");
    router.get(adminPayoutsIndex().url, {}, { preserveState: true, replace: true });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Payouts (Management)", href: adminPayoutsIndex().url },
      ]}
    >
      <Head title="Payouts (Management)" />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payouts Management</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="q">Search provider</Label>
                <Input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="provider name or email..."
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="pending">pending</option>
                  <option value="sent">sent</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button type="submit">Apply</Button>
                <Button type="button" variant="outline" onClick={resetFilters}>
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Sent at</th>
                    <th className="px-4 py-3 font-medium text-right">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.data.map((p) => {
                    const provider = p.provider;
                    return (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-3 font-medium">#{p.id}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium">{provider?.name ?? "-"}</div>
                            <div className="text-muted-foreground">{provider?.email ?? ""}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{money(p.amount)} DZD</td>
                        <td className="px-4 py-3">{p.method ?? "-"}</td>
                        <td className="px-4 py-3">{p.sent_at ?? "-"}</td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild size="sm" variant="secondary">
                            <Link href={adminPayoutsShow(p.id).url}>Open</Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                  {payouts.data.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-muted-foreground">
                        No payouts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {payouts.links?.length ? (
              <div className="p-4">
                <PaginationLinks links={payouts.links} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
