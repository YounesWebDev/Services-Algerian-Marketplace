"use client";

import { Link, useForm } from "@inertiajs/react";
import {
  CheckCircle2Icon,
  UploadCloudIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

// shadcn/ui
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AppLayout from "@/layouts/app-layout";

// icons

type Category = { id: number; name: string; slug?: string };
type City = { id: number; name: string };

type Props = {
  categories: Category[];
  cities: City[];
};

type AlertContent = {
  title: string;
  description: string;
  variant: "success" | "error";
};

// ✅ Change this to your real store route if needed
// Example: "/client/my/requests" OR route("client.my.requests.store")
const STORE_URL = "/requests";

function saveNextPageNotification(content: AlertContent) {
  try {
    sessionStorage.setItem("APP_NOTIFICATION", JSON.stringify(content));
  } catch {
    // ignore
  }
}

export default function Create({ categories, cities }: Props) {
  const form = useForm<{
    category_id: string;
    city_id: string;
    title: string;
    description: string;
    budget_min: string;
    budget_max: string;
    urgency: string;
    photos: File[];
  }>({
    category_id: "",
    city_id: "",
    title: "",
    description: "",
    budget_min: "",
    budget_max: "",
    urgency: "",
    photos: [],
  });

  // ✅ Alert state (shows on this page if it stays)
  const [showAlert, setShowAlert] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [alertContent, setAlertContent] = useState<AlertContent>({
    title: "",
    description: "",
    variant: "success",
  });

  function fireAlert(content: AlertContent) {
    setAlertContent(content);
    setShowAlert(true);
    requestAnimationFrame(() => setAnimate(true));

    window.setTimeout(() => {
      setAnimate(false);
      window.setTimeout(() => setShowAlert(false), 300);
    }, 2500);
  }

  // ✅ Photos handling
  function addPhotos(files: File[]) {
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    const filtered = files.filter((f) => allowed.includes(f.type));
    if (!filtered.length) return;

    form.setData("photos", [...(form.data.photos ?? []), ...filtered]);
  }

  function removePhoto(index: number) {
    form.setData(
      "photos",
      (form.data.photos ?? []).filter((_, i) => i !== index)
    );
  }

  // Previews (with cleanup)
  const previews = useMemo(() => {
    return (form.data.photos ?? []).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [form.data.photos]);

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    form.post(STORE_URL, {
      forceFormData: true,
      preserveScroll: true,

      onSuccess: () => {
        const msg: AlertContent = {
          title: "Created successfully ✅",
          description: "Your request has been created.",
          variant: "success",
        };

        // ✅ if backend redirects, show it on the next page (needs index code to read it)
        saveNextPageNotification(msg);

        // ✅ if backend DOES NOT redirect, you will still see it here
        fireAlert(msg);

        // optional reset
        form.reset("title", "description", "budget_min", "budget_max", "urgency", "photos");
      },

      onError: () => {
        fireAlert({
          title: "Creation failed",
          description: "Please fix the errors and try again.",
          variant: "error",
        });
      },
    });
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create Request</h1>

          <Link
            href="/requests"
            className="text-sm px-3 py-2 rounded-4xl border border-gray-200 transition duration-300 hover:bg-foreground hover:text-background"
          >
            Back
          </Link>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              className="mt-1 h-10 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 px-3 text-sm"
              value={form.data.category_id}
              onChange={(e) => form.setData("category_id", e.target.value)}
            >
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
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

          {/* City */}
          <div>
            <label className="block text-sm font-medium">Wilaya</label>
            <select
              className="mt-1 h-10 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 px-3 text-sm"
              value={form.data.city_id}
              onChange={(e) => form.setData("city_id", e.target.value)}
            >
              <option value="">Select wilaya...</option>
              {cities.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </select>
            {form.errors.city_id && (
              <div className="text-sm text-red-600 mt-1">{form.errors.city_id}</div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Title</label>
            <Input
              value={form.data.title}
              onChange={(e) => form.setData("title", e.target.value)}
              placeholder="Example: Fix leaking sink"
              className="rounded-4xl"
            />
            {form.errors.title && (
              <div className="text-sm text-red-600 mt-1">{form.errors.title}</div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={form.data.description}
              onChange={(e) => form.setData("description", e.target.value)}
              placeholder="Explain what you need..."
              className="mt-1 w-full min-h-[140px] rounded-4xl border border-gray-200 bg-primary-foreground/30 px-3 py-2 text-sm"
            />
            {form.errors.description && (
              <div className="text-sm text-red-600 mt-1">
                {form.errors.description}
              </div>
            )}
          </div>

          {/* Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Budget min (DZD)</label>
              <Input
                type="number"
                value={form.data.budget_min}
                onChange={(e) => form.setData("budget_min", e.target.value)}
                className="rounded-4xl"
              />
              {form.errors.budget_min && (
                <div className="text-sm text-red-600 mt-1">{form.errors.budget_min}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Budget max (DZD)</label>
              <Input
                type="number"
                value={form.data.budget_max}
                onChange={(e) => form.setData("budget_max", e.target.value)}
                className="rounded-4xl"
              />
              {form.errors.budget_max && (
                <div className="text-sm text-red-600 mt-1">{form.errors.budget_max}</div>
              )}
            </div>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium">Urgency (optional)</label>
            <select
              className="mt-1 h-10 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 px-3 text-sm"
              value={form.data.urgency}
              onChange={(e) => form.setData("urgency", e.target.value)}
            >
              <option value="">Select urgency...</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {form.errors.urgency && (
              <div className="text-sm text-red-600 mt-1">{form.errors.urgency}</div>
            )}
          </div>

          {/* Photos */}
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
                addPhotos(Array.from(e.dataTransfer.files ?? []));
              }}
            >
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => addPhotos(Array.from(e.target.files ?? []))}
              />

              <div className="flex items-center gap-3">
                <div className="rounded-3xl border border-gray-200 p-2">
                  <UploadCloudIcon className="size-5 text-muted-foreground" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">Drop images here or click to upload</div>
                  <div className="text-muted-foreground">PNG / JPG / WebP</div>
                </div>
              </div>
            </div>

            {form.errors.photos && (
              <div className="text-sm text-red-600 mt-1">{form.errors.photos}</div>
            )}

            {/* Preview */}
            {previews.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {previews.map((p, i) => (
                  <div
                    key={`${p.file.name}-${i}`}
                    className="relative overflow-hidden rounded-3xl border border-gray-200"
                  >
                    <img
                      src={p.url}
                      alt={p.file.name}
                      className="h-24 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-2 right-2 rounded-full bg-background/80 backdrop-blur p-1 border border-gray-200 hover:bg-background"
                      aria-label="Remove photo"
                    >
                      <XIcon className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={form.processing}
            className="rounded-4xl transition duration-300 hover:bg-foreground hover:text-background"
          >
            {form.processing ? "Creating..." : "Create Request"}
          </Button>
        </form>
      </div>

      {/* ✅ Floating Alert */}
      {showAlert ? (
        <div
          className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-out
            ${animate ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
          `}
        >
          <Alert className="bg-primary/5 backdrop-blur-sm max-w-[92vw] sm:max-w-md">
            {alertContent.variant === "success" ? (
              <CheckCircle2Icon className="text-primary" />
            ) : (
              <XCircleIcon className="text-red-600" />
            )}
            <AlertTitle
              className={alertContent.variant === "success" ? "text-primary" : "text-red-600"}
            >
              {alertContent.title}
            </AlertTitle>
            <AlertDescription className="text-foreground">
              {alertContent.description}
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
    </AppLayout>
  );
}