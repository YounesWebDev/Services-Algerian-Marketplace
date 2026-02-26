import { Head, Link, usePage } from "@inertiajs/react";
import { BookOpenCheck, Clock, ExternalLink, MapPin, Trash2, X } from "lucide-react";

import PaginationLinks from "@/components/pagination-links";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import {
  create as myRequestsCreate,
  index as myRequestsIndex,
} from "@/routes/client/my/requests";

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Media = { id: number; request_id: number; path: string; type: string; position: number };

type RequestItem = {
  id: number;
  title: string;
  status: string;
  budget_min: string | null;
  budget_max: string | null;
  urgency: string | null;
  created_at: string;
  category: Category;
  city: City;
  media: Media[];
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function ClientRequestsIndex() {
  const { requests, filters } = usePage<{
    requests: { data: RequestItem[]; links: PaginationLink[] };
    filters: { status: string };
  }>().props;

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "My Requests", href: myRequestsIndex().url },
      ]}
    >
      <Head title="My Requests" />

      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">My Requests</h1>

          <Link
            href={myRequestsCreate.url()}
            className="inline-flex items-center rounded-3xl bg-primary  px-3 py-2 text-white text-sm transition duration-700 hover:bg-primary-foreground hover:text-background "
          >
            Create Request +
          </Link>
        </div>

        <div className="flex gap-2 items-center">
          <Link
            href={myRequestsIndex.url()}
            className={`px-3 py-1 rounded-3xl  text-sm border ${
              filters.status === "" ? "bg-primary text-foreground border border-gray-200" : "bg-primary-foreground/30 text-foreground border border-gray-200 transition duration-700 hover:bg-primary-foreground/50 hover:shadow-lg"
            }`}
          >
            All
          </Link>

          {["open", "assigned", "closed", "cancelled"].map((s) => (
            <Link
              key={s}
              href={myRequestsIndex.url({ query: { status: s } })}
              className={`px-3 py-1 rounded-3xl text-sm border ${
                filters.status === s ? "bg-primary text-foreground border border-gray-200" : "bg-primary-foreground/30  text-foreground border border-gray-200 transition duration-700 hover:bg-primary-foreground/50 hover:shadow-lg"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          {requests.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-fordround">
              No requests yet.
            </div>
          ) : (
            requests.data.map((r) => (
              <div key={r.id} className="rounded-4xl border border-gray-200 bg-primary-foreground/30 p-4 transition duration-700 hover:bg-primary-foreground/50 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium text-lg">{r.title}</div>
                  <Link
                    href={`/my/requests/${r.id}`}
                    className="text-sm underline"
                  >
                    <ExternalLink className="h-6 w-6 text-primary transition duration-700 hover:text-foreground"/>
                  </Link>
                </div>
                <div className="text-sm text-foreground mt-1 p-1 rounded-3xl border border-gray-200 w-max flex items-center gap-2">
                  {r.category?.name} <div className="p-2 rounded-3xl border border-gray-200 flex items-center"><MapPin className="h-6 w-6 text-red-600"/> {r.city?.name}</div>
                </div>

                <div className="text-sm text-foreground p-2 rounded-3xl border border-gray-200 w-max mt-1">
                  <div className="p-1">
                    Status {
                   r.status === "open" ? <span className="font-medium rounded-full p-2 border border-gray-200  text-primary"><BookOpenCheck className="h-4 w-4 inline mr-1"/>{r.status}</span>
                  : r.status === "assigned" ? <span className="font-medium rounded-full p-2 border border-gray-200  text-primary">{r.status}</span>
                  : r.status === "closed" ? <span className="font-medium rounded-full p-2 border border-gray-200  text-red-600"><X className="h-4 w-4 inline mr-1"/>{r.status}</span>
                  : r.status === "cancelled" ? <span className="font-medium rounded-full p-2 border border-gray-200  text-red-600"><Trash2 className="h-4 w-4 inline mr-1"/>{r.status}</span>
                  : null}
                  </div>
                </div>

                <div className="text-sm text-foreground mt-1">
                  
                  <span className="font-medium p-1 rounded-3xl border border-gray-200 flex items-center w-max gap-4">
                    <div className="rounded-3xl p-2 border border-gray-200 w-max text-primary">Min {r.budget_min ?? "--"} DZD</div> <div className="rounded-3xl p-2 border border-gray-200 w-max text-red-600">Max {r.budget_max ?? "--"} DZD</div> 
                  </span>
                  {r.urgency ? (
                    <>
                      {" "}
                      <div className="p-1 rounded-3xl border border-gray-200 w-max flex items-center gap-2">
                        Urgency 
                        <div className="font-medium rounded-3xl p-2 border border-gray-200 ">
                          {r.urgency === "low" ? <span className="text-primary"><Clock className="h-4 w-4 inline mr-1"/>Low</span>
                          : r.urgency === "medium" ? <span className="text-yellow-600"><Clock className="h-4 w-4 inline mr-1"/>Medium</span>
                          : r.urgency === "high" ? <span className="text-red-600"><Clock className="h-4 w-4 inline mr-1"/>High</span>
                           : null}
                          </div>
                        </div>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        {requests.links?.length > 0 && <PaginationLinks links={requests.links} />}
      </div>
    </AppLayout>
  );
}



