import { Head, Link, useForm, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import { index as providerBookingsIndex } from "@/routes/provider/bookings";
import { confirm as confirmCashPayment } from "@/routes/provider/bookings/cash";
import { show as serviceShow } from "@/routes/services";

type UserLite = { id: number; name: string; avatar_path: string | null };

type Service = { id: number; title: string; slug: string };
type RequestItem = { id: number; title: string };
type Offer = { id: number; proposed_price: string; status: string; request?: RequestItem };

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
    booking.payment &&
    booking.payment.payment_type === "cash" &&
    booking.payment.status === "pending";

  const confirmForm = useForm({});

  function confirmCash(e: React.FormEvent) {
    e.preventDefault();
    confirmForm.post(confirmCashPayment.url(booking.id), {
      preserveScroll: true,
    });
  }

  return (
    <AppLayout>
      <Head title={`Provider Booking #${booking.id}`} />

      <div className="p-6 max-w-3xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Booking #{booking.id}</h1>
            <p className="text-sm text-gray-600">{title}</p>
          </div>

          <Link href={providerBookingsIndex.url()} className="text-sm underline">
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
            {booking.client?.avatar_path ? (
              <img
                src={booking.client.avatar_path}
                alt={booking.client.name}
                className="w-8 h-8 rounded-full object-cover border"
              />
            ) : (
              <span className="w-8 h-8 rounded-full border bg-gray-100" />
            )}
            <span>
              Client: <span className="font-medium">{booking.client?.name}</span>
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

        {/* Payment info */}
        <div className="rounded-md border p-4 space-y-2">
          <div className="font-medium">Payment</div>

          {!booking.payment ? (
            <div className="text-sm text-gray-600">Client has not started payment yet.</div>
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
                Platform fee:{" "}
                <span className="font-medium">{booking.payment.platform_fee}</span> {booking.currency}
                {" • "}
                Provider amount:{" "}
                <span className="font-medium">{booking.payment.provider_amount}</span>{" "}
                {booking.currency}
              </div>

              {booking.payment.paid_at ? (
                <div>
                  Paid at: <span className="font-medium">{booking.payment.paid_at}</span>
                </div>
              ) : null}

              {cashNeedsConfirm ? (
                <div className="text-xs text-gray-500">
                  Cash payment is pending. Confirm after you receive the cash from the client.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Confirm cash */}
        {cashNeedsConfirm ? (
          <div className="rounded-md border p-4">
            <div className="font-medium">Confirm cash received</div>
            <p className="text-sm text-gray-600 mt-1">
              Click confirm only if the client paid you cash.
            </p>

            <form onSubmit={confirmCash} className="mt-3">
              <button
                type="submit"
                disabled={confirmForm.processing}
                className="rounded-md bg-black px-4 py-2 text-white text-sm disabled:opacity-60"
              >
                {confirmForm.processing ? "Confirming..." : "Confirm Cash Payment"}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
