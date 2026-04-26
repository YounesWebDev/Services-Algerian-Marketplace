import { Head, Link, useForm, usePage } from "@inertiajs/react";

import InertiaFlashAlert from "@/components/inertia-flash-alert";
import InputError from "@/components/input-error";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { dashboard } from "@/routes";
// Wayfinder (adjust path if needed)
import { index as adminRequestsIndex } from "@/routes/admin/requests";
import { index as adminServicesIndex } from "@/routes/admin/services";
import { index as adminUsersIndex, status as adminUsersStatus } from "@/routes/admin/users";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "provider" | "client";
  status: "active" | "inactive";
  avatar_path?: string | null;
  created_at?: string | null;
};

type Stats = {
  servicesCount: number;
  requestsCount: number;
  bookingsAsClientCount: number;
  bookingsAsProviderCount: number;
  reportsMadeCount: number;
};

type ProviderVerification = null | {
  id: number;
  provider_id: number;
  doc_type: string;
  doc_number: string;
  doc_path: string;
  status: string;
  reviewed_by?: number | null;
  created_at?: string | null;
};

type PageProps = {
  user: User;
  stats: Stats;
  providerVerification: ProviderVerification;
  flash?: { success?: string };
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
  variant?: "default" | "success" | "danger" | "muted";
}) {
  const cls =
    variant === "success"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : variant === "danger"
      ? "bg-rose-100 text-rose-800 border-rose-200"
      : variant === "muted"
      ? "bg-gray-100 text-gray-700 border-gray-200"
      : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <span className={cn("inline-flex items-center rounded-3xl border border-gray-200 px-2 py-0.5 text-xs font-medium", cls)}>
      {children}
    </span>
  );
}

export default function AdminUsersShow() {
  const { props } = usePage<PageProps>();
  const { user, stats, providerVerification, flash } = props;

  const avatar = publicImagePath(user.avatar_path);

  const form = useForm<{ status: "active" | "inactive" }>({
    status: user.status,
  });

  const setStatus = (status: "active" | "inactive") => {
    form.setData("status", status);
    form.post(adminUsersStatus(user.id).url, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Users", href: adminUsersIndex().url },
        { title: user.name, href: adminUsersIndex().url },
      ]}
    >
      <Head title={`User: ${user.name}`} />
      <InertiaFlashAlert message={flash?.success} title="Success" />

      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">User details</h1>
            <p className="text-sm text-muted-foreground">Manage user status and see quick stats.</p>
          </div>

          <button type="button" className="px-3 py-2 rounded-3xl text-red-600 border border-gray-200 transition duration-700 hover:text-white hover:bg-red-600 hover:shadow-2xl" onClick={() => window.history.back()}>
            Back 
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: user card */}
          <Card className="lg:col-span-1 rounded-4xl border border-gray-200 bg-primary-foreground/30">
            <CardHeader>
              <CardTitle>User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden border bg-muted shrink-0">
                  {avatar ? (
                    <img src={avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="text-lg font-semibold truncate">{user.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{user.email}</div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant={user.role === "admin" ? "default" : user.role === "provider" ? "success" : "muted"}>
                      {user.role}
                    </Badge>
                    <Badge variant={user.status === "active" ? "success" : "danger"}>{user.status}</Badge>
                  </div>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Created:{" "}
                <span className="text-foreground font-medium">
                  {user.created_at ? new Date(user.created_at).toLocaleString() : "-"}
                </span>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="text-sm font-medium">Actions</div>

                <div className="flex flex-wrap gap-2">
                  <button
                  className="rounded-3xl border border-gray-200 px-3 py-2 bg-primary transition duration-700 hover:bg-foreground hover:text-background hover:shadow-2xl"
                    type="button"
                    onClick={() => setStatus("active")}
                    disabled={form.processing || user.status === "active"}
                  >
                    Set Active
                  </button>

                  <button
                                    className="rounded-3xl border  border-gray-200 text-red-600 px-3 py-2  transition duration-700 hover:bg-red-600 hover:text-white hover:shadow-2xl"

                    type="button"
                    
                    onClick={() => setStatus("inactive")}
                    disabled={form.processing || user.status === "inactive"}
                  >
                    Set Inactive
                  </button>
                </div>

                <InputError message={form.errors.status} />
              </div>
            </CardContent>
          </Card>

          {/* Right: stats + provider verification */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-4xl border border-gray-200 bg-primary-foreground/30">
              <CardHeader>
                <CardTitle>Quick stats</CardTitle>
              </CardHeader>
              <CardContent>
                {user.role === "provider" ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-3xl border border-gray-200 p-4 bg-primary-foreground/10">
                      <div className="text-sm text-foreground">Services</div>
                      <Link
                        href={adminServicesIndex({ query: { q: user.name } }).url}
                        className="text-2xl font-semibold underline"
                      >
                        {stats.servicesCount}
                      </Link>
                    </div>

                    <div className="rounded-3xl border border-gray-200 p-4 bg-primary-foreground/10">
                      <div className="text-sm text-foreground">Bookings (as provider)</div>
                      <div className="text-2xl font-semibold">{stats.bookingsAsProviderCount}</div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 p-4 bg-primary-foreground/10">
                      <div className="text-sm text-muted-foreground">Reports made</div>
                      <div className="text-2xl font-semibold">{stats.reportsMadeCount}</div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">Requests</div>
                      <Link
                        href={adminRequestsIndex({ query: { q: user.name } }).url}
                        className="text-2xl font-semibold underline"
                      >
                        {stats.requestsCount}
                      </Link>
                    </div>

                    <div className="rounded-3xl border border-gray-200 p-4 bg-primary-foreground/10">
                      <div className="text-sm text-muted-foreground">Bookings (as client)</div>
                      <div className="text-2xl font-semibold">{stats.bookingsAsClientCount}</div>
                    </div>

                    <div className="rounded-3xl border border-gray-200 p-4 bg-primary-foreground/10">
                      <div className="text-sm text-muted-foreground">Reports made</div>
                      <div className="text-2xl font-semibold">{stats.reportsMadeCount}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {user.role === "provider" && (
              <Card className="rounded-3xl bg-primary-foreground/30 border border-gray-200">
                <CardHeader>
                  <CardTitle>Provider verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {!providerVerification ? (
                    <div className="text-sm text-muted-foreground">
                      No verification record found for this provider.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="text-sm">
                          Status:{" "}
                          <Badge
                            variant={
                              providerVerification.status === "approved"
                                ? "success"
                                : providerVerification.status === "rejected"
                                ? "danger"
                                : "muted"
                            }
                          >
                            {providerVerification.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Doc type:</span>{" "}
                          <span className="font-medium">{providerVerification.doc_type}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Doc number:</span>{" "}
                          <span className="font-medium">{providerVerification.doc_number}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Doc file:</span>{" "}
                          <span className="font-medium break-all">{providerVerification.doc_path}</span>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Tip: You can connect this page later to your unified “Verifications management” screen.
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
