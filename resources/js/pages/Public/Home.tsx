import React, { useEffect, useRef, useState } from "react";
import { Button } from "@headlessui/react";
import { Link, router, usePage } from "@inertiajs/react";
import {
    Tag,
    Wrench,
    Plug,
    Paintbrush,
    Sparkles,
    Car,
    Laptop,
    Camera,
    Hammer,
    Leaf,
    Shield,
    GraduationCap,
    Languages,
    Scissors,
    AirVent,
    Menu,
    X,
} from "lucide-react";

import { dashboard, login, register } from "@/routes";
import { type SharedData } from "@/types";

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
    city_id: number;
    category_id: number;
    media?: ServiceMedia[];
    };

    // Suggestions payload
    type Suggestions = {
    services: { id: number; title: string; slug: string }[];
    categories: { id: number; name: string; slug: string }[];
    };

    // Choose icon based on category name (simple keywords)
    function categoryIcon(name: string) {
    const key = name.toLowerCase();

    if (key.includes("plumb")) return Wrench;
    if (key.includes("electric")) return Plug;
    if (key.includes("paint")) return Paintbrush;
    if (key.includes("clean")) return Sparkles;
    if (key.includes("car")) return Car;
    if (key.includes("computer") || key.includes("laptop")) return Laptop;
    if (key.includes("photo")) return Camera;
    if (key.includes("carpent") || key.includes("mason")) return Hammer;
    if (key.includes("garden")) return Leaf;
    if (key.includes("pest")) return Shield;
    if (key.includes("lesson") || key.includes("course")) return GraduationCap;
    if (key.includes("translat") || key.includes("language")) return Languages;
    if (key.includes("hair") || key.includes("makeup")) return Scissors;
    if (key.includes("air")) return AirVent;

    return Tag;
    }

    export default function Home({
    canRegister,
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
    // Controlled inputs
    const [query, setQuery] = useState(filters?.q ?? "");
    const [city, setCity] = useState(filters?.city ?? "");
    const [category, setCategory] = useState(filters?.category ?? "");
    const [openMenu, setOpenMenu] = useState(false);

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

    // Hero slider state (4 backgrounds)
    const [currentSlide, setCurrentSlide] = useState(0);

    // Keep local services list (you can extend it later)
    const [services, setServices] = useState<Service[]>(popularServices);

    // Update local list if props change (ex: after seeding / reload)
    useEffect(() => {
        setServices(popularServices);
    }, [popularServices]);

    // Auto-rotate hero backgrounds every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % 4);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // ✅ Handler: clear suggestions for short query
    const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        const text = value.trim();

        // If less than 2 chars: close suggestions immediately
        if (text.length < 2) {
        abortRef.current?.abort();
        abortRef.current = null;

        setSuggestions({ services: [], categories: [] });
        setOpen(false);
        }
    };

    // Fetch suggestions when user types (no page reload)
    useEffect(() => {
        const text = query.trim();

        // Do nothing when less than 2 chars
        if (text.length < 2) return;

        const timer = setTimeout(async () => {
        try {
            // Cancel previous request
            abortRef.current?.abort();

            const controller = new AbortController();
            abortRef.current = controller;

            const res = await fetch(`/suggestions?q=${encodeURIComponent(text)}`, {
            signal: controller.signal,
            });

            const data = await res.json();

            setSuggestions({
            services: data.services ?? [],
            categories: data.categories ?? [],
            });

            setOpen(true);
        } catch {
            // ignore abort errors
        }
        }, 250);

        return () => clearTimeout(timer);
    }, [query]);

    // Run search WITHOUT full page reload (Inertia request)
    function runSearch() {
        // optional simple guard
        if (query.trim().length < 2 && city === "" && category === "") return;

        router.get(
        "/services",
        { q: query, city: city || "", category: category || "" },
        { preserveState: true, replace: true }
        );
    }

    const { auth } = usePage<SharedData>().props;

    return (
        <div className="min-h-screen">
        {/* Navbar */}
        <div className="rounded-full mt-5 mx-2 backdrop-blur-sm border border-gray-200 fixed w-full z-30 bg-primary-foreground/30">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link className="hover:text-primary transition" href="/">
                <div className="font-bold text-xl">PROfinder</div>
            </Link>

            <div className="hidden md:flex justify-between gap-15">
                <Link
                className="hover:text-primary hover:border hover:border-primary hover:rounded-full p-1 transition"
                href="/"
                >
                Home
                </Link>
                <Link
                className="hover:text-primary hover:border hover:border-primary hover:rounded-full p-1 transition"
                href="/requests"
                >
                Requests
                </Link>
                <Link
                className="hover:text-primary hover:border hover:border-primary hover:rounded-full p-1 transition"
                href="/services"
                >
                Services
                </Link>
            </div>

            {/* Mobile menu button */}
            <div>
                <Button
                onClick={() => {
                    setOpenMenu(!openMenu);
                }}
                >
                {openMenu ? (
                    <X size={28} className="md:hidden text-black dark:text-white" />
                ) : (
                    <Menu size={28} className="md:hidden text-black dark:text-white" />
                )}
                </Button>

                {/* Mobile dropdown */}
                {openMenu && (
                <div className="flex flex-col">
                    <div className="absolute top-18 right-4 border z-40 bg-white border-gray-200 rounded-xl p-5 flex gap-2 flex-col md:hidden w-[75%]">
                    {auth.user ? (
                        <Link
                        href={dashboard()}
                        className="inline-block rounded-sm border font-bold border-[#19140035] px-5 py-1.5 transition-all hover:backdrop-blur-sm text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                        >
                        Dashboard
                        </Link>
                    ) : (
                        <>
                        <Link
                            href={login()}
                            className="inline-block font-bold rounded-sm border border-transparent transition-all hover:backdrop-blur-sm px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                        >
                            Log in
                        </Link>

                        {canRegister && (
                            <Link
                            href={register()}
                            className="inline-block font-bold rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal transition-all hover:backdrop-blur-sm text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                            Register
                            </Link>
                        )}
                        </>
                    )}

                    <div>
                        <Link
                        className="hover:text-primary hover:border hover:border-primary hover:rounded-full p-1 transition"
                        href="/"
                        >
                        Home
                        </Link>
                    </div>
                    <div>
                        <Link
                        className="hover:text-primary hover:border hover:border-primary hover:rounded-full p-1 transition"
                        href="/requests"
                        >
                        Requests
                        </Link>
                    </div>
                    <div>
                        <Link
                        className="hover:text-primary hover:border hover:border-primary hover:rounded-full p-1 transition"
                        href="/services"
                        >
                        Services
                        </Link>
                    </div>
                    </div>
                </div>
                )}
            </div>

            {/* Desktop auth buttons */}
            <div className="hidden md:flex justify-between gap-3 text-sm">
                {auth.user ? (
                <Link
                    href={dashboard()}
                    className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                >
                    Dashboard
                </Link>
                ) : (
                <>
                    <Link
                    href={login()}
                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                    >
                    Log in
                    </Link>

                    {canRegister && (
                    <Link
                        href={register()}
                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                    >
                        Register
                    </Link>
                    )}
                </>
                )}
            </div>
            </div>
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden h-screen">
            {/* Background slider with 4 local images */}
            {[
            "./hero/njar.jpg",
            "./hero/mason.jpg",
            "./hero/laptop.jpg",
            "./hero/coding.jpg",
            ].map((img: string, index: number) => (
            <div
                key={img}
                className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
                style={{ backgroundImage: `url('${img}')` }}
            />
            ))}

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/50"></div>

            {/* Content */}
            <div className="w-full md:flex items-start flex-col justify-center relative mx-auto max-w-6xl px-6 py-28 space-y-6 text-white">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Hire Professionals for Any Job, Fast
            </h1>

            <p className="text-sm md:text-base">
                Search, chat, and hire providers — all in one place.
            </p>

            {/* Search Bar */}
            <div className="bg-white/20 backdrop-blur-3xl dark:bg-black/70 border border-gray-300 rounded-4xl p-3 flex flex-col md:flex-row gap-3 md:items-center">
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
                    className="h-10 w-full rounded-full border px-3 text-sm text-black"
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

                            {suggestions.categories.map((c) => (
                            <button
                                key={c.id}
                                type="button"
                                className="w-full text-left px-3 py-2 text-black text-sm hover:bg-muted"
                                onMouseDown={() => {
                                setOpen(false);
                                setCategory(c.slug);

                                router.get(
                                    "/services",
                                    { category: c.slug || "", city: city || "" },
                                    { preserveState: true }
                                );
                                }}
                            >
                                {c.name}
                            </button>
                            ))}
                        </div>
                        )}

                        {/* Services */}
                        {suggestions.services.length > 0 && (
                        <div className="p-2 border-t">
                            <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                            Services
                            </div>

                            {suggestions.services.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                className="w-full text-left px-3 py-2 text-black text-sm hover:bg-muted"
                                onMouseDown={() => {
                                setOpen(false);
                                router.get(`/services/${s.slug}`);
                                }}
                            >
                                {s.title}
                            </button>
                            ))}
                        </div>
                        )}
                    </div>
                    )}
                </div>

                {/* City */}
                <select
                value={city}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCity(e.target.value)
                }
                className="h-10 w-full md:w-56 rounded-md border px-3 text-sm text-black"
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
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setCategory(e.target.value)
                }
                className="h-10 w-full md:w-56 rounded-md border px-3 text-sm text-black"
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
                className="h-10 w-full md:w-32 rounded-md bg-primary text-primary-foreground text-sm font-medium"
                >
                Search
                </button>
            </div>

            {/* Category pills with icons */}
            <div className="flex flex-wrap gap-2 mt-4">
                {featuredCategories.slice(0, 10).map((cat) => {
                const Icon = categoryIcon(cat.name);

                return (
                    <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                        setCategory(String(cat.slug));

                        router.get(
                        "/services",
                        { q: "", city: city || "", category: cat.slug },
                        { preserveState: true }
                        );
                    }}
                    className="px-3 py-2 border rounded-full text-sm hover:bg-muted flex items-center gap-2"
                    >
                    <Icon className="h-4 w-4" />
                    <span>{cat.name}</span>
                    </button>
                );
                })}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-4 text-sm mt-4">
                <span>✅ Verified providers</span>
                <span>💬 Realtime chat</span>
                <span>💳 Cash or online payment</span>
                <span>⭐ Ratings & reviews</span>
            </div>
            </div>
        </div>

        {/* Auto-scrolling category squares */}
        <div className="overflow-hidden mt-4">
            <div ref={loaderRef} className="flex gap-4 whitespace-nowrap animate-scroll">
            {featuredCategories.concat(featuredCategories).map((cat, index) => {
                const Icon = categoryIcon(cat.name);

                return (
                <div
                    key={index}
                    className="min-w-[100px] h-24 border rounded-lg p-4 text-center flex flex-col items-center justify-center gap-2 shrink-0"
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

        {/* Popular services */}
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-4">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Popular services</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s) => {
                const cover = s.media?.[0]?.path ?? "/images/service-placeholder.jpg";

                return (
                <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                    router.get(`/services/${s.slug}`);
                    }}
                    className="text-left border rounded-lg p-4 hover:bg-muted/40 transition"
                    title="Click to see service details"
                >
                    {/* ✅ Cover image from service_media */}
                    <img
                    src={cover}
                    alt={s.title}
                    className="h-32 w-full rounded-md object-cover border mb-3"
                    />

                    <div className="font-semibold line-clamp-2">{s.title}</div>

                    <div className="mt-2 text-sm text-muted-foreground">
                    {s.pricing_type}
                    {s.base_price ? ` • ${s.base_price} DZD` : ""}
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                    Click to see details
                    </div>
                </button>
                );
            })}

            {services.length === 0 && (
                <div className="text-md font-semibold text-muted-foreground">
                No services found yet.
                </div>
            )}
            </div>
        </div>

        {/* Footer */}
        <div className="border-t">
            <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground flex flex-wrap gap-4 justify-between">
            <div>© {new Date().getFullYear()} DZ Services</div>
            <div className="flex gap-4">
                <a className="hover:underline" href="/about">
                About
                </a>
                <a className="hover:underline" href="/contact">
                Contact
                </a>
                <a className="hover:underline" href="/terms">
                Terms
                </a>
            </div>
            </div>
        </div>
        </div>
    );
    }
