import { Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";

import AppLayout from "@/layouts/app-layout";
import {
  index as providerServicesIndex,
  update as providerServicesUpdate,
} from "@/routes/provider/my/services";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Media = {
  id: number;
  service_id: number;
  path: string;
  type: string;
  position: number;
};

type Service = {
  id: number;
  title: string;
  description: string;
  base_price: string | number | null;
  pricing_type: string;
  payment_type: string;
  category_id: number;
  city_id: number;
  media: Media[];
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

export default function ProviderServicesEdit(props: {
  service: Service;
  categories: Category[];
  cities: City[];
}) {
  const { service, categories, cities } = props;
  const [photoPreviews, setPhotoPreviews] = useState<
    { name: string; url: string }[]
  >([]);

  const form = useForm({
    category_id: String(service.category_id ?? ""),
    city_id: String(service.city_id ?? ""),
    title: service.title ?? "",
    description: service.description ?? "",
    base_price: service.base_price ?? "",
    pricing_type: service.pricing_type ?? "fixed",
    payment_type: service.payment_type ?? "cash",
    photos: [] as File[],
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();

    form.put(providerServicesUpdate(service.id).url, {
      forceFormData: true,
    });
  }

  useEffect(() => {
    return () => {
      photoPreviews.forEach((photo) => URL.revokeObjectURL(photo.url));
    };
  }, [photoPreviews]);

  const handlePhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    form.setData("photos", files);

    const previews = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPhotoPreviews(previews);
  };

  const existingMedia = service.media
    ?.slice()
    .sort((a, b) => a.position - b.position);

  return (
    <AppLayout>
      <Head title="Edit Service" />

      <div className="p-6 max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Edit Service</h1>
          <Link href={providerServicesIndex.url()}>
            <div className="bg-foreground text-background border border-gray-200 rounded-3xl p-2 px-3 transition duration-700 hover:bg-red-600">
              Back
            </div>
          </Link>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              className="mt-1 w-full rounded-4xl border p-2"
              value={form.data.category_id}
              onChange={(e) => form.setData("category_id", e.target.value)}
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {form.errors.category_id && (
              <div className="text-sm text-red-600 mt-1">
                {form.errors.category_id}
              </div>
            )}
          </div>

          {/* CITY */}
          <div>
            <label className="block text-sm font-medium">City</label>
            <select
              className="mt-1 w-full rounded-4xl border p-2"
              value={form.data.city_id}
              onChange={(e) => form.setData("city_id", e.target.value)}
            >
              <option value="">Select city...</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {form.errors.city_id && (
              <div className="text-sm text-red-600 mt-1">
                {form.errors.city_id}
              </div>
            )}
          </div>

          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              className="mt-1 w-full rounded-4xl border p-2"
              value={form.data.title}
              onChange={(e) => form.setData("title", e.target.value)}
              placeholder="Example: Plumbing repair"
            />
            {form.errors.title && (
              <div className="text-sm text-red-600 mt-1">{form.errors.title}</div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-4xl border p-2"
              rows={5}
              value={form.data.description}
              onChange={(e) => form.setData("description", e.target.value)}
            />
            {form.errors.description && (
              <div className="text-sm text-red-600 mt-1">
                {form.errors.description}
              </div>
            )}
          </div>

          {/* PRICING + PAYMENT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Pricing type</label>
              <select
                className="mt-1 w-full rounded-4xl border p-2"
                value={form.data.pricing_type}
                onChange={(e) => form.setData("pricing_type", e.target.value)}
              >
                <option value="fixed">Fixed</option>
                <option value="hourly">Hourly</option>
                <option value="quote">Quote</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Payment type</label>
              <select
                className="mt-1 w-full rounded-4xl border p-2"
                value={form.data.payment_type}
                onChange={(e) => form.setData("payment_type", e.target.value)}
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          {/* BASE PRICE */}
          <div>
            <label className="block text-sm font-medium">Base price (optional)</label>
            <input
              type="number"
              className="mt-1 w-full rounded-4xl border p-2"
              value={form.data.base_price}
              onChange={(e) => form.setData("base_price", e.target.value)}
            />
          </div>

          {/* EXISTING PHOTOS */}
          {existingMedia?.length ? (
            <div>
              <div className="text-sm font-medium mb-2">Current photos</div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {existingMedia.map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white/50"
                  >
                    <img
                      src={publicImagePath(photo.path)}
                      alt="Service media"
                      className="h-28 w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* NEW PHOTOS */}
          <div>
            <label className="block text-sm font-medium h-20 rounded-4xl p-2">
              Add more images (optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="mt-1 w-full rounded-4xl border p-2 border-gray-200 "
              onChange={handlePhotosChange}
            />
            {photoPreviews.length > 0 ? (
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {photoPreviews.map((photo) => (
                  <div
                    key={photo.url}
                    className="overflow-hidden rounded-2xl border border-gray-200 bg-white/50"
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="h-28 w-full object-cover"
                      loading="lazy"
                    />
                    <div className="px-2 py-1 text-xs text-muted-foreground truncate">
                      {photo.name}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={form.processing}
            className="rounded-3xl bg-primary hover:bg-foreground hover:text-background transition duration-700 px-4 py-2 text-white text-sm disabled:opacity-60"
          >
            {form.processing ? "Saving..." : "Save changes"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
