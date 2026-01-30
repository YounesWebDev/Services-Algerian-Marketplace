import { router, usePage } from "@inertiajs/react";
import { useState } from "react";

// shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";
import { SharedData } from "@/types";

// Utility to convert storage paths to accessible URLs
function toStorageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  if (path.startsWith("/")) return path;
  if (path.startsWith("storage/")) return `/${path}`;

  return `/storage/${path}`;
}

function getCoverImage(service: Service): string {
  if (!service.media || service.media.length === 0) return "";

  const first = service.media[0];

  return toStorageUrl(first.path);
}

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
          <p className="text-sm text-foreground">
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
          className="rounded-4xl"
        />

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-10 w-full rounded-4xl border px-3 text-sm"
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
          className="h-10 w-full rounded-4xl border px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <Button onClick={runSearch} className="rounded-4xl transition duration-700 hover:bg-white hover:text-black">Search</Button>
      </div>

      {/* Results */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {services.data.map((s) => {
    const cover = getCoverImage(s);

    return (
      <Button
        key={s.id}
        type="button"
        onClick={() => {
          if (user?.role === "provider" || user?.role === "admin") return;
          router.get(`/services/${s.slug}`);
        }}
        className="flex flex-col text-left border rounded-4xl h-70 overflow-hidden 
             hover:shadow-xl transition-all duration-300 bg-primary-foreground/30 
             hover:bg-primary-foreground/40 text-foreground"
      >
        {/* cover Image only if exists */}
       {cover ? (
                                       <div className="w-full h-44 overflow-hidden rounded-t-3xl ">
                                           <img
                                               src={cover}
                                               alt={s.title}
                                               className=" block w-full h-full object-cover m-0 hover:scale-105 transition-transform duration-300"
                                               loading="lazy"
                                           />
                                       </div>
                                   ): null}
                                   
                                   {/* content */}
                                   <div className="flex flex-col flex-1 p-4 gap-3 w-full">
                                       <p className="font-semibold line-clamp-2 leading-tight">{s.title}</p>
       
                                       <div className="flex justify-between items-center">
                                           <div className="flex gap-2 items-center">
                                               {s.provider?.avatar_path && (
                                                   <img
                                                       src={toStorageUrl(s.provider.avatar_path)}
                                                       alt={s.provider?.name}
                                                       className="w-8 h-8 rounded-full object-cover"
                                                   />
                                               )}
                                               <div className="text-sm">{s.provider?.name}</div>
                                           </div>
                                           <span className="text-xs text-foreground">Payment: {s.payment_type}</span>
                                       </div>
       
                                       <div className="mt-auto">
                                           <span className="text-sm text-foreground border border-gray-200 rounded-full px-3 py-1 bg-white/20 backdrop-blur-sm hover:text-background hover:bg-foreground transition duration-300">
                                               {s.pricing_type}{s.base_price ? ` - ${s.base_price} DZD` : ""}
                                           </span>
                                       </div>
                                   </div>
                               </Button>
                           
    );
        })}

        {services.data.length === 0 && (
          <div className="text-sm text-foreground">
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
          <p className="text-sm text-foreground">
            Browse approved services. Use filters to narrow results.
          </p>
        </div>

        <Button variant="outline" onClick={clearFilters}
        className="border border-gray-200 rounded-4xl transition duration-700 hover:bg-red-600 hover:text-white hover:border-red-700"
        >
          Clear
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search (e.g. plumber)"
          className="rounded-4xl"
        />

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-10 w-full rounded-4xl border px-3 text-sm "
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
          className="h-10 w-full rounded-4xl border px-3 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <Button onClick={runSearch} className="rounded-4xl transition duration-700 hover:bg-foreground hover:text-background">Search</Button>
      </div>

      {/* Results */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {services.data.map((s) => {
    const cover = getCoverImage(s);

    return (
      <Button
        key={s.id}
        type="button"
        onClick={() => {
          if (user?.role === "provider" || user?.role === "admin") return;
          router.get(`/services/${s.slug}`);
        }}
        className="flex flex-col text-left border rounded-4xl h-70 overflow-hidden 
             hover:shadow-xl transition-all duration-300 bg-primary-foreground/30 
             hover:bg-primary-foreground/40 text-foreground"
      >
        {/* cover Image only if exists */}
       {cover ? (
                                       <div className="w-full h-44 overflow-hidden rounded-t-3xl ">
                                           <img
                                               src={cover}
                                               alt={s.title}
                                               className=" block w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                               loading="lazy"
                                           />
                                       </div>
                                   ): null}
                                   
                                   {/* content */}
                                   <div className="flex flex-col flex-1 p-4 gap-3 w-full">
                                       <p className="font-semibold line-clamp-2 leading-tight">{s.title}</p>
       
                                       <div className="flex justify-between items-center">
                                           <div className="flex gap-2 items-center">
                                               {s.provider?.avatar_path && (
                                                   <img
                                                       src={toStorageUrl(s.provider.avatar_path)}
                                                       alt={s.provider?.name}
                                                       className="w-8 h-8 rounded-full object-cover"
                                                   />
                                               )}
                                               <div className="text-sm">{s.provider?.name}</div>
                                           </div>
                                           <span className="text-xs text-foreground">Payment: {s.payment_type}</span>
                                       </div>
       
                                       <div className="mt-auto">
                                           <span className="text-sm text-foreground border border-gray-200 rounded-full px-3 py-1 bg-white/20 backdrop-blur-sm hover:text-background hover:bg-foreground transition duration-300">
                                               {s.pricing_type}{s.base_price ? ` - ${s.base_price} DZD` : ""}
                                           </span>
                                       </div>
                                   </div>
                               </Button>
                           
    );
  })}

  {services.data.length === 0 && (
    <div className="text-sm text-muted-foreground">
      No services found yet.
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
