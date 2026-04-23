import { Head, Link, router } from "@inertiajs/react";
import { ExternalLink, Search } from "lucide-react";
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
import {
  index as adminPaymentsIndex,
  show as adminPaymentsShow,
} from "@/routes/admin/payments";

type UserLite = {
  id: number;
  name: string;
  email: string;
  avatar_path?: string | null;
};

type BookingLite = {
  id: number;
  source: string;
  status: string;
  total_amount: string | number;
  currency: string;
  client?: UserLite;
  provider?: UserLite;
};

type Payment = {
  id: number;
  booking_id: number;
  payer_id: number;
  payment_type: "cash" | "online" | string;
  online_provider?: string | null;
  amount: string | number;
  platform_fee: string | number;
  provider_amount: string | number;
  status: "pending" | "paid" | "failed" | "refunded" | string;
  paid_at?: string | null;
  created_at?: string | null;
  booking?: BookingLite;
};

type Paginated<T> = {
  data: T[];
  links: Array<{ url: string | null; label: string; active: boolean }>;
  meta?: unknown;
};

type Props = {
  payments: Paginated<Payment>;
  filters: {
    status?: string;
    type?: string;
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
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "failed":
    case "refunded":
      return "destructive";
    default:
      return "outline";
  }
};

export default function PaymentsIndex({ payments, filters }: Props) {
  const [q, setQ] = React.useState(filters.q ?? "");
  const [status, setStatus] = React.useState(filters.status ?? "");
  const [type, setType] = React.useState(filters.type ?? "");

  const applyFilters = (e?: React.FormEvent) => {
    e?.preventDefault();
    router.get(
      adminPaymentsIndex().url,
      { q: q || undefined, status: status || undefined, type: type || undefined },
      { preserveState: true, replace: true }
    );
  };

  const resetFilters = () => {
    setQ("");
    setStatus("");
    setType("");
    router.get(adminPaymentsIndex().url, {}, { preserveState: true, replace: true });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Payments (Management)", href: adminPaymentsIndex().url },
      ]}
    >
      <Head title="Payments (Management)" />

      <div className="space-y-6">
        <Card className="rounded-4xl border border-gray-200 bg-primary-foreground/30">
          <CardHeader>
            <CardTitle>Payments Management</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-4">
              <div className="grid gap-2">
                <Label htmlFor="q">Search</Label>
                <Input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="client/provider name or email..."
                  className="rounded-3xl border "
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="h-10 rounded-3xl border bg-background px-3 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="failed">failed</option>
                  <option value="refunded">refunded</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  className="h-10 rounded-3xl border bg-background px-3 text-sm"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="cash">cash</option>
                  <option value="online">online</option>
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Button type="submit" className="rounded-3xl text-foreground border border-gray-200 transition duration-700 hover:bg-foreground hover:text-background">Search <Search/> </Button>
                <Button type="button" variant="outline" onClick={resetFilters} className="rounded-3xl border border-gray-200 bg-primary-foreground/1">
                  Reset
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto rounded-4xl border border-gray-200 bg-primary-foreground/30">
              <table className="min-w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Fee</th>
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium text-right">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.data.map((p) => {
                    const client = p.booking?.client;
                    const provider = p.booking?.provider;
                    return (
                      <tr key={p.id} className="border-t">
                        <td className="px-4 py-3 font-medium">#{p.id}</td>
                        <td className="px-4 py-3">
                          <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{p.payment_type}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium">{client?.name ?? "-"}</div>
                            <div className="text-muted-foreground">{client?.email ?? ""}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium">{provider?.name ?? "-"}</div>
                            <div className="text-muted-foreground">{provider?.email ?? ""}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {money(p.amount)} {p.booking?.currency ?? "DZD"}
                        </td>
                        <td className="px-4 py-3">{money(p.platform_fee)}</td>
                        <td className="px-4 py-3">{money(p.provider_amount)}</td>
                        <td className="px-4 py-3 text-right" >
                          <Button asChild size="sm" variant="secondary" className="rounded-3xl border border-gray-200 text-primary flex items-center gap-2 transition duration-700 hover:bg-primary hover:text-background">
                            <Link href={adminPaymentsShow(p.id).url} className="rounded-3xl border border-gray-200 text-primary flex items-center gap-2">
                              Open <ExternalLink/>
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}

                  {payments.data.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-muted-foreground">
                        No payments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {payments.links?.length ? (
              <div className="p-4">
                <PaginationLinks links={payments.links} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
