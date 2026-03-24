import { Head, Link } from "@inertiajs/react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as adminPaymentsIndex, show as adminPaymentsShow } from "@/routes/admin/payments";
type UserLite = {
  id: number;
  name: string;
  email: string;
  avatar_path?: string | null;
};

type ServiceLite = {
  id: number;
  title: string;
  slug: string;
};

type RequestLite = {
  id: number;
  title: string;
};

type OfferLite = {
  id: number;
  proposed_price: string | number;
  request?: RequestLite | null;
};

type BookingLite = {
  id: number;
  source: string;
  status: string;
  currency: string;
  total_amount: string | number;
  client?: UserLite;
  provider?: UserLite;
  service?: ServiceLite | null;
  offer?: OfferLite | null;
};

type Payment = {
  id: number;
  booking_id: number;
  payment_type: "cash" | "online" | string;
  status: "pending" | "paid" | "failed" | "refunded" | string;
  amount: string | number;
  platform_fee: string | number;
  provider_amount: string | number;
  paid_at?: string | null;
  online_provider?: string | null;
  metadata?: unknown;
  booking?: BookingLite;
};

const money = (v: unknown) => {
  const n = typeof v === "number" ? v : Number(v ?? NaN);
  if (Number.isFinite(n)) return n.toFixed(2);
  return String(v ?? "");
};

const statusVariant = (status: string) => {
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

export default function PaymentsShow({ payment }: { payment: Payment }) {
  const booking = payment.booking;
  const client = booking?.client;
  const provider = booking?.provider;

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Payments (Management)", href: adminPaymentsIndex().url },
        { title: `Payment #${payment.id}`, href: adminPaymentsShow(payment.id).url },
      ]}
    >
      <Head title={`Payment #${payment.id}`} />

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Payment #{payment.id}</CardTitle>

            <div className="flex items-center gap-2">
              <Badge variant={statusVariant(payment.status)}>{payment.status}</Badge>
              <Badge variant="outline">{payment.payment_type}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Amount</div>
                <div className="text-lg font-semibold">
                  {money(payment.amount)} {booking?.currency ?? "DZD"}
                </div>
              </div>

              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Platform fee</div>
                <div className="text-lg font-semibold">{money(payment.platform_fee)}</div>
              </div>

              <div className="rounded-md border p-3">
                <div className="text-xs text-muted-foreground">Provider amount</div>
                <div className="text-lg font-semibold">{money(payment.provider_amount)}</div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border p-4">
                <div className="mb-2 text-sm font-semibold">Booking</div>
                <div className="text-sm">
                  <div>
                    <span className="text-muted-foreground">Booking ID:</span>{" "}
                    <span className="font-medium">#{booking?.id ?? payment.booking_id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Booking status:</span>{" "}
                    <span className="font-medium">{booking?.status ?? "-"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Source:</span>{" "}
                    <span className="font-medium">{booking?.source ?? "-"}</span>
                  </div>

                  {booking?.service && (
                    <div className="mt-2">
                      <div className="text-muted-foreground">Service:</div>
                      <Button asChild variant="link" className="h-auto p-0">
                        <Link href={`/services/${booking.service.slug}`}>
                          {booking.service.title}
                        </Link>
                      </Button>
                    </div>
                  )}

                  {booking?.offer?.request && (
                    <div className="mt-2">
                      <div className="text-muted-foreground">Request:</div>
                      <div className="font-medium">{booking.offer.request.title}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-md border p-4">
                <div className="mb-2 text-sm font-semibold">People</div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="text-muted-foreground">Client</div>
                    <div className="font-medium">{client?.name ?? "-"}</div>
                    <div className="text-muted-foreground">{client?.email ?? ""}</div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">Provider</div>
                    <div className="font-medium">{provider?.name ?? "-"}</div>
                    <div className="text-muted-foreground">{provider?.email ?? ""}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border p-4">
              <div className="mb-2 text-sm font-semibold">Metadata</div>
              <pre className="max-h-64 overflow-auto rounded-md bg-muted p-3 text-xs">
{JSON.stringify(payment.metadata ?? {}, null, 2)}
              </pre>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => window.history.back()}>
                Back
              </Button>
            </div>

            {payment.paid_at && (
              <div className="text-sm text-muted-foreground">
                Paid at: <span className="font-medium">{payment.paid_at}</span>
              </div>
            )}

            {payment.payment_type === "online" && payment.online_provider && (
              <div className="text-sm text-muted-foreground">
                Online provider:{" "}
                <span className="font-medium">{payment.online_provider}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
