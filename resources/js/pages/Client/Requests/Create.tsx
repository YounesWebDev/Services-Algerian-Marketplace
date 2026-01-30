import { Head, Link, useForm } from "@inertiajs/react";
import type { FormEvent } from "react";

import AppLayout from "@/layouts/app-layout";
import {
  index as myRequestsIndex,
  store as myRequestsStore,
} from "@/routes/client/my/requests";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };

export default function ClientRequestsCreate(props: {
  categories: Category[];
  cities: City[];
}) {
  const { categories, cities } = props;

  const form = useForm({
    category_id: "",
    city_id: "",
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    urgency: "",
    photos: [] as File[],
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    form.post(myRequestsStore.url(),{
      forceFormData: true,
    });
  }

  return (
    <AppLayout>
      <Head title="Create Request" />

      <div className="p-6 max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Create Request</h1>
          <Link href={myRequestsIndex.url()} className="text-sm underline">
            Back
          </Link>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              className="mt-1 w-full rounded-md border p-2"
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
              <div className="text-sm text-red-600 mt-1">{form.errors.category_id}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">City</label>
            <select
              className="mt-1 w-full rounded-md border p-2"
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
              <div className="text-sm text-red-600 mt-1">{form.errors.city_id}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={form.data.title}
              onChange={(e) => form.setData("title", e.target.value)}
              placeholder="Example: AC maintenance"
            />
            {form.errors.title && (
              <div className="text-sm text-red-600 mt-1">{form.errors.title}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              className="mt-1 w-full rounded-md border p-2"
              rows={5}
              value={form.data.description}
              onChange={(e) => form.setData("description", e.target.value)}
              placeholder="Explain what you need, where, and any details..."
            />
            {form.errors.description && (
              <div className="text-sm text-red-600 mt-1">{form.errors.description}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Budget Min (DZD)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={form.data.budget_min}
                onChange={(e) => form.setData("budget_min", e.target.value)}
              />
              {form.errors.budget_min && (
                <div className="text-sm text-red-600 mt-1">{form.errors.budget_min}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Budget Max (DZD)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                value={form.data.budget_max}
                onChange={(e) => form.setData("budget_max", e.target.value)}
              />
              {form.errors.budget_max && (
                <div className="text-sm text-red-600 mt-1">{form.errors.budget_max}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Urgency (optional)</label>
            <input
              className="mt-1 w-full rounded-md border p-2"
              value={form.data.urgency}
              onChange={(e) => form.setData("urgency", e.target.value)}
              placeholder="Example: today / this week"
            />
            {form.errors.urgency && (
              <div className="text-sm text-red-600 mt-1">{form.errors.urgency}</div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium">Photos (optional)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              className="mt-1 w-full rounded-md border p-2"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                form.setData("photos", files);
              }}
            />
            {form.errors.photos && (
              <div className="text-sm text-red-600 mt-1">{form.errors.photos}</div>
            )}
          </div>

          <button
            type="submit"
            disabled={form.processing}
            className="rounded-md bg-black px-4 py-2 text-white text-sm disabled:opacity-60"
          >
            {form.processing ? "Creating..." : "Create Request"}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}

