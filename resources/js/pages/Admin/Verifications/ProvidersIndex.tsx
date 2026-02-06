import { Head, Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";

import PaginationLinks from "@/components/pagination-links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as providersIndex, show as providersShow } from "@/routes/admin/verifications/providers";
type ProviderLite = {
  id: number;
  name: string;
  email: string;
  avatar_path: string | null;
};

type Verification = {
  id: number;
  provider_id: number;
  status: "pending" | "approved" | "rejected";
  doc_type: string;
  doc_number: string;
  doc_path: string;
  created_at?: string | null;
  provider: ProviderLite;
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

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

function statusBadge(status: string) {
  if (status === "approved") return <Badge>Approved</Badge>;
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge variant="outline">{status}</Badge>;
}

export default function ProvidersVerificationsIndex() {
  const { props } = usePage<{
    verifications: Pagination<Verification>;
    filters: { status: string; q: string };
  }>();

  const { verifications, filters } = props;

  const [q, setQ] = useState(filters.q ?? "");
  const [status, setStatus] = useState(filters.status ?? "pending");

  const applyFilters = () => {
    router.get(
      providersIndex().url,
      { q, status },
      { preserveScroll: true, preserveState: true }
    );
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Provider Verifications", href: providersIndex().url },
      ]}
    >
      <Head title="Provider verifications" />

      <div className="p-6 max-w-6xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Provider verifications</h1>
            <p className="text-sm text-muted-foreground">
              Review provider documents and approve or reject.
            </p>
          </div>

          <div />
        </div>

        <Card>
          <CardHeader>
            <div className="font-medium">Filters</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="q">Search (name/email)</Label>
                <Input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Ahmed, provider@email.com..."
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

        {verifications.data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No verifications found.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {verifications.data.map((v) => {
              const avatar = publicImagePath(v.provider.avatar_path);

              return (
                <Card key={v.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={avatar} alt={v.provider.name} />
                        <AvatarFallback>{initials(v.provider.name)}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {v.provider.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {v.provider.email} • {v.doc_type} • {v.doc_number}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {statusBadge(v.status)}

                      <Button variant="outline" asChild>
                        <Link href={providersShow(v.id).url}>
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
        {verifications.last_page > 1 ? (
          <Card>
            <CardContent className="p-4">
              <PaginationLinks links={verifications.links} />
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}


