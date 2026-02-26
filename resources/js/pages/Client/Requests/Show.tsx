import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { BookOpenCheck, Clock, MapPin, Trash2 } from "lucide-react";

import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { index as myRequestsIndex } from "@/routes/client/my/requests";
import { accept as clientOffersAccept, contact as clientOffersContact } from "@/routes/client/offers";
import { show as profileShow } from "@/routes/profiles";
type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };

type RequestMedia = {
  id: number;
  path: string;
  type: string;
  position: number;
};

type RequestItem = {
  id: number;
  title: string;
  description: string;
  budget_min: string | null;
  budget_max: string | null;
  urgency: string | null;
  status: string;

  category?: Category;
  city?: City;
  media?: RequestMedia[];
};

type Provider = { id: number; name: string; avatar_path: string | null };

type Offer = {
  id: number;
  request_id: number;
  provider_id: number;
  message: string;
  proposed_price: string;
  estimated_days: number | null;
  status: string; // sent | rejected | assigned | accepted...
  created_at: string;

  provider?: Provider;
};

const publicImagePath = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  return `/storage/${path}`;
};

export default function ClientRequestShow() {
  const { props } = usePage<{
    request: RequestItem;
    offers: Offer[];
    errors: Record<string, string>;
    flash?: { success?: string };
  }>();

  const job = props.request;
  const offers = props.offers ?? [];
  const { errors, flash } = props;

  const sortedMedia = (job.media ?? []).slice().sort((a, b) => a.position - b.position);

  // Accept offer form
  const acceptForm = useForm({});

  function acceptOffer(offerId: number) {
    acceptForm.post(clientOffersAccept.url(offerId), {
      preserveScroll: true,
    });
  }

  function contactProvider(offerId: number) {
    router.post(clientOffersContact.url(offerId));
  }

  const canAccept = job.status === "open"; // only open requests can accept offers

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "My Requests", href: myRequestsIndex().url },
        { title: job.title, href: myRequestsIndex().url },
      ]}
    >
      <Head title={`My Request: ${job.title}`} />

      <div className="p-6 max-w-4xl space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">{job.title}</h1>
            <div >
              <span >
                <div className="mt-1 mb-3 flex w-max items-center rounded-3xl border border-gray-200 p-1  text-sm text-foreground">
                  Status{" "}
                  {job.status === "open" ? (
                    <span className="rounded-full border border-gray-200 p-2 font-medium text-primary">
                      <BookOpenCheck className="mr-1 inline h-4 w-4" />
                      {job.status}
                    </span>
                  ) : job.status === "assigned" ? (
                    <span className="rounded-full border border-gray-200 p-2 font-medium text-primary">
                      {job.status}
                    </span>
                  ) : job.status === "closed" || job.status === "cancelled" ? (
                    <span className="rounded-full border border-gray-200 p-2 font-medium text-red-600">
                       <Trash2 className="mr-1 inline h-4 w-4" />{job.status}
                    </span>
                  ) : null}
                </div>
              </span>
            </div>
            <div className="p-1 rounded-3xl border border-gray-200 w-max flex items-center ">
             <div className=""> {job.category?.name ? <div className="">  {job.category.name}</div> : null}  </div>
              <div className=" flex items-center p-2 rounded-3xl border border-gray-200 w-max ml-2 ">{job.city?.name ? <div className="flex items-center  "> <MapPin className="text-red-600 "/>  {job.city.name}</div> : null}</div>
              
              
              
            </div>
             <div className="text-sm text-foreground p-1 rounded-3xl border border-gray-200 w-max mt-1 flex items-center gap-2 ">
            Budget{" "}
            <div className="font-medium rounded-3xl p-2 border border-gray-200 flex items-center gap-2">
              <div className="text-primary">{job.budget_min ?? "--"}</div> - <div className="text-red-600">{job.budget_max ?? "--"}</div>  DZD
            </div>{" "}
            
          </div>

          <div className="p-1 rounded-3xl border border-gray-200 w-max flex items-center gap-2 mt-3 ">
                        Urgency 
                        <div className="font-medium rounded-3xl p-2 border border-gray-200 ">
                          {job.urgency === "low" ? <span className="text-primary"><Clock className="h-4 w-4 inline mr-1"/>Low</span>
                          : job.urgency === "medium" ? <span className="text-yellow-600"><Clock className="h-4 w-4 inline mr-1"/>Medium</span>
                          : job.urgency === "high" ? <span className="text-red-600"><Clock className="h-4 w-4 inline mr-1"/>High</span>
                           : null}
                          </div>
                        </div>
          </div>

          <Link href={myRequestsIndex.url()} className="text-sm px-3 py-2 rounded-3xl text-red-600 border border-gray-200 transition duration-700 hover:text-background hover:bg-foreground hover:shadow-2xl ">
            Back
          </Link>
        </div>

        {flash?.success ? (
          <div className="rounded-md border p-3 text-sm bg-green-50">{flash.success}</div>
        ) : null}

        {errors?.offer ? (
          <div className="rounded-md border p-3 text-sm bg-red-50 text-red-700">
            {errors.offer}
          </div>
        ) : null}

        {/* Request details */}
        <div className="rounded-4xl bg-primary-foreground/30 border border-gray-200  p-4 space-y-2">
          <div className="font-medium">Description</div>
          <p className="text-sm text-foreground whitespace-pre-line">{job.description}</p>

         
        </div>

       <div className="rounded-3xl border bg-primary-foreground/30 shadow-sm p-6">
  {/* Header */}
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold tracking-tight">Photos</h3>
    {sortedMedia.length > 0 && (
      <span className="text-xs bg-muted px-3 py-1 rounded-full">
        {sortedMedia.length} image{sortedMedia.length > 1 && "s"}
      </span>
    )}
  </div>

  {/* Content */}
  {sortedMedia.length === 0 ? (
    <div className="mt-6 flex flex-col items-center justify-center text-center text-muted-foreground">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-6 h-6 opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16l4-4a3 3 0 014 0l4 4m-2-2l1-1a3 3 0 014 0l3 3"
          />
        </svg>
      </div>
      <p className="text-sm">No photos uploaded yet</p>
    </div>
  ) : (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
      {sortedMedia.slice(0, 8).map((m) => {
        const url = publicImagePath(m.path);
        return (
          <div
            key={m.id}
            className="group relative rounded-2xl overflow-hidden border bg-muted aspect-square"
          >
            {url ? (
              <img
                src={url}
                alt="Request"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full" />
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-sm font-medium">
                View
              </span>
            </div>
          </div>
        );
      })}
    </div>
  )}
</div>

        {/* Offers */}
        <div className="rounded-md border p-4 space-y-3">
          <div className="font-medium">Offers</div>
          <p className="text-sm text-gray-600">
            Providers send offers. You can accept only while your request is <b>open</b>.
          </p>

          {!canAccept ? (
            <div className="text-sm text-gray-700">
              This request is not open anymore, so you can't accept offers.
            </div>
          ) : null}

          {offers.length === 0 ? (
            <div className="text-sm text-gray-600">No offers yet.</div>
          ) : (
            <div className="space-y-3">
              {offers.map((o) => {
                const canAcceptThis = canAccept && o.status === "sent";

                return (
                  <div key={o.id} className="rounded-md border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {o.provider?.avatar_path ? (
                            <img
                              src={o.provider.avatar_path}
                              alt={o.provider.name}
                              className="w-7 h-7 rounded-full object-cover border"
                            />
                          ) : (
                            <span className="w-7 h-7 rounded-full border bg-gray-100" />
                          )}
                          <div className="font-medium">{o.provider?.name ?? "Provider"}</div>
                          {o.provider ? (
                            <Link
                              href={profileShow(o.provider.id).url}
                              className="text-xs underline"
                            >
                              View profile
                            </Link>
                          ) : null}
                          <span className="text-xs px-2 py-1 rounded border bg-gray-50">
                            {o.status}
                          </span>
                        </div>

                        <div className="text-sm text-gray-700 whitespace-pre-line">
                          {o.message}
                        </div>

                        <div className="text-sm text-gray-600">
                          Price: <span className="font-medium">{o.proposed_price}</span> DZD
                          {o.estimated_days !== null ? (
                            <>
                              {" "}
                              - Estimated days:{" "}
                              <span className="font-medium">{o.estimated_days}</span>
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => contactProvider(o.id)}
                            className="rounded-md border px-3 py-2 text-sm"
                          >
                            Contact
                          </button>
                          <button
                            type="button"
                            onClick={() => acceptOffer(o.id)}
                            disabled={!canAcceptThis || acceptForm.processing}
                            className="rounded-md bg-black px-3 py-2 text-white text-sm disabled:opacity-60"
                          >
                            {acceptForm.processing ? "Working..." : "Accept"}
                          </button>
                        </div>

                        {!canAcceptThis ? (
                          <span className="text-xs text-gray-500">
                            {o.status !== "sent" ? "Not available" : "--"}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
