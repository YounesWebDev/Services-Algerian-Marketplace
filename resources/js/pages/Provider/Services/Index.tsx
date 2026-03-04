import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  BadgeCheck,
  CheckCircle2Icon,
  Clock,
  CreditCard,
  Eye,
  Handshake,
  MapPin,
  OctagonAlert,
  Pen,
  Pin,
  Trash2,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import PaginationLinks from "@/components/pagination-links";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppLayout from "@/layouts/app-layout";
import {
  create as providerServicesCreate,
  destroy as providerServicesDestroy,
  edit as providerServicesEdit,
  index as providerServicesIndex,
} from "@/routes/provider/my/services";
import { show as serviceShow } from "@/routes/services";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Media = {
  id: number;
  service_id: number;
  path: string;
  type: string;
  position: number;
};

type ServiceItem = {
  id: number;
  title: string;
  slug: string;
  status: string; // pending | approved | rejected
  pricing_type: string; // fixed | hourly | quote
  payment_type: string; // cash | online | both
  base_price: string | null;
  category: Category;
  city: City;
  media: Media[];
};

type PaginationLink = { url: string | null; label: string; active: boolean };

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

export default function ProviderServicesIndex() {
  const { props } = usePage<{
    services: { data: ServiceItem[]; links: PaginationLink[] };
    filters: { status: string };
    flash?: { success?: string };
  }>();

  const { services, filters, flash } = props;

  const [showAlert, setShowAlert] = useState(false);
  const [animate, setAnimate] = useState(false);

  const alertContent = useMemo(() => {
    const msg = flash?.success?.trim() ?? "";
    const lower = msg.toLowerCase();

    const isDelete =
      lower.includes("remove") ||
      lower.includes("removed") ||
      lower.includes("delete") ||
      lower.includes("deleted");

    const isUpdate =
      lower.includes("update") ||
      lower.includes("updated") ||
      lower.includes("edit") ||
      lower.includes("edited");

    const title = isDelete
      ? "Service removed successfully"
      : isUpdate
      ? "Service updated successfully"
      : "Service created successfully";

    const description =
      msg ||
      (isDelete
        ? "Your service has been removed successfully."
        : isUpdate
        ? "Your service has been updated successfully."
        : "Your service has been created successfully, waiting for admin approval.");

    return { title, description };
  }, [flash?.success]);

  useEffect(() => {
    if (!flash?.success) return;

    let animationFrameId: number | null = null;
    let showAnimationFrameId: number | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let removeTimer: ReturnType<typeof setTimeout> | null = null;

    animationFrameId = requestAnimationFrame(() => {
      setShowAlert(true);
      showAnimationFrameId = requestAnimationFrame(() => setAnimate(true));
    });

    hideTimer = setTimeout(() => {
      setAnimate(false);
      removeTimer = setTimeout(() => setShowAlert(false), 300);
    }, 8000);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (showAnimationFrameId) cancelAnimationFrame(showAnimationFrameId);
      if (hideTimer) clearTimeout(hideTimer);
      if (removeTimer) clearTimeout(removeTimer);
    };
  }, [flash?.success]);

  return (
    <AppLayout>
      <Head title="My Services " />

      <div className="p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl text-primary font-semibold">My Services</h1>
            <p className="text-sm text-card-foreground/70 mt-1 max-w-md">
              Create services that clients can book. New services start as{" "}
              <span className="font-medium">pending</span> until admin approves.
            </p>
          </div>

          <Link
            href={providerServicesCreate.url()}
            className="rounded-3xl bg-primary px-3 py-2 transition duration-700 text-white text-sm hover:bg-foreground hover:text-background w-full sm:w-auto text-center"
          >
            Create Service
          </Link>
        </div>

        {/* Alert */}
        {showAlert ? (
          <div
            className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-out
              ${
                animate
                  ? "translate-x-0 opacity-100"
                  : "translate-x-full opacity-0"
              }
            `}
          >
            <Alert className="bg-primary/5 backdrop-blur-sm max-w-[92vw] sm:max-w-md">
              <CheckCircle2Icon className="text-primary" />
              <AlertTitle className="text-primary">{alertContent.title}</AlertTitle>
              <AlertDescription className="text-foreground">
                {alertContent.description}
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={providerServicesIndex.url()}
            className={`px-3 py-1 rounded-3xl text-sm border ${
              filters.status === ""
                ? "bg-primary text-foreground"
                : "bg-foreground/40 border border-gray-200"
            }`}
          >
            All
          </Link>

          {["pending", "approved", "rejected"].map((st) => (
            <Link
              key={st}
              href={providerServicesIndex.url({ query: { status: st } })}
              className={`px-3 py-1 rounded-3xl text-sm border ${
                filters.status === st
                  ? "bg-primary text-foreground"
                  : "bg-primary-foreground/30 hover:bg-primary-foreground/40 hover:shadow-2xl border border-gray-200"
              }`}
            >
              {st}
            </Link>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {services.data.length === 0 ? (
            <div className="rounded-3xl bg-primary-foreground/30 hover:shadow-2xl border border-gray-200 p-4 text-sm">
              No services yet.
            </div>
          ) : (
            services.data.map((s) => {
              const cover = s.media?.slice().sort((a, b) => a.position - b.position)[0]?.path;
              const coverUrl = publicImagePath(cover);

              return (
                <div
                  key={s.id}
                  className="rounded-4xl border border-gray-200 bg-primary-foreground/30 hover:bg-primary-foreground/40 hover:shadow p-4 transition duration-300 ease-in-out text-card-foreground"
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-40 sm:h-24 shrink-0 rounded-md overflow-hidden border bg-gray-50">
                      {coverUrl ? (
                        <img src={coverUrl} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-bold text-foreground text-xl wrap-break-word">{s.title}</div>

                          <div className="flex flex-wrap items-center gap-2 text-sm mt-2 border border-gray-200 w-full sm:w-max px-2 py-1 rounded-3xl">
                            <span className="wrap-break-word">{s.category?.name}</span>
                            <div className="flex items-center gap-1 border border-gray-200 rounded-3xl p-2">
                              <MapPin /> <span className="wrap-break-word">{s.city?.name}</span>
                            </div>
                          </div>

                          <div className="text-sm mt-2 flex flex-wrap items-center gap-2">
                            <span> Status:</span>
                            {s.status === "approved" ? (
                              <span className="font-medium text-primary flex items-center gap-1">
                                <BadgeCheck className="w-4 h-4" /> {s.status}
                              </span>
                            ) : s.status === "rejected" ? (
                              <span className="font-medium text-red-600 flex items-center gap-1">
                                <OctagonAlert className="w-4 h-4" /> {s.status}
                              </span>
                            ) : (
                              <span className="font-medium text-yellow-600 flex items-center gap-1">
                                <Clock className="w-4 h-4" /> {s.status}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center gap-2 mt-2">
                            <div className="text-sm p-1 border border-gray-200 rounded-3xl flex flex-wrap items-center gap-2 w-full md:w-auto">
                              Pricing{" "}
                              {s.pricing_type === "fixed" ? (
                                <span className="font-medium flex items-center gap-1 text-red-600 p-2 rounded-3xl border border-gray-200">
                                  <Pin className="w-4 h-4 mr-1" /> {s.pricing_type}
                                </span>
                              ) : s.pricing_type === "quote" ? (
                                <span className="font-medium flex items-center gap-1 text-primary p-2 rounded-3xl border border-gray-200">
                                  <Handshake className="w-4 h-4 mr-1" /> {s.pricing_type}
                                </span>
                              ) : s.pricing_type === "hourly" ? (
                                <span className="font-medium flex items-center gap-1 text-amber-400 p-2 rounded-3xl border border-gray-200">
                                  <Clock className="w-4 h-4 mr-1" /> {s.pricing_type}
                                </span>
                              ) : null}
                            </div>

                            <div className="p-1 border border-gray-200 rounded-3xl flex flex-wrap items-center gap-2 text-sm w-full md:w-auto">
                              Payment{" "}
                              {s.payment_type === "cash" ? (
                                <span className="p-2 rounded-3xl border border-gray-200 font-medium text-primary flex items-center gap-1">
                                  <Wallet className="w-4 h-4 mr-1" /> {s.payment_type}
                                </span>
                              ) : s.payment_type === "online" ? (
                                <span className="p-2 rounded-3xl border border-gray-200 font-medium text-primary flex items-center gap-1">
                                  <CreditCard className="w-4 h-4 mr-1" /> {s.payment_type}
                                </span>
                              ) : s.payment_type === "both" ? (
                                <span className="p-2 rounded-3xl border border-gray-200 font-medium text-primary flex items-center gap-1">
                                  <Wallet className="w-4 h-4 mr-1" /> {s.payment_type}
                                </span>
                              ) : null}
                            </div>

                            <div className="text-sm p-1 border border-gray-200 rounded-3xl text-primary flex flex-wrap items-center gap-2 w-full md:w-auto">
                              price{" "}
                              <span className="font-medium p-2 rounded-3xl border border-gray-200">
                                {s.base_price ?? "—"} DZD
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-2 w-full lg:w-auto">
                          <Link href={serviceShow.url(s.slug)} className="text-sm underline text-center sm:text-left">
                            <Eye className="text-primary transition hover:text-foreground"/>
                          </Link>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Link
                              href={providerServicesEdit(s.id).url}
                              className="rounded-3xl border border-gray-200 px-3 py-2 sm:py-1 text-xs transition hover:bg-foreground hover:text-background w-full sm:w-auto text-center"
                            >
                              <Pen className="w-4 h-4" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => {
                                if (!confirm("Remove this service?")) return;

                                // ✅ TS-safe + supports preserveScroll
                                router.delete(providerServicesDestroy(s.id).url, {
                                  preserveScroll: true,
                                  onSuccess: () => {
                                    // optional: if your backend doesn't flash, you can force show alert here,
                                    // but leaving it as-is to not change your logic.
                                  },
                                });
                              }}
                              className="rounded-3xl border border-red-200 px-3 py-2 sm:py-1 text-xs text-red-600 transition hover:bg-red-600 hover:text-white w-full sm:w-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {services.links?.length > 0 && <PaginationLinks links={services.links} />}
      </div>
    </AppLayout>
  );
}
