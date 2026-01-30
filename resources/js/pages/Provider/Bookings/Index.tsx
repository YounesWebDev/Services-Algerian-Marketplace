import { Head, Link, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import { index as providerBookingsIndex, show as providerBookingsShow } from "@/routes/provider/bookings";

type UserLite = { id: number; name: string; avatar_path: string | null };

type Service = { id: number; title: string; slug: string };
type RequestItem = { id: number; title: string };
type Offer = { id: number; proposed_price: string; status: string; request?: RequestItem };

type Payment = {
  id: number;
  status: string; // pending | paid
  payment_type: "cash" | "online";
  paid_at: string | null;
  amount: string;
};

type BookingItem = {
  id: number;
  source: string;
  status: string;
  total_amount: string;
  currency: string;
  scheduled_at: string | null;

  client: UserLite;

  service?: Service | null;
  offer?: Offer | null;
  payment?: Payment | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function ProviderBookingsIndex() {
  const { props } = usePage<{
    bookings: { data: BookingItem[]; links: PaginationLink[] };
    filters: { status: string };
    flash?: { success?: string };
  }>();

  const { bookings, filters, flash } = props;

  return (
    <AppLayout>
      <Head title="Provider Bookings" />

      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Bookings (Provider)</h1>
          <p className="text-sm text-gray-600">
            Here you manage bookings and confirm cash payments.
          </p>
        </div>

        {flash?.success ? (
          <div className="rounded-md border p-3 text-sm bg-green-50">
            {flash.success}
          </div>
        ) : null}

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={providerBookingsIndex.url()}
            className={`px-3 py-1 rounded-md text-sm border ${
              filters.status === "" ? "bg-black text-white" : "bg-white"
            }`}
          >
            All
          </Link>

          {["pending", "confirmed", "in_progress", "completed", "cancelled"].map((s) => (
            <Link
              key={s}
              href={providerBookingsIndex.url({ query: { status: s } })}
              className={`px-3 py-1 rounded-md text-sm border ${
                filters.status === s ? "bg-black text-white" : "bg-white"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {bookings.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-gray-600">
              No bookings found.
            </div>
          ) : (
            bookings.data.map((b) => {
              const fromService = b.source === "service";
              const title = fromService
                ? b.service?.title ?? "Service booking"
                : b.offer?.request?.title ?? "Request booking";

              const cashNeedsConfirm =
                b.payment &&
                b.payment.payment_type === "cash" &&
                b.payment.status === "pending";

              return (
                <div key={b.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-medium">{title}</div>

                      <div className="text-sm text-gray-600">
                        Status: <span className="font-medium">{b.status}</span> • Total:{" "}
                        <span className="font-medium">{b.total_amount}</span> {b.currency}
                      </div>

                      <div className="text-sm text-gray-600">
                        Client:{" "}
                        <span className="font-medium">
                          {b.client?.name ?? "Client"}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 mt-2">
                        Payment:{" "}
                        {b.payment ? (
                          <>
                            <span className="font-medium">{b.payment.payment_type}</span> •{" "}
                            <span className="font-medium">{b.payment.status}</span>
                            {cashNeedsConfirm ? (
                              <> (needs your confirmation)</>
                            ) : null}
                          </>
                        ) : (
                          <span className="font-medium">not started</span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs px-2 py-1 rounded border bg-gray-50">
                        Booking #{b.id}
                      </span>

                      <Link
                        href={providerBookingsShow.url(b.id)}
                        className="rounded-md bg-black px-3 py-2 text-white text-sm"
                      >
                        Open
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {bookings.links?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {bookings.links.map((l, idx) => (
              <Link
                key={idx}
                href={l.url ?? ""}
                preserveScroll
                className={`px-3 py-1 rounded border text-sm ${
                  l.active ? "bg-black text-white" : "bg-white"
                } ${l.url === null ? "pointer-events-none opacity-40" : ""}`}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
