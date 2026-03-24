import { Head, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { useState } from 'react';

import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import {

    update as providerServicesUpdate,
} from '@/routes/provider/my/services';

type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Media = {
    id: number;
    service_id: number;
    path: string;
    type: string;
    position: number;
};

type Service = {
    id: number;
    title: string;
    description: string;
    base_price: string | number | null;
    pricing_type: string;
    payment_type: string;
    category_id: number;
    city_id: number;
    media: Media[];
};

const publicImagePath = (path?: string | null): string => {
    if (!path) {
        return '';
    }

    if (path.startsWith('http') || path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
};

export default function ProviderServicesEdit(props: {
    service: Service;
    categories: Category[];
    cities: City[];
}) {
    const { service, categories, cities } = props;
    const initialExistingMedia = (service.media ?? [])
        .slice()
        .sort((a, b) => a.position - b.position);
    const [existingMedia, setExistingMedia] =
        useState<Media[]>(initialExistingMedia);

    const form = useForm({
        category_id: String(service.category_id ?? ''),
        city_id: String(service.city_id ?? ''),
        title: service.title ?? '',
        description: service.description ?? '',
        base_price: service.base_price ?? '',
        pricing_type: service.pricing_type ?? 'fixed',
        payment_type: service.payment_type ?? 'cash',
        remove_media_ids: [] as number[],
        cover_media_id: (initialExistingMedia[0]?.id ?? null) as number | null,
        cover_new_photo_index: null as number | null,
        photos: [] as File[],
    });
    const hasCoverFromNewPhotos =
        form.data.cover_media_id === null &&
        form.data.cover_new_photo_index !== null;

    function setCoverAsExisting(mediaId: number) {
        setExistingMedia((current) => {
            const selectedMedia = current.find((media) => media.id === mediaId);

            if (!selectedMedia) {
                return current;
            }

            const remainingMedia = current.filter(
                (media) => media.id !== mediaId,
            );

            return [selectedMedia, ...remainingMedia];
        });
        form.setData('cover_media_id', mediaId);
        form.setData('cover_new_photo_index', null);
    }

    function setCoverAsNew(photoIndex: number) {
        const currentPhotos = (form.data.photos ?? []) as File[];
        const selectedPhoto = currentPhotos[photoIndex];

        if (!selectedPhoto) {
            return;
        }

        const nextPhotos = [
            selectedPhoto,
            ...currentPhotos.filter((_, idx) => idx !== photoIndex),
        ];

        form.setData('photos', nextPhotos);
        form.setData('cover_media_id', null);
        form.setData('cover_new_photo_index', 0);
    }

    function removeExistingPhoto(mediaId: number) {
        const nextExistingMedia = existingMedia.filter(
            (media) => media.id !== mediaId,
        );
        setExistingMedia(nextExistingMedia);

        form.setData('remove_media_ids', [
            ...form.data.remove_media_ids.filter((id) => id !== mediaId),
            mediaId,
        ]);

        if (form.data.cover_media_id === mediaId) {
            if (nextExistingMedia.length > 0) {
                setCoverAsExisting(nextExistingMedia[0].id);
                return;
            }

            if ((form.data.photos as File[]).length > 0) {
                setCoverAsNew(0);
                return;
            }

            form.setData('cover_media_id', null);
            form.setData('cover_new_photo_index', null);
        }
    }

    function removeNewPhoto(indexToRemove: number) {
        const currentPhotos = (form.data.photos ?? []) as File[];
        const nextPhotos = currentPhotos.filter(
            (_, idx) => idx !== indexToRemove,
        );

        form.setData('photos', nextPhotos);

        if (form.data.cover_new_photo_index === null) {
            return;
        }

        if (form.data.cover_new_photo_index === indexToRemove) {
            if (existingMedia.length > 0) {
                setCoverAsExisting(existingMedia[0].id);
                return;
            }

            if (nextPhotos.length > 0) {
                setCoverAsNew(0);
                return;
            }

            form.setData('cover_media_id', null);
            form.setData('cover_new_photo_index', null);

            return;
        }

        if (form.data.cover_new_photo_index > indexToRemove) {
            form.setData(
                'cover_new_photo_index',
                form.data.cover_new_photo_index - 1,
            );
        }
    }

    function clearNewPhotos() {
        form.setData('photos', []);

        if (form.data.cover_new_photo_index !== null) {
            if (existingMedia.length > 0) {
                setCoverAsExisting(existingMedia[0].id);
                return;
            }

            form.setData('cover_media_id', null);
            form.setData('cover_new_photo_index', null);
        }
    }

    function submit(e: FormEvent) {
        e.preventDefault();

        form.transform((data) => ({
            ...data,
            _method: 'put',
        }));

        form.post(providerServicesUpdate(service.id).url, {
            forceFormData: true,
        });
    }
    return (
        <AppLayout breadcrumbs={[{ title: "Dashboard", href: dashboard().url }]}>
            <Head title="Edit Service" />

            <div className="max-w-2xl space-y-4 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-primary">
                        Edit Service
                    </h1>
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="rounded-3xl border border-gray-200 bg-foreground p-2 px-3 text-background transition duration-700 hover:bg-red-600"
                    >
                        Back
                    </button>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* CATEGORY */}
                    <div>
                        <label className="block text-sm font-medium">
                            Category
                        </label>
                        <select
                            className="mt-1 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 p-2"
                            value={form.data.category_id}
                            onChange={(e) =>
                                form.setData('category_id', e.target.value)
                            }
                        >
                            <option value="">Select category...</option>
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.category_id && (
                            <div className="mt-1 text-sm text-red-600">
                                {form.errors.category_id}
                            </div>
                        )}
                    </div>

                    {/* CITY */}
                    <div>
                        <label className="block text-sm font-medium">
                            City
                        </label>
                        <select
                            className="mt-1 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 p-2"
                            value={form.data.city_id}
                            onChange={(e) =>
                                form.setData('city_id', e.target.value)
                            }
                        >
                            <option value="">Select city...</option>
                            {cities.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {form.errors.city_id && (
                            <div className="mt-1 text-sm text-red-600">
                                {form.errors.city_id}
                            </div>
                        )}
                    </div>

                    {/* TITLE */}
                    <div>
                        <label className="block text-sm font-medium">
                            Title
                        </label>
                        <input
                            className="mt-1 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 p-2"
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            placeholder="Example: Plumbing repair"
                        />
                        {form.errors.title && (
                            <div className="mt-1 text-sm text-red-600">
                                {form.errors.title}
                            </div>
                        )}
                    </div>

                    {/* DESCRIPTION */}
                    <div>
                        <label className="block text-sm font-medium">
                            Description
                        </label>
                        <textarea
                            className="mt-1 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 p-2"
                            rows={5}
                            value={form.data.description}
                            onChange={(e) =>
                                form.setData('description', e.target.value)
                            }
                        />
                        {form.errors.description && (
                            <div className="mt-1 text-sm text-red-600">
                                {form.errors.description}
                            </div>
                        )}
                    </div>

                    {/* PRICING + PAYMENT */}
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium">
                                Pricing type
                            </label>
                            <select
                                className="mt-1 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 p-2"
                                value={form.data.pricing_type}
                                onChange={(e) =>
                                    form.setData('pricing_type', e.target.value)
                                }
                            >
                                <option value="fixed">Fixed</option>
                                <option value="hourly">Hourly</option>
                                <option value="quote">Quote</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium">
                                Payment type
                            </label>
                            <select
                                className="mt-1 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 p-2"
                                value={form.data.payment_type}
                                onChange={(e) =>
                                    form.setData('payment_type', e.target.value)
                                }
                            >
                                <option value="cash">Cash</option>
                                <option value="online">Online</option>
                                <option value="both">Both</option>
                            </select>
                        </div>
                    </div>

                    {/* BASE PRICE */}
                    <div>
                        <label className="block text-sm font-medium">
                            Base price (optional)
                        </label>
                        <input
                            type="number"
                            className="mt-1 w-full rounded-4xl border border-gray-200 bg-primary-foreground/30 p-2"
                            value={form.data.base_price}
                            onChange={(e) =>
                                form.setData('base_price', e.target.value)
                            }
                        />
                    </div>

                    {/* EXISTING PHOTOS */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium">
                            Photos{' '}
                            <span className="text-muted-foreground">
                                (PNG/JPG/WebP)
                            </span>
                        </label>

                        {/* Dropzone */}
                        <div
                            className="group relative rounded-4xl border border-dashed border-gray-300 bg-background p-4 transition hover:border-gray-400 hover:shadow-sm"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const dropped = Array.from(
                                    e.dataTransfer.files || [],
                                ).filter((f) =>
                                    [
                                        'image/png',
                                        'image/jpeg',
                                        'image/webp',
                                    ].includes(f.type),
                                );
                                if (!dropped.length) return;

                                // merge with existing photos
                                const current = (form.data.photos ??
                                    []) as File[];
                                const next = [...current, ...dropped];

                                form.setData('photos', next);

                                if (
                                    form.data.cover_media_id === null &&
                                    form.data.cover_new_photo_index === null &&
                                    existingMedia.length === 0 &&
                                    next.length > 0
                                ) {
                                    setCoverAsNew(0);
                                }
                            }}
                        >
                            <input
                                id="photos"
                                type="file"
                                multiple
                                accept="image/png,image/jpeg,image/webp"
                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                                onChange={(e) => {
                                    const picked = Array.from(
                                        e.target.files ?? [],
                                    );
                                    if (!picked.length) return;

                                    const current = (form.data.photos ??
                                        []) as File[];
                                    const next = [...current, ...picked];

                                    form.setData('photos', next);

                                    if (
                                        form.data.cover_media_id === null &&
                                        form.data.cover_new_photo_index ===
                                            null &&
                                        existingMedia.length === 0 &&
                                        next.length > 0
                                    ) {
                                        setCoverAsNew(0);
                                    }

                                    // allow re-picking same file again
                                    e.currentTarget.value = '';
                                }}
                            />

                            <div className="flex items-center justify-between gap-3">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Drag & drop images here, or click to
                                        browse
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        You can add multiple photos. Remove any
                                        before submitting.
                                    </p>
                                </div>

                                <div className="shrink-0 rounded-4xl border px-3 py-2 text-xs transition group-hover:bg-foreground group-hover:text-background">
                                    Add photos
                                </div>
                            </div>
                        </div>

                        {/* Existing photos */}
                        {existingMedia.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-xs text-muted-foreground">
                                    Current photos (remove or choose cover
                                    before saving)
                                </p>
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                                    {existingMedia.map((media, idx) => (
                                        <div
                                            key={media.id}
                                            className={`relative overflow-hidden rounded-3xl border bg-muted ${
                                                form.data.cover_media_id ===
                                                media.id
                                                    ? 'ring-2 ring-primary/70'
                                                    : ''
                                            }`}
                                        >
                                            <img
                                                src={publicImagePath(
                                                    media.path,
                                                )}
                                                alt={`Current photo ${idx + 1}`}
                                                className="h-24 w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeExistingPhoto(
                                                        media.id,
                                                    )
                                                }
                                                className="absolute top-2 right-2 rounded-full bg-background/90 px-2 py-1 text-xs shadow hover:bg-background"
                                                aria-label="Remove existing photo"
                                                title="Remove"
                                            >
                                                X
                                            </button>
                                            <div className="absolute top-2 left-2 rounded-full bg-foreground/80 px-2 py-1 text-xs text-background">
                                                {hasCoverFromNewPhotos
                                                    ? idx + 2
                                                    : idx + 1}
                                            </div>
                                            {form.data.cover_media_id ===
                                            media.id ? (
                                                <span className="absolute right-2 bottom-2 rounded-full bg-background/90 px-2 py-1 text-[10px] shadow">
                                                    Cover
                                                </span>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCoverAsExisting(
                                                            media.id,
                                                        )
                                                    }
                                                    className="absolute right-2 bottom-2 rounded-full bg-background/90 px-2 py-1 text-[10px] shadow hover:bg-background"
                                                    aria-label="Set as cover"
                                                    title="Set as cover"
                                                >
                                                    Make cover
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Previews */}
                        {Array.isArray(form.data.photos) &&
                            (form.data.photos as File[]).length > 0 && (
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
                                    {(form.data.photos as File[]).map(
                                        (file, idx) => {
                                            const url =
                                                URL.createObjectURL(file);
                                            const isCoverNewPhoto =
                                                form.data.cover_media_id ===
                                                    null &&
                                                form.data
                                                    .cover_new_photo_index ===
                                                    idx;

                                            return (
                                                <div
                                                    key={`${file.name}-${file.size}-${idx}`}
                                                    className={`relative overflow-hidden rounded-3xl border bg-muted ${
                                                        isCoverNewPhoto
                                                            ? 'ring-2 ring-primary/70'
                                                            : ''
                                                    }`}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={file.name}
                                                        className="h-24 w-full object-cover"
                                                        onLoad={() =>
                                                            URL.revokeObjectURL(
                                                                url,
                                                            )
                                                        }
                                                    />

                                                    {/* Remove */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeNewPhoto(idx)
                                                        }
                                                        className="absolute top-2 right-2 rounded-full bg-background/90 px-2 py-1 text-xs shadow hover:bg-background"
                                                        aria-label="Remove photo"
                                                        title="Remove"
                                                    >
                                                        X
                                                    </button>

                                                    {/* Order badge like IG */}
                                                    <div className="absolute top-2 left-2 rounded-full bg-foreground/80 px-2 py-1 text-xs text-background">
                                                        {hasCoverFromNewPhotos &&
                                                        idx === 0
                                                            ? 1
                                                            : existingMedia.length +
                                                              idx +
                                                              1}
                                                    </div>
                                                    {isCoverNewPhoto ? (
                                                        <span className="absolute right-2 bottom-2 rounded-full bg-background/90 px-2 py-1 text-[10px] shadow">
                                                            Cover
                                                        </span>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setCoverAsNew(
                                                                    idx,
                                                                )
                                                            }
                                                            className="absolute right-2 bottom-2 rounded-full bg-background/90 px-2 py-1 text-[10px] shadow hover:bg-background"
                                                            aria-label="Set as cover"
                                                            title="Set as cover"
                                                        >
                                                            Make cover
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            )}

                        {/* Optional: clear all */}
                        {Array.isArray(form.data.photos) &&
                            (form.data.photos as File[]).length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearNewPhotos}
                                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                                >
                                    Remove all
                                </button>
                            )}
                    </div>

                    <button
                        type="submit"
                        disabled={form.processing}
                        className="rounded-3xl bg-primary px-4 py-2 text-sm text-white transition duration-700 hover:bg-foreground hover:text-background disabled:opacity-60"
                    >
                        {form.processing ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}


