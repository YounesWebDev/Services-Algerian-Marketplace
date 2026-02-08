import { Head, Link, usePage } from "@inertiajs/react";
import {
  Briefcase,
  CircleCheckBig,
  CircleDollarSign,
  CircleX,
  ClipboardCheck,
  Clock,
  CreditCard,
  ExternalLink,
} from "lucide-react";

import PaginationLinks from "@/components/pagination-links";
import AppLayout from "@/layouts/app-layout";
import {
  index as providerBookingsIndex,
  show as providerBookingsShow,
} from "@/routes/provider/bookings";

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

      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Bookings (Provider)</h1>
          <p className="text-sm text-foreground-muted">
            Here you manage bookings and confirm cash payments.
          </p>
        </div>

        {flash?.success ? (
          <div className="rounded-3xl border p-3 text-sm bg-green-50 break-words">
            {flash.success}
          </div>
        ) : null}

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={providerBookingsIndex.url()}
            className={`px-3 py-1 rounded-3xl text-sm border border-gray-200 ${
              filters.status === ""
                ? "bg-primary text-foreground"
                : "bg-primary-foreground/30 transition duration-700 hover:bg-primary-foreground/40 hover-shadow-lg"
            }`}
          >
            All
          </Link>

          {["pending", "confirmed", "in progress", "completed", "cancelled"].map((s) => (
            <Link
              key={s}
              href={providerBookingsIndex.url({ query: { status: s } })}
              className={`px-3 py-1 rounded-3xl text-sm border border-gray-200 ${
                filters.status === s
                  ? "bg-primary text-foreground"
                  : "bg-primary-foreground/30 transition duration-700 hover:bg-primary-foreground/40 hover-shadow-lg"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {bookings.data.length === 0 ? (
            <div className="rounded-3xl border p-4 text-sm text-foreground-muted">
              No bookings found.
            </div>
          ) : (
            bookings.data.map((b) => {
              const fromService = b.source === "service";
              const title = fromService
                ? b.service?.title ?? "Service booking"
                : b.offer?.request?.title ?? "Request booking";

              const cashNeedsConfirm =
                b.payment && b.payment.payment_type === "cash" && b.payment.status === "pending";

              return (
                <div
                  key={b.id}
                  className="rounded-4xl border border-gray-200 bg-primary-foreground/30 transition duration-700 hover:bg-primary-foreground/40 hover:shadow-2xl p-4"
                >
                  {/* responsive layout: column on mobile, row on sm+ */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="font-bold text-lg sm:text-2xl break-words">{title}</div>

                      {/* client */}
                      <span className="inline-flex items-center gap-2 min-w-0">
                        {b.client?.avatar_path ? (
                          <img
                            src={b.client.avatar_path}
                            alt={b.client.name}
                            className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover border shrink-0"
                          />
                        ) : (
                          <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-full border border-transparent shrink-0" />
                        )}

                        <span className="font-medium truncate max-w-[70vw] sm:max-w-none">
                          {b.client?.name}
                        </span>
                      </span>

                      {/* status + amount */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="text-sm text-foreground p-1 border border-gray-200 rounded-3xl flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-max">
                          {b.status === "pending" ? (
                            <span className="font-medium p-2 text-amber-400 flex items-center gap-2">
                              <Clock className="h-5 w-5" /> {b.status}
                            </span>
                          ) : b.status === "confirmed" ? (
                            <span className="font-medium p-2 text-primary flex items-center gap-2">
                              <CircleCheckBig className="h-5 w-5" /> {b.status}
                            </span>
                          ) : b.status === "in progress" ? (
                            <span className="font-medium p-2 text-amber-400 flex items-center gap-2">
                              <Briefcase className="h-5 w-5" /> {b.status}
                            </span>
                          ) : b.status === "completed" ? (
                            <span className="font-medium p-2 text-primary flex items-center gap-2">
                              <ClipboardCheck className="h-5 w-5" /> {b.status}
                            </span>
                          ) : b.status === "cancelled" ? (
                            <span className="font-medium p-2 text-red-600 flex items-center gap-2">
                              <CircleX className="h-5 w-5" /> {b.status}
                            </span>
                          ) : null}

                          <div className="font-medium rounded-3xl border border-gray-200 p-2 text-primary ml-auto sm:ml-0">
                            {b.total_amount} {b.currency}
                          </div>
                        </div>
                      </div>

                      {/* payment */}
                      <div className="text-xs text-foreground mt-2 p-1 rounded-3xl border border-gray-200 w-full sm:w-max flex flex-wrap items-center gap-2">
                        <span className="shrink-0">Payment:</span>{" "}
                        {b.payment ? (
                          <>
                            {b.payment.payment_type === "online" ? (
                              <span className="font-medium flex items-center gap-2">
                                <CreditCard className="h-4 w-4" /> {b.payment.payment_type}
                              </span>
                            ) : b.payment.payment_type === "cash" ? (
                              <span className="font-medium flex items-center gap-2">
                                <CircleDollarSign className="h-4 w-4" /> {b.payment.payment_type}
                              </span>
                            ) : null}

                            <span className="font-medium p-2 rounded-3xl border border-gray-200">
                              {b.payment.status}
                            </span>

                            {cashNeedsConfirm ? (
                              <span className="text-foreground-muted">(needs your confirmation)</span>
                            ) : null}
                          </>
                        ) : (
                          <span className="font-medium">not started</span>
                        )}
                      </div>
                    </div>

                    {/* right actions: row on mobile, column on sm+ */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-2 shrink-0">
                      <span className="text-xs text-foreground-muted">Booking #{b.id}</span>

                      <Link
                        href={providerBookingsShow.url(b.id)}
                        className="text-primary px-3 py-2 hover:text-foreground transition duration-700 text-sm inline-flex items-center"
                        aria-label={`Open booking ${b.id}`}
                      >
                        <ExternalLink />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {bookings.links?.length > 0 && <PaginationLinks links={bookings.links} />}
      </div>
    </AppLayout>
  );
}
