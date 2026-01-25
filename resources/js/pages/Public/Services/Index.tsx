import { router, usePage } from "@inertiajs/react";
import { useState } from "react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import { SharedData } from "@/types";

type ServiceMedia = {
  id: number;
  path: string;
  type: string;
  position: number;
};
type Provider = {
  id: number;
  name: string;
  email?: string;
  phone?: string | null;
  avatar_path?: string | null;
  role?: string;
  status?: string;
};
type Service = {
  id: number;
  title: string;
  slug: string;
  base_price: string | null;
  pricing_type: string;
  payment_type: string;
  media?: ServiceMedia[];
  provider_id?: number;
  provider?: Provider;
};

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };

type PaginationLink = { url: string | null; label: string; active: boolean };

// Laravel paginator meta (basic + safe extra fields)
type PaginationMeta = {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  from?: number | null;
  to?: number | null;
  path?: string;
  links?: unknown[];
  [key: string]: unknown;
};

type Paginated<T> = {
  data: T[];
  links: PaginationLink[];
  meta?: PaginationMeta;
};

type Filters = {
  q: string;
  city: string;
  category: string;
};

type Props = {
  services: Paginated<Service>;
  categories: Category[];
  cities: City[];
  filters: Filters;
};

export default function Index({ services, categories, cities, filters }: Props) {
  // Local UI state (start with filters coming from backend)
  const [q, setQ] = useState(filters?.q ?? "");
  const [city, setCity] = useState(filters?.city ?? "");
  const [category, setCategory] = useState(filters?.category ?? "");
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user ?? null;

  // Run search using Inertia (no full refresh)
  function runSearch() {
    router.get(
      "/services",
      { q: q || "", city: city || "", category: category || "" },
      { preserveState: true, replace: true }
    );
  }

  function clearFilters() {
    setQ("");
    setCity("");
    setCategory("");
    router.get("/services", {}, { preserveState: true, replace: true });
  }

  return user?.role === "client" ? (
  <AppLayout>
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">
            Browse approved services. Use filters to narrow results.
          </p>
        </div>

        <Button variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (e.g. plumber)"
        />

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-10 w-full rounded-md border px-3 text-sm"
        >
          <option value="">All wilayas</option>
          {cities.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>

        {/* category: you can send slug OR id - controller supports both */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 w-full rounded-md border px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <Button onClick={runSearch}>Search</Button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.data.map((s) => {
          const cover = s.media?.[0]?.path ?? "/images/service-placeholder.jpg";

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => router.get(`/services/${s.slug}`)}
              className="text-left border rounded-lg p-4 hover:bg-muted/40 transition"
              title="Open service details"
              >
              <img
                src={cover}
                alt={s.title}
                className="h-32 w-full rounded-md object-cover border mb-3"
              />

              <div className="font-semibold line-clamp-2">{s.title}</div>

              <div className="mt-2 text-sm text-muted-foreground">
                Pricing: {s.pricing_type}
                {s.base_price ? ` - ${s.base_price} DZD` : ""}
                {" - "}
                Payment: {s.payment_type}
              </div>
            </button>
          );
        })}

        {services.data.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No services found with these filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {services.links?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {services.links.map((l, idx) => (
            <button
            key={`${l.url ?? "null"}-${idx}`}
            type="button"
            disabled={!l.url}
            onClick={() =>
                l.url && router.get(l.url, {}, { preserveState: true })
              }
              className={[
                "px-3 py-1.5 text-sm border rounded-md",
                l.active
                ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
                  !l.url ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
                // Laravel labels can be "&laquo;" etc
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      )}
    </div>
  </AppLayout>
  ) : (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-muted-foreground">
            Browse approved services. Use filters to narrow results.
          </p>
        </div>

        <Button variant="outline" onClick={clearFilters}>
          Clear
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (e.g. plumber)"
        />

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-10 w-full rounded-md border px-3 text-sm"
        >
          <option value="">All wilayas</option>
          {cities.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </select>

        {/* category: you can send slug OR id - controller supports both */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 w-full rounded-md border px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <Button onClick={runSearch}>Search</Button>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.data.map((s) => {
          const cover = s.media?.[0]?.path ?? "/images/service-placeholder.jpg";

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => router.get(`/services/${s.slug}`)}
              className="text-left border rounded-lg p-4 hover:bg-muted/40 transition"
              title="Open service details"
              >
              <img
                src={cover}
                alt={s.title}
                className="h-32 w-full rounded-md object-cover border mb-3"
              />

              <div className="font-semibold line-clamp-2">{s.title}</div>

              <div className="mt-2 text-sm text-muted-foreground">
                Pricing: {s.pricing_type}
                {s.base_price ? ` - ${s.base_price} DZD` : ""}
                {" - "}
                Payment: {s.payment_type}
              </div>
            </button>
          );
        })}

        {services.data.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No services found with these filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {services.links?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {services.links.map((l, idx) => (
            <button
            key={`${l.url ?? "null"}-${idx}`}
            type="button"
            disabled={!l.url}
            onClick={() =>
                l.url && router.get(l.url, {}, { preserveState: true })
              }
              className={[
                "px-3 py-1.5 text-sm border rounded-md",
                l.active
                ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted",
                  !l.url ? "opacity-50 cursor-not-allowed" : "",
                ].join(" ")}
                // Laravel labels can be "&laquo;" etc
              dangerouslySetInnerHTML={{ __html: l.label }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
