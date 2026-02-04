import { Link, router, useForm, usePage } from "@inertiajs/react";
import { Clock, CreditCard, Handshake, Pin } from "lucide-react";
import React, { useMemo, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "@/routes";
import { create as reportCreate } from "@/routes/reports";
import { show as profileShow } from "@/routes/profiles";
import { index as providerServicesIndex } from "@/routes/provider/my/services";
import { index as servicesIndex } from "@/routes/services";
import { SharedData } from "@/types";

type ServiceMedia = {
  id: number;
  path: string;
  type: string;
  position: number;
};

type Review = {
  id: number;
  rating: number | null;
  comment: string | null;
  created_at?: string | null;
  client?: { id: number; name: string; avatar_path: string | null };
};

type Service = {
  id: number;
  title: string;
  slug: string;
  description: string;
  base_price: string | null;
  pricing_type: string;
  payment_type: string;
  media?: ServiceMedia[];

  category?: { id: number; name: string; slug: string };
  city?: { id: number; name: string };
  provider?: { id: number; name: string; avatar_path?: string };
  reviews?: Review[];
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

function Stars({ value }: { value: number }) {
  const full = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="font-mono text-sm">
      {"★".repeat(full)}
      {"☆".repeat(5 - full)}
    </span>
  );
}

export default function Show({ service }: { service: Service }) {
  const images = useMemo(() => service.media ?? [], [service.media]);
  const [active, setActive] = useState(0);
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user ?? null;
  const reviews = service.reviews ?? [];
  const ratingsOnly = reviews.filter(
    (r) => r.rating !== null && r.rating !== undefined
  );
  const avg =
    ratingsOnly.length > 0
      ? ratingsOnly.reduce((sum, r) => sum + Number(r.rating), 0) /
        ratingsOnly.length
      : null;

  const bookingForm = useForm<{ scheduled_at: string }>({
    scheduled_at: "",
  });

  const coverPath =
    images[active]?.path ??
    images[0]?.path ??
    "/images/service-placeholder.jpg";
  const cover = publicImagePath(coverPath);

  function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    bookingForm.post(`/services/${service.slug}/book`, {
      preserveScroll: true,
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      {/* Back */}
      <Button
        variant="outline"
        onClick={() =>
          router.get(
            user?.role === "provider"
              ? providerServicesIndex.url()
              : servicesIndex.url(),
          )
        }
        className="rounded-4xl transition duration-700  hover:bg-foreground hover:text-background hover:shadow-xl"
      >
        ← Back to Services
      </Button>

      {/* Title */}
      <div className="space-y-2">
        {service.provider?.name ? (
          <div className="flex items-center gap-3">
            {service.provider.avatar_path ? (
              <img
                src={service.provider.avatar_path}
                alt={service.provider.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : null}
            <span className="text-4xl px-2 py-1">{service.provider.name}</span>
            {service.provider.id ? (
              <Link
                href={profileShow(service.provider.id).url}
                className="text-sm underline"
              >
                View profile
              </Link>
            ) : null}
          </div>
        ) : null}
        <h1 className="text-2xl font-bold">{service.title}</h1>

        <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
          {service.category?.name && (
            <span className="border rounded-full px-2 py-1 border-gray-200">
              {service.category.name}
            </span>
          )}
          {service.city?.name && (
            <span className="border rounded-full px-2 py-1 border-gray-200 ">
              {service.city.name}
            </span>
          )}
          
        </div>

        <div className="flex gap-4  ">
          <div className=" flex justify-between gap-2 text-sm text-muted-foreground rounded-4xl px-2 py-1 w-max border border-gray-200">
           <div className="border border-gray-200 rounded-4xl px-2 py-1">
            {service.pricing_type === "fixed" ? (
              <span className="flex items-center gap-1 text-red-600">
                <Pin />
                <span>fixed</span>
              </span>
            ) : service.pricing_type === "hourly" ? (
              <span className="flex items-center gap-1 text-yellow-400">
                <Clock />
                <span>hourly</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-primary">
                <Handshake />
                <span>quote</span>
              </span>
            )}







           </div>
          {service.base_price ? <div className="flex items-center font-bold text-primary">{service.base_price} DZD</div> : ""}
          
          
        </div>
        <div className="flex justify-center items-center border border-gray-200 rounded-4xl px-2 py-1 w-max "><CreditCard className="mr-2"/> <div className="text-primary">{service.payment_type}</div></div>
        </div>
      </div>

      {/* Media */}
      <div className="space-y-3">
        <img
          src={cover}
          alt={service.title}
          className="w-full h-80 rounded-4xl object-cover border"
        />

        {images.length > 1 && (
          <div className="flex gap-2 overflow-auto">
            {images.map((m, idx) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActive(idx)}
                className={[
                  "border rounded-md overflow-hidden",
                  idx === active ? "ring-2 ring-primary" : "",
                ].join(" ")}
                title="View image"
              >
                <img
                  src={publicImagePath(m.path)}
                  alt={`media-${idx}`}
                  className="h-16 w-24 object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2 border border-gray-200 rounded-4xl p-4 bg-primary-foreground/30">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
          {service.description}
        </p>
      </div>

      {/* Booking */}
      <div className="rounded-md border p-4 space-y-2">
        <div className="font-medium">Book this service</div>
        <p className="text-sm text-gray-600">
          This will create a booking with status <b>pending</b>. Then you choose payment (cash or online)
          in your booking page.
        </p>

        {!user ? (
          <div className="text-sm text-gray-700">
            You must{" "}
            <Link className="underline" href={login()}>
              login
            </Link>{" "}
            as a client to book.
          </div>
        ) : user.role !== "client" ? (
          <div className="text-sm text-gray-700">
            Only <b>clients</b> can book services.
          </div>
        ) : (
          <form onSubmit={submitBooking} className="mt-3 space-y-3">
            <div>
              <label className="block text-sm font-medium">Scheduled at (optional)</label>
              <input
                type="datetime-local"
                className="mt-1 w-full rounded-md border p-2"
                value={bookingForm.data.scheduled_at}
                onChange={(e) => bookingForm.setData("scheduled_at", e.target.value)}
              />
              {bookingForm.errors.scheduled_at ? (
                <div className="text-sm text-red-600 mt-1">{bookingForm.errors.scheduled_at}</div>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={bookingForm.processing}
              className="rounded-md bg-black px-4 py-2 text-white text-sm disabled:opacity-60"
            >
              {bookingForm.processing ? "Booking..." : "Create Booking"}
            </button>
          </form>
        )}
      </div>

      {/* CTA (placeholder for later weeks) */}
      <div className="flex gap-3">
        <Button
          onClick={() => alert("Later: create/open chat with provider")}
          className="rounded-4xl transition duration-700  hover:bg-foreground hover:text-background hover:shadow-xl">
          Contact provider
        </Button>

        <Button
          variant="outline"
          onClick={() =>
            router.get(
              user?.role === "provider"
                ? providerServicesIndex.url()
                : servicesIndex.url(),
            )
          }
          className="rounded-4xl transition duration-700 hover:bg-foreground hover:text-background hover:shadow-xl"
        >
          Browse more
        </Button>

        <Button variant="outline" asChild>
          <Link
            href={reportCreate({
              query: { type: "service", id: service.id },
            }).url}
          >
            Report this service
          </Link>
        </Button>
      </div>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Reviews</CardTitle>

            <div className="text-sm text-muted-foreground">
              {avg !== null ? (
                <div className="flex items-center gap-2">
                  <Stars value={avg} />
                  <span>{avg.toFixed(1)} / 5</span>
                  <span>({ratingsOnly.length})</span>
                </div>
              ) : (
                <span>No ratings yet</span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => {
                const avatarUrl = publicImagePath(r.client?.avatar_path ?? null);
                const initials =
                  (r.client?.name ?? "U")
                    .split(" ")
                    .slice(0, 2)
                    .map((x) => x[0]?.toUpperCase())
                    .join("") || "U";

                return (
                  <div
                    key={r.id}
                    className="flex gap-3 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={avatarUrl}
                        alt={r.client?.name ?? "Client"}
                      />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium truncate">
                          {r.client?.name ?? "Client"}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {r.rating !== null && r.rating !== undefined ? (
                            <div className="flex items-center gap-2">
                              <Stars value={Number(r.rating)} />
                              <span>{Number(r.rating)}/5</span>
                            </div>
                          ) : (
                            <span>Comment</span>
                          )}
                        </div>
                      </div>

                      {r.comment ? (
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {r.comment}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No comment.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
