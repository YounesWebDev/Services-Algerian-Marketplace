import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

import PaginationLinks from "@/components/pagination-links";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { index as providersIndex } from "@/routes/admin/verifications/providers";
import {
  index as servicesIndex,
  show as servicesShow,
} from "@/routes/admin/verifications/services";

type ServiceLite = {
  id: number;
  title: string;
  status: string;
  provider?: { id: number; name: string; avatar_path: string | null };
  category?: { id: number; name: string; slug: string };
  city?: { id: number; name: string };
  media?: Array<{ id: number; path: string; position: number }>;
};

type Pagination<T> = {
  data: T[];
  links: Array<{ url: string | null; label: string; active: boolean }>;
  current_page: number;
  last_page: number;
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

function statusBadge(status: string) {
  if (status === "approved") return <Badge>Approved</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function ServicesVerificationsIndex() {
  const { props } = usePage<{
    services: Pagination<ServiceLite>;
    filters: { status: string; q: string };
  }>();

  const { services, filters } = props;

  const [q, setQ] = useState(filters.q ?? "");
  const [status, setStatus] = useState(filters.status ?? "pending");

  const applyFilters = () => {
    router.get(
      servicesIndex().url,
      { q, status },
      { preserveScroll: true, preserveState: true }
    );
  };

  return (
    <AppLayout>
      <Head title="Service approvals" />

      <div className="p-6 max-w-6xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Service approvals</h1>
            <p className="text-sm text-muted-foreground">
              Approve or reject services created by providers.
            </p>
          </div>

          <Button variant="outline" asChild>
            <Link href={providersIndex().url}>
              Provider verifications
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="font-medium">Filters</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="q">Search (title/provider)</Label>
                <Input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Plumbing, Ahmed..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") applyFilters();
                  }}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="h-10 rounded-md border bg-background px-3 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="rejected">rejected</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button onClick={applyFilters} className="w-full">
                  Apply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {services.data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No services found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {services.data.map((s) => {
              const cover =
                s.media?.slice().sort((a, b) => a.position - b.position)[0]?.path ?? null;
              const coverUrl = publicImagePath(cover);

              return (
                <Card key={s.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 rounded-md overflow-hidden border bg-muted">
                        {coverUrl ? (
                          <img src={coverUrl} className="h-full w-full object-cover" alt={s.title} />
                        ) : null}
                      </div>

                      <div className="min-w-0">
                        <div className="font-medium truncate">{s.title}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          Provider: {s.provider?.name ?? "—"} • {s.city?.name ?? "—"} •{" "}
                          {s.category?.name ?? "—"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {statusBadge(s.status)}

                      <Button variant="outline" asChild>
                        <Link href={servicesShow(s.id).url}>
                          Open
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {services.last_page > 1 ? (
          <Card>
            <CardContent className="p-4">
              <PaginationLinks links={services.links} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}


