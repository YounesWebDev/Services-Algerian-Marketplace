import { Link, router, useForm, usePage } from "@inertiajs/react";
import { Clock, CreditCard, Handshake, Pin } from "lucide-react";
import React, { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { login } from "@/routes";
import { index as servicesIndex } from "@/routes/services";
import { SharedData } from "@/types";

type ServiceMedia = {
  id: number;
  path: string;
  type: string;
  position: number;
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
};

export default function Show({ service }: { service: Service }) {
  const images = useMemo(() => service.media ?? [], [service.media]);
  const [active, setActive] = useState(0);
  const { auth } = usePage<SharedData>().props;
  const user = auth?.user ?? null;

  const bookingForm = useForm<{ scheduled_at: string }>({
    scheduled_at: "",
  });

  const cover =
    images[active]?.path ??
    images[0]?.path ??
    "/images/service-placeholder.jpg";

  function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    bookingForm.post(`/services/${service.slug}/book`, {
      preserveScroll: true,
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      {/* Back */}
      <Button variant="outline" onClick={() => router.get(servicesIndex.url())} className="rounded-4xl transition duration-700  hover:bg-foreground hover:text-background hover:shadow-xl">
        ← Back to Services
      </Button>

      {/* Title */}
      <div className="space-y-2">
        {service.provider?.name && (
            <span className="text-4xl px-2 py-1">
              {service.provider?.avatar_path && (
                                         <img src={service.provider.avatar_path} alt={service.provider?.name} className="w-8 h-8 rounded-full object-cover" />
                                     )}
               {service.provider.name}
            </span>
          )}
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
                  src={m.path}
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

        <Button variant="outline" onClick={() => router.get(servicesIndex.url())}  className="rounded-4xl transition duration-700 hover:bg-foreground hover:text-background hover:shadow-xl">
          Browse more
        </Button>
      </div>
    </div>
  );
}
