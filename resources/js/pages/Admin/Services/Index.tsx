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

// Wayfinder (adjust if your generated path differs)
import {
  index as adminServicesIndex,
  show as adminServicesShow,
} from "@/routes/admin/services";

type ServiceMedia = {
  id: number;
  path: string;
  type: string;
  position: number;
};

type ProviderMini = {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  avatar_path?: string | null;
};

type CategoryMini = { id: number; name: string; slug: string };
type CityMini = { id: number; name: string };

type ServiceRow = {
  id: number;
  title: string;
  slug: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  pricing_type: "fixed" | "hourly" | "quote";
  payment_type: "cash" | "online" | "both";
  base_price?: number | string | null;
  created_at?: string | null;

  provider: ProviderMini;
  category: CategoryMini;
  city: CityMini;
  media?: ServiceMedia[];
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  links: { url: string | null; label: string; active: boolean }[];
};

type PageProps = {
  services: Paginated<ServiceRow>;
  filters: {
    q: string;
    status: string;
    payment_type: string;
    pricing_type: string;
    provider_id: string;
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

export default function AdminServicesIndex() {
  const { props } = usePage<PageProps>();
  const { services, filters } = props;

  return (
    <AppLayout>
      <Head title="Services Management" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Services management</h1>
          <p className="text-sm text-muted-foreground">
            Approve or reject provider services. Use filters to quickly find pending ones.
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <form method="get" action={adminServicesIndex().url} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="q">Search</Label>
                  <Input id="q" name="q" placeholder="Title or slug..." defaultValue={filters.q ?? ""} />
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
                      <SelectItem value="pending">pending</SelectItem>
                      <SelectItem value="approved">approved</SelectItem>
                      <SelectItem value="rejected">rejected</SelectItem>
                      <SelectItem value="hidden">hidden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment</Label>
                  <input type="hidden" name="payment_type" value={filters.payment_type ?? ""} />
                  <Select
                    defaultValue={filters.payment_type ?? ""}
                    onValueChange={(v) => {
                      const input = document.querySelector<HTMLInputElement>('input[name="payment_type"]');
                      if (input) input.value = v === "__all" ? "" : v;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All</SelectItem>
                      <SelectItem value="cash">cash</SelectItem>
                      <SelectItem value="online">online</SelectItem>
                      <SelectItem value="both">both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Pricing</Label>
                  <input type="hidden" name="pricing_type" value={filters.pricing_type ?? ""} />
                  <Select
                    defaultValue={filters.pricing_type ?? ""}
                    onValueChange={(v) => {
                      const input = document.querySelector<HTMLInputElement>('input[name="pricing_type"]');
                      if (input) input.value = v === "__all" ? "" : v;
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all">All</SelectItem>
                      <SelectItem value="fixed">fixed</SelectItem>
                      <SelectItem value="hourly">hourly</SelectItem>
                      <SelectItem value="quote">quote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* optional provider_id filter */}
              <div className="grid gap-4 md:grid-cols-5">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="provider_id">Provider ID (optional)</Label>
                  <Input
                    id="provider_id"
                    name="provider_id"
                    placeholder="Example: 4"
                    defaultValue={filters.provider_id ?? ""}
                  />
                </div>

                <div className="flex items-end gap-2 md:col-span-3">
                  <Button type="submit">Apply</Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => (window.location.href = adminServicesIndex().url)}
                  >
                    Reset
                  </Button>

                  <div className="ml-auto text-sm text-muted-foreground">
                    Total: <span className="font-medium text-foreground">{services.total}</span>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* List */}
        <div className="rounded-lg border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Service</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Payment</th>
                  <th className="px-4 py-3 font-medium">Pricing</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>

              <tbody>
                {services.data.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-muted-foreground">
                      No services found.
                    </td>
                  </tr>
                ) : (
                  services.data.map((s) => {
                    const cover = (s.media ?? []).slice().sort((a, b) => a.position - b.position)[0]?.path;
                    const coverUrl = publicImagePath(cover);

                    const statusVariant =
                      s.status === "approved"
                        ? "success"
                        : s.status === "rejected"
                        ? "danger"
                        : s.status === "hidden"
                        ? "muted"
                        : "warning";

                    return (
                      <tr key={s.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-14 w-14 shrink-0 rounded-md overflow-hidden border bg-muted">
                              {coverUrl ? (
                                <img src={coverUrl} alt={s.title} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                                  No image
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{s.title}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {s.category?.name} • {s.city?.name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">slug: {s.slug}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <div className="min-w-0">
                            <div className="font-medium truncate">{s.provider?.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{s.provider?.email}</div>
                            <div className="mt-1">
                              <Badge variant={s.provider?.status === "active" ? "success" : "danger"}>
                                provider {s.provider?.status}
                              </Badge>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant={statusVariant}>{s.status}</Badge>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant="muted">{s.payment_type}</Badge>
                        </td>

                        <td className="px-4 py-3">
                          <Badge variant="muted">{s.pricing_type}</Badge>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <Button asChild variant="outline" size="sm">
                            <Link href={adminServicesShow(s.id).url}>View</Link>
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {services.links?.length > 1 && (
            <div className="border-t p-3">
              <PaginationLinks links={services.links} />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}


