import { Link, router, usePage } from "@inertiajs/react";
import React from "react";

import AppLayout from "@/layouts/app-layout";
import { index as providerRequestsIndex, show as providerRequestsShow } from "@/routes/provider/requests";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };

type RequestItem = {
  id: number;
  title: string;
  description: string;
  status: string;
  budget_min?: string | number | null;
  budget_max?: string | number | null;
  urgency?: string | null;

  category?: { id: number; name: string; slug: string };
  city?: { id: number; name: string };
  client?: { id: number; name: string };

  media?: Array<{ id: number; path: string; type: string; position: number }>;
};

type PaginationLink = { url: string | null; label: string; active: boolean };
type Paginated<T> = { data: T[]; links: PaginationLink[] };

type PageProps = {
  requests: Paginated<RequestItem>;
  categories: Category[];
  cities: City[];
  filters: { q: string; city: string; category: string };
};

export default function Index() {
  const { requests, categories, cities, filters } = usePage<PageProps>().props;

  const setFilter = (next: Partial<PageProps["filters"]>) => {
    router.get(
      providerRequestsIndex.url(),
      { ...filters, ...next },
      { preserveState: true, replace: true }
    );
  };

  return (
    <AppLayout>
      <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Open Requests</h1>

        {/* Filters */}
        <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={filters.q}
            onChange={(e) => setFilter({ q: e.target.value })}
            placeholder="Search by title..."
            style={{ padding: 8, minWidth: 240 }}
          />

          <select
            value={filters.city}
            onChange={(e) => setFilter({ city: e.target.value })}
            style={{ padding: 8 }}
          >
            <option value="">All Cities</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilter({ category: e.target.value })}
            style={{ padding: 8 }}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* List */}
        <div style={{ marginTop: 16 }}>
          {requests.data.length === 0 ? (
            <p>No requests found.</p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {requests.data.map((r) => (
                <div key={r.id} style={{ border: "1px solid #ddd", padding: 12 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                    {r.title}
                  </h2>

                  <div style={{ fontSize: 14, color: "#444" }}>
                    <span><b>City:</b> {r.city?.name ?? "-"}</span>
                    <span style={{ marginLeft: 12 }}><b>Category:</b> {r.category?.name ?? "-"}</span>
                  </div>

                  <div style={{ marginTop: 8, fontSize: 14 }}>
                    {r.description.length > 160 ? r.description.slice(0, 160) + "..." : r.description}
                  </div>

                  <div style={{ marginTop: 8, fontSize: 14 }}>
                    <b>Budget:</b> {r.budget_min ?? "-"} / {r.budget_max ?? "-"} DZD
                  </div>

                  <div style={{ marginTop: 10 }}>
                    <Link href={providerRequestsShow.url(r.id)}>View Details</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {requests.links && requests.links.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
            {requests.links.map((l, idx) => (
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
