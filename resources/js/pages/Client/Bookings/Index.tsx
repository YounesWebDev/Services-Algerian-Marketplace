import { Head, Link, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import { index as clientBookingsIndex, show as clientBookingsShow } from "@/routes/client/bookings";
import { show as serviceShow } from "@/routes/services";

type Provider = { id: number; name: string; avatar_path: string | null };

type Service = { id: number; title: string; slug: string };
type RequestItem = { id: number; title: string };
type Offer = { id: number; proposed_price: string; status: string; request?: RequestItem };

type Payment = {
  id: number;
  status: string; // pending | paid
  payment_type: "cash" | "online";
  paid_at: string | null;
};

type BookingItem = {
  id: number;
  source: "service" | "request_offer" | string;
  status: string;
  total_amount: string;
  currency: string;
  scheduled_at: string | null;

  provider: Provider;

  service?: Service | null;
  offer?: Offer | null;
  payment?: Payment | null;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function ClientBookingsIndex() {
  const { props } = usePage<{
    bookings: { data: BookingItem[]; links: PaginationLink[] };
    filters: { status: string };
    flash?: { success?: string };
  }>();

  const { bookings, filters, flash } = props;

  return (
    <AppLayout>
      <Head title="Bookings" />

      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">My Bookings</h1>
          <p className="text-sm text-gray-600">
            Bookings come from: booking a service OR accepting an offer.
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
            href={clientBookingsIndex.url()}
            className={`px-3 py-1 rounded-md text-sm border ${
              filters.status === "" ? "bg-black text-white" : "bg-white"
            }`}
          >
            All
          </Link>

          {["pending", "confirmed", "in_progress", "completed", "cancelled"].map((s) => (
            <Link
              key={s}
              href={clientBookingsIndex.url({ query: { status: s } })}
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

              return (
                <div key={b.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-medium">{title}</div>

                      <div className="text-sm text-gray-600">
                        Source: <span className="font-medium">{b.source}</span> • Status:{" "}
                        <span className="font-medium">{b.status}</span>
                      </div>

                      <div className="text-sm text-gray-600">
                        Total: <span className="font-medium">{b.total_amount}</span> {b.currency}
                        {b.scheduled_at ? (
                          <>
                            {" "}
                            • Scheduled: <span className="font-medium">{b.scheduled_at}</span>
                          </>
                        ) : null}
                      </div>

                      <div className="text-sm text-gray-600 flex items-center gap-2 mt-2">
                        {b.provider?.avatar_path ? (
                          <img
                            src={b.provider.avatar_path}
                            alt={b.provider.name}
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                        ) : (
                          <span className="w-7 h-7 rounded-full border bg-gray-100" />
                        )}
                        <span>
                          Provider: <span className="font-medium">{b.provider?.name}</span>
                        </span>
                      </div>

                      {/* Payment quick status */}
                      <div className="text-xs text-gray-500 mt-2">
                        Payment:{" "}
                        {b.payment ? (
                          <>
                            <span className="font-medium">{b.payment.payment_type}</span> •{" "}
                            <span className="font-medium">{b.payment.status}</span>
                            {b.payment.payment_type === "cash" && b.payment.status === "pending" ? (
                              <> (waiting provider confirm)</>
                            ) : null}
                          </>
                        ) : (
                          <span className="font-medium">not started</span>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-xs px-2 py-1 rounded border bg-gray-50">
                        Booking #{b.id}
                      </span>

                      <Link
                        href={clientBookingsShow.url(b.id)}
                        className="rounded-md bg-black px-3 py-2 text-white text-sm"
                      >
                        Open
                      </Link>
                    </div>
                  </div>

                  {/* Origin link */}
                  <div className="mt-3 text-sm text-gray-700">
                    {fromService && b.service?.slug ? (
                      <Link className="underline" href={serviceShow.url(b.service.slug)}>
                        View service
                      </Link>
                    ) : null}

                    {!fromService ? (
                      <span className="text-gray-500">(Created from request offer)</span>
                    ) : null}
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
