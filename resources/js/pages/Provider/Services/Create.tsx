import { Head, Link, useForm } from "@inertiajs/react";

import AppLayout from "@/layouts/app-layout";
import {
  index as providerServicesIndex,
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

    form.post(providerServicesStore.url());
  }

  return (
    <AppLayout>
      <Head title="Create Service"  />

      <div className="p-6 max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Create Service</h1>
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
              <div className="text-sm text-red-600 mt-1">
                {form.errors.title}
              </div>
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
                onChange={(e) =>
                  form.setData("pricing_type", e.target.value)
                }
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
                onChange={(e) =>
                  form.setData("payment_type", e.target.value)
                }
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
              className="mt-1 w-full rounded-4xl border p-2"
              value={form.data.base_price}
              onChange={(e) => form.setData("base_price", e.target.value)}
            />
          </div>

          {/* PHOTOS */}
          <div>
            <label className="block text-sm font-medium h-20  rounded-4xl p-2">Drag and drop your Images or click to browse</label>
            <input
              type="file"
              placeholder=""

              multiple
              accept="image/png,image/jpeg,image/webp"
              className="mt-1 w-full rounded-4xl border p-2 border-gray-200 "
              onChange={(e) =>
                form.setData("photos", Array.from(e.target.files ?? []))
              }
            />
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
