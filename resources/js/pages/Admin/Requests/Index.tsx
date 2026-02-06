import { Head, Link, usePage } from "@inertiajs/react";
import { useMemo } from "react";
import PaginationLinks from "@/components/pagination-links";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";

// Wayfinder (adjust import path if your generated routes differ)
import {
  index as adminRequestsIndex,
  show as adminRequestsShow,
} from "@/routes/admin/requests";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };

type Media = { id: number; path: string; type: string; position: number };

type ClientMini = {
  id: number;
  name: string;
  email: string;
  avatar_path?: string | null;
  status: "active" | "inactive";
  role: string;
};

type RequestRow = {
  id: number;
  title: string;
  description: string;
  status: string; // open/assigned/closed/cancelled...
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  urgency?: string | null;

  category: Category;
  city: City;
  client: ClientMini;
  media?: Media[];

  offers_count: number;
  created_at?: string | null;
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
};

type PageProps = {
  requests: Paginated<RequestRow>;
  categories: Category[];
  cities: City[];
  filters: {
    q: string;
    status: string;
    city: string;
    category: string;
  };
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "muted" | "warning";
}) {
  const cls = useMemo(() => {
    switch (variant) {
      case "success":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "danger":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "warning":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "muted":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  }, [variant]);

  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", cls)}>
      {children}
    </span>
  );
}

export default function AdminRequestsIndex() {
  const { props } = usePage<PageProps>();
  const { requests, categories, cities, filters } = props;

  return (
    <AppLayout>
      <Head title="Requests Management" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Requests management</h1>
          <p className="text-sm text-muted-foreground">
            Moderate client requests: review details, offers count, and close/reopen when needed.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="get" action={adminRequestsIndex().url} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-6">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="q">Search</Label>
                  <Input id="q" name="q" placeholder="Title or description..." defaultValue={filters.q ?? ""} />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <input type="hidden" name="status" value={filters.status ?? ""} />
                  <Select
                    defaultValue={filters.status ?? ""}
                    onValueChange={(v) => {
                      const input = document.querySelector<HTMLInputElement>('input[name="status"]');
                      if (input) input.value = v === "__all" ? "" : v;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All</SelectItem>
                      <SelectItem value="open">open</SelectItem>
                      <SelectItem value="in_discussion">in_discussion</SelectItem>
                      <SelectItem value="assigned">assigned</SelectItem>
                      <SelectItem value="closed">closed</SelectItem>
                      <SelectItem value="cancelled">cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>
                  <input type="hidden" name="city" value={filters.city ?? ""} />
                  <Select
                    defaultValue={filters.city ?? ""}
                    onValueChange={(v) => {
                      const input = document.querySelector<HTMLInputElement>('input[name="city"]');
                      if (input) input.value = v === "__all" ? "" : v;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All</SelectItem>
                      {cities.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <input type="hidden" name="category" value={filters.category ?? ""} />
                  <Select
                    defaultValue={filters.category ?? ""}
                    onValueChange={(v) => {
                      const input = document.querySelector<HTMLInputElement>('input[name="category"]');
                      if (input) input.value = v === "__all" ? "" : v;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              </div>

              <div className="flex items-center gap-2">
                <Button type="submit">Apply</Button>
                <Button type="button" variant="outline" onClick={() => (window.location.href = adminRequestsIndex().url)}>
                  Reset
                </Button>

                <div className="ml-auto text-sm text-muted-foreground">
                  Total: <span className="font-medium text-foreground">{requests.total}</span>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Request</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Offers</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {requests.data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-muted-foreground">
                      No requests found.
                    </td>
                  </tr>
                ) : (
                  requests.data.map((r) => {
                    const cover = (r.media ?? []).slice().sort((a, b) => a.position - b.position)[0]?.path;
                    const coverUrl = publicImagePath(cover);

                    const variant =
                      r.status === "open"
                        ? "success"
                        : r.status === "assigned"
                        ? "warning"
                        : r.status === "closed" || r.status === "cancelled"
                        ? "danger"
                        : "muted";

                    return (
                      <tr key={r.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden border bg-muted">
                              {coverUrl ? (
                                <img src={coverUrl} alt={r.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-medium truncate">{r.title}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {r.category?.name} • {r.city?.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                budget:{" "}
                                {r.budget_min || r.budget_max
                                  ? `${r.budget_min ?? "—"} - ${r.budget_max ?? "—"} DZD`
                                  : "—"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{r.client?.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{r.client?.email}</div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant={variant}>{r.status}</Badge>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant="muted">{r.offers_count}</Badge>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={adminRequestsShow(r.id).url}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {requests.links?.length > 1 && (
            <div className="border-t p-3">
              <PaginationLinks links={requests.links} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}


