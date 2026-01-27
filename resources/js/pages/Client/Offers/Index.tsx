import { router, usePage } from "@inertiajs/react";
import React from "react";

import AppLayout from "@/layouts/app-layout";
import { accept as acceptOfferRoute, index as clientOffersIndex } from "@/routes/client/offers";

type Offer = {
  id: number;
  message: string;
  proposed_price: string | number;
  estimated_days?: number | null;
  status: "sent" | "assigned" | "rejected" | string;
  provider?: { id: number; name: string; avatar_path?: string | null };
  request?: { id: number; title: string; status: string };
};

type PaginationLink = { url: string | null; label: string; active: boolean };
type Paginated<T> = { data: T[]; links: PaginationLink[] };

type PageProps = {
  offers: Paginated<Offer>;
  filters: { status: string };
  errors?: Record<string, string>;
  flash?: { success?: string };
};

export default function Index() {
  const { offers, filters, flash } = usePage<PageProps>().props;

  const onStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;

    router.get(
      clientOffersIndex.url(),
      { status: status || undefined },
      { preserveState: true, replace: true }
    );
  };

  const acceptOffer = (offerId: number) => {
    router.post(acceptOfferRoute.url(offerId));
  };

  return (
    <AppLayout>
      <div style={{ padding: 16, maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Offers</h1>

        {flash?.success && (
          <div style={{ marginTop: 12, padding: 10, border: "1px solid #cfc" }}>
            {flash.success}
          </div>
        )}

        <div style={{ marginTop: 12 }}>
          <label style={{ marginRight: 8 }}>Filter by status:</label>
          <select value={filters.status} onChange={onStatusChange}>
            <option value="">All</option>
            <option value="sent">Sent</option>
            <option value="assigned">Assigned</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          {offers.data.length === 0 ? (
            <p>No offers found.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>ID</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Provider</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Request</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Price</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Days</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Status</th>
                  <th style={{ textAlign: "left", borderBottom: "1px solid #ddd", padding: 8 }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {offers.data.map((o) => (
                  <tr key={o.id}>
                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>#{o.id}</td>

                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      {o.provider?.name ?? "-"}
                    </td>

                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      {o.request?.title ?? "-"}
                    </td>

                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      {o.proposed_price} DZD
                    </td>

                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      {o.estimated_days ?? "-"}
                    </td>

                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>{o.status}</td>

                    <td style={{ borderBottom: "1px solid #eee", padding: 8 }}>
                      {o.status === "sent" ? (
                        <button
                          onClick={() => acceptOffer(o.id)}
                          style={{ padding: "6px 10px" }}
                        >
                          Accept
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {offers.links && offers.links.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {offers.links.map((l, idx) => (
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
