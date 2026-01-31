import { Head, Link, useForm, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import { index as myRequestsIndex } from "@/routes/client/my/requests";
import { accept as clientOffersAccept } from "@/routes/client/offers";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };

type RequestMedia = {
  id: number;
  path: string;
  type: string;
  position: number;
};

type RequestItem = {
  id: number;
  title: string;
  description: string;
  budget_min: string | null;
  budget_max: string | null;
  urgency: string | null;
  status: string;

  category?: Category;
  city?: City;
  media?: RequestMedia[];
};

type Provider = { id: number; name: string; avatar_path: string | null };

type Offer = {
  id: number;
  request_id: number;
  provider_id: number;
  message: string;
  proposed_price: string;
  estimated_days: number | null;
  status: string; // sent | rejected | assigned | accepted...
  created_at: string;

  provider?: Provider;
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

export default function ClientRequestShow() {
  const { props } = usePage<{
    request: RequestItem;
    offers: Offer[];
    errors: Record<string, string>;
    flash?: { success?: string };
  }>();

  const job = props.request;
  const offers = props.offers ?? [];
  const { errors, flash } = props;

  const sortedMedia = (job.media ?? []).slice().sort((a, b) => a.position - b.position);

  // Accept offer form
  const acceptForm = useForm({});

  function acceptOffer(offerId: number) {
    acceptForm.post(clientOffersAccept.url(offerId), {
      preserveScroll: true,
    });
  }

  const canAccept = job.status === "open"; // only open requests can accept offers

  return (
    <AppLayout>
      <Head title={`My Request: ${job.title}`} />

      <div className="p-6 max-w-4xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{job.title}</h1>
            <p className="text-sm text-gray-600">
              Status: <span className="font-medium">{job.status}</span>
              {job.category?.name ? <span> • {job.category.name}</span> : null}
              {job.city?.name ? <span> • {job.city.name}</span> : null}
            </p>
          </div>

          <Link href={myRequestsIndex.url()} className="text-sm underline">
            Back
          </Link>
        </div>

        {flash?.success ? (
          <div className="rounded-md border p-3 text-sm bg-green-50">{flash.success}</div>
        ) : null}

        {errors?.offer ? (
          <div className="rounded-md border p-3 text-sm bg-red-50 text-red-700">
            {errors.offer}
          </div>
        ) : null}

        {/* Request details */}
        <div className="rounded-md border p-4 space-y-2">
          <div className="font-medium">Description</div>
          <p className="text-sm text-gray-700 whitespace-pre-line">{job.description}</p>

          <div className="text-sm text-gray-600 pt-2">
            Budget:{" "}
            <span className="font-medium">
              {job.budget_min ?? "—"} - {job.budget_max ?? "—"}
            </span>{" "}
            DZD
          </div>

          {job.urgency ? (
            <div className="text-sm text-gray-600">
              Urgency: <span className="font-medium">{job.urgency}</span>
            </div>
          ) : null}
        </div>

        {/* Media */}
        <div className="rounded-md border p-4">
          <div className="font-medium">Photos</div>

          {sortedMedia.length === 0 ? (
            <div className="text-sm text-gray-600 mt-2">No photos.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              {sortedMedia.slice(0, 8).map((m) => {
                const url = publicImagePath(m.path);
                return (
                  <div key={m.id} className="rounded-md border overflow-hidden bg-gray-50">
                    {url ? (
                      <img src={url} alt="Request" className="w-full h-28 object-cover" />
                    ) : (
                      <div className="w-full h-28" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Offers */}
        <div className="rounded-md border p-4 space-y-3">
          <div className="font-medium">Offers</div>
          <p className="text-sm text-gray-600">
            Providers send offers. You can accept only while your request is <b>open</b>.
          </p>

          {!canAccept ? (
            <div className="text-sm text-gray-700">
              This request is not open anymore, so you can’t accept offers.
            </div>
          ) : null}

          {offers.length === 0 ? (
            <div className="text-sm text-gray-600">No offers yet.</div>
          ) : (
            <div className="space-y-3">
              {offers.map((o) => {
                const canAcceptThis = canAccept && o.status === "sent";

                return (
                  <div key={o.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {o.provider?.avatar_path ? (
                            <img
                              src={o.provider.avatar_path}
                              alt={o.provider.name}
                              className="w-7 h-7 rounded-full object-cover border"
                            />
                          ) : (
                            <span className="w-7 h-7 rounded-full border bg-gray-100" />
                          )}
                          <div className="font-medium">{o.provider?.name ?? "Provider"}</div>
                          <span className="text-xs px-2 py-1 rounded border bg-gray-50">
                            {o.status}
                          </span>
                        </div>

                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {o.message}
                        </div>

                        <div className="text-sm text-gray-600">
                          Price: <span className="font-medium">{o.proposed_price}</span> DZD
                          {o.estimated_days !== null ? (
                            <>
                              {" "}
                              • Estimated days:{" "}
                              <span className="font-medium">{o.estimated_days}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => acceptOffer(o.id)}
                          disabled={!canAcceptThis || acceptForm.processing}
                          className="rounded-md bg-black px-3 py-2 text-white text-sm disabled:opacity-60"
                        >
                          {acceptForm.processing ? "Working..." : "Accept"}
                        </button>

                        {!canAcceptThis ? (
                          <span className="text-xs text-gray-500">
                            {o.status !== "sent" ? "Not available" : "—"}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
