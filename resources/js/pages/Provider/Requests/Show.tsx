import { Link, usePage } from "@inertiajs/react";
import React from "react";

import AppLayout from "@/layouts/app-layout";
import { index as providerRequestsIndex } from "@/routes/provider/requests";

type RequestItem = {
  id: number;
  title: string;
  description: string;
  status: string;
  budget_min?: string | number | null;
  budget_max?: string | number | null;
  urgency?: string | null;

  category?: { id: number; name: string; slug: string };
  city?: { id: number; name: string };
  client?: { id: number; name: string };

  media?: Array<{ id: number; path: string; type: string; position: number }>;
};

type PageProps = {
  request: RequestItem;
};

export default function Show() {
  const { request } = usePage<PageProps>().props;

  return (
    <AppLayout>
      <div style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
        <div style={{ marginBottom: 12 }}>
          <Link href={providerRequestsIndex.url()}>{"<-"} Back to requests</Link>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700 }}>{request.title}</h1>

        <div style={{ marginTop: 10, padding: 12, border: "1px solid #ddd" }}>
          <p><b>City:</b> {request.city?.name ?? "-"}</p>
          <p><b>Category:</b> {request.category?.name ?? "-"}</p>
          <p><b>Client:</b> {request.client?.name ?? "-"}</p>
          <p><b>Budget:</b> {request.budget_min ?? "-"} / {request.budget_max ?? "-"} DZD</p>
          <p><b>Urgency:</b> {request.urgency ?? "-"}</p>
          <p><b>Status:</b> {request.status}</p>
        </div>

        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Description</h2>
          <div style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>
            {request.description}
          </div>
        </div>

        {/* Next week: Add "Send Offer" form here */}
      </div>
    </AppLayout>
  );
}
