import { Head, Link, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";

import PaginationLinks from "@/components/pagination-links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { show as profileShow } from "@/routes/profiles";

type ProviderProfile = {
  bio: string | null;
  address: string | null;
  company_name: string | null;
  verified_at: string | null;
  rating_avg: string;
  rating_count: number;
};

type ProviderUser = {
  id: number;
  name: string;
  avatar_path: string | null;
  approved_services_count: number;
  profile: ProviderProfile | null;
};

type Pagination<T> = {
  data: T[];
  current_page: number;
  last_page: number;
  links: Array<{ url: string | null; label: string; active: boolean }>;
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

export default function ProvidersIndex() {
  const { props } = usePage<{
    providers: Pagination<ProviderUser>;
    filters: { q: string; city?: string; category?: string };
  }>();

  const providers = props.providers;
  const filters = props.filters;

  const [q, setQ] = useState(filters.q ?? "");

  const submitSearch = () => {
    router.get(
      "/providers",
      { q },
      { preserveScroll: true, preserveState: true }
    );
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submitSearch();
  };

  const subtitle = useMemo(() => {
    const count = providers.data?.length ?? 0;
    return `${count} providers on this page`;
  }, [providers.data]);

  return (
    <AppLayout>
      <Head title="Providers" />

      <div className="p-6 max-w-6xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">Find providers</h1>
            <p className="text-sm text-muted-foreground">
              Search providers by name or company. Open a profile to see more details.
            </p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>

          <Button variant="outline" asChild>
            <Link href={dashboard().url}>Back</Link>
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <div className="font-medium">Search</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="q">Provider name or company</Label>
              <div className="flex gap-2">
                <Input
                  id="q"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onEnter}
                  placeholder="Example: Ahmed, FixPro, Plumber..."
                />
                <Button onClick={submitSearch}>Search</Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground">
              (Optional filters by city/category are already supported by backend if you add
              dropdowns later.)
            </div>
          </CardContent>
        </Card>

        {/* Providers list */}
        {providers.data.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              No providers found. Try another keyword.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {providers.data.map((p) => {
              const avatarUrl = publicImagePath(p.avatar_path);
              const company = p.profile?.company_name;
              const verified = !!p.profile?.verified_at;

              return (
                <Card key={p.id} className="overflow-hidden">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={avatarUrl} alt={p.name} />
                        <AvatarFallback>{initials(p.name)}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {company ? company : "No company name"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">
                        Approved services: {p.approved_services_count}
                      </Badge>

                      {verified ? (
                        <Badge>Verified</Badge>
                      ) : (
                        <Badge variant="outline">Not verified</Badge>
                      )}

                      <Badge variant="outline">
                        Rating: {p.profile?.rating_avg ?? "0.00"} ({p.profile?.rating_count ?? 0})
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {p.profile?.bio ? p.profile.bio : "No bio yet."}
                    </div>

                    <div className="pt-1">
                      <Button asChild className="w-full">
                        <Link href={profileShow(p.id).url}>Open profile</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {providers.links?.length > 0 && <PaginationLinks links={providers.links} />}
      </div>
    </AppLayout>
  );
}
