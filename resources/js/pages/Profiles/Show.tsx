import { Head, Link, usePage } from "@inertiajs/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { show as myRequestShow } from "@/routes/client/my/requests";
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
    <AppLayout>
      <Head title={`${user.name} - Profile`} />

      <div className="p-6 max-w-3xl space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={avatarUrl} alt={user.name} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{user.name}</h1>
                <Badge variant="secondary">{user.role}</Badge>
                <Badge variant={user.status === "active" ? "default" : "destructive"}>
                  {user.status}
                </Badge>
              </div>

              {/* if you don't want to show email publicly, remove it from controller props */}
              {user.email ? (
                <p className="text-sm text-muted-foreground">{user.email}</p>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={dashboard().url}>Back</Link>
            </Button>
            {user.role === "provider" && viewerRole === "client" ? (
              <Button variant="outline" asChild>
                <Link
                  href={reportCreate({
                    query: { type: "provider", id: user.id },
                  }).url}
                >
                  Report this provider
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="font-medium">About</div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-foreground whitespace-pre-line">
              {profile?.bio ? profile.bio : "No bio yet."}
            </div>

            <Separator />

            <div className="text-sm text-muted-foreground space-y-2">
              <div>
                Address:{" "}
                <span className="text-foreground font-medium">
                  {profile?.address ? profile.address : "--"}
                </span>
              </div>

              {user.role === "provider" ? (
                <>
                  <div>
                    Company:{" "}
                    <span className="text-foreground font-medium">
                      {profile?.company_name ? profile.company_name : "--"}
                    </span>
                  </div>

                  <div>
                    Rating:{" "}
                    <span className="text-foreground font-medium">
                      {profile?.rating_avg ?? "0.00"} ({profile?.rating_count ?? 0})
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
          <Card>
            <CardHeader>
              <div className="font-medium">Services</div>
            </CardHeader>
            <CardContent className="space-y-3">
              {services.length === 0 ? (
                <div className="text-sm text-muted-foreground">No services yet.</div>
              ) : (
                services.map((service) => (
                  <div key={service.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium">{service.title}</div>
                      <Link
                        href={serviceShow(service.slug).url}
                        className="text-sm underline"
                      >
                        View
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Status: <span className="text-foreground">{service.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
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
          <Card>
            <CardHeader>
              <div className="font-medium">Requests</div>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.length === 0 ? (
                <div className="text-sm text-muted-foreground">No requests yet.</div>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="font-medium">{request.title}</div>
                      <Link
                        href={myRequestShow(request.id).url}
                        className="text-sm underline"
                      >
                        View
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Status: <span className="text-foreground">{request.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Budget:{" "}
                      <span className="text-foreground">
                        {request.budget_min ?? "--"} - {request.budget_max ?? "--"} DZD
                      </span>
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
