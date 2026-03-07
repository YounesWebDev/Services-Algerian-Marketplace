import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
  Briefcase,
  CircleCheckBig,
  CircleDollarSign,
  CircleX,
  ClipboardCheck,
  Clock,
  CreditCard,
  OctagonAlert,
} from "lucide-react";
import { CheckCircle2Icon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import AppLayout from "@/layouts/app-layout";
import {
  index as providerBookingsIndex,
  status as bookingStatusUpdate,
} from "@/routes/provider/bookings";
import { confirm as confirmCashPayment } from "@/routes/provider/bookings/cash";


type UserLite = { id: number; name: string; avatar_path: string | null };

type Service = { id: number; title: string; slug: string };
type RequestItem = { id: number; title: string };
type Offer = {
  id: number;
  proposed_price: string;
  status: string;
  request?: RequestItem;
};

type Payment = {
  id: number;
  status: string; // pending | paid
  payment_type: "cash" | "online";
  amount: string;
  platform_fee: string;
  provider_amount: string;
  paid_at: string | null;
};

type BookingItem = {
  id: number;
  source: string;
  status: string;
  total_amount: string;
  currency: string;
  scheduled_at: string | null;

  client: UserLite;
  provider: UserLite;

  service?: Service | null;
  offer?: Offer | null;
  payment?: Payment | null;
};

function getAllowedNextStatuses(current: string): string[] {
  if (current === "pending") return ["confirmed", "cancelled"];
  if (current === "confirmed") return ["in_progress", "cancelled"];
  if (current === "in_progress") return ["completed"];
  return [];
}

function StatusPill({ status }: { status: string }) {
  const s = status;

  if (s === "pending") {
    return (
      <span className="font-medium p-2 text-amber-400 flex items-center gap-2">
        <Clock className="h-5 w-5" /> {s}
      </span>
    );
  }

  if (s === "confirmed") {
    return (
      <span className="font-medium p-2 text-primary flex items-center gap-2">
        <CircleCheckBig className="h-5 w-5" /> {s}
      </span>
    );
  }

  if (s === "in_progress") {
    return (
      <span className="font-medium p-2 text-amber-400 flex items-center gap-2">
        <Briefcase className="h-5 w-5" /> {s}
      </span>
    );
  }

  if (s === "completed") {
    return (
      <span className="font-medium p-2 text-primary flex items-center gap-2">
        <ClipboardCheck className="h-5 w-5" /> {s}
      </span>
    );
  }

  if (s === "cancelled") {
    return (
      <span className="font-medium p-2 text-red-600 flex items-center gap-2">
        <CircleX className="h-5 w-5" /> {s}
      </span>
    );
  }

  return null;
}

type AlertVariant = "success" | "error" | "info";

export default function ProviderBookingShow() {
  const { props } = usePage<{
    booking: BookingItem;
    errors: Record<string, string>;
    flash?: { success?: string };
  }>();

  const { booking, errors, flash } = props;

  const title =
    booking.source === "service"
      ? booking.service?.title ?? "Service booking"
      : booking.offer?.request?.title ?? "Request booking";

  const cashNeedsConfirm =
    !!booking.payment &&
    booking.payment.payment_type === "cash" &&
    booking.payment.status === "pending";

  /**
   * ------------------------
   * Shared Animated Alert
   * ------------------------
   */
  const [showAlert, setShowAlert] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [alertContent, setAlertContent] = useState<{
    title: string;
    description: string;
    variant: AlertVariant;
  }>({ title: "", description: "", variant: "success" });

  // Use number to avoid the "Timeout vs number" TS issue across setups
  const hideTimer = useRef<number | null>(null);
  const removeTimer = useRef<number | null>(null);

  function clearTimers() {
    if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
    if (removeTimer.current !== null) window.clearTimeout(removeTimer.current);
    hideTimer.current = null;
    removeTimer.current = null;
  }

  function pushAlert(variant: AlertVariant, titleText: string, descText: string) {
    if (typeof window === "undefined") return;

    clearTimers();

    setAlertContent({ variant, title: titleText, description: descText });
    setShowAlert(true);

    // next tick -> play transition
    window.setTimeout(() => setAnimate(true), 10);

    // stay 8s then slide out, then remove
    hideTimer.current = window.setTimeout(() => {
      setAnimate(false);
      removeTimer.current = window.setTimeout(() => setShowAlert(false), 300);
    }, 8000);
  }

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") clearTimers();
    };
     
  }, []);

  // Flash success -> animated alert
  useEffect(() => {
    if (flash?.success) {
      pushAlert("success", "Success", flash.success);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash?.success]);

  // Errors -> animated alert
  useEffect(() => {
    if (errors?.payment) pushAlert("error", "Payment error", errors.payment);
    else if (errors?.status) pushAlert("error", "Status error", errors.status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errors?.payment, errors?.status]);

  /**
   * ------------------------
   * Forms
   * ------------------------
   */

  // Cash confirm form
  const confirmCashForm = useForm({});

  function confirmCash(e: React.FormEvent) {
    e.preventDefault();

    confirmCashForm.post(confirmCashPayment.url(booking.id), {
      onSuccess: () =>
        pushAlert("success", "Cash confirmed", "Payment marked as received."),
      onError: () =>
        pushAlert("error", "Failed", "Could not confirm cash payment."),
      preserveScroll: true,
    });
  }

  // Status update form
  const allowed = useMemo(
    () => getAllowedNextStatuses(booking.status),
    [booking.status],
  );

  const nextStatus = allowed[0] ?? "";

  const statusForm = useForm<{ status: string }>({
    status: nextStatus,
  });

  useEffect(() => {
    statusForm.setData("status", nextStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextStatus]);

  function updateStatus(e: React.FormEvent) {
    e.preventDefault();

    const url = bookingStatusUpdate.url(booking.id);

    statusForm.post(url, {
      onSuccess: () =>
        pushAlert(
          "success",
          "Status updated",
          `Booking status updated to "${statusForm.data.status}".`,
        ),
      onError: () =>
        pushAlert("error", "Failed", "Could not update booking status."),
      preserveScroll: true,
    });
  }

  const alertIcon =
    alertContent.variant === "error" ? (
      <OctagonAlert className="text-red-600" />
    ) : (
      <CheckCircle2Icon className="text-primary" />
    );

  const alertTitleClass =
    alertContent.variant === "error" ? "text-red-600" : "text-primary";

  const alertBgClass =
    alertContent.variant === "error" ? "bg-red-500/10" : "bg-primary/5";

  return (
    <AppLayout>
      <Head title={`Provider Booking #${booking.id}`} />

      {/* Animated Alert */}
      

      <div className="p-6 max-w-3xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-foreground">Booking details</p>
          </div>

          <Link
            href={providerBookingsIndex.url()}
            className="text-sm rounded-3xl text-red-600 bg-primary-foreground/30 px-3 py-2 border border-gray-200 hover:bg-red-600 hover:text-white transition duration-700"
          >
            Back
          </Link>
        </div>
        {showAlert ? (
          <div className="fixed bottom-6 right-6 z-50">
            <Alert
              className={[
                alertBgClass,
                "backdrop-blur-sm w-[92vw] sm:w-96 shadow-2xl transition-all duration-300",
                animate ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
              ].join(" ")}
            >
              {alertIcon}
              <AlertTitle className={alertTitleClass}>
                {alertContent.title}
              </AlertTitle>
              <AlertDescription className="text-foreground">
                {alertContent.description}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        {/* Booking card */}
        <div className="rounded-4xl border border-gray-200 bg-primary-foreground/30 transition duration-700 hover:bg-primary-foreground/40 hover:shadow-2xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="space-y-2 min-w-0">
              <div className="font-bold text-lg sm:text-2xl">{title}</div>

              {/* client */}
              <span className="inline-flex items-center gap-2 min-w-0">
                {booking.client?.avatar_path ? (
                  <img
                    src={booking.client.avatar_path}
                    alt={booking.client.name}
                    className="w-7 h-7 sm:w-6 sm:h-6 rounded-full object-cover border shrink-0"
                  />
                ) : (
                  <span className="w-7 h-7 sm:w-6 sm:h-6 rounded-full border border-transparent shrink-0" />
                )}

                <span className="font-medium truncate max-w-[70vw] sm:max-w-none">
                  {booking.client?.name}
                </span>
              </span>

              {/* status + amount */}
              <div className="text-sm text-foreground p-1 border border-gray-200 rounded-3xl flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-max">
                <StatusPill status={booking.status} />

                <div className="font-medium rounded-3xl border border-gray-200 p-2 text-primary ml-auto sm:ml-0">
                  {booking.total_amount} {booking.currency}
                </div>
              </div>

              {/* payment */}
              <div className="text-xs text-foreground mt-2 p-1 rounded-3xl border border-gray-200 w-full sm:w-max flex flex-wrap items-center gap-2">
                <span className="shrink-0">Payment:</span>

                {booking.payment ? (
                  <>
                    {booking.payment.payment_type === "online" ? (
                      <span className="font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />{" "}
                        {booking.payment.payment_type}
                      </span>
                    ) : (
                      <span className="font-medium flex items-center gap-2">
                        <CircleDollarSign className="h-4 w-4" />{" "}
                        {booking.payment.payment_type}
                      </span>
                    )}

                    <span className="font-medium p-2 rounded-3xl border border-gray-200">
                      {booking.payment.status}
                    </span>

                    {cashNeedsConfirm ? (
                      <span className="text-foreground-muted">
                        (needs your confirmation)
                      </span>
                    ) : null}
                  </>
                ) : (
                  <span className="font-medium">not started</span>
                )}
              </div>

              {/* Status update */}
              {allowed.length ? (
                <form onSubmit={updateStatus} className="w-full sm:w-auto space-y-2">
                  <div className="text-sm font-medium rounded-3xl">Status</div>

                  <select
                    value={statusForm.data.status}
                    onChange={(e) => statusForm.setData("status", e.target.value)}
                    className="w-full sm:w-56 rounded-3xl border border-gray-200 bg-primary-foreground/30 p-2"
                  >
                    {allowed.map((s) => (
                      <option className="text-black" key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    disabled={statusForm.processing || !statusForm.data.status}
                    className="w-full sm:w-auto rounded-4xl bg-primary ml-3 hover:bg-foreground hover:text-background transition duration-700 px-4 py-2 text-white text-sm disabled:opacity-60"
                  >
                    {statusForm.processing ? "Updating..." : "Update Status"}
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>

        {/* Payment info */}
        <div className="rounded-4xl border border-gray-200 bg-primary-foreground/30 transition duration-700 hover:bg-primary-foreground/40 p-4 space-y-2">
          <div className="font-medium">Payment</div>

          {!booking.payment ? (
            <div className="text-sm text-foreground">
              Client has not started payment yet.
            </div>
          ) : (
            <div className="text-sm text-foreground space-y-1">
              <div className="p-2 rounded-3xl border border-gray-200 w-max">
                Amount :{" "}
                <span className="font-medium">{booking.payment.amount}</span>{" "}
                {booking.currency}
              </div>

              <div className="p-1 rounded-3xl border border-gray-200 w-max flex items-center gap-1">
                <div className="p-2 rounded-3xl border border-gray-200 w-max">
                  Platform fee :{" "}
                  <span className="font-medium">{booking.payment.platform_fee}</span>{" "}
                  {booking.currency}
                </div>

                <div className="p-2 rounded-3xl border border-gray-200 w-max">
                  Provider amount :{" "}
                  <span className="font-medium">{booking.payment.provider_amount}</span>{" "}
                  {booking.currency}
                </div>
              </div>

              {booking.payment.paid_at ? (
                <div>
                  Paid at :{" "}
                  <span className="font-medium">{booking.payment.paid_at}</span>
                </div>
              ) : null}

              {cashNeedsConfirm ? (
                <div className="text-xs text-foreground-muted">
                  Cash payment is pending. Confirm after you receive the cash from
                  the client.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Confirm cash */}
        {cashNeedsConfirm ? (
          <div className="rounded-4xl border border-gray-200 bg-primary-foreground/30 transition duration-700 hover:bg-primary-foreground/40 p-4">
            <div className="text-3xl">Confirm cash received</div>
            <p className="text-sm text-gray-300 mt-1">
              Click confirm only if the client paid you cash.
            </p>

            <form onSubmit={confirmCash} className="mt-3">
              <button
                type="submit"
                disabled={confirmCashForm.processing}
                className="bg-primary rounded-3xl transition duration-700 hover:bg-foreground hover:text-background px-4 py-2 text-white text-sm disabled:opacity-60"
              >
                {confirmCashForm.processing ? "Confirming..." : "Confirm Cash Payment"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
