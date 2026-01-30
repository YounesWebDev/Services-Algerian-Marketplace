import { Head, Link, usePage } from "@inertiajs/react";

import { buttonVariants } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { index as providerRequestsIndex, show as providerRequestsShow } from "@/routes/provider/requests";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Client = { id: number; name: string; avatar_path: string | null };
type Media = { id: number; request_id: number; path: string; type: string; position: number };

type RequestItem = {
  id: number;
  title: string;
  description: string;
  status: string;
  budget_min: string | null;
  budget_max: string | null;
  urgency: string | null;
  created_at: string;
  category: Category;
  city: City;
  client: Client;
  media: Media[];
};

type PaginationLink = { url: string | null; label: string; active: boolean };

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

function renderPagination(links: PaginationLink[]) {
  if (!links?.length) {
    return null;
  }

  return (
    <Pagination>
      <PaginationContent>
        {links.map((link, idx) => {
          const labelText = link.label
            .replace(/&laquo;|&raquo;/g, "")
            .replace(/&hellip;/g, "...")
            .replace(/&nbsp;/g, " ")
            .trim();

          const lowerLabel = labelText.toLowerCase();
          const isPrev = lowerLabel.includes("previous");
          const isNext = lowerLabel.includes("next");
          const isEllipsis = labelText === "..." || labelText === "…";

          if (isEllipsis) {
            return (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          if (!link.url) {
            return (
              <PaginationItem key={`disabled-${idx}`}>
                <span
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      size: isPrev || isNext ? "default" : "icon",
                    }),
                    "pointer-events-none opacity-50",
                  )}
                >
                  {isPrev ? "Previous" : isNext ? "Next" : labelText}
                </span>
              </PaginationItem>
            );
          }

          if (isPrev) {
            return (
              <PaginationItem key={`prev-${idx}`}>
                <PaginationPrevious href={link.url} preserveScroll />
              </PaginationItem>
            );
          }

          if (isNext) {
            return (
              <PaginationItem key={`next-${idx}`}>
                <PaginationNext href={link.url} preserveScroll />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={`${link.url}-${idx}`}>
              <PaginationLink href={link.url} preserveScroll isActive={link.active}>
                {labelText}
              </PaginationLink>
            </PaginationItem>
          );
        })}
      </PaginationContent>
    </Pagination>
  );
}

export default function ProviderRequestsIndex() {
  const { props } = usePage<{
    requests: { data: RequestItem[]; links: PaginationLink[] };
    categories: Category[];
    cities: City[];
    filters: { q: string; city: string; category: string };
  }>();

  const { requests, categories, cities, filters } = props;

  return (
    <AppLayout>
      <Head title="Requests" />

      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Open Requests</h1>
          <p className="text-sm text-gray-600">
            These are requests posted by clients. You can open one and send an offer.
          </p>
        </div>

        {/* Filters (simple beginner-friendly) */}
        <div className="rounded-md border p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium">Search</label>
              <input
                defaultValue={filters.q}
                id="q"
                className="mt-1 w-full rounded-md border p-2"
                placeholder="Search by title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium">City</label>
              <select defaultValue={filters.city} id="city" className="mt-1 w-full rounded-md border p-2">
                <option value="">All cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                defaultValue={filters.category}
                id="category"
                className="mt-1 w-full rounded-md border p-2"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md bg-black px-3 py-2 text-white text-sm"
              onClick={() => {
                const q = (document.getElementById("q") as HTMLInputElement)?.value ?? "";
                const city = (document.getElementById("city") as HTMLSelectElement)?.value ?? "";
                const category = (document.getElementById("category") as HTMLSelectElement)?.value ?? "";
                window.location.href = providerRequestsIndex.url({ query: { q, city, category } });
              }}
            >
              Apply
            </button>

            <Link
              href={providerRequestsIndex.url()}
              className="rounded-md border px-3 py-2 text-sm"
            >
              Reset
            </Link>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {requests.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-gray-600">
              No open requests found.
            </div>
          ) : (
            requests.data.map((r) => {
              const cover = r.media?.slice().sort((a, b) => a.position - b.position)[0]?.path;
              const coverUrl = publicImagePath(cover);

              return (
                <div key={r.id} className="rounded-md border p-4">
                  <div className="flex gap-4">
                    {/* cover image */}
                    <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden border bg-gray-50">
                      {coverUrl ? (
                        <img src={coverUrl} alt={r.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{r.title}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {r.category?.name} • {r.city?.name}
                          </div>

                          <div className="text-sm text-gray-600 mt-1">
                            Budget:{" "}
                            <span className="font-medium">
                              {r.budget_min ?? "—"} - {r.budget_max ?? "—"} DZD
                            </span>
                            {r.urgency ? (
                              <>
                                {" "}
                                • Urgency: <span className="font-medium">{r.urgency}</span>
                              </>
                            ) : null}
                          </div>

                          <div className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <span>Client:</span>
                            <span className="inline-flex items-center gap-2">
                              {r.client?.avatar_path ? (
                                <img
                                  src={r.client.avatar_path}
                                  alt={r.client.name}
                                  className="w-6 h-6 rounded-full object-cover border"
                                />
                              ) : (
                                <span className="w-6 h-6 rounded-full border bg-gray-100" />
                              )}
                              <span className="font-medium">{r.client?.name}</span>
                            </span>
                          </div>
                        </div>

                        <Link
                          href={providerRequestsShow.url(r.id)}
                          className="text-sm underline"
                        >
                          Open
                        </Link>
                      </div>

                      <div className="text-sm text-gray-700 mt-2 line-clamp-2">
                        {r.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {requests.links?.length > 0 && renderPagination(requests.links)}
      </div>
    </AppLayout>
  );
}
