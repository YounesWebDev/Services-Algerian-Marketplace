import { Head, Link, router, usePage } from "@inertiajs/react";
import {
  BadgeCheck,
  CheckCircle2Icon,
  Clock,
  CreditCard,
  Handshake,
  MapPin,
  OctagonAlert,
  Pin,
  Wallet,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AppLayout from "@/layouts/app-layout";
import PaginationLinks from "@/components/pagination-links";
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

  // ✅ MOD: show alert with animation for 8s when flash.success exists
  const [showAlert, setShowAlert] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!flash?.success) return;

    let animationFrameId: number | null = null;
    let showAnimationFrameId: number | null = null;
    let hideTimer: ReturnType<typeof setTimeout> | null = null;
    let removeTimer: ReturnType<typeof setTimeout> | null = null;

    animationFrameId = requestAnimationFrame(() => {
      setShowAlert(true);

      // allow DOM paint before animating in
      showAnimationFrameId = requestAnimationFrame(() => setAnimate(true));
    });

    hideTimer = setTimeout(() => {
      setAnimate(false); // slide out to the right
      removeTimer = setTimeout(() => setShowAlert(false), 300); // wait for animation end
    }, 8000); // ✅ MOD: 8 seconds

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (showAnimationFrameId) {
        cancelAnimationFrame(showAnimationFrameId);
      }
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      if (removeTimer) {
        clearTimeout(removeTimer);
      }
    };
  }, [flash?.success]);

  return (
    <AppLayout>
      <Head title="My Services " />

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl text-primary font-semibold">My Services</h1>
            <p className="text-sm text-card-foreground/70 mt-1 max-w-md">
              Create services that clients can book. New services start as{" "}
              <span className="font-medium">pending</span> until admin approves.
            </p>
          </div>

          <Link
            href={providerServicesCreate.url()}
            className="rounded-3xl  bg-primary px-3 py-2 transition duration-700  text-white text-sm hover:bg-foreground hover:text-background "
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
            <Alert className="bg-primary/5 backdrop-blur-sm">
              <CheckCircle2Icon className="text-primary" />
              <AlertTitle className="text-primary">
                Service created successfully
              </AlertTitle>
              <AlertDescription className="text-foreground">
                your service has been created successfully waiting for admin
                approval.
              </AlertDescription>
            </Alert>
          </div>
        ) : null}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={providerServicesIndex.url()}
            className={`px-3 py-1 rounded-3xl  text-sm border   ${
              filters.status === "" ? "bg-primary text-foreground" : "bg-foreground/40 border border-gray-200"
            }`}
          >
            All
          </Link>

          {["pending", "approved", "rejected"].map((s) => (
            <Link
              key={s}
              href={providerServicesIndex.url({ query: { status: s } })}
              className={`px-3 py-1 rounded-3xl text-sm border ${
                filters.status === s ? "bg-primary text-foreground " : "bg-foreground/40 border border-gray-200"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {services.data.length === 0 ? (
            <div className="rounded-3xl bg-foreground/30 border border-gray-200 p-4 text-sm ">
              No services yet.
            </div>
          ) : (
            services.data.map((s) => {
              const cover = s.media
                ?.slice()
                .sort((a, b) => a.position - b.position)[0]?.path;
              const coverUrl = publicImagePath(cover);

              return (
                <div
                  key={s.id}
                  className="rounded-4xl border border-gray-200  bg-foreground/40 hover:bg-foreground/60 p-4 transition duration-300 ease-in-out text-card-foreground"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24  shrink-0 rounded-md overflow-hidden border bg-gray-50">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={s.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-bold text-primary ">{s.title}</div>
                          <div className=" flex items-center  gap-1 text-sm  mt-1 border border-gray-200 w-max px-2 py-1 rounded-3xl">
                            {s.category?.name}{" "}
                            <div className="flex items-center gap-1 border border-gray-200 rounded-3xl p-2">
                              <MapPin /> {s.city?.name}
                            </div>
                          </div>

                          <div className="text-sm  mt-1 flex items-center gap-1">
                            Status:{" "}
                            {s.status === "approved" ? (
                              <span className=" font-medium text-primary flex items-center gap-1">
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

                          <div className="flex justify-between gap-5 ">
                            <div className="text-sm  mt-1 p-1 border border-gray-200 rounded-3xl flex items-center gap-1">
                              Pricing{" "}
                              {s.pricing_type === "fixed" ? (
                                <span className="font-medium flex items-center gap-1 text-red-600 p-2 rounded-3xl border border-gray-200"><Pin className="w-4 h-4 mr-1" /> {s.pricing_type}</span>
                              ) : s.pricing_type === "quote" ? (
                                <span className="font-medium flex items-center gap-1 text-primary p-2 rounded-3xl border border-gray-200"><Handshake className="w-4 h-4 mr-1" /> {s.pricing_type}</span>
                              ) : s.pricing_type === "hourly" ? (
                                <span className="font-medium flex items-center gap-1 text-amber-400 p-2 rounded-3xl border border-gray-200"><Clock className="w-4 h-4 mr-1" /> {s.pricing_type}</span>
                              ) : null}
                            </div>
                            <div className="p-1 border border-gray-200 rounded-3xl flex items-center gap-1 text-sm  mt-1">
                              Payment{" "}
                              {s.payment_type === "cash" ? (
                                <span className=" p-2 rounded-3xl border border-gray-200 font-medium text-primary flex items-center gap-1 ">
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
                            <div className="text-sm  mt-1 p-1 border border-gray-200 rounded-3xl text-primary flex items-center gap-1">
                              price{" "}
                              <span className="font-medium p-2 rounded-3xl border border-gray-200">
                                {s.base_price ?? "—"} DZD
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {/* Public page */}
                          <Link
                            href={serviceShow.url(s.slug)}
                            className="text-sm underline"
                          >
                            View public
                          </Link>

                          <div className="flex items-center gap-2">
                            <Link
                              href={providerServicesEdit(s.id).url}
                              className="rounded-3xl border border-gray-200 px-3 py-1 text-xs transition hover:bg-foreground hover:text-background"
                            >
                              Edit
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                if (!confirm("Remove this service?")) {
                                  return;
                                }

                                router.delete(providerServicesDestroy(s.id).url, {
                                  preserveScroll: true,
                                });
                              }}
                              className="rounded-3xl border border-red-200 px-3 py-1 text-xs text-red-600 transition hover:bg-red-600 hover:text-white"
                            >
                              Remove
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
