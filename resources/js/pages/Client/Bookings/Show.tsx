import { Link, useForm, usePage } from "@inertiajs/react";
import { BadgeCheck, CircleX, ClipboardList, Clock, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as clientBookingsIndex, payment as bookingPayment } from "@/routes/client/bookings";
import { create as disputeCreate } from "@/routes/client/bookings/dispute";
import { confirm as bookingPaymentConfirm } from "@/routes/client/bookings/payment";
import { show as serviceShow } from "@/routes/services";
type Provider = { id: number; name: string; avatar_path: string | null };
type Service = { id: number; title: string; slug: string };
type RequestItem = { id: number; title: string };
type Offer = { id: number; proposed_price: string; status: string; request?: RequestItem };

type PaymentType = "cash" | "online";

type Payment = {
  id: number;
  status: string; // pending | paid
  payment_type: "cash" | "online";
  amount: string;
  platform_fee: string;
  provider_amount: string;
  paid_at: string | null;
};

type Review = {
  id: number;
  booking_id: number;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
};

type Dispute = {
  id: number;
  booking_id: number;
  status: string;
};

type BookingItem = {
  id: number;
  source: string;
  status: string;
  total_amount: string;
  currency: string;
  scheduled_at: string | null;
  service_id?: number | null;

  provider: Provider;

  service?: Service | null;
  offer?: Offer | null;
  payment?: Payment | null;
  review?: Review | null;
  dispute?: Dispute | null;
};

export default function ClientBookingShow() {
  const { props } = usePage<{
    booking: BookingItem;
    fee?: { commission_rate: string; fixed_fee: string | null } | null;
    errors: Record<string, string>;
    flash?: { success?: string };
  }>();

  const { booking, fee, errors, flash } = props;

  const title =
    booking.source === "service"
      ? booking.service?.title ?? "Service booking"
      : booking.offer?.request?.title ?? "Request booking";

  // Payment choose form (cash/online + card fields)
  const payForm = useForm<{
    payment_type: PaymentType;
    card_number: string;
    expiry_month: string;
    expiry_year: string;
    cvc: string;
  }>({
    payment_type: "cash",
    card_number: "",
    expiry_month: "",
    expiry_year: "",
    cvc: "",
  });

  function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    payForm.post(bookingPayment.url(booking.id), {
      preserveScroll: true,
    });
  }

  // OTP confirm form
  const otpForm = useForm({
    otp: "",
  });

  function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    otpForm.post(bookingPaymentConfirm.url(booking.id), {
      preserveScroll: true,
    });
  }

  const canPay = booking.status === "pending" || booking.status === "confirmed";
  const canCancel = booking.status === "pending" || booking.status === "confirmed";
  const canDispute = ["confirmed", "in_progress", "completed"].includes(booking.status);

  const cancelForm = useForm({});

  function submitCancel(e: React.FormEvent) {
    e.preventDefault();
    cancelForm.post(`/bookings/${booking.id}/cancel`, {
      preserveScroll: true,
    });
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Bookings", href: clientBookingsIndex().url },
        { title: "Booking details", href: clientBookingsIndex().url },
      ]}
    >
      <div className="p-6 max-w-3xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Booking </h1>
            <p className="text-2xl text-primary text-foredround">{title}</p>
          </div>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-sm rounded-3xl px-3 py-2 border border-gray-200 text-red-600 text-bold transition duration-700 hover:bg-foreground"
          >
            Back
          </button>
        </div>

        {/* Flash + errors */}
        {flash?.success ? (
          <div className="rounded-md border p-3 text-sm bg-green-50">
            {flash.success}
          </div>
        ) : null}

        {errors?.payment ? (
          <div className="rounded-md border p-3 text-sm bg-red-50 text-red-700">
            {errors.payment}
          </div>
        ) : null}

        {errors?.booking ? (
          <div className="rounded-md border p-3 text-sm bg-red-50 text-red-700">
            {errors.booking}
          </div>
        ) : null}

        {/* Booking info */}
        <div className="rounded-4xl bg-primary-foreground/30 border border-gray-200 p-4 space-y-2">
          <div className="text-sm text-foreground p-1 rounded-3xl border border-gray-200 w-fit max-w-full flex flex-wrap items-center gap-2">
                                  <span>Status</span>{" "}
                                  {booking.status === "in_progress" ? (
                                    <div className="font-medium rounded-3xl p-2 border border-gray-200 text-amber-400 flex items-center gap-2">
                                      <ClipboardList className="h-4 w-4" /> in progress
                                    </div>
                                  ) : booking.status === "confirmed" ? (
                                    <div className="font-medium rounded-3xl p-2 border border-gray-200 text-primary flex items-center gap-2">
                                      <BadgeCheck className="h-4 w-4" />
                                      {booking.status}
                                    </div>
                                  ) : booking.status === "pending" ? (
                                    <div className="font-medium rounded-3xl p-2 border border-gray-200 text-amber-400 flex items-center gap-2">
                                      <Clock className="h-4 w-4" /> {booking.status}
                                    </div>
                                  ) : booking.status === "completed" ? (
                                    <div className="font-medium rounded-3xl p-2 border border-gray-200 text-primary flex items-center gap-2">
                                      <BadgeCheck className="h-4 w-4" />
                                      {booking.status}
                                    </div>
                                  ) : booking.status === "cancelled" ? (
                                    <div className="font-medium rounded-3xl p-2 border border-gray-200 text-red-600 flex items-center gap-2">
                                      <CircleX className="h-4 w-4" /> {booking.status}
                                    </div>
                                  ) : null}
                                </div>
                                <div className="text-sm text-foreground p-1 rounded-3xl border border-gray-200 w-fit max-w-full flex flex-wrap items-center gap-2">
                        <span>Total</span>
                        <div className="font-medium p-2 rounded-3xl border border-gray-200 break-words">
                          {booking.total_amount} {booking.currency}
                        </div>
                      </div>

                      {booking.scheduled_at ? (
                        <div className="p-1 rounded-3xl border border-gray-200 flex items-center gap-2 w-max">
                          <div>Scheduled</div>
                          <div className="rounded-3xl p-2 border border-gray-200">{booking.scheduled_at}</div>
                        </div>
                      ) : null}

          

          <div className="text-sm text-foreground flex items-center rounded-3xl p-2 border border-gray-200 w-max  gap-2 my-2">
            {booking.provider?.avatar_path ? (
              <img
                src={booking.provider.avatar_path}
                alt={booking.provider.name}
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <span className="w-8 h-8 rounded-full border bg-gray-100" />
            )}
            <div>
               <span className="font-medium">{booking.provider?.name}</span>
            </div>
          </div>

          {booking.source === "service" && booking.service?.slug ? (
            <div className="text-sm mt-2">
              <Link className="p-2 rounded-3xl border border-gray-200  bg-primary transition duration-700 hover:bg-foreground hover:text-background mt-2 " href={serviceShow.url(booking.service.slug)}>
                View service
              </Link>
            </div>
          ) : null}
        </div>

        {/* Fee explanation (optional) */}
        {fee ? (
          <div className="rounded-4xl bg-primary-foreground/30 border border-gray-200 p-4 text-sm text-foreground">
            <div className="font-medium mb-1 flex items-center gap-2"><Info /> Platform fees (for understanding)</div>
            <div className="p-1 rounded-3xl border border-gray-200 flex items-center gap-2 w-max">
              Commission rate <span className="font-medium p-2 rounded-3xl border border-gray-200 text-primary  ">{fee.commission_rate}%</span>
              {fee.fixed_fee ? (
                <>
                  {" "}
                   Fixed fee: <span className="font-medium">{fee.fixed_fee}</span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Cancel booking */}
        {canCancel ? (
          <div className="rounded-4xl  border border-gray-200  bg-primary-foreground/30 p-4">
            <div className="font-medium  ">Cancel booking</div>
            <p className="text-sm text-foreground mt-1">
              You can cance l while the booking is pending or confirmed.
            </p>
            <form onSubmit={submitCancel} className="mt-3">
              <button
                type="submit"
                disabled={cancelForm.processing}
                className=" rounded-4xl border border-gray-200 px-4 py-2 text-red-600 text-sm disabled:opacity-60 transition duration-700 hover:bg-red-600 hover:text-white"
              >
                {cancelForm.processing ? "Cancelling..." : "Cancel booking"}
              </button>
            </form>
          </div>
        ) : null}

        {booking.status === "completed" && !booking.review ? (
          <div className="rounded-md border p-4">
            <div className="font-medium">Review</div>
            <p className="text-sm text-foreground mt-1">
              Share your feedback about this booking.
            </p>
            <div className="mt-3">
              <Button asChild>
                <Link href={`/bookings/${booking.id}/review`}>
                  {booking.service_id ? "Review this service" : "Review provider"}
                </Link>
              </Button>
            </div>
          </div>
        ) : null}

        {canDispute && !booking.dispute ? (
          <div className="rounded-4xl  border border-gray-200 bg-primary-foreground/30 p-4">
            <div className="font-medium">Dispute</div>
            <p className="text-sm text-foreground mt-1">
              Open a dispute if there is an issue with this booking.
            </p>
            <div className="mt-3">
              <button >
                <Link href={disputeCreate(booking.id).url} className="rounded-3xl p-2 border border-gray-200 bg-primary transition duration-700 hover:bg-foreground hover:text-background ">Open dispute</Link>
              </button>
            </div>
          </div>
        ) : null}

        {/* Payment status */}
        <div className="rounded-4xl border border-gray-200 bg-primary-foreground/30 p-4 space-y-2">
          <div className="font-medium">Payment</div>

          {!booking.payment ? (
            <div className="text-sm text-foreground">
              No payment yet. Choose Cash or Online below.
            </div>
          ) : (
            <div className="text-sm text-foreground space-y-1">
              <div className="flex items-center rounded-3xl p-1 border border-gray-200 w-max gap-2">
                Type <div className="font-medium flex items-center rounded-3xl p-2 border border-gray-200">{booking.payment.payment_type}</div> 
              </div>
              <div className="text-sm flex items-center rounded-3xl p-1 border border-gray-200 w-max gap-2"> Status{" "}
                <div className="font-medium flex items-center rounded-3xl p-2 border border-gray-200 w-max gap-2 ">{booking.payment.status}</div></div>
              <div className="flex items-center rounded-3xl p-1 border border-gray-200 w-max gap-2">
                Amount <div className="font-medium flex items-center rounded-3xl p-2 border border-gray-200 w-max gap-2">{booking.payment.amount}  {booking.currency}</div>{" "}
               
              </div>
              <div className="flex items-center rounded-3xl p-2 border border-gray-200 w-max gap-2">
                Platform fee: <div className="font-medium">{booking.payment.platform_fee}</div>{" "}
                {booking.currency} • Provider amount:{" "}
                <div className="font-medium">{booking.payment.provider_amount}</div>{" "}
                {booking.currency}
              </div>
              {booking.payment.paid_at ? (
                <div>
                  Paid at: <span className="font-medium">{booking.payment.paid_at}</span>
                </div>
              ) : null}

              {booking.payment.payment_type === "cash" && booking.payment.status === "pending" ? (
                <div className="text-xs text-muted-foreground">
                  Cash selected. Waiting for provider to confirm cash payment.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Choose payment type */}
        {!booking.payment ? (
          <div className="rounded-4xl  border border-gray-200 bg-primary-foreground/30 p-4">
          <div className="font-medium">Choose payment method</div>
          <p className="text-sm text-muted-foreground mt-1">
            - Online: fill card form → we send OTP to <b>+000000000</b> (code is always <b>000000</b>). <br />
            - Cash: provider will confirm cash later.
          </p>

          <form onSubmit={submitPayment} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium">Payment type</label>
              <select
                className="mt-1 w-full rounded-3xl border border-gray-200 p-2"
                value={payForm.data.payment_type}
                onChange={(e) =>
                  payForm.setData(
                    "payment_type",
                    e.target.value === "online" ? "online" : "cash",
                  )
                }
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>

            {payForm.data.payment_type === "online" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Card number</label>
                  <input
                    className="mt-1 w-full rounded-3xl border border-gray-200 p-2"
                    value={payForm.data.card_number}
                    onChange={(e) => payForm.setData("card_number", e.target.value)}
                    placeholder="Example: 4111111111111111"
                    inputMode="numeric"
                    maxLength={16}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium">Expiry month</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-3xl border border-gray-200 p-2"
                      value={payForm.data.expiry_month}
                      onChange={(e) => payForm.setData("expiry_month", e.target.value)}
                      placeholder="12"
                      min={1}
                      max={12}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Expiry year</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-3xl border border-gray-200 p-2"
                      value={payForm.data.expiry_year}
                      onChange={(e) => payForm.setData("expiry_year", e.target.value)}
                      placeholder="2028"
                      min={2026}
                      max={2100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium">CVC</label>
                    <input
                      className="mt-1 w-full rounded-3xl border border-gray-200 p-2"
                      value={payForm.data.cvc}
                      onChange={(e) => payForm.setData("cvc", e.target.value)}
                      placeholder="123"
                      inputMode="numeric"
                      maxLength={3}
                    />
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  OTP will be sent to: <b>+000000000</b>
                </div>
              </div>
            ) : null}

            {/* errors from validation */}
            {payForm.hasErrors ? (
              <div className="text-sm text-red-600">
                {payForm.errors.payment_type ||
                  payForm.errors.card_number ||
                  payForm.errors.expiry_month ||
                  payForm.errors.expiry_year ||
                  payForm.errors.cvc ||
                  ""}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={!canPay || payForm.processing}
              className="rounded-3xl bg-primary px-4 py-2 text-foreground transiton duration-700 hover:text-background hover:bg-foreground text-sm disabled:opacity-60"
            >
              {payForm.processing ? "Saving..." : "Continue"}
            </button>

            {!canPay ? (
              <p className="text-xs text-gray-500">
                You can only pay when booking status is <b>pending</b> or <b>confirmed</b>.
              </p>
            ) : null}
          </form>
        </div>
        ) : null}

        {/* OTP confirm section (only if payment exists and is online pending) */}
        {booking.payment && booking.payment.payment_type === "online" && booking.payment.status === "pending" ? (
          <div className="rounded-4xl  border border-gray-200 bg-primary-foreground/30 p-4">
            <div className="font-medium">Confirm online payment (OTP)</div>
            <p className="text-sm text-muted-foreground mt-1">
              Enter code <b>000000</b> to confirm.
            </p>

            <form onSubmit={submitOtp} className="mt-3 flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium">OTP</label>
                <input
                  className="mt-1 w-full rounded-3xl border border-gray-200  p-2"
                  value={otpForm.data.otp}
                  onChange={(e) => otpForm.setData("otp", e.target.value)}
                  placeholder="000000"
                />
                {otpForm.errors.otp ? (
                  <div className="text-sm text-red-600 mt-1">{otpForm.errors.otp}</div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={otpForm.processing}
                className="rounded-3xl bg-primary px-4 py-2 text-foreground transiton duration-700 hover:text-background hover:bg-foreground text-sm disabled:opacity-60"
              >
                {otpForm.processing ? "Confirming..." : "Confirm Payment"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
