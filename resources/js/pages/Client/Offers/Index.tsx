import { router, usePage } from "@inertiajs/react";
import React from "react";

import AppLayout from "@/layouts/app-layout";
import { accept as acceptOfferRoute, index as clientOffersIndex } from "@/routes/client/offers";

type Offer = {
  id: number;
  message: string;
  proposed_price: string | number;
  estimated_days?: number | null;
  status: "sent" | "assigned" | "rejected" | string;
  provider?: { id: number; name: string; avatar_path?: string | null };
  request?: { id: number; title: string; status: string };
};

type PaginationLink = { url: string | null; label: string; active: boolean };
type Paginated<T> = { data: T[]; links: PaginationLink[] };

type PageProps = {
  offers: Paginated<Offer>;
  filters: { status: string };
  errors?: Record<string, string>;
  flash?: { success?: string };
};

export default function Index() {
  const { offers, filters, flash } = usePage<PageProps>().props;

  const onStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;

    router.get(
      clientOffersIndex.url(),
      { status: status || undefined },
      { preserveState: true, replace: true }
    );
  };

  const acceptOffer = (offerId: number) => {
    router.post(acceptOfferRoute.url(offerId));
  };

  return (
    <AppLayout>
      <div className="p-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary">Offers</h1>

        {flash?.success && (
          <div className="mt-3 p-2.5 border border-green-300 bg-green-50 rounded">
            {flash.success}
          </div>
        )}

        <div className="mt-3 p-2 border border-gray-200 bg-background  rounded-3xl w-max flex items-center">
          <label className="mr-2">Filter by status:</label>
          <select value={filters.status} onChange={onStatusChange} className="border border-gray-300 rounded-3xl bg-background text-foreground px-2 py-1">
            <option value="">All</option>
            <option value="sent">Sent</option>
            <option value="assigned">Assigned</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="mt-4">
          {offers.data.length === 0 ? (
            <p>No offers found.</p>
          ) : (
            <div className="overflow-x-auto bg-foreground/30 rounded-4xl p-4 border border-gray-200">
              <table className="w-full border-collapse  ">
                <thead>
                  <tr>
                    <th className="text-left border-b border-gray-300 p-2">ID</th>
                    <th className="text-left border-b border-gray-300 p-2">Provider</th>
                    <th className="text-left border-b border-gray-300 p-2">Request</th>
                    <th className="text-left border-b border-gray-300 p-2">Price</th>
                    <th className="text-left border-b border-gray-300 p-2">Days</th>
                    <th className="text-left border-b border-gray-300 p-2">Status</th>
                    <th className="text-left border-b border-gray-300 p-2">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {offers.data.map((o) => (
                    <tr key={o.id}>
                      <td className="border-b border-gray-200 p-2">#{o.id}</td>

                      <td className="border-b border-gray-200 p-2">
                        {o.provider?.name ?? "-"}
                      </td>

                      <td className="border-b border-gray-200 p-2">
                        {o.request?.title ?? "-"}
                      </td>

                      <td className="border-b border-gray-200 p-2">
                        {o.proposed_price} DZD
                      </td>

                      <td className="border-b border-gray-200 p-2">
                        {o.estimated_days ?? "-"}
                      </td>

                      <td className="border-b border-gray-200 p-2">{o.status}</td>

                      <td className="border-b border-gray-200 p-2">
                        {o.status === "sent" ? (
                          <button
                            onClick={() => acceptOffer(o.id)}
                            className="px-2.5 py-1.5 bg-primary text-white rounded-3xl hover:bg-foreground transition duration-700 hover:text-background"
                          >
                            Accept
                          </button>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {offers.links && offers.links.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {offers.links.map((l, idx) => (
              <button
                key={idx}
                disabled={!l.url}
                onClick={() => l.url && router.visit(l.url)}
                className={`px-2.5 py-1.5 border border-gray-300 rounded-3xl bg-foreground text-background transition ${
                  l.active ? "bg-gray-200" : "bg-primary"
                } ${l.url ? "cursor-pointer hover:bg-gray-100" : "cursor-not-allowed opacity-50"}`}
                dangerouslySetInnerHTML={{ __html: l.label }}
              />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
