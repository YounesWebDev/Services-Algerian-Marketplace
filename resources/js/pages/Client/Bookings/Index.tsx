import { Link, router, usePage } from "@inertiajs/react";
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
      <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>My Bookings</h1>

        <div style={{ marginTop: 12 }}>
          <label style={{ marginRight: 8 }}>Filter by status:</label>
          <select value={filters.status} onChange={onStatusChange}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          {bookings.data.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>ID</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Provider</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Title</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Amount</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Booking</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Payment</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {bookings.data.map((b) => {
                  const title = b.offer?.request?.title || b.service?.title || "Booking";
                  const payStatus = b.payment?.status;
                  const showPay = b.status === "pending" && payStatus !== "paid";

                  return (
                    <tr key={b.id}>
                      <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>#{b.id}</td>

                      <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                        {b.provider?.name ?? "-"}
                      </td>

                      <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{title}</td>

                      <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                        {b.total_amount} {b.currency}
                      </td>

                      <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{b.status}</td>

                      <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                        {paymentLabel(payStatus)}
                      </td>

                      <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                        <Link href={clientBookingsShow.url(b.id)}>View</Link>

                        {showPay && (
                          <span style={{ marginLeft: 10 }}>
                            <Link href={clientBookingsShow.url(b.id)}>Pay</Link>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {bookings.links && bookings.links.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {bookings.links.map((l, idx) => (
              <button
                key={idx}
                disabled={!l.url}
                onClick={() => l.url && router.visit(l.url)}
                style={{
                  padding: "6px 10px",
                  border: "1px solid #ddd",
                  background: l.active ? "#eee" : "white",
                  cursor: l.url ? "pointer" : "not-allowed",
                }}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
