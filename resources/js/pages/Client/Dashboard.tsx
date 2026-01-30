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
      <div className="p-4 max-w-full mx-auto ">
        <h1 className="text-2xl font-bold mb-6 text-primary">Client Dashboard</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-300 text-primary-foreground p-4 rounded-2xl hover:text-background transition duration-700  hover:bg-primary-foreground">
            <div className="text-sm ">Total Bookings</div>
            <div className="text-3xl font-bold">{stats.total_bookings}</div>
          </div>

          <div className="border border-gray-300 text-primary-foreground p-4 rounded-2xl hover:text-background transition duration-700  hover:bg-primary-foreground">
            <div className="text-sm w-100">Pending Bookings</div>
            <div className="text-3xl font-bold">{stats.pending_bookings}</div>
          </div>

          <div className="border border-gray-300 text-primary-foreground p-4 rounded-2xl hover:text-background transition duration-700  hover:bg-primary-foreground">
            <div className="text-sm ">Confirmed Bookings</div>
            <div className="text-3xl font-bold">{stats.confirmed_bookings}</div>
          </div>

          <div className="border border-gray-300 text-primary-foreground p-4 rounded-2xl hover:text-background transition duration-700  hover:bg-primary-foreground">
            <div className="text-sm">Pending Payments</div>
            <div className="text-3xl font-bold">{stats.pending_payments}</div>
          </div>
        </div>

        <div className="mt-6 flex gap-4">
          <Link href={clientBookingsIndex.url()} className="p-2 w-max border border-gray-200 rounded-4xl bg-primary text-primary-foreground transition duration-700 hover:bg-primary-foreground hover:text-background">Go to Bookings</Link>
          <Link href={clientOffersIndex.url()} className="p-2 w-max border border-gray-200 rounded-4xl bg-primary-background  text-primary-foreground transition duration-700 hover:bg-primary-foreground hover:text-background">Go to Offers</Link>
        </div>
      </div>
    </AppLayout>
  );
}
