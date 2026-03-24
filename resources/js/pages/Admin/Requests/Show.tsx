import { Head, useForm, usePage } from "@inertiajs/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { dashboard } from "@/routes";
// Wayfinder (adjust import if needed)
import {
  index as adminRequestsIndex,
  close as adminRequestsClose,
  reopen as adminRequestsReopen,
} from "@/routes/admin/requests";

type Media = { id: number; path: string; type: string; position: number };

type UserMini = {
  id: number;
  name: string;
  email: string;
  avatar_path?: string | null;
  status: "active" | "inactive";
  role: string;
};

type OfferRow = {
  id: number;
  provider_id: number;
  message: string;
  proposed_price: number | string;
  estimated_days?: number | null;
  status: string; // sent/rejected/assigned...
  created_at?: string | null;
  provider: UserMini;
};

type RequestModel = {
  id: number;
  title: string;
  description: string;
  status: string;
  budget_min?: number | string | null;
  budget_max?: number | string | null;
  urgency?: string | null;

  category: { id: number; name: string; slug: string };
  city: { id: number; name: string };
  client: UserMini;
  media?: Media[];

  offers?: OfferRow[];
  created_at?: string | null;
};

type PageProps = {
  request: RequestModel;
  flash?: { success?: string };
  errors?: Record<string, string>;
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
  const cls =
    variant === "success"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : variant === "danger"
      ? "bg-rose-100 text-rose-800 border-rose-200"
      : variant === "warning"
      ? "bg-amber-100 text-amber-900 border-amber-200"
      : variant === "muted"
      ? "bg-gray-100 text-gray-700 border-gray-200"
      : "bg-blue-100 text-blue-800 border-blue-200";

  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", cls)}>
      {children}
    </span>
  );
}

export default function AdminRequestsShow() {
  const { props } = usePage<PageProps>();
  const { request, flash, errors } = props;

  const form = useForm({});

  const mediaSorted = (request.media ?? []).slice().sort((a, b) => a.position - b.position);
  const offers = request.offers ?? [];

  const isClosed = request.status === "closed" || request.status === "cancelled";
  const canClose = !isClosed && request.status !== "assigned";
  const canReopen = isClosed;

  const closeNow = () => {
    form.post(adminRequestsClose(request.id).url, { preserveScroll: true });
  };

  const reopenNow = () => {
    form.post(adminRequestsReopen(request.id).url, { preserveScroll: true });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Requests", href: adminRequestsIndex().url },
        { title: request.title, href: adminRequestsIndex().url },
      ]}
    >
      <Head title={`Request: ${request.title}`} />

      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Request details</h1>
            <p className="text-sm text-muted-foreground">
              Review content and offers. Close requests if they violate rules or should be stopped.
            </p>
          </div>

          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Back
          </Button>
        </div>

        {flash?.success ? (
          <div className="rounded-md border bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {flash.success}
          </div>
        ) : null}

        {errors?.request ? (
          <div className="rounded-md border bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {errors.request}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span className="truncate">{request.title}</span>
                <Badge
                  variant={
                    request.status === "open"
                      ? "success"
                      : request.status === "assigned"
                      ? "warning"
                      : request.status === "closed" || request.status === "cancelled"
                      ? "danger"
                      : "muted"
                  }
                >
                  {request.status}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="rounded-lg border p-3 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Category / City</div>
                <div className="font-medium">
                  {request.category?.name} • {request.city?.name}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Budget</div>
                  <div className="font-medium">
                    {request.budget_min || request.budget_max
                      ? `${request.budget_min ?? "—"} - ${request.budget_max ?? "—"} DZD`
                      : "—"}
                  </div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Urgency</div>
                  <div className="font-medium">{request.urgency ?? "—"}</div>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Offers</div>
                  <div className="font-medium">{offers.length}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Description</div>
                <div className="rounded-lg border p-3 text-sm whitespace-pre-wrap">
                  {request.description}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Media</div>

                {mediaSorted.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No images.</div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {mediaSorted.map((m) => {
                      const url = publicImagePath(m.path);
                      return (
                        <div key={m.id} className="rounded-lg overflow-hidden border bg-muted">
                          {url ? (
                            <img src={url} alt="request media" className="w-full h-40 object-cover" />
                          ) : (
                            <div className="w-full h-40 flex items-center justify-center text-xs text-muted-foreground">
                              Invalid path
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Admin actions */}
              <div className="border-t pt-4 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={closeNow}
                  variant="destructive"
                  disabled={form.processing || !canClose}
                >
                  Close request
                </Button>

                <Button
                  type="button"
                  onClick={reopenNow}
                  variant="outline"
                  disabled={form.processing || !canReopen}
                >
                  Reopen
                </Button>

                <div className="text-xs text-muted-foreground ml-auto">
                  {request.status === "assigned"
                    ? "Tip: assigned requests usually should be handled via booking/offer flow."
                    : null}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden border bg-muted shrink-0">
                  {request.client?.avatar_path ? (
                    <img
                      src={publicImagePath(request.client.avatar_path)}
                      alt={request.client.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-medium truncate">{request.client?.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{request.client?.email}</div>
                  <div className="mt-2">
                    <Badge variant={request.client?.status === "active" ? "success" : "danger"}>
                      {request.client?.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Created: {request.created_at ? new Date(request.created_at).toLocaleString() : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Offers list */}
        <Card>
          <CardHeader>
            <CardTitle>Offers</CardTitle>
          </CardHeader>

          <CardContent>
            {offers.length === 0 ? (
              <div className="text-sm text-muted-foreground">No offers yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr className="text-left">
                      <th className="px-3 py-2 font-medium">Provider</th>
                      <th className="px-3 py-2 font-medium">Price</th>
                      <th className="px-3 py-2 font-medium">Days</th>
                      <th className="px-3 py-2 font-medium">Status</th>
                      <th className="px-3 py-2 font-medium">Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {offers.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="px-3 py-2">
                          <div className="font-medium">{o.provider?.name}</div>
                          <div className="text-xs text-muted-foreground">{o.provider?.email}</div>
                        </td>
                        <td className="px-3 py-2">{o.proposed_price} DZD</td>
                        <td className="px-3 py-2">{o.estimated_days ?? "—"}</td>
                        <td className="px-3 py-2">
                          <Badge variant="muted">{o.status}</Badge>
                        </td>
                        <td className="px-3 py-2">
                          <div className="max-w-105 whitespace-pre-wrap">{o.message}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

