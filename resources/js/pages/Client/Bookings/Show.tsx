import { Head, Link, useForm, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import { index as clientBookingsIndex, payment as bookingPayment } from "@/routes/client/bookings";
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

type BookingItem = {
  id: number;
  source: string;
  status: string;
  total_amount: string;
  currency: string;
  scheduled_at: string | null;

  provider: Provider;

  service?: Service | null;
  offer?: Offer | null;
  payment?: Payment | null;
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

  return (
    <AppLayout>
      <Head title={`Booking #${booking.id}`} />

      <div className="p-6 max-w-3xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Booking #{booking.id}</h1>
            <p className="text-sm text-gray-600">{title}</p>
          </div>

          <Link href={clientBookingsIndex.url()} className="text-sm underline">
            Back
          </Link>
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

        {/* Booking info */}
        <div className="rounded-md border p-4 space-y-2">
          <div className="text-sm text-gray-600">
            Source: <span className="font-medium">{booking.source}</span> • Status:{" "}
            <span className="font-medium">{booking.status}</span>
          </div>

          <div className="text-sm text-gray-600">
            Total: <span className="font-medium">{booking.total_amount}</span> {booking.currency}
            {booking.scheduled_at ? (
              <>
                {" "}
                • Scheduled: <span className="font-medium">{booking.scheduled_at}</span>
              </>
            ) : null}
          </div>

          <div className="text-sm text-gray-600 flex items-center gap-2 mt-2">
            {booking.provider?.avatar_path ? (
              <img
                src={booking.provider.avatar_path}
                alt={booking.provider.name}
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <span className="w-8 h-8 rounded-full border bg-gray-100" />
            )}
            <span>
              Provider: <span className="font-medium">{booking.provider?.name}</span>
            </span>
          </div>

          {booking.source === "service" && booking.service?.slug ? (
            <div className="text-sm">
              <Link className="underline" href={serviceShow.url(booking.service.slug)}>
                View service
              </Link>
            </div>
          ) : null}
        </div>

        {/* Fee explanation (optional) */}
        {fee ? (
          <div className="rounded-md border p-4 text-sm text-gray-700">
            <div className="font-medium mb-1">Platform fees (for understanding)</div>
            <div>
              Commission rate: <span className="font-medium">{fee.commission_rate}</span>
              {fee.fixed_fee ? (
                <>
                  {" "}
                  • Fixed fee: <span className="font-medium">{fee.fixed_fee}</span>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {/* Payment status */}
        <div className="rounded-md border p-4 space-y-2">
          <div className="font-medium">Payment</div>

          {!booking.payment ? (
            <div className="text-sm text-gray-600">
              No payment yet. Choose Cash or Online below.
            </div>
          ) : (
            <div className="text-sm text-gray-700 space-y-1">
              <div>
                Type: <span className="font-medium">{booking.payment.payment_type}</span> • Status:{" "}
                <span className="font-medium">{booking.payment.status}</span>
              </div>
              <div>
                Amount: <span className="font-medium">{booking.payment.amount}</span>{" "}
                {booking.currency}
              </div>
              <div>
                Platform fee: <span className="font-medium">{booking.payment.platform_fee}</span>{" "}
                {booking.currency} • Provider amount:{" "}
                <span className="font-medium">{booking.payment.provider_amount}</span>{" "}
                {booking.currency}
              </div>
              {booking.payment.paid_at ? (
                <div>
                  Paid at: <span className="font-medium">{booking.payment.paid_at}</span>
                </div>
              ) : null}

              {booking.payment.payment_type === "cash" && booking.payment.status === "pending" ? (
                <div className="text-xs text-gray-500">
                  Cash selected. Waiting for provider to confirm cash payment.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Choose payment type */}
        {!booking.payment ? (
          <div className="rounded-md border p-4">
          <div className="font-medium">Choose payment method</div>
          <p className="text-sm text-gray-600 mt-1">
            - Online: fill card form → we send OTP to <b>+000000000</b> (code is always <b>000000</b>). <br />
            - Cash: provider will confirm cash later.
          </p>

          <form onSubmit={submitPayment} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium">Payment type</label>
              <select
                className="mt-1 w-full rounded-md border p-2"
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
                    className="mt-1 w-full rounded-md border p-2"
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
                      className="mt-1 w-full rounded-md border p-2"
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
                      className="mt-1 w-full rounded-md border p-2"
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
                      className="mt-1 w-full rounded-md border p-2"
                      value={payForm.data.cvc}
                      onChange={(e) => payForm.setData("cvc", e.target.value)}
                      placeholder="123"
                      inputMode="numeric"
                      maxLength={3}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500">
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
              className="rounded-md bg-black px-4 py-2 text-white text-sm disabled:opacity-60"
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
          <div className="rounded-md border p-4">
            <div className="font-medium">Confirm online payment (OTP)</div>
            <p className="text-sm text-gray-600 mt-1">
              Enter code <b>000000</b> to confirm.
            </p>

            <form onSubmit={submitOtp} className="mt-3 flex flex-col md:flex-row gap-3 md:items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium">OTP</label>
                <input
                  className="mt-1 w-full rounded-md border p-2"
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
                className="rounded-md bg-black px-4 py-2 text-white text-sm disabled:opacity-60"
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
