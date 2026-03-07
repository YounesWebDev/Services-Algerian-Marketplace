import { router, usePage } from "@inertiajs/react";
import { Search } from "lucide-react";
import { useState } from "react";

// shadcn/ui
import Navbar from "@/components/navbar"; 
import PaginationLinks from "@/components/pagination-links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

function getCoverImage(service: Service): string {
  if (!service.media || service.media.length === 0) return "";
  const first = service.media[0];
  return toStorageUrl(first.path);
}

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase() || "U";
}

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

  const PageUI = (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      {
        user === null ? (
          <div className=" flex max-w-screen items-center absolute top-10 left-0 right-0 z-10"><Navbar user={null} canRegister={true} /></div>
        ) : null
      }
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="text-sm text-foreground">
            Browse approved services. Use filters to narrow results.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={clearFilters}
          className={
            user?.role === "client"
              ? ""
              : "border border-gray-200 rounded-4xl transition duration-700 hover:bg-red-600 hover:text-white hover:border-red-700"
          }
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
          className="rounded-4xl bg-primary-foreground/30 border border-gray-200"
        />

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-4xl bg-primary-foreground/30 border border-gray-200 p-2"
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
          className="rounded-4xl bg-primary-foreground/30 border border-gray-200 p-2"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          onClick={runSearch}
          className="rounded-4xl flex items-center gap-2 bg-primary w-max p-2 text-foreground transition duration-700 hover:bg-foreground hover:text-background"
        >
          <Search/> <p className="hiddenmd: flex">Search</p>
        </button>
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
              className="flex flex-col text-left border rounded-4xl h-70 overflow-hidden p-0
                hover:shadow-xl transition-all duration-300 bg-primary-foreground/30 
                hover:bg-primary-foreground/40 text-foreground"
            >
              {/* cover Image only if exists */}
              {cover ? (
                <div className="w-full h-44 overflow-hidden rounded-t-4xl">
                  <img
                    src={cover}
                    alt={s.title}
                    className="block w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
              ) : null}

              {/* content */}
              <div className="flex flex-col flex-1 p-4 gap-3 w-full">
                <p className="font-semibold line-clamp-2 leading-tight">
                  {s.title}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <Avatar className="size-8">
                      <AvatarImage
                        src={
                          s.provider?.avatar_path
                            ? toStorageUrl(s.provider.avatar_path)
                            : ""
                        }
                        alt={s.provider?.name ?? "Provider"}
                      />
                      <AvatarFallback>{getInitials(s.provider?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm">{s.provider?.name}</div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Payment: {s.payment_type}
                  </span>
                </div>

                <div className="mt-auto">
                  <span className="text-sm text-muted-foreground border border-gray-200 rounded-full px-3 py-1 bg-white/20 backdrop-blur-sm hover:text-foreground transition duration-300">
                    {s.pricing_type}
                    {s.base_price ? ` - ${s.base_price} DZD` : ""}
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
      {services.links?.length > 0 && <PaginationLinks links={services.links} />}

     
      
    </div>
  );

  return user?.role === "client" ? <AppLayout>{PageUI}</AppLayout> : PageUI;
}




