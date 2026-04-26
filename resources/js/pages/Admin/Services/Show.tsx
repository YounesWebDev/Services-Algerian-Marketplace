import { Head, useForm, usePage } from "@inertiajs/react";

import InertiaFlashAlert from "@/components/inertia-flash-alert";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { cn } from "@/lib/utils";
import { dashboard } from "@/routes";
// Wayfinder (adjust if needed)
import {
  index as adminServicesIndex,
  approve as adminServicesApprove,
  reject as adminServicesReject,
  hide as adminServicesHide,
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

type Service = {
  id: number;
  title: string;
  slug: string;
  description: string;
  base_price?: number | string | null;
  pricing_type: "fixed" | "hourly" | "quote";
  payment_type: "cash" | "online" | "both";
  status: "pending" | "approved" | "rejected" | "hidden";

  provider: ProviderMini;
  category: CategoryMini;
  city: CityMini;
  media?: ServiceMedia[];

  created_at?: string | null;
};

type PageProps = {
  service: Service;
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
    <span className={cn("inline-flex items-center rounded-3xl  border border-gray-200 px-2 py-0.5 text-xs font-medium", cls)}>
      {children}
    </span>
  );
}

export default function AdminServicesShow() {
  const { props } = usePage<PageProps>();
  const { service, flash, errors } = props;

  const form = useForm<{ service?: string }>({});

  const mediaSorted = (service.media ?? []).slice().sort((a, b) => a.position - b.position);
  const statusVariant =
    service.status === "approved"
      ? "success"
      : service.status === "rejected"
      ? "danger"
      : service.status === "hidden"
      ? "muted"
      : "warning";

  const approve = () => {
    form.post(adminServicesApprove(service.id).url, {
      preserveScroll: true,
    });
  };

  const reject = () => {
    form.post(adminServicesReject(service.id).url, {
      preserveScroll: true,
    });
  };

  const hide = () => {
    form.post(adminServicesHide(service.id).url, {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Services", href: adminServicesIndex().url },
        { title: service.title, href: adminServicesIndex().url },
      ]}
    >
      <Head title={`Service: ${service.title}`} />
      <InertiaFlashAlert message={flash?.success} title="Success" />
      <InertiaFlashAlert
        message={errors?.service}
        title="Action blocked"
        variant="error"
      />

      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Service details</h1>
            <p className="text-sm text-muted-foreground">
              Review the service content and approve/reject it.
            </p>
          </div>

          <button type="button" className="rounded-3xl px-3 py-2 border border-gray-200 text-red-600 transition duration-700 hover:bg-red-600 hover:text-white" onClick={() => window.history.back()}>
            Back
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main info */}
          <Card className="lg:col-span-2 rounded-4xl border border-gray-200 bg-primary-foreground/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span className="truncate">{service.title}</span>
                <Badge variant={statusVariant}>{service.status}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="text-sm text-muted-foreground">
                slug: <span className="text-foreground font-medium">{service.slug}</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-gray-200 p-3">
                  <div className="text-xs text-foreground">Pricing type</div>
                  <div className="font-medium">{service.pricing_type}</div>
                </div>

                <div className="rounded-3xl border border-gray-200 p-3">
                  <div className="text-xs text-foreground">Payment type</div>
                  <div className="font-medium">{service.payment_type}</div>
                </div>

                <div className="rounded-3xl border border-gray-200 p-3">
                  <div className="text-xs text-foreground">Base price</div>
                  <div className="font-medium">
                    {service.base_price === null || service.base_price === undefined || service.base_price === ""
                      ? "—"
                      : `${service.base_price} DZD`}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 p-3">
                <div className="text-xs text-foreground mb-1">Category / City</div>
                <div className="font-medium">
                  {service.category?.name} • {service.city?.name}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Description</div>
                <div className="rounded-3xl border border-gray-200 p-3 text-sm whitespace-pre-wrap">
                  {service.description}
                </div>
              </div>

              {/* Media */}
              <div className="space-y-3">
  <div className="flex items-center justify-between">
    <div className="text-sm font-semibold">Media</div>
    {mediaSorted.length > 0 ? (
      <div className="text-xs text-muted-foreground">
        {mediaSorted.length} photo{mediaSorted.length > 1 ? "s" : ""}
      </div>
    ) : null}
  </div>

  {mediaSorted.length === 0 ? (
    <div className="rounded-2xl border bg-muted/40 p-6 text-sm text-muted-foreground">
      No images.
    </div>
  ) : (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2">
        {mediaSorted.map((m) => {
          const url = publicImagePath(m.path);

          return (
            <div
              key={m.id}
              className="min-w-[85%] sm:min-w-[60%] md:min-w-[45%] lg:min-w-[38%] snap-start overflow-hidden rounded-3xl border border-gray-200 bg-muted shrink-0"
            >
              {url ? (
                <img
                  src={url}
                  alt="service media"
                  className="w-full h-56 sm:h-64 md:h-72 object-cover transition duration-300 hover:scale-[1.02]"
                />
              ) : (
                <div className="w-full h-56 sm:h-64 md:h-72 flex items-center justify-center text-xs text-muted-foreground">
                  Invalid path
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )}
</div>

              {/* Actions */}
              <div className="border-t pt-4 flex flex-wrap gap-2 items-center">
                <Button
                  type="button"
                  onClick={approve}
                  disabled={form.processing || service.status === "approved"}
                >
                  Approve
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={reject}
                  disabled={form.processing || service.status === "rejected"}
                >
                  Reject
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={hide}
                  disabled={form.processing || service.status === "hidden"}
                >
                  Hide
                </Button>

                <InputError message={form.errors.service} />
              </div>
            </CardContent>
          </Card>

          {/* Provider card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Provider</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden border bg-muted shrink-0">
                  {service.provider?.avatar_path ? (
                    <img
                      src={publicImagePath(service.provider.avatar_path)}
                      alt={service.provider.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                      N/A
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="font-medium truncate">{service.provider?.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{service.provider?.email}</div>
                  <div className="mt-2">
                    <Badge variant={service.provider?.status === "active" ? "success" : "danger"}>
                      {service.provider?.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-3 text-sm">
                <div className="text-xs text-muted-foreground">Rule</div>
                <div className="mt-1">
                  If provider is <b>inactive</b>, you may want to keep services hidden.
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Created:{" "}
                {service.created_at ? new Date(service.created_at).toLocaleString() : "—"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
