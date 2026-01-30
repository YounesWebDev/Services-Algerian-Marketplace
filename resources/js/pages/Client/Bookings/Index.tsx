import { Link, router, usePage } from "@inertiajs/react";
import { CreditCard, Eye } from "lucide-react";
import React from "react";

import AppLayout from "@/layouts/app-layout";
import {
  index as clientBookingsIndex,
  show as clientBookingsShow,
} from "@/routes/client/bookings";

type PaymentMini = { status: string };

type Booking = {
  id: number;
  status: string;
  total_amount: string | number;
  currency: string;

  payment?: PaymentMini | null;

  provider?: { id: number; name: string; avatar_path?: string | null };
  offer?: { id: number; proposed_price: string | number; status: string; request?: { title: string } };
  service?: { id: number; title: string; slug: string };
};

type PaginationLink = { url: string | null; label: string; active: boolean };
type Paginated<T> = { data: T[]; links: PaginationLink[] };

type PageProps = {
  bookings: Paginated<Booking>;
  filters: { status: string };
};

export default function Index() {
  const { bookings, filters } = usePage<PageProps>().props;

  const onStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    const url = status
      ? clientBookingsIndex.url({ query: { status } })
      : clientBookingsIndex.url();

    router.get(url, {}, { preserveState: true, replace: true });
  };

  const paymentLabel = (status?: string) => {
    if (!status) return "Not created";
    if (status === "paid") return "Paid";
    if (status === "pending") return "Pending";
    return status;
  };

  return (
    <AppLayout>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary">My Bookings</h1>

        <div className="mt-3 p-2 border border-gray-200 rounded-3xl w-max flex items-center">
          <label className="mr-2">Filter by status:</label>
          <select value={filters.status} onChange={onStatusChange} className="border border-gray-300 rounded-3xl px-2 py-1 bg-background text-foreground">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mt-4">
          {bookings.data.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="overflow-x-auto bg-foreground/30 rounded-4xl p-4 border border-gray-200">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left border-b border-gray-300 p-2">ID</th>
                    <th className="text-left border-b border-gray-300 p-2">Provider</th>
                    <th className="text-left border-b border-gray-300 p-2">Title</th>
                    <th className="text-left border-b border-gray-300 p-2">Amount</th>
                    <th className="text-left border-b border-gray-300 p-2">Booking</th>
                    <th className="text-left border-b border-gray-300 p-2">Payment</th>
                    <th className="text-left border-b border-gray-300 p-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.data.map((b) => {
                    const title = b.offer?.request?.title || b.service?.title || "Booking";
                    const payStatus = b.payment?.status;
                    const showPay = b.status === "pending" && payStatus !== "paid";

                    return (
                      <tr key={b.id}>
                        <td className="border-b border-gray-200 p-2">#{b.id}</td>

                        <td className="border-b border-gray-200 p-2">
                          {b.provider?.name ?? "-"}
                        </td>

                        <td className="border-b border-gray-200 p-2">{title}</td>

                        <td className="border-b border-gray-200 p-2">
                          {b.total_amount} {b.currency}
                        </td>

                        <td className="border-b border-gray-200 p-2">{b.status}</td>

                        <td className="border-b border-gray-200 p-2">
                          {paymentLabel(payStatus)}
                        </td>

                        <td className="border-b border-gray-200 w-max space-x-2 flex justify-center p-1 rounded-3xl">
                          <Link href={clientBookingsShow.url(b.id)} className="text-primary hover:underline">
                            <Eye/>
                          </Link>

                          {showPay && (
                            <Link href={clientBookingsShow.url(b.id)} className="text-primary hover:underline">
                              <CreditCard/>
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {bookings.links && bookings.links.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {bookings.links.map((l, idx) => (
              <button
                key={idx}
                disabled={!l.url}
                onClick={() => l.url && router.visit(l.url)}
                className={`px-2.5 py-1.5 border border-gray-300 bg-foreground rounded-3xl transition ${
                  l.active ? "bg-foreground text-background" : "bg-white text-foreground"
                } ${l.url ? "cursor-pointer bg-primary hover:bg-foreground hover:text-background" : "cursor-not-allowed opacity-50"}`}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
