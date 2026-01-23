import { Head, router, usePage } from "@inertiajs/react";
import { Pencil, Trash2 } from "lucide-react";
import React, { useState } from "react";

import AppLayout from "@/layouts/app-layout";
import type { SharedData } from "@/types";

type Flash = {
  success?: string;
  error?: string;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  parent?: {id:number , name:string} | null
};

type Props = {
  categories: Category[];
  parents: { id: number; name: string }[];
};

export default function Index({ categories, parents }: Props) {
  const { errors, flash } = usePage<SharedData & { flash?: Flash }>().props;

  // form fields
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState<string>("");

  // editing state (null = create mode)
  const [editingId, setEditingId] = useState<number | null>(null);

  function resetForm() {
    setName("");
    setParentId("");
    setEditingId(null);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      name,
      parent_id: parentId ? Number(parentId) : null,
    };

    // CREATE
    if (editingId === null) {
      router.post("/admin/categories", payload, {
        onSuccess: () => resetForm(),
      });
      return;
    }

    // UPDATE
    router.put(`/admin/categories/${editingId}`, payload, {
      onSuccess: () => resetForm(),
    });
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setName(c.name);
    setParentId(c.parent_id ? String(c.parent_id) : "");
  }

  function remove(id: number) {
    if (!confirm("Delete this category?")) return;
    router.delete(`/admin/categories/${id}`);
  }

  return (
    <AppLayout>
      <Head title="Categories" />

      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Categories</h1>
        </div>

        {/* success message */}
        {flash?.success && (
          <div className="rounded-md border p-3 text-sm">{flash.success}</div>
        )}

        {/* form */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">
              {editingId === null ? "Add Category" : "Edit Category"}
            </h2>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md border px-3 py-1 text-sm"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={submit} className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <label className="text-sm">Name</label>
              <input
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Cleaning"
              />
              {errors?.name && (
                <div className="mt-1 text-sm text-red-500">{errors.name}</div>
              )}
            </div>

            <div className="md:col-span-1">
              <label className="text-sm">Parent (optional)</label>
              <select
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
              >
                <option value="">— No parent —</option>
                {parents
                  // (optional) don’t allow selecting itself as parent while editing
                  .filter((p) => (editingId ? p.id !== editingId : true))
                  .map((p) => (
                    <option key={p.id} value={String(p.id)}>
                      {p.name}
                    </option>
                  ))}
              </select>

              {errors?.parent_id && (
                <div className="mt-1 text-sm text-red-500">
                  {errors.parent_id}
                </div>
              )}
            </div>

            <div className="md:col-span-1 flex items-end gap-2">
              <button className="w-full rounded-md border px-4 py-2">
                {editingId === null ? "Create" : "Update"}
              </button>
            </div>
          </form>
        </div>

        {/* table */}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Parent</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr>
                  <td className="p-3 text-muted-foreground" colSpan={4}>
                    No categories yet.
                  </td>
                </tr>
              ) : (
                categories.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="p-3">{c.name}</td>
                    <td className="p-3 text-muted-foreground">{c.slug}</td>
                    <td className="p-3 text-muted-foreground">
                      {c.parent ? c.parent.name: "—"}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => startEdit(c)}
                        className="rounded-md border px-3 py-1"
                      >
                        <Pencil/>
                      </button>
                      <button
                        onClick={() => remove(c.id)}
                        className="rounded-md border px-3 py-1"
                      >
                        <Trash2/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* delete error */}
          {errors?.delete && (
            <div className="border-t p-3 text-sm text-red-500">
              {errors.delete}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
