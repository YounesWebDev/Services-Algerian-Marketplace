import { Head, Link, useForm, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import { accept as acceptOfferRoute, index as clientOffersIndex } from "@/routes/client/offers";

type Provider = { id: number; name: string; avatar_path: string | null };
type City = { id: number; name: string };
type Category = { id: number; name: string; slug: string };

type RequestItem = {
  id: number;
  title: string;
  status: string;
  city: City;
  category: Category;
};

type OfferItem = {
  id: number;
  message: string;
  proposed_price: string;
  estimated_days: number | null;
  status: string; // sent | assigned | rejected (based on your DB)
  provider: Provider;
  request: RequestItem;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function ClientOffersIndex() {
  const { props } = usePage<{
    offers: { data: OfferItem[]; links: PaginationLink[] };
    filters: { status: string };
    flash?: { success?: string };
    errors: Record<string, string>;
  }>();

  const { offers, filters, flash, errors } = props;

  const acceptForm = useForm({});

  function acceptOffer(offerId: number) {
    if (!confirm("Accept this offer? This will create a booking and reject other offers.")) return;

    acceptForm.post(acceptOfferRoute.url(offerId), {
      preserveScroll: true,
    });
  }

  return (
    <AppLayout>
      <Head title="Offers" />

      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Offers</h1>
          <p className="text-sm text-gray-600">
            These are offers providers sent to your requests. You can accept one offer to create a booking.
          </p>
        </div>

        {/* flash / errors */}
        {flash?.success ? (
          <div className="rounded-md border p-3 text-sm bg-green-50">
            {flash.success}
          </div>
        ) : null}

        {errors?.offer ? (
          <div className="rounded-md border p-3 text-sm bg-red-50 text-red-700">
            {errors.offer}
          </div>
        ) : null}

        {/* Filters */}
        <div className="rounded-md border p-4 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
          <div>
            <label className="block text-sm font-medium">Status</label>
            <select
              defaultValue={filters.status}
              className="mt-1 w-56 rounded-md border p-2"
              onChange={(e) => {
                const status = e.target.value;
                window.location.href = clientOffersIndex.url({
                  query: status ? { status } : {},
                });
              }}
            >
              <option value="">All</option>
              <option value="sent">Sent</option>
              <option value="assigned">Assigned</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Link href={clientOffersIndex.url()} className="rounded-md border px-3 py-2 text-sm">
              Reset
            </Link>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {offers.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-gray-600">
              No offers found.
            </div>
          ) : (
            offers.data.map((o) => {
              const canAccept = o.status === "sent";

              return (
                <div key={o.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-medium">{o.request?.title}</div>
                      <div className="text-sm text-gray-600">
                        {o.request?.category?.name} • {o.request?.city?.name}
                      </div>

                      <div className="text-sm text-gray-700 mt-2 whitespace-pre-line">
                        <span className="font-medium">Provider message:</span> {o.message}
                      </div>

                      <div className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Price:</span> {o.proposed_price} DZD
                        {o.estimated_days ? (
                          <>
                            {" "}
                            • <span className="font-medium">Days:</span> {o.estimated_days}
                          </>
                        ) : null}
                      </div>

                      <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                        {o.provider?.avatar_path ? (
                          <img
                            src={o.provider.avatar_path}
                            alt={o.provider.name}
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                        ) : (
                          <span className="w-7 h-7 rounded-full border bg-gray-100" />
                        )}
                        <span>
                          <span className="font-medium">{o.provider?.name}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded border ${
                          o.status === "assigned"
                            ? "bg-green-50"
                            : o.status === "rejected"
                            ? "bg-red-50"
                            : "bg-gray-50"
                        }`}
                      >
                        {o.status}
                      </span>

                      <button
                        type="button"
                        disabled={!canAccept || acceptForm.processing}
                        onClick={() => acceptOffer(o.id)}
                        className="rounded-md bg-black px-3 py-2 text-white text-sm disabled:opacity-50"
                      >
                        {acceptForm.processing ? "Working..." : "Accept"}
                      </button>

                      {!canAccept ? (
                        <div className="text-xs text-gray-500">
                          You can only accept offers with status <b>sent</b>.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {offers.links?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {offers.links.map((l, idx) => (
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
