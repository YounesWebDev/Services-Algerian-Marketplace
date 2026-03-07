import { Head, Link, usePage } from "@inertiajs/react";
import { BadgeCheck, CircleX, ClipboardList, Clock, ExternalLink, CheckCircle2Icon } from "lucide-react";
import { useEffect, useState } from "react";

import PaginationLinks from "@/components/pagination-links";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as clientBookingsIndex, show as clientBookingsShow } from "@/routes/client/bookings";
import { show as serviceShow } from "@/routes/services";


type Provider = { id: number; name: string; avatar_path: string | null };

type Service = { id: number; title: string; slug: string };
type RequestItem = { id: number; title: string };
type Offer = { id: number; proposed_price: string; status: string; request?: RequestItem };

type Payment = {
  id: number;
  status: string;
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

  const successMessage = flash?.success ?? "";
  const [hiddenSuccessMessage, setHiddenSuccessMessage] = useState<string | null>(null);
  const showFlash = Boolean(successMessage) && hiddenSuccessMessage !== successMessage;

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setHiddenSuccessMessage(successMessage);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Bookings", href: clientBookingsIndex().url },
      ]}
    >
      <Head title="Bookings" />

      <div className="p-4 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-semibold">My Bookings</h1>
          <p className="text-sm text-muted-foreground">
            Bookings come from: booking a service OR accepting an offer.
          </p>
        </div>

        {/* ✅ Alert notification */}
        {showFlash ? (
          <div className="fixed bottom-4 right-4 z-50">
            <Alert className="bg-primary/5 backdrop-blur-sm max-w-[92vw] sm:max-w-md">
              <CheckCircle2Icon className="text-primary" />
              <AlertTitle className="text-primary">Success</AlertTitle>
              <AlertDescription className="text-foreground">
                {successMessage}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={clientBookingsIndex.url()}
            className={`px-3 py-1 rounded-3xl border border-gray-200 text-sm ${
              filters.status === "" ? "bg-primary text-foreground" : "bg-primary-foreground/30  transition duration-700 hover:bg-primary-foreground/40 hover:shadow-2xl dark:shadow"
            }`}
          >
            All
          </Link>

          {["pending", "confirmed", "in progress", "completed", "cancelled"].map((s) => (
            <Link
              key={s}
              href={clientBookingsIndex.url({ query: { status: s } })}
              className={`px-3 py-1 rounded-3xl text-sm border border-gray-200 ${
                filters.status === s ? "bg-primary text-foreground" : "bg-primary-foreground/30 transition duration-700 hover:bg-primary-foreground/40 hover:shadow-2xl dark:shadow"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {bookings.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-muted">
              No bookings found.
            </div>
          ) : (
            bookings.data.map((b) => {
              const fromService = b.source === "service";
              const title = fromService
                ? b.service?.title ?? "Service booking"
                : b.offer?.request?.title ?? "Request booking";

              return (
                <div
                  key={b.id}
                  className="rounded-4xl border border-gray-200 bg-primary-foreground/30 transition duration-700 hover:bg-primary-foreground/40 hover:shadow-2xl p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="space-y-2 min-w-0">
                      <div className="text-lg sm:text-2xl break-words">{title}</div>

                      <div className="text-sm text-foreground p-1 rounded-3xl border border-gray-200 w-fit max-w-full flex flex-wrap items-center gap-2">
                        <span>Status</span>{" "}
                        {b.status === "in_progress" ? (
                          <div className="font-medium rounded-3xl p-2 border border-gray-200 text-amber-400 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4" /> in progress
                          </div>
                        ) : b.status === "confirmed" ? (
                          <div className="font-medium rounded-3xl p-2 border border-gray-200 text-primary flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4" />
                            {b.status}
                          </div>
                        ) : b.status === "pending" ? (
                          <div className="font-medium rounded-3xl p-2 border border-gray-200 text-amber-400 flex items-center gap-2">
                            <Clock className="h-4 w-4" /> {b.status}
                          </div>
                        ) : b.status === "completed" ? (
                          <div className="font-medium rounded-3xl p-2 border border-gray-200 text-primary flex items-center gap-2">
                            <BadgeCheck className="h-4 w-4" />
                            {b.status}
                          </div>
                        ) : b.status === "cancelled" ? (
                          <div className="font-medium rounded-3xl p-2 border border-gray-200 text-red-600 flex items-center gap-2">
                            <CircleX className="h-4 w-4" /> {b.status}
                          </div>
                        ) : null}
                      </div>

                      <div className="text-sm text-foreground p-1 rounded-3xl border border-gray-200 w-fit max-w-full flex flex-wrap items-center gap-2">
                        <span>Total</span>
                        <div className="font-medium p-2 rounded-3xl border border-gray-200 break-words">
                          {b.total_amount} {b.currency}
                        </div>
                      </div>

                      {b.scheduled_at ? (
                        <div className="p-1 rounded-3xl border border-gray-200 flex items-center gap-2 w-max">
                          <div>Scheduled</div>
                          <div className="rounded-3xl p-2 border border-gray-200">{b.scheduled_at}</div>
                        </div>
                      ) : null}

                      <div className="text-sm text-foreground flex items-center gap-2 mt-2 p-2 rounded-3xl border border-gray-200 w-fit max-w-full">
                        {b.provider?.avatar_path ? (
                          <img
                            src={b.provider.avatar_path}
                            alt={b.provider.name}
                            className="w-7 h-7 rounded-full object-cover border shrink-0"
                          />
                        ) : (
                          <span className="w-7 h-7 rounded-full border bg-gray-100 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="font-medium break-words">{b.provider?.name}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                      <Link
                        href={clientBookingsShow.url(b.id)}
                        className="rounded-3xl text-primary transition duration-700 hover:bg-foreground hover:text-background text-sm p-2"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-foreground flex flex-wrap items-center gap-2">
                    {fromService && b.service?.slug ? (
                      <Link
                        className="font-bold rounded-3xl p-2 border border-gray-200 bg-primary text-foreground transition duration-700 hover:bg-foreground hover:text-background"
                        href={serviceShow.url(b.service.slug)}
                      >
                        View service
                      </Link>
                    ) : null}

                    {!fromService ? (
                      <span className="text-foreground">(Created from request offer)</span>
                    ) : null}
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
