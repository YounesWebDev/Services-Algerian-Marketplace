import { Head, Link, router, usePage } from "@inertiajs/react";
import { Search, Star } from "lucide-react";
import { useMemo, useState } from "react";

import PaginationLinks from "@/components/pagination-links";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as clientProvidersIndex } from "@/routes/client/providers";
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
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Providers", href: clientProvidersIndex().url },
      ]}
    >
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

          <button className="rounded-3xl py-2 text-red-600 border border-gray-200 transition duration-700 hover:bg-red-600 hover:text-white px-3">
            <Link href={dashboard().url}>Back</Link>
          </button>
        </div>

        {/* Search */}
        <Card className="rounded-4xl border border-gray-200 bg-primary-foreground/30">
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
                  className="rounded-3xl border border-gray-200 bgprimary-foreground/40"
                />
                <button
                  onClick={submitSearch}
                  className="flex items-center rounded-3xl p-2 border border-gray-200 bg-primary transition duration-700 hover:bg-foreground hover:text-background"
                >
                  <Search /> <p className="hidden md:flex ">Search</p>
                </button>
              </div>
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

              const rating = Number(p.profile?.rating_avg ?? 0);
              const count = p.profile?.rating_count ?? 0;

              return (
                <Card key={p.id} className="overflow-hidde rounded-4xl border border-gray-200 bg-primary-foreground/30 transition duration-700 hover:bg-primary-foreground/40  hover:shadow-2xl">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={avatarUrl} alt={p.name} />
                        <AvatarFallback>{initials(p.name)}</AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="font-medium truncate">
                           {verified ? (
                            <img src="verify.png" alt="Verified" className="inline-block h-4 w-4 ml-1" />
                          ) : (
                            <div></div>
                          )}
                          {p.name}
                         
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {company ? company : "No company name"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <div className="text-xs rounded-3xl p-1 border border-gray-200">
                        Approved services: {p.approved_services_count}
                      </div>

                      {/* ⭐ Real Half Star Logic */}
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const full = rating >= star;
                          const half = rating >= star - 0.5 && rating < star;

                          return (
                            <div key={star} className="relative">
                              <Star size={16} className="text-gray-300" />

                              {full && (
                                <Star
                                  size={16}
                                  className="absolute top-0 left-0 fill-yellow-400 text-yellow-400"
                                />
                              )}

                              {half && (
                                <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                                  <Star
                                    size={16}
                                    className="fill-yellow-400 text-yellow-400"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <span className="ml-1 text-xs text-muted-foreground">
                          {rating.toFixed(2)} ({count})
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground line-clamp-3 whitespace-pre-line">
                      {p.profile?.bio ? p.profile.bio : "No bio yet."}
                    </div>

                    <div className="pt-1">
                      <button  className="w-full rounded-3xl py-2 border border-gray-200 bg-primary transition duration-700 hover:bg-foreground hover:text-background">
                        <Link href={profileShow(p.id).url}>Open profile</Link>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {providers.links?.length > 0 && (
          <PaginationLinks links={providers.links} />
        )}
      </div>
    </AppLayout>
  );
}
