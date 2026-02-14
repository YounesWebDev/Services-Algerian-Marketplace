import { Head, Link, router } from "@inertiajs/react";
import { ExternalLink } from "lucide-react";
import { useRef } from "react";

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
import {
  index as providerPayoutsIndex,
  show as providerPayoutsShow,
} from "@/routes/provider/payouts";

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

export default function ProviderPayoutsIndex({
  payouts: list,
  filters,
  earnings,
}: Props) {
  const q = filters?.q ?? "";
  const status = filters?.status ?? "";

  // ✅ hook must be inside component
  const typingTimeout = useRef<number | null>(null);

  // ✅ use Inertia navigation (no full reload / black flash)
  const submit = (next: { q?: string; status?: string }) => {
    router.get(
      providerPayoutsIndex({
        query: {
          q: next.q ?? q,
          status: next.status ?? status,
        },
      }).url,
      {},
      {
        preserveState: true,
        preserveScroll: true,
        replace: true,
      }
    );
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
          <Card className="bg-primary-foreground/30 border text-foreground border-gray-200 rounded-4xl transition duration-700 hover:bg-primary-foreground/54  hover:shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium  text-foreground">
                Online earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{money(earnings.online)}</div>
            </CardContent>
          </Card>

          <Card className="bg-primary-foreground/30 border text-foreground border-gray-200 rounded-4xl transition duration-700 hover:bg-primary-foreground/54  hover:shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground">
                Cash earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{money(earnings.cash)}</div>
            </CardContent>
          </Card>

          <Card className="bg-primary-foreground/30 border text-foreground border-gray-200 rounded-4xl transition duration-700 hover:bg-primary-foreground/54  hover:shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground">
                Total earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{money(earnings.total)}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-gray-200 rounded-4xl bg-primary-foreground/30 hover:bg-primary-foreground/40 transition duration-700 hover:shadow-xl">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Your Payouts</CardTitle>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <Input
                value={q}
                onChange={(e) => {
                  const value = e.target.value;

                  if (typingTimeout.current) {
                    window.clearTimeout(typingTimeout.current);
                  }

                  typingTimeout.current = window.setTimeout(() => {
                    submit({ q: value });
                  }, 400);
                }}
                placeholder="Search method / reference..."
                className="rounded-3xl border border-gray-200 "
              />

              <Select
                value={status === "" ? "all" : status}
                onValueChange={(v) => submit({ status: v === "all" ? "" : v })}
              >
                <SelectTrigger className="sm:w-40 rounded-3xl border border-gray-200  ">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => submit({ q: "", status: "" })}
                className="rounded-3xl bg-primary transition duration-700 hover:text-background hover:bg-foreground"
              >
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
                          <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 text-primary transition duration-700 "  /></Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
