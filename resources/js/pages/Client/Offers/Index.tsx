import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Clock, MapPin } from "lucide-react";

import PaginationLinks from "@/components/pagination-links";
import AppLayout from "@/layouts/app-layout";
import { dashboard } from "@/routes";
import { accept as acceptOfferRoute, index as clientOffersIndex } from "@/routes/client/offers";
type Provider = { id: number; name: string; avatar_path: string | null };
type City = { id: number; name: string };
type Category = { id: number; name: string; slug: string };

type RequestItem = {
  id: number;
  title: string;
  status: string;
  city: City;
  category: Category;
};

type OfferItem = {
  id: number;
  message: string;
  proposed_price: string;
  estimated_days: number | null;
  status: string; // sent | assigned | rejected (based on your DB)
  provider: Provider;
  request: RequestItem;
};

type PaginationLink = { url: string | null; label: string; active: boolean };

export default function ClientOffersIndex() {
  const { props } = usePage<{
    offers: { data: OfferItem[]; links: PaginationLink[] };
    filters: { status: string };
    flash?: { success?: string };
    errors: Record<string, string>;
  }>();

  const { offers, filters, flash, errors } = props;

  const acceptForm = useForm({});

  function acceptOffer(offerId: number) {
    if (!confirm("Accept this offer? This will create a booking and reject other offers.")) return;

    acceptForm.post(acceptOfferRoute.url(offerId), {
      preserveScroll: true,
    });
  }

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: dashboard().url },
        { title: "Offers", href: clientOffersIndex().url },
      ]}
    >
      <Head title="Offers" />

      <div className="p-6 space-y-4">
        <div>
          <h1 className="text-xl font-semibold">Offers</h1>
          <p className="text-sm text-muted-foreground">
            These are offers providers sent to your requests. You can accept one offer to create a booking.
          </p>
        </div>

        {/* flash / errors */}
        {flash?.success ? (
          <div className="rounded-md border p-3 text-sm bg-green-50">
            {flash.success}
          </div>
        ) : null}

        {errors?.offer ? (
          <div className="rounded-md border p-3 text-sm bg-red-50 text-red-600">
            {errors.offer}
          </div>
        ) : null}

        {/* Filters */}
        <div className="  p-4 flex flex-col md:flex-row gap-3 md:items-end md:justify-between">
           <div className="flex flex-wrap gap-2">
                    <Link
                      href={clientOffersIndex.url()}
                      className={`px-3 py-1 rounded-3xl border border-gray-200 text-sm  ${
                        filters.status === "" ? "bg-primary text-foreground" : "bg-primary-foreground/30"
                      }`}
                    >
                      All
                    </Link>
          
                    {["sent", "assigned", "rejected"].map((s) => (
                      <Link
                        key={s}
                        href={clientOffersIndex.url({ query: { status: s } })}
                        className={`px-3 py-1 rounded-3xl border-gray-200  text-sm border transition duration-700 hover:bg-primary-foreground/40 hover:shadow-2xl ${
                          filters.status === s ? "bg-primary text-foreground" : "bg-primary-foreground/30"
                        }`}
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
          

          <button className="rounded-3xl py-2 text-red-600 border border-gray-200 transition duration-700 hover:bg-red-600 hover:text-white px-3">
            <Link href={dashboard().url}>Back</Link>
          </button>
        </div>

        {/* List */}
        <div className="space-y-3">
          {offers.data.length === 0 ? (
            <div className="rounded-md border p-4 text-sm text-gray-600">
              No offers found.
            </div>
          ) : (
            offers.data.map((o) => {
              const canAccept = o.status === "sent";

              return (
                <div key={o.id} className="rounded-4xl bg-primary-foreground/30 border border-gray-200 transition duration-700 hover:bg-primary-foreground/40 hover:shadow-3xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="text-xl">{o.request?.title}</div>
                      <div className="text-sm text-foreground flex items-center gap-2 p-1 rounded-3xl border border-gray-200 w-max">
                        <div>{o.request?.category?.name}</div>  <div className=" flex items-center p-2 rounded-3xl border border-gray-200"><MapPin className="w-6 h-6 text-red-600 " /> {o.request?.city?.name}</div>
                      </div>

                      

                      <div className="text-sm text-foreground mt-2 p-1 rounded-3xl border border-gray-200 flex items-center w-max gap-2">
                        <div className="font-medium "></div> {o.proposed_price} DZD
                        {o.estimated_days ? (
                          <>
                            {" "}
                            <div className="p-2 rounded-3xl w-max border border-gray-200 flex items-center ml-2"><div className="font-medium flex items-center gap-2 "><Clock className="h-5 w-5"/> Days:</div> {o.estimated_days}</div>
                          </>
                        ) : null}
                      </div>
                      <div className="text-sm text-foreground  whitespace-pre-line p-2 w-max rounded-3xl bg-primary-foreground/40 border border-gray-200 mt-3">
                        <div className="font-medium  "><div className="text-sm text-foreground mt-2 flex items-center gap-2">
                        {o.provider?.avatar_path ? (
                          <img
                            src={o.provider.avatar_path}
                            alt={o.provider.name}
                            className="w-5 h-5 rounded-full object-cover border"
                          />
                        ) : (
                          <span className="w-7 h-7 rounded-full border bg-gray-100" />
                        )}
                        <span>
                          <span className="text-sm">{o.provider?.name}</span>
                        </span>
                      </div></div> {o.message}
                      </div>

                      
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-3xl border border-gray-200  ${
                          o.status === "assigned"
                            ? "text-primary"
                            : o.status === "rejected"
                            ? "bg-red-600"
                            : ""
                        }`}
                      >
                        {o.status}
                      </span>

                      <button
                        type="button"
                        disabled={!canAccept || acceptForm.processing}
                        onClick={() => acceptOffer(o.id)}
                        className="rounded-3xl bg-primary transition duration-700 hover:bg-foreground hover:text-background hover:shadow-3xl px-3 py-2 text-white text-sm disabled:opacity-50"
                      >
                        {acceptForm.processing ? "Working..." : "Accept"}
                      </button>

                      {!canAccept ? (
                        <div className="text-xs text-gray-500">
                          You can only accept offers with status <b>sent</b>.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {offers.links?.length > 0 && <PaginationLinks links={offers.links} />}
      </div>
    </AppLayout>
  );
}
