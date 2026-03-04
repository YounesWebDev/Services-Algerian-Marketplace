"use client";

import { Head, Link, useForm } from "@inertiajs/react";
import {
  CheckCircle2Icon,
  UploadCloudIcon,
  XCircleIcon,
  XIcon,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

import InputError from "@/components/input-error";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import {
  index as myRequestsIndex,
  store as myRequestsStore,
} from "@/routes/client/my/requests";

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

  function addPhotos(files: File[]) {
    const allowed = ["image/png", "image/jpeg", "image/webp"];
    const filtered = files.filter((f) => allowed.includes(f.type));
    if (!filtered.length) {
      return;
    }

    form.setData("photos", [...(form.data.photos ?? []), ...filtered]);
  }

  function removePhoto(index: number) {
    form.setData(
      "photos",
      (form.data.photos ?? []).filter((_, i) => i !== index)
    );
  }

  const previews = useMemo(() => {
    return (form.data.photos ?? []).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [form.data.photos]);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [previews]);

  function submit(e: React.FormEvent) {
    e.preventDefault();

    form.post(myRequestsStore().url, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => {
        const message: AlertContent = {
          title: "Created successfully",
          description: "Your request has been created.",
          variant: "success",
        };

        saveNextPageNotification(message);
        fireAlert(message);

        form.reset(
          "title",
          "description",
          "budget_min",
          "budget_max",
          "urgency",
          "photos"
        );
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
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "My Requests", href: myRequestsIndex().url },
        { title: "Create Request", href: myRequestsIndex().url },
      ]}
    >
      <Head title="Create Request" />

      <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create Request</h1>

          <Button
            variant="outline"
            asChild
            className="rounded-4xl border-gray-200 text-red-600 transition duration-700 hover:bg-foreground hover:text-background"
          >
            <Link href={myRequestsIndex().url}>Back</Link>
          </Button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Select
              value={form.data.category_id || undefined}
              onValueChange={(value) => form.setData("category_id", value)}
            >
              <SelectTrigger
                id="category_id"
                className="h-10 rounded-4xl border-gray-200 bg-primary-foreground/30"
              >
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={form.errors.category_id} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city_id">Wilaya</Label>
            <Select
              value={form.data.city_id || undefined}
              onValueChange={(value) => form.setData("city_id", value)}
            >
              <SelectTrigger
                id="city_id"
                className="h-10 rounded-4xl border-gray-200 bg-primary-foreground/30"
              >
                <SelectValue placeholder="Select wilaya..." />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={String(city.id)}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <InputError message={form.errors.city_id} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={form.data.title}
              onChange={(e) => form.setData("title", e.target.value)}
              placeholder="Example: Fix leaking sink"
              className="rounded-4xl border border-gray-200 bg-primary-foreground/30"
            />
            <InputError message={form.errors.title} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.data.description}
              onChange={(e) => form.setData("description", e.target.value)}
              placeholder="Explain what you need..."
              className="min-h-[140px] rounded-4xl border-gray-200 bg-primary-foreground/30"
            />
            <InputError message={form.errors.description} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="budget_min">Budget min (DZD)</Label>
              <Input
                id="budget_min"
                type="number"
                value={form.data.budget_min}
                onChange={(e) => form.setData("budget_min", e.target.value)}
                className="rounded-4xl border border-gray-200 bg-primary-foreground/30"
              />
              <InputError message={form.errors.budget_min} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget_max">Budget max (DZD)</Label>
              <Input
                id="budget_max"
                type="number"
                value={form.data.budget_max}
                onChange={(e) => form.setData("budget_max", e.target.value)}
                className="rounded-4xl border border-gray-200 bg-primary-foreground/30"
              />
              <InputError message={form.errors.budget_max} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency">Urgency (optional)</Label>
            <Select
              value={form.data.urgency || undefined}
              onValueChange={(value) => form.setData("urgency", value)}
            >
              <SelectTrigger
                id="urgency"
                className="h-10 rounded-4xl border-gray-200 bg-primary-foreground/30"
              >
                <SelectValue placeholder="Select urgency..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <InputError message={form.errors.urgency} />
          </div>

          <div className="space-y-3">
            <Label>
              Photos <span className="text-muted-foreground">(PNG/JPG/WebP)</span>
            </Label>

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
                className="absolute inset-0 cursor-pointer opacity-0"
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

            <InputError message={form.errors.photos} />

            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previews.map((preview, index) => (
                  <div
                    key={`${preview.file.name}-${index}`}
                    className="relative overflow-hidden rounded-3xl border border-gray-200"
                  >
                    <img
                      src={preview.url}
                      alt={preview.file.name}
                      className="h-24 w-full object-cover"
                    />
                    <Button
                      type="button"
                      onClick={() => removePhoto(index)}
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 size-7 rounded-full border-gray-200 bg-background/80 p-1 backdrop-blur hover:bg-background"
                      aria-label="Remove photo"
                    >
                      <XIcon className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={form.processing}
            className="rounded-4xl bg-primary p-2 transition duration-700 hover:bg-foreground hover:text-background"
          >
            {form.processing ? "Creating..." : "Create Request"}
          </Button>
        </form>
      </div>

      {showAlert ? (
        <div
          className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-out ${
            animate ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <Alert className="max-w-[92vw] bg-primary/5 backdrop-blur-sm sm:max-w-md">
            {alertContent.variant === "success" ? (
              <CheckCircle2Icon className="text-primary" />
            ) : (
              <XCircleIcon className="text-red-600" />
            )}
            <AlertTitle
              className={
                alertContent.variant === "success" ? "text-primary" : "text-red-600"
              }
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
