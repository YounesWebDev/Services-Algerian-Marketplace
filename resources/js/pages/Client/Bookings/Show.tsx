import React from "react";
import { usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

type Booking = {
  id: number;
  status: string;
  total_amount: string | number;
  currency: string;
  provider?: { id: number; name: string; avatar_path?: string | null };
  offer?: { id: number; proposed_price: string | number; status: string; request?: { title: string; status: string } };
  service?: { id: number; title: string; slug: string };
};

type Payment = {
  id: number;
  status: "pending" | "paid" | string;
  paid_at?: string | null;
};

type PageProps = {
  booking: Booking;
  payment: Payment | null;
  errors?: Record<string, string>;
  flash?: { success?: string };
};

export default function Show() {
  const { booking, payment, errors, flash } = usePage<PageProps>().props;

  const paymentStatus = payment?.status ?? "not_created";
  const title = booking.offer?.request?.title || booking.service?.title || "Booking";

  return (
    <AppLayout>
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>
          Booking #{booking.id} - {title}
        </h1>

        {flash?.success && (
          <div style={{ marginTop: 12, padding: 10, border: "1px solid #cfc" }}>
            {flash.success}
          </div>
        )}

        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd" }}>
          <p><b>Status:</b> {booking.status}</p>
          <p><b>Total:</b> {booking.total_amount} {booking.currency}</p>
          <p><b>Provider:</b> {booking.provider?.name ?? "-"}</p>
        </div>

        <div style={{ marginTop: 20, padding: 12, border: "1px solid #ddd" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Payment</h2>

          <p style={{ marginTop: 8 }}>
            <b>Payment Status:</b>{" "}
            {paymentStatus === "not_created" ? "Not created" : paymentStatus}
          </p>

          {paymentStatus === "paid" && (
            <div style={{ marginTop: 12, padding: 10, border: "1px solid #cfc" }}>
              Paid {payment?.paid_at ? `at ${payment.paid_at}` : ""}
            </div>
          )}

          {booking.status === "pending" && paymentStatus !== "paid" && (
            <div style={{ marginTop: 12 }}>
              Payment actions are not available yet.
              {errors && Object.keys(errors).length > 0 && (
                <div style={{ marginTop: 8, color: "red" }}>
                  Please reload the page to clear previous errors.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
