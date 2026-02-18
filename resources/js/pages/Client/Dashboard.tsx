import { Link, usePage } from "@inertiajs/react";
import React from "react";

import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
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

  const totalBookings = Number(stats.total_bookings ?? 0);
  const pending = Number(stats.pending_bookings ?? 0);
  const confirmed = Number(stats.confirmed_bookings ?? 0);
  const payments = Number(stats.pending_payments ?? 0);

  const total = totalBookings || 1;

  const items = [
    {
      label: "Total Bookings",
      value: totalBookings,
      percent: 100,
    },
    {
      label: "Pending Bookings",
      value: pending,
      percent: Math.round((pending / total) * 100),
    },
    {
      label: "Confirmed Bookings",
      value: confirmed,
      percent: Math.round((confirmed / total) * 100),
    },
    {
      label: "Pending Payments",
      value: payments,
      percent: Math.round((payments / total) * 100),
    },
  ];

  const Ring = ({
    label,
    value,
    percent,
  }: {
    label: string;
    value: number;
    percent: number;
  }) => {
    const size = 120;
    const stroke = 10;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (percent / 100) * c;

    return (
      <div className="rounded-4xl border border-gray-200 p-4 text-primary transition duration-700 bg-primary/10 hover:bg-primary/20 hover:shadow-xl">
        <div className="flex items-center gap-4">
          <div className="relative h-30 w-30 shrink-0">
            <svg width={size} height={size} className="-rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="transparent"
                stroke="currentColor"
                opacity={0.15}
                strokeWidth={stroke}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-xl font-bold leading-none">{percent}%</div>
              <div className="text-xs opacity-80">of total</div>
            </div>
          </div>

          <div className="min-w-0">
            <div className="text-sm opacity-80">{label}</div>
            <div className="text-3xl font-bold">{value}</div>

            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-current/10">
              <div
                className="h-full rounded-full bg-current"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout breadcrumbs={[{ title: "Dashboard", href: dashboard().url }]}>
      <div className="p-4 max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-primary">
          Client Dashboard
        </h1>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {items.map((item) => (
            <Ring
              key={item.label}
              label={item.label}
              value={item.value}
              percent={item.percent}
            />
          ))}
        </div>

        {/* ✅ Buttons kept exactly as requested */}
        <div className="mt-6 flex gap-4">
          <Link
            href={clientBookingsIndex.url()}
            className="p-2 w-max border border-gray-200 rounded-4xl bg-primary text-primary-foreground transition duration-700 hover:bg-primary-foreground hover:text-background"
          >
            Go to Bookings
          </Link>

          <Link
            href={clientOffersIndex.url()}
            className="p-2 w-max border border-gray-200 rounded-4xl bg-primary-background text-primary-foreground transition duration-700 hover:bg-primary-foreground hover:text-background"
          >
            Go to Offers
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
