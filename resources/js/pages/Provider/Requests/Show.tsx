import { Head, Link, useForm, usePage } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import { index as providerRequestsIndex } from "@/routes/provider/requests";
import { store as providerRequestsOffersStore } from "@/routes/provider/requests/offers";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Client = { id: number; name: string; avatar_path: string | null };
type Media = { id: number; request_id: number; path: string; type: string; position: number };

type RequestItem = {
  id: number;
  title: string;
  description: string;
  status: string;
  budget_min: string | null;
  budget_max: string | null;
  urgency: string | null;
  created_at: string;
  category: Category;
  city: City;
  client: Client;
  media: Media[];
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

export default function ProviderRequestsShow() {
  const { props } = usePage<{
    request: RequestItem;
    has_offer: boolean;
    errors: Record<string, string>;
    flash?: { success?: string };
  }>();

  const r = props.request;

  const images = (r.media ?? []).slice().sort((a, b) => a.position - b.position);

  const form = useForm({
    message: "",
    proposed_price: "",
    estimated_days: "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    form.post(providerRequestsOffersStore.url(r.id), {
      preserveScroll: true,
    });
  }

  return (
    <AppLayout>
      <Head title={r.title} />

      <div className="p-6 space-y-4 max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{r.title}</h1>
          <Link href={providerRequestsIndex.url()} className="text-sm underline">
            Back
          </Link>
        </div>

        {/* Flash success */}
        {props.flash?.success ? (
          <div className="rounded-md border p-3 text-sm bg-green-50">
            {props.flash.success}
          </div>
        ) : null}

        {/* Server errors (general) */}
        {props.errors?.offer ? (
          <div className="rounded-md border p-3 text-sm bg-red-50 text-red-700">
            {props.errors.offer}
          </div>
        ) : null}

        <div className="rounded-md border p-4 space-y-2">
          <div className="text-sm text-gray-600">
            {r.category?.name} • {r.city?.name}
          </div>

          <div className="text-sm text-gray-600">
            Budget:{" "}
            <span className="font-medium">
              {r.budget_min ?? "—"} - {r.budget_max ?? "—"} DZD
            </span>
            {r.urgency ? (
              <>
                {" "}
                • Urgency: <span className="font-medium">{r.urgency}</span>
              </>
            ) : null}
          </div>

          <div className="text-sm text-gray-600 flex items-center gap-2">
            <span>Client:</span>
            <span className="inline-flex items-center gap-2">
              {r.client?.avatar_path ? (
                <img
                  src={publicImagePath(r.client.avatar_path)}
                  alt={r.client.name}
                  className="w-7 h-7 rounded-full object-cover border"
                />
              ) : (
                <span className="w-7 h-7 rounded-full border bg-gray-100" />
              )}
              <span className="font-medium">{r.client?.name}</span>
            </span>
          </div>
        </div>

        <div className="rounded-md border p-4">
          <h2 className="font-medium">Description</h2>
          <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{r.description}</p>
        </div>

        <div className="rounded-md border p-4">
          <h2 className="font-medium">Photos</h2>
          {images.length === 0 ? (
            <p className="text-sm text-gray-600 mt-2">No photos.</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 mt-3">
              {images.map((m) => (
                <div key={m.id} className="rounded-md overflow-hidden border bg-gray-50">
                  <img src={publicImagePath(m.path)} alt="Request" className="w-full h-44 object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offer form */}
        <div className="rounded-md border p-4">
          <h2 className="font-medium">Send an Offer</h2>
          {props.has_offer ? (
            <p className="text-sm text-gray-600 mt-1">
              You already sent an offer for this request.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mt-1">
                Fill these fields and click <span className="font-medium">Send Offer</span>.
              </p>

              <form onSubmit={submit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium">Message</label>
                  <textarea
                    className="mt-1 w-full rounded-md border p-2"
                    rows={4}
                    value={form.data.message}
                    onChange={(e) => form.setData("message", e.target.value)}
                    placeholder="Example: I can do it tomorrow. I will bring all tools..."
                  />
                  {form.errors.message ? (
                    <div className="text-sm text-red-600 mt-1">{form.errors.message}</div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium">Proposed Price (DZD)</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-md border p-2"
                      value={form.data.proposed_price}
                      onChange={(e) => form.setData("proposed_price", e.target.value)}
                      placeholder="Example: 5000"
                    />
                    {form.errors.proposed_price ? (
                      <div className="text-sm text-red-600 mt-1">{form.errors.proposed_price}</div>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-sm font-medium">Estimated Days (optional)</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-md border p-2"
                      value={form.data.estimated_days}
                      onChange={(e) => form.setData("estimated_days", e.target.value)}
                      placeholder="Example: 2"
                    />
                    {form.errors.estimated_days ? (
                      <div className="text-sm text-red-600 mt-1">{form.errors.estimated_days}</div>
                    ) : null}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={form.processing}
                  className="rounded-md bg-black px-4 py-2 text-white text-sm disabled:opacity-60"
                >
                  {form.processing ? "Sending..." : "Send Offer"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
