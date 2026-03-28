import { Head, router, useForm, usePage } from '@inertiajs/react';
import { CheckCircle2Icon, ChevronLeft, ChevronRight, Clock, MapPin, OctagonAlert } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import {
    contact as providerRequestsContact,
} from '@/routes/provider/requests';
import { store as providerRequestsOffersStore } from '@/routes/provider/requests/offers';

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Client = { id: number; name: string; avatar_path: string | null };
type Media = {
    id: number;
    request_id: number;
    path: string;
    type: string;
    position: number;
};
type AlertVariant = 'success' | 'error' | 'info';
type RequestItem = {
    id: number;
    title: string;
    description: string;
    status: string;
    budget_min: string | null;
    budget_max: string | null;
    urgency: string | null;
    created_at: string;
    category: Category;
    city: City;
    client: Client;
    media: Media[];
};

const publicImagePath = (path?: string | null) => {
    if (!path) {
        return '';
    }

    if (path.startsWith('http') || path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
};

export default function ProviderRequestsShow() {
    const page = usePage<{
        request: RequestItem;
        has_offer: boolean;
        errors: Record<string, string>;
        flash?: { success?: string };
    }>();
    const { props } = page;
    const { errors, flash } = props;

    const r = props.request;

    const images = useMemo(
        () => (r.media ?? []).slice().sort((a, b) => a.position - b.position),
        [r.media],
    );

    const form = useForm({
        message: '',
        proposed_price: '',
        estimated_days: '',
    });

    const [showAlert, setShowAlert] = useState(false);
    const [animate, setAnimate] = useState(false);
    const [alertContent, setAlertContent] = useState<{
        title: string;
        description: string;
        variant: AlertVariant;
    }>({ title: '', description: '', variant: 'success' });

    const hideTimer = useRef<number | null>(null);
    const removeTimer = useRef<number | null>(null);

    function clearTimers() {
        if (hideTimer.current !== null) window.clearTimeout(hideTimer.current);
        if (removeTimer.current !== null) window.clearTimeout(removeTimer.current);
        hideTimer.current = null;
        removeTimer.current = null;
    }

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(providerRequestsOffersStore.url(r.id), {
            preserveScroll: true,
        });
    }

    function contactClient() {
        router.post(providerRequestsContact.url(r.id));
    }

    function pushAlert(
        variant: AlertVariant,
        titleText: string,
        descText: string,
    ) {
        if (typeof window === 'undefined') {
            return;
        }

        clearTimers();

        setAlertContent({ variant, title: titleText, description: descText });
        setShowAlert(true);

        window.setTimeout(() => setAnimate(true), 10);

        hideTimer.current = window.setTimeout(() => {
            setAnimate(false);
            removeTimer.current = window.setTimeout(
                () => setShowAlert(false),
                300,
            );
        }, 8000);
    }

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined') {
                clearTimers();
            }
        };
    }, []);

    useEffect(() => {
        if (flash?.success) {
            pushAlert('success', 'Success', flash.success);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flash?.success]);

    useEffect(() => {
        if (errors?.payment) {
            pushAlert('error', 'Payment error', errors.payment);
        } else if (errors?.status) {
            pushAlert('error', 'Status error', errors.status);
        } else if (errors?.offer) {
            pushAlert('error', 'Offer error', errors.offer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [errors?.offer, errors?.payment, errors?.status]);

    const alertIcon =
        alertContent.variant === 'error' ? (
            <OctagonAlert className="text-red-600" />
        ) : (
            <CheckCircle2Icon className="text-primary" />
        );

    const alertTitleClass =
        alertContent.variant === 'error' ? 'text-red-600' : 'text-primary';

    const alertBgClass =
        alertContent.variant === 'error' ? 'bg-red-500/10' : 'bg-primary/5';

    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard", href: dashboard().url }]}>
            <Head title={r.title} />

            {showAlert ? (
                <div className="fixed right-6 bottom-6 z-50">
                    <Alert
                        className={[
                            alertBgClass,
                            'w-[92vw] shadow-2xl backdrop-blur-sm transition-all duration-300 sm:w-96',
                            animate
                                ? 'translate-y-0 opacity-100'
                                : 'translate-y-2 opacity-0',
                        ].join(' ')}
                    >
                        {alertIcon}
                        <AlertTitle className={alertTitleClass}>
                            {alertContent.title}
                        </AlertTitle>
                        <AlertDescription className="text-foreground">
                            {alertContent.description}
                        </AlertDescription>
                    </Alert>
                </div>
            ) : null}

            <div className="max-w-3xl space-y-4 rounded-4xl bg-primary-foreground/30 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">{r.title}</h1>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="rounded-3xl border border-gray-200 px-3 py-2 text-sm text-red-600 transition duration-700 hover:bg-red-600 hover:text-white"
                    >
                        Back
                    </button>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="text-xl font-bold break-words sm:text-2xl">
                                {r.title}
                            </div>

                            <div className="mt-2 flex w-full flex-wrap items-center gap-2 rounded-3xl border border-gray-200 p-1 text-sm text-foreground sm:w-max">
                                <span className="break-words">
                                    <div className="mt-2 mb-2 flex w-full items-center justify-center gap-2 rounded-3xl text-sm text-foreground sm:w-max">
                                        <span className="inline-flex min-w-0 items-center gap-2">
                                            {r.client?.avatar_path ? (
                                                <img
                                                    src={r.client.avatar_path}
                                                    alt={r.client.name}
                                                    className="h-6 w-6 rounded-full border object-cover"
                                                />
                                            ) : (
                                                <span className="h-6 w-6" />
                                            )}
                                            <span className="max-w-[220px] truncate font-medium sm:max-w-none">
                                                {r.client?.name}
                                            </span>
                                        </span>
                                    </div>
                                </span>

                                <div className="flex items-center gap-1 rounded-3xl border border-gray-200 p-2">
                                    <MapPin className="text-red-600" />
                                    <span className="break-words">
                                        {r.city?.name}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-2 text-sm text-foreground">
                                <span className="flex w-full flex-col gap-2 rounded-4xl border border-gray-200 p-1 font-medium sm:w-max sm:flex-row sm:items-center">
                                    <div className="flex w-full items-center gap-1 rounded-4xl border border-gray-200 p-1 font-bold text-primary sm:w-auto">
                                        Min{' '}
                                        <div className="w-full rounded-4xl p-2 text-center sm:w-auto">
                                            {r.budget_min ?? 'â€”'} DZD
                                        </div>
                                    </div>

                                    <div className="flex w-full items-center gap-1 rounded-4xl border border-gray-200 p-1 font-bold text-red-600 sm:w-auto">
                                        Max{' '}
                                        <div className="w-full p-2 text-center sm:w-auto">
                                            {r.budget_max ?? 'â€”'} DZD
                                        </div>
                                    </div>
                                </span>

                                <div className="mt-2 flex w-full flex-wrap items-center gap-2 rounded-3xl border border-gray-200 p-1 text-sm text-foreground sm:w-max">
                                    {r.urgency ? (
                                        <>
                                            Urgency{' '}
                                            {r.urgency === 'high' ? (
                                                <span className="inline-flex items-center gap-1 font-bold">
                                                    <div className="flex items-center gap-2 rounded-3xl border border-gray-200 p-2 text-red-600">
                                                        <Clock /> {r.urgency}
                                                    </div>
                                                </span>
                                            ) : r.urgency === 'medium' ? (
                                                <span className="flex items-center gap-2 rounded-3xl border border-gray-200 p-2 text-yellow-600">
                                                    <Clock /> {r.urgency}
                                                </span>
                                            ) : r.urgency === 'low' ? (
                                                <span className="inline-flex items-center gap-2 rounded-3xl border border-gray-200 p-2 font-bold text-primary">
                                                    <Clock /> {r.urgency}
                                                </span>
                                            ) : null}
                                        </>
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 line-clamp-2 rounded-4xl border border-gray-200 p-2 text-sm text-foreground">
                        <div className="font-bold">Description</div>
                        {r.description}
                    </div>
                </div>

                {/* âœ… Photos (manual slider + thumbnails bottom) */}
                <div className="rounded-md border p-4">
                    <h2 className="font-medium">Photos</h2>

                    {images.length === 0 ? (
                        <p className="mt-2 text-sm text-foreground">
                            No photos.
                        </p>
                    ) : (
                        <MarketplacePhotoSlider
                            images={images}
                            publicImagePath={publicImagePath}
                        />
                    )}
                </div>

                {/* Offer form */}
                <div className="rounded-md border p-4">
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="font-medium">Send an Offer</h2>
                        <button
                            type="button"
                            onClick={contactClient}
                            className="rounded-3xl border border-gray-200 px-4 py-2 text-sm transition duration-700 hover:bg-foreground hover:text-background hover:shadow-xl"
                        >
                            Contact client
                        </button>
                    </div>
                    {props.has_offer ? (
                        <p className="mt-1 text-sm text-foreground">
                            You already sent an offer for this request.
                        </p>
                    ) : (
                        <>
                            <p className="mt-1 text-sm text-foreground">
                                Fill these fields and click{' '}
                                <span className="font-medium">Send Offer</span>.
                            </p>

                            <form onSubmit={submit} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium">
                                        Message
                                    </label>
                                    <textarea
                                        className="mt-1 w-full rounded-md border p-2"
                                        rows={4}
                                        value={form.data.message}
                                        onChange={(e) =>
                                            form.setData(
                                                'message',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Example: I can do it tomorrow. I will bring all tools..."
                                    />
                                    {form.errors.message ? (
                                        <div className="mt-1 text-sm text-red-600">
                                            {form.errors.message}
                                        </div>
                                    ) : null}
                                </div>

                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium">
                                            Proposed Price (DZD)
                                        </label>
                                        <input
                                            type="number"
                                            className="mt-1 w-full rounded-md border p-2"
                                            value={form.data.proposed_price}
                                            onChange={(e) =>
                                                form.setData(
                                                    'proposed_price',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Example: 5000"
                                        />
                                        {form.errors.proposed_price ? (
                                            <div className="mt-1 text-sm text-red-600">
                                                {form.errors.proposed_price}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium">
                                            Estimated Days (optional)
                                        </label>
                                        <input
                                            type="number"
                                            className="mt-1 w-full rounded-md border p-2"
                                            value={form.data.estimated_days}
                                            onChange={(e) =>
                                                form.setData(
                                                    'estimated_days',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Example: 2"
                                        />
                                        {form.errors.estimated_days ? (
                                            <div className="mt-1 text-sm text-red-600">
                                                {form.errors.estimated_days}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-3xl bg-primary px-4 py-2 text-sm text-white"
                                >
                                    {form.processing
                                        ? 'Sending...'
                                        : 'Send Offer'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}

function MarketplacePhotoSlider({
    images,
    publicImagePath,
}: {
    images: { id: number; path: string }[];
    publicImagePath: (p: string) => string;
}) {
    const [active, setActive] = useState(0);

    const canPrev = active > 0;
    const canNext = active < images.length - 1;

    const prev = () => canPrev && setActive((i) => i - 1);
    const next = () => canNext && setActive((i) => i + 1);

    // center-ish thumbnails when many
    const thumbWidth = 72;
    const thumbGap = 8;
    const thumbStripLeft = useMemo(() => {
        const x = active * (thumbWidth + thumbGap);
        return Math.max(0, x - 2 * (thumbWidth + thumbGap));
    }, [active]);

    return (
        <div className="mt-3 space-y-3">
            {/* Main viewer */}
            <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-primary-foreground/30">
                <img
                    src={publicImagePath(images[active].path)}
                    alt={`Photo ${active + 1}`}
                    className="h-[260px] w-full object-cover select-none sm:h-[340px] md:h-[420px]"
                    draggable={false}
                />

                {/* Counter */}
                <div className="absolute top-3 right-3 rounded-full bg-black/55 px-3 py-1 text-xs text-white">
                    {active + 1} / {images.length}
                </div>

                {/* Prev */}
                <button
                    type="button"
                    onClick={prev}
                    disabled={!canPrev}
                    className={`absolute top-1/2 left-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white transition ${
                        canPrev
                            ? 'hover:bg-black/55'
                            : 'cursor-not-allowed opacity-40'
                    }`}
                    aria-label="Previous photo"
                >
                    <ChevronLeft/>
                </button>

                {/* Next */}
                <button
                    type="button"
                    onClick={next}
                    disabled={!canNext}
                    className={`absolute top-1/2 right-3 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/40 text-white transition ${
                        canNext
                            ? 'hover:bg-black/55'
                            : 'cursor-not-allowed opacity-40'
                    }`}
                    aria-label="Next photo"
                >
                    <ChevronRight/>
                </button>
            </div>

            {/* Thumbnails bottom */}
            <div className="rounded-xl border border-gray-200 bg-primary-foreground/30 p-2">
                <div className="overflow-x-auto">
                    <div
                        className="flex gap-2"
                        style={{
                            transform: `translateX(-${thumbStripLeft}px)`,
                        }}
                    >
                        {images.map((img, idx) => {
                            const isActive = idx === active;

                            return (
                                <button
                                    key={img.id}
                                    type="button"
                                    onClick={() => setActive(idx)}
                                    className={`relative shrink-0 overflow-hidden rounded-lg border transition ${
                                        isActive
                                            ? 'border-primary ring-2 ring-primary/40'
                                            : 'border-gray-200 hover:border-primary/60'
                                    }`}
                                    aria-label={`Select photo ${idx + 1}`}
                                >
                                    <img
                                        src={publicImagePath(img.path)}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="h-[56px] w-[72px] object-cover"
                                        draggable={false}
                                    />
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
