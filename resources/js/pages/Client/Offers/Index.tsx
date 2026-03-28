import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { Clock, MapPin } from "lucide-react";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { useEffect, useState } from "react";

import PaginationLinks from "@/components/pagination-links";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
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
import {
accept as clientOffersAccept,
index as clientOffersIndex,
} from "@/routes/client/offers";

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
status: string;
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
const [openAcceptDialogOfferId, setOpenAcceptDialogOfferId] = useState<number | null>(null);

const alertMessage = flash?.success ?? errors?.offer ?? "";
const [hiddenAlertMessage, setHiddenAlertMessage] = useState<string | null>(null);
const showAlert = Boolean(alertMessage) && hiddenAlertMessage !== alertMessage;

useEffect(() => {
if (alertMessage) {
const timer = setTimeout(() => {
setHiddenAlertMessage(alertMessage);
}, 7000);
return () => clearTimeout(timer);
}
}, [alertMessage]);

function acceptOffer(offerId: number) {
acceptForm.post(clientOffersAccept.url(offerId), {
preserveScroll: true,
onSuccess: () => {
setOpenAcceptDialogOfferId(null);
},
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

<div className="p-3 sm:p-6 space-y-4">

{/* HEADER */}

<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
<div className="flex flex-col gap-1 min-w-0">
<div className="flex justify-between">
<h1 className="text-lg sm:text-xl font-semibold">Offers</h1>

<button
type="button"
onClick={() => window.history.back()}
className="rounded-3xl py-2 text-red-600 border border-gray-200 transition duration-700 hover:bg-red-600 hover:text-white px-3 w-max md:w-auto"
>
Back
</button>

</div>

<p className="text-xs sm:text-sm text-muted-foreground break-words">
These are offers providers sent to your requests. You can accept one offer to create a booking.
</p>
</div>
</div>

{/* ALERT */}

{showAlert && (flash?.success || errors?.offer) && (

<div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50">
<Alert className="bg-primary/5 backdrop-blur-sm w-max sm:max-w-md shadow-2xl">
{flash?.success ? (
<CheckCircle2Icon className="text-primary" />
) : (
<XCircleIcon className="text-red-600" />
)}

<AlertTitle className={flash?.success ? "text-primary" : "text-red-600"}>
{flash?.success ? "Success" : "Error"}
</AlertTitle>

<AlertDescription>
{flash?.success ?? errors?.offer}
</AlertDescription>
</Alert>
</div>

)}

{/* FILTERS */}

<div className="p-2 flex flex-wrap gap-2">
<Link
href={clientOffersIndex().url}
className={`px-3 py-1 rounded-3xl border border-gray-200 text-sm ${
filters.status === "" ? "bg-primary text-foreground" : "bg-primary-foreground/30"
}`}
>
All
</Link>

{["sent", "assigned", "rejected"].map((s) => (

<Link
key={s}
href={clientOffersIndex({ query: { status: s } }).url}
className={`px-3 py-1 rounded-3xl border border-gray-200 text-sm ${
filters.status === s ? "bg-primary text-foreground" : "bg-primary-foreground/30"
}`}
>
{s}
</Link>

))}
</div>

{/* LIST */}

<div className="space-y-3">

{offers.data.length === 0 ? (

<div className="rounded-md border border-gray-200 p-4 text-sm text-muted-foreground">
No offers found.
</div>

) : (

offers.data.map((o) => {

const canAccept = o.status === "sent" && o.request?.status === "open";

return (

<div
key={o.id}
className="rounded-3xl bg-primary-foreground/30 border border-gray-200 p-3 sm:p-4 overflow-hidden"
>

<div className="flex flex-col md:flex-row gap-4">

{/* LEFT */}

<div className="flex-1 min-w-0 space-y-2">

<div className="text-base sm:text-lg break-words">
{o.request?.title}
</div>

<div className="flex items-center gap-2 text-sm border border-gray-200 p-1 rounded-3xl w-max">

<div className="break-words">
{o.request?.category?.name}
</div>

<div className="flex items-center gap-1 p-2 rounded-3xl border border-gray-200">
<MapPin className="w-4 h-4 text-red-600" />
<div className="break-words">{o.request?.city?.name}</div>
</div>

</div>

<div className="flex items-center gap-2 text-sm border border-gray-200 p-1 rounded-3xl w-max">

<span>{o.proposed_price} DZD</span>

{o.estimated_days && (

<div className="flex items-center gap-2 p-2 rounded-3xl border border-gray-200">
<Clock className="w-4 h-4" />
{o.estimated_days} days
</div>

)}

</div>

<div className="text-sm p-2 rounded-3xl border border-gray-200 break-words">

<div className="flex items-center gap-2 mb-1">

{o.provider?.avatar_path ? (
<img src={o.provider.avatar_path} className="w-6 h-6 rounded-full" />
) : (
<div className="w-6 h-6 bg-gray-200 rounded-full" />
)}

<span className="truncate">{o.provider?.name}</span>

</div>

{o.message}

</div>

</div>

{/* RIGHT */}

<div className="flex flex-col gap-2 w-full md:w-max md:items-end">

<span className="text-xs text-center border border-gray-200 rounded-3xl px-2 py-1 w-full md:w-max">
{o.status}
</span>

{o.status === "sent" && (

<Dialog

open={openAcceptDialogOfferId === o.id}
onOpenChange={(isOpen) =>
setOpenAcceptDialogOfferId(isOpen ? o.id : null)
}


>
<DialogTrigger asChild >

<button
disabled={!canAccept || acceptForm.processing}
className="rounded-3xl bg-primary px-3 py-2 text-sm w-full md:w-max transition duration-700 hover:bg-foreground hover:text-background disabled:opacity-50 disabled:hover:bg-primary"
>
Accept
</button>

</DialogTrigger>

<DialogContent className="w-[95vw] sm:max-w-md rounded-2xl">

<DialogTitle className="text-base sm:text-lg">
Accept this offer?
</DialogTitle>

<DialogDescription className="text-sm text-muted-foreground">
This will create a booking.
</DialogDescription>

<DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">

<DialogClose asChild>
<button className="border border-gray-200 px-3 py-2 rounded-3xl w-full sm:w-max transition duration-700 hover:bg-foreground hover:text-red-600">
Cancel
</button>
</DialogClose>

<button
onClick={() => acceptOffer(o.id)}
className="bg-primary text-white px-3 py-2 rounded-3xl w-full sm:w-max transition duration-700 hover:bg-foreground hover:text-background disabled:opacity-50 disabled:hover:bg-primary"
>
Confirm
</button>

</DialogFooter>

</DialogContent>
</Dialog>

)}

</div>

</div>

</div>

);

})

)}

</div>

{offers.links?.length > 0 && (
<PaginationLinks links={offers.links} />
)}

</div>

</AppLayout>
);
}