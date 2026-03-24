import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { BookOpenCheck, Clock, MapPin, MessageCircle, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  status: string;
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

  const [active, setActive] = useState(0);
  const [openAcceptDialogOfferId, setOpenAcceptDialogOfferId] = useState<number | null>(null);

  const validImages = sortedMedia.filter((m) => publicImagePath(m.path));
  const cover =
    validImages.length > 0
      ? publicImagePath(validImages[Math.min(active, validImages.length - 1)]?.path)
      : "";

  const acceptForm = useForm({});

  function acceptOffer(offerId: number) {
    setOpenAcceptDialogOfferId(null);

    acceptForm.post(clientOffersAccept.url(offerId), {
      preserveScroll: true,
    });
  }

  function contactProvider(offerId: number) {
    router.post(clientOffersContact.url(offerId));
  }

  const canAccept = job.status === "open";

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

            <div>
              <span>
                <div className="mt-1 mb-3 flex w-max items-center rounded-3xl border border-gray-200 p-1 text-sm text-foreground">
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
                      <Trash2 className="mr-1 inline h-4 w-4" />
                      {job.status}
                    </span>
                  ) : null}
                </div>
              </span>
            </div>

            <div className="p-1 rounded-3xl border border-gray-200 w-max flex items-center ">
              <div>{job.category?.name ? <div>{job.category.name}</div> : null}</div>

              <div className="flex items-center p-2 rounded-3xl border border-gray-200 w-max ml-2 ">
                {job.city?.name ? (
                  <div className="flex items-center">
                    <MapPin className="text-red-600" /> {job.city.name}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="text-sm text-foreground p-1 rounded-3xl border border-gray-200 w-max mt-1 flex items-center gap-2 ">
              Budget
              <div className="font-medium rounded-3xl p-2 border border-gray-200 flex items-center gap-2">
                <div className="text-primary">{job.budget_min ?? "--"}</div> -
                <div className="text-red-600">{job.budget_max ?? "--"}</div> DZD
              </div>
            </div>

            <div className="p-1 rounded-3xl border border-gray-200 w-max flex items-center gap-2 mt-3 ">
              Urgency
              <div className="font-medium rounded-3xl p-2 border border-gray-200 ">
                {job.urgency === "low" ? (
                  <span className="text-primary">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Low
                  </span>
                ) : job.urgency === "medium" ? (
                  <span className="text-yellow-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    Medium
                  </span>
                ) : job.urgency === "high" ? (
                  <span className="text-red-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    High
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="text-sm px-3 py-2 rounded-3xl text-red-600 border border-gray-200 transition duration-700 hover:text-background hover:bg-foreground hover:shadow-2xl "
          >
            Back
          </button>
        </div>

        {flash?.success ? (
          <div className="rounded-md border p-3 text-sm bg-green-50">{flash.success}</div>
        ) : null}

        {errors?.offer ? (
          <div className="rounded-md border p-3 text-sm bg-red-50 text-red-700">
            {errors.offer}
          </div>
        ) : null}

        <div className="rounded-4xl bg-primary-foreground/30 border border-gray-200 p-4 space-y-2">
          <div className="font-medium">Description</div>
          <p className="text-sm text-foreground whitespace-pre-line">{job.description}</p>
        </div>

        {/* Photos */}
        <div className="space-y-3">
          {cover ? (
            <img src={cover} alt={job.title} className="w-full h-80 rounded-4xl object-cover border" />
          ) : (
            <div className="w-full h-80 rounded-4xl border flex items-center justify-center text-sm text-gray-500">
              No photos.
            </div>
          )}

          {validImages.length > 1 && (
            <div className="flex gap-2 overflow-auto">
              {validImages.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={[
                    "border rounded-md overflow-hidden shrink-0",
                    idx === active ? "ring-2 ring-primary" : "",
                  ].join(" ")}
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

        {/* Offers */}
        <div className="rounded-md border p-4 space-y-3">
          <div className="font-medium">Offers</div>

          {offers.length === 0 ? (
            <div className="text-sm text-foreground">No offers yet.</div>
          ) : (
            <div className="space-y-3">
              {offers.map((o) => {
                const canAcceptThis = canAccept && o.status === "sent";

                return (
                  <div key={o.id} className="rounded-4xl border border-gray-200 bg-primary-foreground/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">

                        {/* FIXED PROVIDER SECTION */}
                        {o.provider ? (
                          <Link
                            href={profileShow(o.provider.id).url}
                            className="flex items-center gap-2"
                          >
                            {o.provider.avatar_path ? (
                              <img
                                src={o.provider.avatar_path}
                                alt={o.provider.name}
                                className="w-7 h-7 rounded-full object-cover border"
                              />
                            ) : (
                              <span className="w-7 h-7 rounded-full border bg-gray-100" />
                            )}

                            <span className="font-medium text-sm hover:underline">
                              {o.provider.name}
                            </span>
                          </Link>
                        ) : (
                          <div className="font-medium text-sm">Provider</div>
                        )}

                        <span className="text-xs px-2 py-1 rounded-3xl border border-gray-200 w-max text-foreground">
                          {o.status}
                        </span>

                        <div className="text-sm text-foreground mt-3 whitespace-pre-line">
                          {o.message}
                        </div>

                        <div className="text-sm text-foreground p-1 rounded-3xl border border-gray-200 w-max flex items-center gap-2 ">
                          Price <div className="font-medium rounded-3xl p-2 border border-gray-200 ">{o.proposed_price} DZD</div> 
                          
                        </div>
                        <div>
                           {o.estimated_days !== null && (
                            <><div className="rounded-3xl p-2 border border-gray-200 flex items-center gap-2 w-max"> <Clock/> Estimated days: <div className="font-medium ">{o.estimated_days}</div></div></>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => contactProvider(o.id)}
                            className=" px-3 py-2 text-sm text-primary transition duration-700 hover:text-foreground disabled:opacity-60 flex items-center gap-1"
                          >
                           <MessageCircle/> 
                          </button>

                          <Dialog
                            open={openAcceptDialogOfferId === o.id}
                            onOpenChange={(isOpen) => {
                              setOpenAcceptDialogOfferId(isOpen ? o.id : null);
                            }}
                          >
                            <DialogTrigger asChild>
                              <button
                                type="button"
                                disabled={!canAcceptThis || acceptForm.processing}
                                className="rounded-4xl bg-primary px-3 py-2 text-sm text-foreground transition duration-700 hover:bg-foreground hover:text-background disabled:hidden disabled:opacity-60 flex items-center gap-1 "
                              >
                                {acceptForm.processing ? "Working..." : "Accept"}
                              </button>
                            </DialogTrigger>

                            <DialogContent>
                              <DialogTitle>Accept this offer?</DialogTitle>
                              <DialogDescription>
                                This will create a booking and automatically reject the other offers
                                for this request.
                              </DialogDescription>

                              <DialogFooter>
                                <DialogClose asChild>
                                  <button
                                    type="button"
                                    onClick={() => setOpenAcceptDialogOfferId(null)}
                                    className="rounded-3xl border border-gray-200 px-3 py-2 text-sm"
                                  >
                                    Cancel
                                  </button>
                                </DialogClose>

                                <button
                                  type="button"
                                  onClick={() => acceptOffer(o.id)}
                                  disabled={acceptForm.processing}
                                  className="rounded-3xl bg-primary px-3 py-2 text-sm text-white disabled:opacity-50"
                                >
                                  {acceptForm.processing ? "Processing..." : "Confirm"}
                                </button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
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
