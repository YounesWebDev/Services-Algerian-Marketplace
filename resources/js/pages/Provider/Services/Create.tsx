import { Head, useForm } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import { dashboard } from '@/routes';
import {
  store as providerServicesStore,
} from "@/routes/provider/my/services";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };

export default function ProviderServicesCreate(props: {
  categories: Category[];
  cities: City[];
}) {
  const { categories, cities } = props;

  const form = useForm({
    category_id: "",
    city_id: "",
    title: "",
    description: "",
    base_price: "",
    pricing_type: "fixed",
    payment_type: "cash",
    photos: [] as File[],
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();

    form.post(providerServicesStore.url(), {
      forceFormData: true,
    });
  }

  return (
    <AppLayout breadcrumbs={[{ title: "Dashboard", href: dashboard().url }]}>
      <Head title="Create Service" />

      <div className="p-6 max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Create Service</h1>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="bg-foreground text-background border border-gray-200 rounded-3xl p-2 px-3 transition duration-700 hover:bg-red-600"
          >
            Back
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              className="mt-1 w-full rounded-4xl border p-2 bg-primary-foreground/30 border-gray-200"
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
              className="mt-1 w-full rounded-4xl border p-2 bg-primary-foreground/30 border-gray-200"
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
              className="mt-1 w-full rounded-4xl border p-2 bg-primary-foreground/30 border-gray-200"
              value={form.data.title}
              onChange={(e) => form.setData("title", e.target.value)}
              placeholder="Example: Plumbing repair"
            />
            {form.errors.title && (
              <div className="text-sm text-red-600 mt-1">
                {form.errors.title}
              </div>
            )}
          </div>
          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-4xl  border p-2 bg-primary-foreground/30 border-gray-200"
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
                className="mt-1 w-full rounded-4xl  border p-2 bg-primary-foreground/30 border-gray-200"
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
                className="mt-1 w-full rounded-4xl  border p-2 bg-primary-foreground/30 border-gray-200"
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
            <label className="block text-sm font-medium">
              Base price (optional)
            </label>
            <input
              type="number"
              className="mt-1 w-full rounded-4xl  border p-2 bg-primary-foreground/30 border-gray-200"
              value={form.data.base_price}
              onChange={(e) => form.setData("base_price", e.target.value)}
            />
          </div>

          {/* PHOTOS */}
<div className="space-y-3">
  <label className="block text-sm font-medium">
    Photos <span className="text-muted-foreground">(PNG/JPG/WebP)</span>
  </label>

  {/* Dropzone */}
          <div
    className="group relative rounded-4xl border border-dashed border-gray-300 bg-background p-4 transition hover:border-gray-400 hover:shadow-sm"
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files || []).filter((f) =>
        ["image/png", "image/jpeg", "image/webp"].includes(f.type),
      );
      if (!dropped.length) return;

      // merge with existing photos
      const current = (form.data.photos ?? []) as File[];
      const next = [...current, ...dropped];

      form.setData("photos", next);
    }}
  >
    <input
      id="photos"
      type="file"
      multiple
      accept="image/png,image/jpeg,image/webp"
      className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      onChange={(e) => {
        const picked = Array.from(e.target.files ?? []);
        if (!picked.length) return;

        const current = (form.data.photos ?? []) as File[];
        const next = [...current, ...picked];

        form.setData("photos", next);

        // allow re-picking same file again
        e.currentTarget.value = "";
      }}
    />

    <div className="flex items-center justify-between gap-3">
      <div className="space-y-1">
        <p className="text-sm font-medium">
          Drag & drop images here, or click to browse
        </p>
        <p className="text-xs text-muted-foreground">
          You can add multiple photos. Remove any before submitting.
        </p>
      </div>

      <div className="shrink-0 rounded-4xl border px-3 py-2 text-xs transition group-hover:bg-foreground group-hover:text-background">
        Add photos
      </div>
    </div>
  </div>

  {/* Previews */}
  {Array.isArray(form.data.photos) && (form.data.photos as File[]).length > 0 && (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {(form.data.photos as File[]).map((file, idx) => {
        const url = URL.createObjectURL(file);

        return (
          <div
            key={`${file.name}-${file.size}-${idx}`}
            className="relative overflow-hidden rounded-3xl border bg-muted"
          >
            <img
              src={url}
              alt={file.name}
              className="h-24 w-full object-cover"
              onLoad={() => URL.revokeObjectURL(url)}
            />

            {/* Remove */}
            <button
              type="button"
              onClick={() => {
                const current = (form.data.photos ?? []) as File[];
                const next = current.filter((_, i) => i !== idx);
                form.setData("photos", next);
              }}
              className="absolute right-2 top-2 rounded-full bg-background/90 px-2 py-1 text-xs shadow hover:bg-background"
              aria-label="Remove photo"
              title="Remove"
            >
              âœ•
            </button>

            {/* Order badge like IG */}
            <div className="absolute left-2 top-2 rounded-full bg-foreground/80 px-2 py-1 text-xs text-background">
              {idx + 1}
            </div>
          </div>
        );
      })}
    </div>
  )}

  {/* Optional: clear all */}
  {Array.isArray(form.data.photos) && (form.data.photos as File[]).length > 0 && (
    <button
      type="button"
      onClick={() => form.setData("photos", [])}
      className="text-xs text-muted-foreground underline-offset-4 hover:underline"
    >
      Remove all
    </button>
  )}
</div>
          <button
            type="submit"
            disabled={form.processing}
            className="rounded-3xl bg-primary hover:bg-foreground hover:text-background transition duration-700 px-4 py-2 text-white text-sm disabled:opacity-60"
          >
            {form.processing ? "Creating..." : "Create Service"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

