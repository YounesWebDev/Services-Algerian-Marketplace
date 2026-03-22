import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Clock, MapPin } from "lucide-react";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

import PaginationLinks from "@/components/pagination-links";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import {
  accept as clientOffersAccept,
  index as clientOffersIndex,
} from "@/routes/client/offers";

type Provider = { id: number; name: string; avatar_path: string | null };
type City = { id: number; name: string };
type Category = { id: number; name: string; slug: string };

type RequestItem = {
  id: number;
  title: string;
  status: string;
  city: City;
  category: Category;
};

type OfferItem = {
  id: number;
  message: string;
  proposed_price: string;
  estimated_days: number | null;
  status: string; // sent | assigned | rejected
  provider: Provider;
  request: RequestItem;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function ClientOffersIndex() {
  const { props } = usePage<{
    offers: { data: OfferItem[]; links: PaginationLink[] };
    filters: { status: string };
    flash?: { success?: string };
    errors: Record<string, string>;
  }>();

  const { offers, filters, flash, errors } = props;
  const acceptForm = useForm({});

  const alertMessage = flash?.success ?? errors?.offer ?? "";
  const [hiddenAlertMessage, setHiddenAlertMessage] = useState<string | null>(null);
  const showAlert = Boolean(alertMessage) && hiddenAlertMessage !== alertMessage;

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setHiddenAlertMessage(alertMessage);
      }, 7000); // 7 seconds

      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  function acceptOffer(offerId: number) {
    acceptForm.post(clientOffersAccept.url(offerId), {
      preserveScroll: true,
    });
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Offers", href: clientOffersIndex().url },
      ]}
    >
      <Head title="Offers" />

      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Offers</h1>
          <p className="text-sm text-muted-foreground">
            These are offers providers sent to your requests. You can accept one offer to create a
            booking.
          </p>
        </div>

        {/* flash / errors - fixed bottom right auto hide */}
        {showAlert && (flash?.success || errors?.offer) && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50">
            <Alert className="bg-primary/5 backdrop-blur-sm w-full sm:w-[92vw] sm:max-w-md shadow-2xl animate-in slide-in-from-bottom-5 fade-in duration-300">
              {flash?.success ? (
                <CheckCircle2Icon className="text-primary" />
              ) : (
                <XCircleIcon className="text-red-600" />
              )}

              <AlertTitle className={flash?.success ? "text-primary" : "text-red-600"}>
                {flash?.success ? "Success" : "Error"}
              </AlertTitle>

              <AlertDescription className="text-foreground">
                {flash?.success ?? errors?.offer}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Filters */}
        <div className="p-4 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div className="flex flex-wrap gap-2">
            <Link
              href={clientOffersIndex().url}
              className={`px-3 py-1 rounded-3xl border border-gray-200 text-sm ${
                filters.status === ""
                  ? "bg-primary text-foreground"
                  : "bg-primary-foreground/30"
              }`}
            >
              All
            </Link>

            {["sent", "assigned", "rejected"].map((s) => (
              <Link
                key={s}
                href={clientOffersIndex({ query: { status: s } }).url}
                className={`px-3 py-1 rounded-3xl border-gray-200 text-sm border transition duration-700 hover:bg-primary-foreground/40 hover:shadow-2xl ${
                  filters.status === s
                    ? "bg-primary text-foreground"
                    : "bg-primary-foreground/30"
                }`}
              >
                {s}
              </Link>
            ))}
          </div>

          <Link
            href={dashboard().url}
            className="rounded-3xl py-2 text-red-600 border border-gray-200 transition duration-700 hover:bg-red-600 hover:text-white px-3 inline-flex items-center justify-center w-full md:w-auto"
          >
            Back
          </Link>
        </div>

        {/* List */}
        <div className="space-y-3">
          {offers.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-muted-foreground">No offers found.</div>
          ) : (
            offers.data.map((o) => {
              const canAccept = o.status === "sent";

              return (
                <div
                  key={o.id}
                  className="rounded-4xl bg-primary-foreground/30 border border-gray-200 transition duration-700 hover:bg-primary-foreground/40 hover:shadow-3xl p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="text-xl wrap-break-words">{o.request?.title}</div>

                      <div className="text-sm text-foreground flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-2 p-1 rounded-3xl border border-gray-200 w-full sm:w-max max-w-full">
                        <div>{o.request?.category?.name}</div>
                        <div className="flex items-center gap-1 p-2 rounded-3xl border border-gray-200 w-full sm:w-auto">
                          <MapPin className="w-6 h-6 text-red-600 shrink-0" />{" "}
                          <span className="wrap-break-words">{o.request?.city?.name}</span>
                        </div>
                      </div>

                      <div className="text-sm text-foreground mt-2 p-1 rounded-3xl border border-gray-200 flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center w-full sm:w-max max-w-full gap-2">
                        <span>{o.proposed_price} DZD</span>
                        {o.estimated_days ? (
                          <>
                            <div className="p-2 rounded-3xl w-full sm:w-max border border-gray-200 flex items-center gap-2 sm:ml-2">
                              <div className="font-medium flex items-center gap-2">
                                <Clock className="h-5 w-5" /> Days:
                              </div>
                              {o.estimated_days}
                            </div>
                          </>
                        ) : null}
                      </div>

                      <div className="text-sm text-foreground whitespace-pre-line p-2 w-full max-w-full wrap-break-words rounded-3xl bg-primary-foreground/40 border border-gray-200 mt-3">
                        <div className="font-medium">
                          <div className="text-sm text-foreground mt-2 flex items-center gap-2 min-w-0">
                            {o.provider?.avatar_path ? (
                              <img
                                src={o.provider.avatar_path}
                                alt={o.provider.name}
                                className="w-5 h-5 rounded-full object-cover border shrink-0"
                              />
                            ) : (
                              <span className="w-7 h-7 rounded-full border bg-gray-100 shrink-0" />
                            )}
                            <span className="text-sm wrap-break-words">{o.provider?.name}</span>
                          </div>
                        </div>{" "}
                        {o.message}
                      </div>
                    </div>

                    <div className="flex flex-col items-stretch md:items-end gap-2 w-full md:w-max">
                      <span
                        className={`text-xs px-2 py-1 rounded-3xl border border-gray-200 text-center ${
                          o.status === "assigned"
                            ? "text-primary"
                            : o.status === "rejected"
                            ? "bg-red-600"
                            : ""
                        }`}
                      >
                        {o.status}
                      </span>

                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            type="button"
                            disabled={!canAccept || acceptForm.processing}
                            className="rounded-3xl bg-primary px-3 py-2 text-sm text-foreground transition duration-700 hover:bg-foreground hover:text-background hover:shadow-3xl disabled:opacity-50 w-full md:w-max"
                          >
                            {acceptForm.processing ? "Working..." : "Accept"}
                          </button>
                        </DialogTrigger>

                        <DialogContent className="w-[95vw] max-w-md">
                          <DialogTitle>Accept this offer?</DialogTitle>
                          <DialogDescription>
                            This will create a booking and automatically reject the other offers for
                            this request.
                          </DialogDescription>

                          <DialogFooter className="flex-col sm:flex-row gap-2">
                            <DialogClose asChild>
                              <button
                                type="button"
                                className="rounded-3xl border border-gray-200 px-3 py-2 text-sm w-full sm:w-auto"
                              >
                                Cancel
                              </button>
                            </DialogClose>

                            <button
                              type="button"
                              onClick={() => acceptOffer(o.id)}
                              disabled={acceptForm.processing}
                              className="rounded-3xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-50 w-max sm:w-auto"
                            >
                              {acceptForm.processing ? "Processing..." : "Confirm"}
                            </button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {!canAccept ? (
                        <div className="text-xs text-muted-foreground mt-1 md:text-right">
                          You can only accept offers with status <b>sent</b>.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {offers.links?.length > 0 && <PaginationLinks links={offers.links} />}
      </div>
    </AppLayout>
  );
}