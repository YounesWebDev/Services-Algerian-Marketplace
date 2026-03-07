import { Head, Link, usePage } from "@inertiajs/react";
import { Clock, MapPin, SquareArrowOutUpRight } from "lucide-react";

import PaginationLinks from "@/components/pagination-links";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from '@/routes';
import {
  index as providerRequestsIndex,
  show as providerRequestsShow,
} from "@/routes/provider/requests";

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

export default function ProviderRequestsIndex() {
  const { props } = usePage<{
    requests: { data: RequestItem[]; links: PaginationLink[] };
    categories: Category[];
    cities: City[];
    filters: { q: string; city: string; category: string };
  }>();

  const { requests, categories, cities, filters } = props;

  return (
    <AppLayout breadcrumbs={[{ title: "Dashboard", href: dashboard().url }]}>
      <Head title="Requests" />

      <div className="p-4 sm:p-6 space-y-4">
        <div>
          <h1 className="text-xl font-bold text-primary">Open Requests</h1>
          <p className="text-sm text-foreground">
            These are requests posted by clients. You can open one and send an offer.
          </p>
        </div>

        {/* Filters */}
        <div className="rounded-4xl bg-primary-foreground/30 border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium">Search</label>
              <input
                defaultValue={filters.q}
                id="q"
                className="mt-1 w-full rounded-4xl bg-primary-foreground/30 border-gray-200 border p-2"
                placeholder=" Search by title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium">City</label>
              <select
                defaultValue={filters.city}
                id="city"
                className="mt-1 w-full rounded-4xl bg-primary-foreground/30 border-gray-200 border p-2"
              >
                <option value="" className="text-background">All cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id} className="text-background ">
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
                className="mt-1 w-full rounded-4xl bg-primary-foreground/30 border-gray-200 border p-2"
              >
                <option value="">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug} className="text-background">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-3xl bg-primary px-3 py-2 text-white text-sm transition duration-700 hover:bg-foreground hover:text-background"
              onClick={() => {
                const q = (document.getElementById("q") as HTMLInputElement)?.value ?? "";
                const city = (document.getElementById("city") as HTMLSelectElement)?.value ?? "";
                const category =
                  (document.getElementById("category") as HTMLSelectElement)?.value ?? "";
                window.location.href = providerRequestsIndex.url({ query: { q, city, category } });
              }}
            >
              Search
            </button>

            <Link
              href={providerRequestsIndex.url()}
              className="rounded-3xl border border-gray-200 px-3 py-2 text-sm transform transition duration-700 hover:bg-primary-foreground hover:text-background"
            >
              Reset
            </Link>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {requests.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-foreground">
              No open requests found.
            </div>
          ) : (
            requests.data.map((r) => {
              const cover = r.media?.slice().sort((a, b) => a.position - b.position)[0]?.path;
              const coverUrl = publicImagePath(cover);

              return (
                <div
                  key={r.id}
                  className="rounded-4xl bg-primary-foreground/30 border border-gray-200 transition duration-700 hover:bg-primary-foreground/40 hover:shadow-2xl p-4"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* cover image */}
                    <div className="w-full sm:w-24 h-40 sm:h-24 shrink-0 rounded-md overflow-hidden border bg-gray-50">
                      {coverUrl ? (
                        <img src={coverUrl} alt={r.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-xl sm:text-2xl break-words">{r.title}</div>

                          <div className="text-sm text-foreground mt-2 rounded-3xl p-1 border border-gray-200 w-full  sm:w-max flex flex-wrap  items-center gap-2">
                            <span className="break-words"> <div className="text-sm text-foreground mt-2 flex items-center justify-center rounded-3xl mb-2 gap-2 w-full sm:w-max">
                            <span className="inline-flex items-center gap-2 min-w-0">
                              {r.client?.avatar_path ? (
                                <img
                                  src={r.client.avatar_path}
                                  alt={r.client.name}
                                  className="w-6 h-6 rounded-full object-cover border"
                                />
                              ) : (
                                <span className="w-6 h-6 " />
                              )}
                              <span className="font-medium truncate max-w-[220px] sm:max-w-none">
                                {r.client?.name}
                              </span>
                            </span>
                          </div>  </span>
                            <div className="p-2 rounded-3xl border border-gray-200 flex items-center gap-1">
                              <MapPin className="text-red-600" />
                              <span className="break-words">{r.city?.name}</span>
                            </div>
                          </div>

                          <div className="text-sm text-foreground mt-2">
                            <span className="font-medium flex flex-col sm:flex-row sm:items-center gap-2 p-1 rounded-4xl border border-gray-200 w-full sm:w-max">
                              <div className="font-bold flex items-center gap-1 p-1 rounded-4xl border border-gray-200 text-primary w-full sm:w-auto">
                                Min{" "}
                                <div className="p-2 rounded-4xl  w-full sm:w-auto text-center">
                                  {r.budget_min ?? "â€”"} DZD
                                </div>
                              </div>

                              <div className="font-bold text-red-600 flex items-center gap-1 p-1 rounded-4xl border border-gray-200 w-full sm:w-auto">
                                Max{" "}
                                <div className="p-2  w-full sm:w-auto text-center">
                                  {r.budget_max ?? "â€”"} DZD
                                </div>
                              </div>
                            </span>

                            <div className="flex flex-wrap items-center gap-2 mt-2 rounded-3xl border border-gray-200 w-full sm:w-max p-1 text-sm text-foreground">
                              {r.urgency ? (
                                <>
                                  Urgency{" "}
                                  {r.urgency === "high" ? (
                                    <span className="font-bold inline-flex items-center gap-1">
                                      <div className="flex items-center text-red-600 rounded-3xl p-2 border border-gray-200 gap-2">
                                        <Clock /> {r.urgency}
                                      </div>
                                    </span>
                                  ) : r.urgency === "medium" ? (
                                    <span className="flex items-center text-yellow-600 rounded-3xl p-2 border border-gray-200 gap-2">
                                      <Clock /> {r.urgency}
                                    </span>
                                  ) : r.urgency === "low" ? (
                                    <span className="text-primary rounded-3xl p-2 border border-gray-200 font-bold inline-flex items-center gap-2">
                                      <Clock /> {r.urgency}
                                    </span>
                                  ) : null}
                                </>
                              ) : null}
                            </div>
                          </div>

                          
                        </div>

                        <Link
                          href={providerRequestsShow.url(r.id)}
                          className="text-sm text-primary  transition duration-700 hover:text-foreground px-3 py-2 sm:py-1 w-full sm:w-auto text-center"
                        >
                          <SquareArrowOutUpRight/>
                        </Link>
                      </div>

                      <div className="text-sm text-foreground mt-3 rounded-4xl border border-gray-200 p-2 line-clamp-2">
                        <div className="font-bold">Description</div>
                        {r.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {requests.links?.length > 0 && <PaginationLinks links={requests.links} />}
      </div>
    </AppLayout>
  );
}
