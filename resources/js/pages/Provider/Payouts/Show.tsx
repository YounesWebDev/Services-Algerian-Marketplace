import { Head, Link } from "@inertiajs/react";
import { BadgeCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as providerPayoutsIndex, show as providerPayoutsShow } from "@/routes/provider/payouts";

type Payout = {
  id: number;
  provider_id: number;
  amount: string | number;
  status: "pending" | "sent" | string;
  sent_at: string | null;
  method: string | null;
  metadata: unknown;
  created_at: string | null;
  updated_at: string | null;
};

type Props = {
  payout: Payout;
};

const money = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v ?? NaN);
  if (Number.isFinite(n)) return `${n.toFixed(2)} DZD`;
  return `${v ?? ""} DZD`;
};

export default function ProviderPayoutShow({ payout }: Props) {
  const meta =
    payout?.metadata && typeof payout.metadata === "object" && payout.metadata
      ? (payout.metadata as {
          reference?: unknown;
          ref?: unknown;
          account_name?: unknown;
          account_number?: unknown;
          cle?: unknown;
          note?: unknown;
        })
      : null;
  const reference = meta?.reference ?? meta?.ref ?? null;
  const referenceText = reference === null ? "-" : String(reference);
  const accountName = meta?.account_name ?? null;
  const accountNumber = meta?.account_number ?? null;
  const cle = meta?.cle ?? null;
  const note = meta?.note ?? null;

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Payouts", href: providerPayoutsIndex().url },
        { title: `Payout #${payout.id}`, href: providerPayoutsShow(payout.id).url },
      ]}
    >
      <Head title={`Payout #${payout.id}`} />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
               <div className="flex items-center">
                  {payout.status === "sent" ? (
                    <div className="text-primary flex items-center gap-1">
                      <BadgeCheck className="h-4 w-4" />
                      {payout.status}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      {payout.status}
                    </div>
                  )}
                </div>
              <h1 className="text-lg font-semibold">Payout </h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Amount: <span className="font-medium text-foreground">{money(payout.amount)}</span>
            </div>
          </div>

          <Link href={providerPayoutsIndex().url}>
            <button className="rounded-3xl border border-gray-200 text-red-600  p-2 transition duration-700 hover:text-white hover:bg-red-600">Back</button>
          </Link>
        </div>

        <Card className="rounded-3xl border border-gray-200 bg-primary-foreground/30">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="text-primary">Status :</div>
              <div className="font-medium">{payout.status}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-primary">Method :</div>
              <div className="font-medium">{payout.method ?? "-"}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-primary">Reference :</div>
              <div className="font-medium">{referenceText}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-primary">Account name :</div>
              <div className="font-medium">{accountName ? String(accountName) : "-"}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-primary">Account number :</div>
              <div className="font-medium">{accountNumber ? String(accountNumber) : "-"}</div>
            </div>
            {payout.method === "ccp" && (
              <div className="flex items-center gap-2">
                <div className="text-primary">Cle :</div>
                <div className="font-medium">{cle ? String(cle) : "-"}</div>
              </div>
            )}
            {note ? (
              <div className="text-sm text-muted-foreground pt-2">
                Note: <span className="text-foreground">{String(note)}</span>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <div className="text-primary">Sent at :</div>
              <div className="font-medium">{payout.sent_at?.slice(0, 16)}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-primary">Created at :</div>
              <div className="font-medium">{payout.created_at?.slice(0, 16)}</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-primary">Updated at :</div>
              <div className="font-medium">{payout.updated_at?.slice(0, 16) }</div>
            </div>

            
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
