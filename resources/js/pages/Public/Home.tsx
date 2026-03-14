import { Button } from "@headlessui/react";
import { Link, router, usePage } from "@inertiajs/react";
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
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import GlassIcons from "@/components/GlassIcons";
import Navbar from "@/components/navbar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { about, contact, terms } from "@/routes";
import { suggestions as homeSuggestions } from "@/routes/home";
import { index as servicesIndex, show as servicesShow } from "@/routes/services";
import { type SharedData } from "@/types";

const HERO_IMAGES = [
    "/hero/njar.jpg",
    "/hero/mason.jpg",
    "/hero/laptop.jpg",
    "/hero/coding.jpg",
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
        provider?:Provider;
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

    function toStorageUrl(path:string){
        if(!path) return "";

        if(path.startsWith("/storage/")) return path;

        if(path.startsWith("storage/")) return "/" + path;

        return "/storage/" + path;
    }

    function getCoverImage(service: Service){
        if (!service.media || service.media.length === 0) return "";

        const first = service.media[0];

        return toStorageUrl(first.path);
    }

    function getInitials(name?: string | null) {
        if (!name) return "U";
        const parts = name.trim().split(/\s+/);
        const first = parts[0]?.[0] ?? "";
        const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
        return (first + last).toUpperCase() || "U";
    }

    type HeroBackgroundSliderProps = {
        images: string[];
        intervalMs?: number;
    };

    function HeroBackgroundSlider({ images, intervalMs = 10000 }: HeroBackgroundSliderProps) {
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
                        loading={index === 0 ? "eager" : "lazy"}
                        decoding="async"
                        fetchPriority={index === 0 ? "high" : "low"}
                        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out will-change-[opacity] motion-reduce:transition-none ${
                            index === currentSlide ? "opacity-100" : "opacity-0"
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
        if(query.length < 2 && city === "" && category === "") {
            return;
        }
        router.get(
        servicesIndex.url({
            query: { q: query, city: city || "", category: category || "" },
        }),
        {},
        { preserveState: true, replace: true }
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
            <div className=" flex max-w-screen items-center absolute top-10 left-0 right-0 z-10"><Navbar user={user} canRegister={true} /></div>
       {/* Hero */}
<div className="relative overflow-hidden h-screen">
    <HeroBackgroundSlider images={HERO_IMAGES} />

  {/* Overlay Gradient */}
    <div className="absolute inset-0 bg-linear-to-b from-black/30 to-black/50"></div>

  {/* Content */}
    <div className="w-full md:flex items-start flex-col justify-center relative mx-auto max-w-6xl px-6 py-28 space-y-6 text-white">
    {/* Title */}
    <h1 className="text-3xl md:text-5xl font-bold leading-tight">
        Hire Professionals for Any Job, Fast
    </h1>

    {/* Subtitle */}
    <p className="text-sm md:text-base">
        Search, chat, and hire providers - all in one place.
    </p>

    {/* Search Bar */}
    <div className="bg-white/20 backdrop-blur-3xl  border border-gray-300 rounded-4xl p-3 flex flex-col md:flex-row gap-3 md:items-center">
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
                    {suggestions.categories.map((c) => (
                    <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-3 py-2 text-black text-sm hover:bg-muted"
                        onMouseDown={() => {
                        setOpen(false);
                        setCategory(c.slug);
                        router.get(
                            servicesIndex.url({
                            query: { category: c.slug || "", city: city || "" },
                            }),
                            {},
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
                        router.get(servicesShow.url(s.slug));
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
        className="h-10 w-full text-forground md:w-56 rounded-4xl hover:text-primary transition border px-3 text-sm"
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
        className="h-10 w-full md:w-56 rounded-4xl border px-3 hover:text-primary transition text-muted-forground text-sm"
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
        className="h-10 w-full md:w-32 rounded-4xl bg-primary text-primary-foreground text-sm font-medium  hover:bg-white duration-300  transition hover:text-black"
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
                setCategory(String(cat.id));
                router.get(
                    servicesIndex.url({
                    query: { q: "", city: city || "", category: cat.slug },
                    }),
                    {},
                    { preserveState: true }
                );
                }}
                className="px-3 py-2 border rounded-full text-sm hover:bg-muted hover:text-primary transition-all flex items-center gap-2"
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
    <h2 className="text-4xl font-bold mb-5 flex justify-center mt-5">Popular categories</h2>
<div className="overflow-hidden mt-4">
    <div ref={loaderRef} className="flex gap-4 whitespace-nowrap animate-scroll">
    {featuredCategories.concat(featuredCategories).map((cat, index) => {
        const Icon = categoryIcon(cat.name);
        return (
        <div
            key={index}
            className="min-w-25 h-24 border rounded-lg p-4 text-center flex flex-col items-center justify-center gap-2 shrink-0  hover:px-9  hover:shadow-sm hover:bg-muted transition-all duration-500 cursor-pointer hover:text-primary "
        >
            <Icon className="h-6 w-6 hover:text-primary" />
            <span className="text-sm font-medium hover:text-primary">{cat.name}</span>
        </div>
        );
    })}
    </div>
</div>
 {/* Badges */}
        <div className="giborder-t border-gray-forground">
            <h1 className="flex justify-center text-xl font-bold mt-10  ">why ProFinder ?</h1>
            <div className="flex items-center">
                <GlassIcons items={items} className=""
                />
            </div>
        </div>


        {/* Popular services */}
        <div className="mx-auto h- max-w-7xl px-6 py-10 space-y-4">
            <div className="flex items-center justify-center">
                <h2 className="text-4xl font-bold mb-5">Popular Services</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((s)=>{
                    const cover = getCoverImage(s);

                    return (
                        <Button
                            key={s.id}
                            type="button"
                            onClick={() =>{

                                if(user?.role === "provider" || user?.role === "admin") return;
                                router.get(servicesShow.url(s.slug))
                            }}
                                className="flex m-5 flex-col text-left border rounded-3xl h-70  bg-primary-foreground/30  overflow-hidden hover:shadow-xl transition-all duration-300 hover:bg-primary-foreground/40"
                        >
                            {/* cover Image only if exists */}
                            {cover ? (
                                <div className="w-full h-44 overflow-hidden rounded-t-3xl ">
                                    <img
                                        src={cover}
                                        alt={s.title}
                                        className=" block w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                        loading="lazy"
                                    />
                                </div>
                            ): null}
                            
                            {/* content */}
                            <div className="p-4">
                                <div className="font-semibold line-clamp-2">{s.title}</div>

                                <div className="flex justify-between">
                                    <div className="flex justify-between gap-2 items-center mt-2">
                                        <Avatar className="size-8">
                                            <AvatarImage
                                                src={s.provider?.avatar_path ? toStorageUrl(s.provider.avatar_path) : ""}
                                                alt={s.provider?.name ?? "Provider"}
                                            />
                                            <AvatarFallback>
                                                {getInitials(s.provider?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div >{s.provider?.name}</div>
                                    </div>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                    Payment: {s.payment_type}
                                </div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="mt-3 text-sm text-muted-foreground border border-gray-200 rounded-full w-max px-3 py-2 bg-white/20 backdrop-blur-sm hover:text-black hover:bg-white transition duration-300">
                                        {s.pricing_type}
                                        {s.base_price ? ` - ${s.base_price} DZD ` : ""}
                                    </div>
                                </div>
                            </div>
                        </Button>
                    )
                })}

                {services.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                        No services found yet .
                    </div>
                )}
            </div>
        </div>

            {/* Footer */}
            <div className="border-t ">
                <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted-foreground flex flex-wrap gap-4 justify-between">
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
