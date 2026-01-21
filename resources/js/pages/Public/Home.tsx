import React, { useEffect, useRef, useState } from "react";
import { Link, router } from "@inertiajs/react";
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
    } from "lucide-react";

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
    };

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
    // Controlled inputs (so we can update without reloading)
    const [query, setQuery] = useState(filters?.q ?? "");
    const [city, setCity] = useState(filters?.city ?? "");
    const [category, setCategory] = useState(filters?.category ?? "");

    // Suggestions dropdown
    const [suggestions, setSuggestions] = useState<Suggestions>({
        services: [],
        categories: [],
    });
    const [open, setOpen] = useState(false);

    // Cancel old fetch requests when typing fast
    const abortRef = useRef<AbortController | null>(null);

    // Fetch suggestions when user types (no page reload)
    useEffect(() => {
        const text = query.trim();

        // If less than 2 chars: close suggestions
        if (text.length < 2) {
        setSuggestions({ services: [], categories: [] });
        setOpen(false);
        return;
        }

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
        }, 250); // small delay to avoid too many requests

        return () => clearTimeout(timer);
    }, [query]);

    // Run search WITHOUT full page reload (Inertia request)
    function runSearch() {
        router.get(
        "/",
        { q: query, city: city || "", category: category || "" },
        { preserveState: true, replace: true }
        );
    }

    return (
        <div className="min-h-screen">
        {/* Navbar */}
        <div className="border-b">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <div className="font-bold text-xl">DZ Services</div>

            <div className="flex gap-4 text-sm">
                <Link className="hover:underline" href="/">Home</Link>
                <Link className="hover:underline" href="/requests">Requests</Link>
                <Link className="hover:underline" href="/services">Services</Link>
            </div>

            <div className="flex gap-3 text-sm">
                <a className="hover:underline" href="/login">Login</a>
                {canRegister && (
                <a className="px-3 py-1 border rounded hover:bg-muted" href="/register">
                    Register
                </a>
                )}
            </div>
            </div>
        </div>

        {/* Hero (Fiverr-like) */}
        <div className="bg-gradient-to-b from-muted/40 to-background">
            <div className="mx-auto max-w-6xl px-6 py-14 space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Find trusted services in Algeria
            </h1>
            <p className="text-muted-foreground">
                Search, chat, and hire providers — all in one place.
            </p>

            {/* Search Bar */}
            <div className="bg-background border rounded-lg p-3 flex flex-col md:flex-row gap-3 md:items-center">
                {/* Search input + suggestions */}
                <div className="relative w-full md:flex-1">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                    if (query.trim().length >= 2) setOpen(true);
                    }}
                    onBlur={() => {
                    // delay so clicking suggestions works
                    setTimeout(() => setOpen(false), 150);
                    }}
                    placeholder="Search services (e.g. plumber)"
                    className="h-10 w-full rounded-md border px-3 text-sm"
                />

                {/* Suggestions dropdown (no reload) */}
                {open && (suggestions.services.length > 0 || suggestions.categories.length > 0) && (
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
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                            onMouseDown={() => {
                                // set category filter + clear input
                                setCategory(String(c.id));
                                setQuery("");
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
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                            onMouseDown={() => {
                                // fill query
                                setQuery(s.title);
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
                onChange={(e) => setCity(e.target.value)}
                className="h-10 w-full md:w-56 rounded-md border px-3 text-sm"
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
                onChange={(e) => setCategory(e.target.value)}
                className="h-10 w-full md:w-56 rounded-md border px-3 text-sm"
                >
                <option value="">All categories</option>
                {featuredCategories.map((cat) => (
                    <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                    </option>
                ))}
                </select>

                {/* Search button (Inertia, no full reload) */}
                <button
                type="button"
                onClick={runSearch}
                className="h-10 w-full md:w-32 rounded-md bg-primary text-primary-foreground text-sm font-medium"
                >
                Search
                </button>
            </div>

            {/* Category pills with icons */}
            <div className="flex flex-wrap gap-2">
                {featuredCategories.slice(0, 10).map((cat) => {
                const Icon = categoryIcon(cat.name);
                return (
                    <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                        setCategory(String(cat.id));
                        router.get("/", { q: "", city: city || "", category: cat.id }, { preserveState: true, replace: true });
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
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span>✅ Verified providers</span>
                <span>💬 Realtime chat</span>
                <span>💳 Cash or online payment</span>
                <span>⭐ Ratings & reviews</span>
            </div>
            </div>
        </div>

        {/* Popular services */}
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-4">
            <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Popular services</h2>
            <button
                type="button"
                className="text-sm underline"
                onClick={() => {
                setQuery("");
                setCity("");
                setCategory("");
                router.get("/", {}, { preserveState: true, replace: true });
                }}
            >
                Clear
            </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularServices.map((s) => (
                <button
                key={s.id}
                type="button"
                onClick={() => {
                    setQuery(s.title);
                    router.get("/", { q: s.title, city: city || "", category: category || "" }, { preserveState: true, replace: true });
                }}
                className="text-left border rounded-lg p-4 hover:bg-muted/40 transition"
                title="Click to search similar services"
                >
                <div className="font-semibold line-clamp-2">{s.title}</div>
                <div className="mt-2 text-sm text-muted-foreground">
                    {s.pricing_type}
                    {s.base_price ? ` • ${s.base_price} DZD` : ""}
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                    Click to see similar
                </div>
                </button>
            ))}

            {popularServices.length === 0 && (
                <div className="text-sm text-muted-foreground">
                No services found yet. (Seeder will add demo services)
                </div>
            )}
            </div>
        </div>

        {/* Footer */}
        <div className="border-t">
            <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground flex flex-wrap gap-4 justify-between">
            <div>© {new Date().getFullYear()} DZ Services</div>
            <div className="flex gap-4">
                <a className="hover:underline" href="/about">About</a>
                <a className="hover:underline" href="/contact">Contact</a>
                <a className="hover:underline" href="/terms">Terms</a>
            </div>
            </div>
        </div>
        </div>
    );
    }
