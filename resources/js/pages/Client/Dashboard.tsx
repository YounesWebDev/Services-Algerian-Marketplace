import { Link, usePage } from "@inertiajs/react";
import React from "react";

import AppLayout from "@/layouts/app-layout";
import { index as clientBookingsIndex } from "@/routes/client/bookings";
import { index as clientOffersIndex } from "@/routes/client/offers";

type Stats = {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  pending_payments: number;
};

type PageProps = {
  stats: Stats;
};

export default function Dashboard() {
  const { stats } = usePage<PageProps>().props;

  return (
    <AppLayout>
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Client Dashboard</h1>

        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <div style={{ border: "1px solid #ddd", padding: 12 }}>
            <div style={{ fontSize: 14, color: "#555" }}>Total Bookings</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.total_bookings}</div>
          </div>

          <div style={{ border: "1px solid #ddd", padding: 12 }}>
            <div style={{ fontSize: 14, color: "#555" }}>Pending Bookings</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.pending_bookings}</div>
          </div>

          <div style={{ border: "1px solid #ddd", padding: 12 }}>
            <div style={{ fontSize: 14, color: "#555" }}>Confirmed Bookings</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.confirmed_bookings}</div>
          </div>

          <div style={{ border: "1px solid #ddd", padding: 12 }}>
            <div style={{ fontSize: 14, color: "#555" }}>Pending Payments</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{stats.pending_payments}</div>
            <div style={{ marginTop: 8 }}>
              <Link href={clientBookingsIndex.url()}>Go to Bookings</Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <Link href={clientOffersIndex.url()}>Go to Offers</Link>
        </div>
      </div>
    </AppLayout>
  );
}
