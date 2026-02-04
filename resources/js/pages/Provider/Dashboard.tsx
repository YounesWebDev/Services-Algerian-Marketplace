import { Head, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";

type Stats = {
  pending_bookings: number;
  confirmed_bookings: number;
  pending_payouts: number;
};

type PageProps = {
  stats: Stats;
};

export default function Dashboard() {
  const { stats } = usePage<PageProps>().props;

  return (
    <AppLayout>
      <Head title="Provider Dashboard" />
      <div className="p-4 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-primary">Provider Dashboard</h1>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-gray-300 text-foreground w-sm p-4 rounded-4xl hover:text-background transition duration-700 hover:bg-foreground">
            <div className="text-sm">Pending Bookings</div>
            <div className="text-3xl font-bold">{stats.pending_bookings}</div>
          </div>

          <div className="border border-gray-300 text-foreground p-4 rounded-4xl hover:text-background transition duration-700 hover:bg-foreground">
            <div className="text-sm">Confirmed Bookings</div>
            <div className="text-3xl font-bold">{stats.confirmed_bookings}</div>
          </div>

          <div className="border border-gray-300 text-foreground p-4 rounded-4xl hover:text-background transition duration-700 hover:bg-foreground">
            <div className="text-sm">Pending Payouts</div>
            <div className="text-3xl font-bold">{stats.pending_payouts}</div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
