import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Clock, MapPin } from "lucide-react";
import { useMemo, useState } from "react";

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

  const images = useMemo(
    () => (r.media ?? []).slice().sort((a, b) => a.position - b.position),
    [r.media]
  );

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

      <div className="p-6 space-y-4 max-w-3xl bg-primary-foreground/30 rounded-4xl">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">{r.title}</h1>
          <Link
            href={providerRequestsIndex.url()}
            className="text-sm rounded-3xl text-red-600 px-3 py-2 border border-gray-200 hover:bg-red-600 hover:text-white transition duration-700"
          >
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

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="font-bold text-xl sm:text-2xl break-words">{r.title}</div>

              <div className="text-sm text-foreground mt-2 rounded-3xl p-1 border border-gray-200 w-full sm:w-max flex flex-wrap items-center gap-2">
                <span className="break-words">
                  <div className="text-sm text-foreground mt-2 flex items-center justify-center rounded-3xl mb-2 gap-2 w-full sm:w-max">
                    <span className="inline-flex items-center gap-2 min-w-0">
                      {r.client?.avatar_path ? (
                        <img
                          src={r.client.avatar_path}
                          alt={r.client.name}
                          className="w-6 h-6 rounded-full object-cover border"
                        />
                      ) : (
                        <span className="w-6 h-6 " />
                      )}
                      <span className="font-medium truncate max-w-[220px] sm:max-w-none">
                        {r.client?.name}
                      </span>
                    </span>
                  </div>
                </span>

                <div className="p-2 rounded-3xl border border-gray-200 flex items-center gap-1">
                  <MapPin className="text-red-600" />
                  <span className="break-words">{r.city?.name}</span>
                </div>
              </div>

              <div className="text-sm text-foreground mt-2">
                <span className="font-medium flex flex-col sm:flex-row sm:items-center gap-2 p-1 rounded-4xl border border-gray-200 w-full sm:w-max">
                  <div className="font-bold flex items-center gap-1 p-1 rounded-4xl border border-gray-200 text-primary w-full sm:w-auto">
                    Min{" "}
                    <div className="p-2 rounded-4xl w-full sm:w-auto text-center">
                      {r.budget_min ?? "—"} DZD
                    </div>
                  </div>

                  <div className="font-bold text-red-600 flex items-center gap-1 p-1 rounded-4xl border border-gray-200 w-full sm:w-auto">
                    Max{" "}
                    <div className="p-2 w-full sm:w-auto text-center">
                      {r.budget_max ?? "—"} DZD
                    </div>
                  </div>
                </span>

                <div className="flex flex-wrap items-center gap-2 mt-2 rounded-3xl border border-gray-200 w-full sm:w-max p-1 text-sm text-foreground">
                  {r.urgency ? (
                    <>
                      Urgency{" "}
                      {r.urgency === "high" ? (
                        <span className="font-bold inline-flex items-center gap-1">
                          <div className="flex items-center text-red-600 rounded-3xl p-2 border border-gray-200 gap-2">
                            <Clock /> {r.urgency}
                          </div>
                        </span>
                      ) : r.urgency === "medium" ? (
                        <span className="flex items-center text-yellow-600 rounded-3xl p-2 border border-gray-200 gap-2">
                          <Clock /> {r.urgency}
                        </span>
                      ) : r.urgency === "low" ? (
                        <span className="text-primary rounded-3xl p-2 border border-gray-200 font-bold inline-flex items-center gap-2">
                          <Clock /> {r.urgency}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-foreground mt-3 rounded-4xl border border-gray-200 p-2 line-clamp-2">
            <div className="font-bold">Description</div>
            {r.description}
          </div>
        </div>

        {/* ✅ Photos (manual slider + thumbnails bottom) */}
        <div className="rounded-md border p-4">
          <h2 className="font-medium">Photos</h2>

          {images.length === 0 ? (
            <p className="text-sm text-foreground mt-2">No photos.</p>
          ) : (
            <MarketplacePhotoSlider
              images={images}
              publicImagePath={publicImagePath}
            />
          )}
        </div>

        {/* Offer form */}
        <div className="rounded-md border p-4">
          <h2 className="font-medium">Send an Offer</h2>
          {props.has_offer ? (
            <p className="text-sm text-foreground mt-1">
              You already sent an offer for this request.
            </p>
          ) : (
            <>
              <p className="text-sm text-foreground mt-1">
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
                  className="rounded-3xl bg-primary px-4 py-2 text-white text-sm"
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

function MarketplacePhotoSlider({
  images,
  publicImagePath,
}: {
  images: { id: number; path: string }[];
  publicImagePath: (p: string) => string;
}) {
  const [active, setActive] = useState(0);

  const canPrev = active > 0;
  const canNext = active < images.length - 1;

  const prev = () => canPrev && setActive((i) => i - 1);
  const next = () => canNext && setActive((i) => i + 1);

  // center-ish thumbnails when many
  const thumbWidth = 72;
  const thumbGap = 8;
  const thumbStripLeft = useMemo(() => {
    const x = active * (thumbWidth + thumbGap);
    return Math.max(0, x - 2 * (thumbWidth + thumbGap));
  }, [active]);

  return (
    <div className="mt-3 space-y-3">
      {/* Main viewer */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-primary-foreground/30">
        <img
          src={publicImagePath(images[active].path)}
          alt={`Photo ${active + 1}`}
          className="w-full h-[260px] sm:h-[340px] md:h-[420px] object-cover select-none"
          draggable={false}
        />

        {/* Counter */}
        <div className="absolute top-3 right-3 rounded-full bg-black/55 text-white text-xs px-3 py-1">
          {active + 1} / {images.length}
        </div>

        {/* Prev */}
        <button
          type="button"
          onClick={prev}
          disabled={!canPrev}
          className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white w-10 h-10 grid place-items-center transition ${
            canPrev ? "hover:bg-black/55" : "opacity-40 cursor-not-allowed"
          }`}
          aria-label="Previous photo"
        >
          ‹
        </button>

        {/* Next */}
        <button
          type="button"
          onClick={next}
          disabled={!canNext}
          className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/40 text-white w-10 h-10 grid place-items-center transition ${
            canNext ? "hover:bg-black/55" : "opacity-40 cursor-not-allowed"
          }`}
          aria-label="Next photo"
        >
          ›
        </button>
      </div>

      {/* Thumbnails bottom */}
      <div className="rounded-xl border border-gray-200 bg-primary-foreground/30 p-2">
        <div className="overflow-x-auto">
          <div
            className="flex gap-2"
            style={{ transform: `translateX(-${thumbStripLeft}px)` }}
          >
            {images.map((img, idx) => {
              const isActive = idx === active;

              return (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={`relative shrink-0 rounded-lg overflow-hidden border transition ${
                    isActive
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-gray-200 hover:border-primary/60"
                  }`}
                  aria-label={`Select photo ${idx + 1}`}
                >
                  <img
                    src={publicImagePath(img.path)}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-[72px] h-[56px] object-cover"
                    draggable={false}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
