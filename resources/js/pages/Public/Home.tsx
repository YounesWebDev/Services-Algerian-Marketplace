import { Button } from '@headlessui/react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    AirVent,
    BadgeCheck,
    Camera,
    Car,
    CreditCard,
    Flag,
    GraduationCap,
    Hammer,
    Languages,
    Laptop,
    Leaf,
    MessageCircleMore,
    Paintbrush,
    Plug,
    Scissors,
    Shield,
    ShieldHalf,
    Sparkles,
    Star,
    Tag,
    Wrench,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import GlassIcons from '@/components/GlassIcons';
import Navbar from '@/components/navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { about, contact, terms } from '@/routes';
import { suggestions as homeSuggestions } from '@/routes/home';
import {
    index as servicesIndex,
    show as servicesShow,
} from '@/routes/services';
import { type SharedData } from '@/types';

const HERO_IMAGES = [
    '/hero/njar.jpg',
    '/hero/mason.jpg',
    '/hero/laptop.jpg',
    '/hero/coding.jpg',
];

type Provider = {
    id: number;
    name: string;
    avatar_path?: string | null;
};
type ServiceMedia = {
    id: number;
    path: string;
    type: string;
    position: number;
};
type Category = { id: number; name: string; slug: string };
type City = { id: number; name: string };
type Service = {
    id: number;
    title: string;
    slug: string;
    base_price: string | null;
    pricing_type: string;
    payment_type: string;
    city_id: number;
    category_id: number;
    media?: ServiceMedia[];
    provider?: Provider;
};

type Suggestions = {
    services: { id: number; title: string; slug: string }[];
    categories: { id: number; name: string; slug: string }[];
};

// Choose icon based on category name (simple keywords)
function categoryIcon(name: string) {
    const key = name.toLowerCase();

    if (key.includes('plumb')) return Wrench;
    if (key.includes('electric')) return Plug;
    if (key.includes('paint')) return Paintbrush;
    if (key.includes('clean')) return Sparkles;
    if (key.includes('car')) return Car;
    if (key.includes('computer') || key.includes('laptop')) return Laptop;
    if (key.includes('photo')) return Camera;
    if (key.includes('carpent') || key.includes('mason')) return Hammer;
    if (key.includes('garden')) return Leaf;
    if (key.includes('pest')) return Shield;
    if (key.includes('lesson') || key.includes('course')) return GraduationCap;
    if (key.includes('translat') || key.includes('language')) return Languages;
    if (key.includes('hair') || key.includes('makeup')) return Scissors;
    if (key.includes('air')) return AirVent;

    return Tag;
}

function toStorageUrl(path: string) {
    if (!path) return '';

    if (path.startsWith('/storage/')) return path;

    if (path.startsWith('storage/')) return '/' + path;

    return '/storage/' + path;
}

function getCoverImage(service: Service) {
    if (!service.media || service.media.length === 0) return '';

    const first = service.media[0];

    return toStorageUrl(first.path);
}

function getInitials(name?: string | null) {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : '';
    return (first + last).toUpperCase() || 'U';
}

type HeroBackgroundSliderProps = {
    images: string[];
    intervalMs?: number;
};

function HeroBackgroundSlider({
    images,
    intervalMs = 10000,
}: HeroBackgroundSliderProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (images.length <= 1) {
            return;
        }

        const interval = window.setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % images.length);
        }, intervalMs);

        return () => window.clearInterval(interval);
    }, [images, intervalMs]);

    useEffect(() => {
        images.slice(1).forEach((src) => {
            const image = new Image();
            image.src = src;
        });
    }, [images]);

    if (images.length === 0) {
        return null;
    }

    return (
        <div className="absolute inset-0 contain-[paint]" aria-hidden="true">
            {images.map((image, index) => (
                <img
                    key={image}
                    src={image}
                    alt=""
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={index === 0 ? 'high' : 'low'}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out will-change-[opacity] motion-reduce:transition-none ${
                        index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                />
            ))}
        </div>
    );
}
export default function Home({
    featuredCategories = [],
    topCities = [],
    popularServices = [],
    filters,
}: {
    canRegister: boolean;
    featuredCategories: Category[];
    topCities: City[];
    popularServices: Service[];
    filters: { q: string; city: string; category: string };
}) {
    // Controlled inputs (so we can update without reloading)
    const [query, setQuery] = useState(filters?.q ?? '');
    const [city, setCity] = useState(filters?.city ?? '');
    const [category, setCategory] = useState(filters?.category ?? '');

    // Suggestions dropdown
    const [suggestions, setSuggestions] = useState<Suggestions>({
        services: [],
        categories: [],
    });
    const [open, setOpen] = useState(false);

    // Cancel old fetch requests when typing fast
    const abortRef = useRef<AbortController | null>(null);

    // Loader ref for auto-scrolling categories
    const loaderRef = useRef<HTMLDivElement>(null);

    const services = popularServices;

    // OK: keep "clear suggestions" behavior
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        const text = value.trim();

        // If less than 2 chars: close suggestions immediately
        if (text.length < 2) {
            // cancel any inflight request
            abortRef.current?.abort();
            abortRef.current = null;

            setSuggestions({ services: [], categories: [] });
            setOpen(false);
        }
    };

    // Fetch suggestions when user types
    useEffect(() => {
        const text = query.trim();

        // OK: do nothing when less than 2 chars
        if (text.length < 2) return;

        const timer = setTimeout(async () => {
            try {
                // Cancel previous request
                abortRef.current?.abort();

                const controller = new AbortController();
                abortRef.current = controller;

                const res = await fetch(
                    homeSuggestions.url({ query: { q: text } }),
                    {
                        signal: controller.signal,
                    },
                );

                const data = await res.json();

                setSuggestions({
                    services: data.services ?? [],
                    categories: data.categories ?? [],
                });

                setOpen(true);
            } catch {
                // ignore abort errors
            }
        }, 250); // small delay to avoid too many requests

        return () => clearTimeout(timer);
    }, [query]);

    // Run search WITHOUT full page reload (Inertia request)
    function runSearch() {
        if (query.length < 2 && city === '' && category === '') {
            return;
        }
        router.get(
            servicesIndex.url({
                query: { q: query, city: city || '', category: category || '' },
            }),
            {},
            { preserveState: true, replace: true },
        );
    }
    const { auth } = usePage<SharedData>().props;
    const user = auth?.user ?? null;
    const items = [
        { icon: <BadgeCheck />, color: 'green', label: 'Verified Providers' },
        { icon: <CreditCard />, color: 'green', label: 'Online Payment' },
        { icon: <Star />, color: 'green', label: 'rating & reviews' },
        { icon: <MessageCircleMore />, color: 'green', label: 'live chat' },
        { icon: <Flag />, color: 'green', label: 'Reports' },
        { icon: <ShieldHalf />, color: 'green', label: 'safety' },
    ];
    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <div className=" top-2 right-0 left-0 z-10 flex max-w-screen items-center fixed justify-center px-6">
                <Navbar user={user} canRegister={true} />
            </div>
            {/* Hero */}
            <div className="relative h-screen overflow-hidden">
                <HeroBackgroundSlider images={HERO_IMAGES} />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-linear-to-b from-black/30 to-black/50"></div>

                {/* Content */}
                <div className="relative mx-auto w-full max-w-6xl flex-col items-start justify-center space-y-6 px-6 py-28 text-white md:flex">
                    {/* Title */}
                    <h1 className="text-3xl leading-tight font-bold md:text-5xl">
                        Hire Professionals for Any Job, Fast
                    </h1>

                    {/* Subtitle */}
                    <p className="text-sm md:text-base">
                        Search, chat, and hire providers - all in one place.
                    </p>

                    {/* Search Bar */}
                    <div className="flex flex-col gap-3 rounded-4xl border border-gray-300 bg-white/20 p-3 backdrop-blur-3xl md:flex-row md:items-center">
                        {/* Search input + suggestions */}
                        <div className="relative w-full md:flex-1">
                            <input
                                value={query}
                                onChange={handleQueryChange}
                                onFocus={() => {
                                    if (query.trim().length >= 2) setOpen(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => setOpen(false), 150);
                                }}
                                placeholder="Search services (e.g. plumber)"
                                className="h-10 w-full rounded-full border px-3 text-sm"
                            />

                            {/* Suggestions dropdown */}
                            {open &&
                                (suggestions.services.length > 0 ||
                                    suggestions.categories.length > 0) && (
                                    <div className="absolute z-50 mt-2 w-full rounded-md border bg-background shadow">
                                        {/* Categories */}
                                        {suggestions.categories.length > 0 && (
                                            <div className="p-2">
                                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                                    Categories
                                                </div>
                                                {suggestions.categories.map(
                                                    (c) => (
                                                        <button
                                                            key={c.id}
                                                            type="button"
                                                            className="w-full px-3 py-2 text-left text-sm text-black hover:bg-muted"
                                                            onMouseDown={() => {
                                                                setOpen(false);
                                                                setCategory(
                                                                    c.slug,
                                                                );
                                                                router.get(
                                                                    servicesIndex.url(
                                                                        {
                                                                            query: {
                                                                                category:
                                                                                    c.slug ||
                                                                                    '',
                                                                                city:
                                                                                    city ||
                                                                                    '',
                                                                            },
                                                                        },
                                                                    ),
                                                                    {},
                                                                    {
                                                                        preserveState: true,
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            {c.name}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}

                                        {/* Services */}
                                        {suggestions.services.length > 0 && (
                                            <div className="border-t p-2">
                                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                                    Services
                                                </div>
                                                {suggestions.services.map(
                                                    (s) => (
                                                        <button
                                                            key={s.id}
                                                            type="button"
                                                            className="w-full px-3 py-2 text-left text-sm text-black hover:bg-muted"
                                                            onMouseDown={() => {
                                                                setOpen(false);
                                                                router.get(
                                                                    servicesShow.url(
                                                                        s.slug,
                                                                    ),
                                                                );
                                                            }}
                                                        >
                                                            {s.title}
                                                        </button>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>

                        {/* City */}
                        <select
                            value={city}
                            onChange={(
                                e: React.ChangeEvent<HTMLSelectElement>,
                            ) => setCity(e.target.value)}
                            className="text-forground h-10 w-full rounded-4xl border px-3 text-sm transition hover:text-primary md:w-56"
                        >
                            <option value="">All wilayas</option>
                            {topCities.map((c) => (
                                <option key={c.id} value={String(c.id)}>
                                    {c.name}
                                </option>
                            ))}
                        </select>

                        {/* Category */}
                        <select
                            value={category}
                            onChange={(
                                e: React.ChangeEvent<HTMLSelectElement>,
                            ) => setCategory(e.target.value)}
                            className="text-muted-forground h-10 w-full rounded-4xl border px-3 text-sm transition hover:text-primary md:w-56"
                        >
                            <option value="">All categories</option>
                            {featuredCategories.map((cat) => (
                                <option key={cat.id} value={String(cat.slug)}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>

                        {/* Search Button */}
                        <button
                            type="button"
                            onClick={runSearch}
                            className="h-10 w-full rounded-4xl bg-primary text-sm font-medium text-primary-foreground transition duration-300 hover:bg-white hover:text-black md:w-32"
                        >
                            Search
                        </button>
                    </div>

                    {/* Category pills with icons */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {featuredCategories.slice(0, 10).map((cat) => {
                            const Icon = categoryIcon(cat.name);
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => {
                                        setCategory(String(cat.id));
                                        router.get(
                                            servicesIndex.url({
                                                query: {
                                                    q: '',
                                                    city: city || '',
                                                    category: cat.slug,
                                                },
                                            }),
                                            {},
                                            { preserveState: true },
                                        );
                                    }}
                                    className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-all hover:bg-muted hover:text-primary"
                                >
                                    <Icon className="h-4 w-4" />
                                    <span>{cat.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Auto-scrolling category squares */}
            <h2 className="mt-5 mb-5 flex justify-center text-4xl font-bold">
                Popular categories
            </h2>
            <div className="mt-4 overflow-hidden">
                <div
                    ref={loaderRef}
                    className="animate-scroll flex gap-4 whitespace-nowrap"
                >
                    {featuredCategories
                        .concat(featuredCategories)
                        .map((cat, index) => {
                            const Icon = categoryIcon(cat.name);
                            return (
                                <div
                                    key={index}
                                    className="flex h-24 min-w-25 shrink-0 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border p-4 text-center transition-all duration-500 hover:bg-muted hover:px-9 hover:text-primary hover:shadow-sm"
                                >
                                    <Icon className="h-6 w-6 hover:text-primary" />
                                    <span className="text-sm font-medium hover:text-primary">
                                        {cat.name}
                                    </span>
                                </div>
                            );
                        })}
                </div>
            </div>
            {/* Badges */}
            <div className="giborder-t border-gray-forground">
                <h1 className="mt-10 flex justify-center text-xl font-bold">
                    why ProFinder ?
                </h1>
                <div className="flex items-center">
                    <GlassIcons items={items} className="" />
                </div>
            </div>

            {/* Popular services */}
            <div className="h- mx-auto max-w-7xl space-y-4 px-6 py-10">
                <div className="flex items-center justify-center">
                    <h2 className="mb-5 text-4xl font-bold">
                        Popular Services
                    </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {services.map((s) => {
                        const cover = getCoverImage(s);

                        return (
                            <Button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                    if (
                                        user?.role === 'provider' ||
                                        user?.role === 'admin'
                                    )
                                        return;
                                    router.get(servicesShow.url(s.slug));
                                }}
                                className="m-5 flex h-70 flex-col overflow-hidden rounded-3xl border bg-primary-foreground/30 text-left transition-all duration-300 hover:bg-primary-foreground/40 hover:shadow-xl"
                            >
                                {cover ? (
                                    <div className="h-44 w-full overflow-hidden rounded-t-3xl">
                                        <img
                                            src={cover}
                                            alt={s.title}
                                            className="block h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-44 w-full items-center justify-center rounded-t-3xl border-b text-sm text-gray-500">
                                        No photos.
                                    </div>
                                )}

                                {/* content */}
                                <div className="p-4">
                                    <div className="line-clamp-2 font-semibold">
                                        {s.title}
                                    </div>

                                    <div className="flex justify-between">
                                        <div className="mt-2 flex items-center justify-between gap-2">
                                            <Avatar className="size-8">
                                                <AvatarImage
                                                    src={
                                                        s.provider?.avatar_path
                                                            ? toStorageUrl(
                                                                  s.provider
                                                                      .avatar_path,
                                                              )
                                                            : ''
                                                    }
                                                    alt={
                                                        s.provider?.name ??
                                                        'Provider'
                                                    }
                                                />
                                                <AvatarFallback>
                                                    {getInitials(
                                                        s.provider?.name,
                                                    )}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>{s.provider?.name}</div>
                                        </div>
                                        <div className="mt-2 text-xs text-muted-foreground">
                                            Payment: {s.payment_type}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="mt-3 w-max rounded-full border border-gray-200 bg-white/20 px-3 py-2 text-sm text-muted-foreground backdrop-blur-sm transition duration-300 hover:bg-white hover:text-black">
                                            {s.pricing_type}
                                            {s.base_price
                                                ? ` - ${s.base_price} DZD `
                                                : ''}
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        );
                    })}

                    {services.length === 0 && (
                        <div className="text-sm text-muted-foreground">
                            No services found yet .
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="border-t">
                <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-6 py-6 text-sm text-muted-foreground">
                    <div>(c) {new Date().getFullYear()} profinder</div>
                    <div className="flex gap-4">
                        <Link className="hover:underline" href={about.url()}>
                            About
                        </Link>
                        <Link className="hover:underline" href={contact.url()}>
                            Contact
                        </Link>
                        <Link className="hover:underline" href={terms.url()}>
                            Terms
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
