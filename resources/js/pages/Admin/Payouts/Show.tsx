import { Head, Link, useForm } from "@inertiajs/react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import {
  index as adminPayoutsIndex,
  show as adminPayoutsShow,
  markSent as adminPayoutsMarkSent,
} from "@/routes/admin/payouts";

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

const money = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v ?? NaN);
  if (Number.isFinite(n)) return n.toFixed(2);
  return String(v ?? "");
};

const statusVariant = (status: string) => {
  switch (status) {
    case "sent":
      return "default";
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
};

export default function PayoutsShow({ payout }: { payout: Payout }) {
  const { data, setData, post, processing, errors } = useForm<{
    method: string;
    account_name: string;
    account_number: string;
    cle: string;
    reference: string;
  }>({
    method: payout.method ?? "",
    account_name:
      payout.metadata && typeof payout.metadata === "object" && "account_name" in payout.metadata
        ? String((payout.metadata as { account_name?: unknown }).account_name ?? "")
        : "",
    account_number:
      payout.metadata && typeof payout.metadata === "object" && "account_number" in payout.metadata
        ? String((payout.metadata as { account_number?: unknown }).account_number ?? "")
        : "",
    cle:
      payout.metadata && typeof payout.metadata === "object" && "cle" in payout.metadata
        ? String((payout.metadata as { cle?: unknown }).cle ?? "")
        : "",
    reference:
      payout.metadata && typeof payout.metadata === "object" && "reference" in payout.metadata
        ? String((payout.metadata as { reference?: unknown }).reference ?? "")
        : "",
  });

  const canMarkSent = payout.status !== "sent";

  const markSent = (e: React.FormEvent) => {
    e.preventDefault();
    post(adminPayoutsMarkSent(payout.id).url, {
      preserveScroll: true,
    });
  };

  const provider = payout.provider;

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Payouts (Management)", href: adminPayoutsIndex().url },
        { title: `Payout #${payout.id}`, href: adminPayoutsShow(payout.id).url },
      ]}
    >
      <Head title={`Payout #${payout.id}`} />

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Payout #{payout.id}</CardTitle>
            <Badge variant={statusVariant(payout.status)}>{payout.status}</Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-md border p-4">
                <div className="text-xs text-muted-foreground">Amount</div>
                <div className="text-lg font-semibold">{money(payout.amount)} DZD</div>

                <div className="mt-3 text-sm text-muted-foreground">
                  Sent at: <span className="font-medium">{payout.sent_at ?? "-"}</span>
                </div>

                <div className="text-sm text-muted-foreground">
                  Method: <span className="font-medium">{payout.method ?? "-"}</span>
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="mb-2 text-sm font-semibold">Provider</div>
                <div className="text-sm">
                  <div className="font-medium">{provider?.name ?? "-"}</div>
                  <div className="text-muted-foreground">{provider?.email ?? ""}</div>
                </div>

                <div className="mt-3">
                  <div className="text-xs text-muted-foreground">Metadata</div>
                  <pre className="mt-2 max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs">
                    {JSON.stringify(payout.metadata ?? {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {canMarkSent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Mark payout as sent</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={markSent} className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="method">Method</Label>
                      <select
                        id="method"
                        className="h-10 rounded-md border bg-background px-3 text-sm"
                        value={data.method}
                        onChange={(e) => setData("method", e.target.value)}
                      >
                        <option value="">Select method</option>
                        <option value="bank_transfer">bank_transfer</option>
                        <option value="ccp">ccp</option>
                      </select>
                      {errors.method && <div className="text-sm text-destructive">{errors.method}</div>}
                    </div>

                    {(data.method === "bank_transfer" || data.method === "ccp") && (
                      <div className="grid gap-2">
                        <Label htmlFor="account_name">Account name</Label>
                        <Input
                          id="account_name"
                          value={data.account_name}
                          onChange={(e) => setData("account_name", e.target.value)}
                          placeholder="Account holder name"
                        />
                        {errors.account_name && (
                          <div className="text-sm text-destructive">{errors.account_name}</div>
                        )}
                      </div>
                    )}

                    {(data.method === "bank_transfer" || data.method === "ccp") && (
                      <div className="grid gap-2">
                        <Label htmlFor="account_number">Account number</Label>
                        <Input
                          id="account_number"
                          value={data.account_number}
                          onChange={(e) => setData("account_number", e.target.value)}
                          placeholder="Account number"
                        />
                        {errors.account_number && (
                          <div className="text-sm text-destructive">{errors.account_number}</div>
                        )}
                      </div>
                    )}

                    {data.method === "ccp" && (
                      <div className="grid gap-2">
                        <Label htmlFor="cle">Cle</Label>
                        <Input
                          id="cle"
                          value={data.cle}
                          onChange={(e) => setData("cle", e.target.value)}
                          placeholder="CCP cle"
                        />
                        {errors.cle && <div className="text-sm text-destructive">{errors.cle}</div>}
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="reference">Reference (optional)</Label>
                      <Input
                        id="reference"
                        value={data.reference}
                        onChange={(e) => setData("reference", e.target.value)}
                        placeholder="transaction id"
                      />
                      {errors.reference && (
                        <div className="text-sm text-destructive">{errors.reference}</div>
                      )}
                    </div>

                    <div className="flex gap-2 md:col-span-2">
                      <Button disabled={processing} type="submit">
                        Mark Sent
                      </Button>
                      <Button asChild variant="outline">
                        <Link href={adminPayoutsIndex().url}>Back</Link>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {!canMarkSent && (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href={adminPayoutsIndex().url}>Back</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
