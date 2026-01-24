import { router } from "@inertiajs/react";
import React, { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

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
  provider?: { id: number; name: string };
};

export default function Show({ service }: { service: Service }) {
  const images = useMemo(() => service.media ?? [], [service.media]);
  const [active, setActive] = useState(0);

  const cover =
    images[active]?.path ??
    images[0]?.path ??
    "/images/service-placeholder.jpg";

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
      {/* Back */}
      <Button variant="outline" onClick={() => router.get("/services")}>
        ← Back to Services
      </Button>

      {/* Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{service.title}</h1>

        <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
          {service.category?.name && (
            <span className="border rounded-full px-2 py-1">
              {service.category.name}
            </span>
          )}
          {service.city?.name && (
            <span className="border rounded-full px-2 py-1">
              {service.city.name}
            </span>
          )}
          {service.provider?.name && (
            <span className="border rounded-full px-2 py-1">
              Provider: {service.provider.name}
            </span>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Pricing: {service.pricing_type}
          {service.base_price ? ` • ${service.base_price} DZD` : ""}
          {" • "}
          Payment: {service.payment_type}
        </div>
      </div>

      {/* Media */}
      <div className="space-y-3">
        <img
          src={cover}
          alt={service.title}
          className="w-full h-80 rounded-lg object-cover border"
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
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {service.description}
        </p>
      </div>

      {/* CTA (placeholder for later weeks) */}
      <div className="flex gap-3">
        <Button
          onClick={() => alert("Later: create/open chat with provider")}
        >
          Contact provider
        </Button>

        <Button variant="outline" onClick={() => router.get("/services")}>
          Browse more
        </Button>
      </div>
    </div>
  );
}
