import { Head, Link, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import {
  create as providerServicesCreate,
  index as providerServicesIndex,
} from "@/routes/provider/my/services";
import { show as serviceShow } from "@/routes/services";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Media = { id: number; service_id: number; path: string; type: string; position: number };

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

  return (
    <AppLayout>
      <Head title="My Services" />

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">My Services</h1>
            <p className="text-sm text-gray-600">
              Create services that clients can book. New services start as{" "}
              <span className="font-medium">pending</span> until admin approves.
            </p>
          </div>

          <Link
            href={providerServicesCreate.url()}
            className="rounded-md bg-black px-3 py-2 text-white text-sm"
          >
            Create Service
          </Link>
        </div>

        {flash?.success ? (
          <div className="rounded-md border p-3 text-sm bg-green-50">
            {flash.success}
          </div>
        ) : null}

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <Link
            href={providerServicesIndex.url()}
            className={`px-3 py-1 rounded-md text-sm border ${
              filters.status === "" ? "bg-black text-white" : "bg-white"
            }`}
          >
            All
          </Link>

          {["pending", "approved", "rejected"].map((s) => (
            <Link
              key={s}
              href={providerServicesIndex.url({ query: { status: s } })}
              className={`px-3 py-1 rounded-md text-sm border ${
                filters.status === s ? "bg-black text-white" : "bg-white"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* List */}
        <div className="space-y-3">
          {services.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-gray-600">
              No services yet.
            </div>
          ) : (
            services.data.map((s) => {
              const cover = s.media?.slice().sort((a, b) => a.position - b.position)[0]?.path;
              const coverUrl = publicImagePath(cover);

              return (
                <div key={s.id} className="rounded-md border p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 shrink-0 rounded-md overflow-hidden border bg-gray-50">
                      {coverUrl ? (
                        <img src={coverUrl} alt={s.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-medium">{s.title}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {s.category?.name} • {s.city?.name}
                          </div>

                          <div className="text-sm text-gray-600 mt-1">
                            Status: <span className="font-medium">{s.status}</span>
                          </div>

                          <div className="text-sm text-gray-600 mt-1">
                            Pricing: <span className="font-medium">{s.pricing_type}</span>
                            {" • "}
                            Payment: <span className="font-medium">{s.payment_type}</span>
                          </div>

                          <div className="text-sm text-gray-600 mt-1">
                            Base price:{" "}
                            <span className="font-medium">
                              {s.base_price ?? "—"} DZD
                            </span>
                          </div>
                        </div>

                        {/* Public page */}
                        <Link
                          href={serviceShow.url(s.slug)}
                          className="text-sm underline"
                        >
                          View public
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {services.links?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {services.links.map((l, idx) => (
              <Link
                key={idx}
                href={l.url ?? ""}
                preserveScroll
                className={`px-3 py-1 rounded border text-sm ${
                  l.active ? "bg-black text-white" : "bg-white"
                } ${l.url === null ? "pointer-events-none opacity-40" : ""}`}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
