import { Head, Link, usePage } from "@inertiajs/react";
import {
  BookOpenCheck,
  CheckCircle,
  CircleX,
  Clock,
  ExternalLink,
  Star,
  StarHalf,
  Trash2,
  TriangleAlert,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { show as myRequestShow } from "@/routes/client/my/requests";
import { show as profileShow } from "@/routes/profiles";
import { create as reportCreate } from "@/routes/reports";
import { show as serviceShow } from "@/routes/services";

type UserItem = {
  id: number;
  name: string;
  email?: string;
  role: string;
  status: string;
  avatar_path: string | null;
};

type ProfileItem = {
  bio: string | null;
  address: string | null;
  company_name: string | null;
  verified_at: string | null;
  rating_avg: string;
  rating_count: number;
} | null;

type RequestItem = {
  id: number;
  title: string;
  status: string;
  budget_min: string | null;
  budget_max: string | null;
  created_at: string;
};

type ServiceItem = {
  id: number;
  title: string;
  slug: string;
  base_price: string | null;
  pricing_type: string;
  status: string;
  created_at: string;
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

const initials = (name: string) => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
};

function Stars({ value }: { value: number }) {
  const rating = Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0;

  const full = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-1 flex-wrap">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      ))}

      {hasHalf && <StarHalf className="h-4 w-4 fill-yellow-400 text-yellow-400" />}

      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e-${i}`} className="h-4 w-4 text-muted-foreground" />
      ))}
    </span>
  );
}

export default function ProfileShow() {
  const { props } = usePage<{
    auth?: { user?: { role?: string } | null };
    user: UserItem;
    profile: ProfileItem;
    requests?: RequestItem[] | null;
    services?: ServiceItem[] | null;
  }>();

  const user = props.user;
  const profile = props.profile;
  const requests = props.requests ?? [];
  const services = props.services ?? [];
  const viewerRole = props.auth?.user?.role ?? null;

  const avatarUrl = publicImagePath(user.avatar_path);

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: user.name, href: profileShow(user.id).url },
      ]}
    >
      <Head title={`${user.name} - Profile`} />

      <div className="p-4 sm:p-6  w-full space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="relative inline-block shrink-0">
              <Avatar className="h-14 w-14">
                <AvatarImage src={avatarUrl} alt={user.name} />
                <AvatarFallback>{initials(user.name)}</AvatarFallback>
              </Avatar>

              {user.role === "provider" && profile?.verified_at ? (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              ) : null}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold break-words">{user.name}</h1>
              </div>

              {user.email ? (
                <p className="text-sm text-muted-foreground break-all">{user.email}</p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
            {user.role === "provider" && viewerRole === "client" ? (
              <button className="w-max sm:w-auto">
                <Link
                  href={reportCreate({
                    query: { type: "provider", id: user.id },
                  }).url}
                  className="block"
                >
                  <div className="flex items-center justify-center rounded-3xl p-2 border border-gray-200 gap-2 text-red-600 transition duration-700 w-full">
                    <TriangleAlert className="h-5 w-5 shrink-0" />
                    <span>Report</span>
                  </div>
                </Link>
              </button>
            ) : null}

            <div className="flex items-center justify-center rounded-3xl border border-gray-200 text-red-600 py-2 px-3 transition duration-700 hover:bg-red-600 hover:text-white gap-2 w-full sm:w-auto">
              <button className="w-max sm:w-auto">
                <Link href={dashboard().url} className="block w-max text-center">
                  Back
                </Link>
              </button>
            </div>
          </div>
        </div>

        <Card className="border border-gray-200 rounded-4xl bg-primary-foreground/30">
          <CardHeader>
            <div className="font-medium">About</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm whitespace-pre-line break-words">
              {profile?.bio ? profile.bio : "No bio yet."}
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground space-y-2">
              <div className="break-words">
                Address:{" "}
                <span className="text-foreground font-medium">
                  {profile?.address ? profile.address : "--"}
                </span>
              </div>

              {user.role === "provider" ? (
                <>
                  <div className="break-words">
                    Company:{" "}
                    <span className="text-foreground font-medium">
                      {profile?.company_name ? profile.company_name : "--"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Stars value={Number(profile?.rating_avg ?? 0)} />
                    <span className="text-foreground font-medium">
                      {Number(profile?.rating_avg ?? 0).toFixed(2)} (
                      {profile?.rating_count ?? 0})
                    </span>
                  </div>

                  <div>
                    Verified:{" "}
                    <span className="text-foreground font-medium">
                      {profile?.verified_at ? "Yes" : "No"}
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>

        {user.role === "provider" ? (
          <Card className="rounded-3xl">
            <CardHeader>
              <div className="font-medium">Services</div>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.length === 0 ? (
                <div className="text-sm text-muted-foreground">No services yet.</div>
              ) : (
                services.map((service) => (
                  <div
                    key={service.id}
                    className="rounded-4xl border border-gray-200 bg-primary-foreground/30 p-4 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-base sm:text-xl break-words min-w-0">{service.title}</div>
                      <Link
                        href={serviceShow(service.slug).url}
                        className="text-primary hover:text-foreground shrink-0"
                      >
                        <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6" />
                      </Link>
                    </div>

                    <div className="text-sm text-foreground mt-3">
                      <div className="rounded-3xl border border-gray-200 w-max sm:w-max p-2 break-words">
                        Status:{" "}
                        {service.status === "approved" ? (
                          <span className="text-primary">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            {service.status}
                          </span>
                        ) : service.status === "pending" ? (
                          <span className="text-yellow-600">
                            <Clock className="h-4 w-4 inline mr-1" />
                            {service.status}
                          </span>
                        ) : service.status === "rejected" ? (
                          <span className="text-red-600">
                            <CircleX className="h-4 w-4 inline mr-1" />
                            {service.status}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">{service.status}</span>
                        )}
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground p-2 rounded-3xl border border-gray-200 w-max sm:w-max mt-2 break-words">
                      Pricing:{" "}
                      <span className="text-foreground">
                        {service.pricing_type}
                        {service.base_price ? ` - ${service.base_price} DZD` : ""}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="rounded-4xl p-4 border border-gray-200 bg-primary-foreground/30">
            <CardHeader>
              <div className="font-medium">Requests</div>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-sm text-muted-foreground">No requests yet.</div>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="rounded-4xl border border-gray-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium break-words min-w-0">{request.title}</div>
                      <Link
                        href={myRequestShow(request.id).url}
                        className="text-sm underline shrink-0"
                      >
                        <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6 text-primary transition duration-700 hover:text-foreground" />
                      </Link>
                    </div>

                    <div className="text-sm text-foreground p-2 rounded-3xl border border-gray-200 w-max sm:w-max mt-2">
                      <div className="p-1 flex flex-wrap items-center gap-2">
                        <span>Status</span>
                        {request.status === "open" ? (
                          <span className="font-medium rounded-full p-2 border border-gray-200 text-primary inline-flex items-center">
                            <BookOpenCheck className="h-4 w-4 inline mr-1" />
                            {request.status}
                          </span>
                        ) : request.status === "assigned" ? (
                          <span className="font-medium rounded-full p-2 border border-gray-200 text-primary inline-flex items-center">
                            {request.status}
                          </span>
                        ) : request.status === "closed" ? (
                          <span className="font-medium rounded-full p-2 border border-gray-200 text-red-600 inline-flex items-center">
                            <X className="h-4 w-4 inline mr-1" />
                            {request.status}
                          </span>
                        ) : request.status === "cancelled" ? (
                          <span className="font-medium rounded-full p-2 border border-gray-200 text-red-600 inline-flex items-center">
                            <Trash2 className="h-4 w-4 inline mr-1" />
                            {request.status}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-sm text-foreground mt-2 p-2 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 rounded-3xl border border-gray-200 w-full sm:w-max">
                      <span>Budget</span>

                      <div className="text-red-600 font-medium rounded-3xl p-2 border border-gray-200 w-max sm:w-max flex items-center gap-2">
                        {request.budget_min ?? "--"} DZD
                      </div>

                      <div className="text-primary font-medium rounded-3xl p-2 border border-gray-200 w-max sm:w-max flex items-center gap-2">
                        {request.budget_max ?? "--"} DZD
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}