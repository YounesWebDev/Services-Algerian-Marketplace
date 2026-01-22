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
    ChevronLeft,
    ChevronRight,
    } from "lucide-react";
    import React, { useEffect, useRef, useState } from "react";
    import { usePage } from "@inertiajs/react";
    import { type SharedData } from "@/types";
import { dashboard, login, register } from "@/routes";

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
    images?: string[];
    currentImage?: number;
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

    // Loader ref for auto-scrolling categories
    const loaderRef = useRef<HTMLDivElement>(null);

    // Slider state
    const [currentSlide, setCurrentSlide] = useState(0);
    const [services, setServices] = useState<Service[]>(popularServices);

    // Auto-rotate slides every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % 4);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Auto-rotate images inside each service card
    useEffect(() => {
        const interval = setInterval(() => {
            setServices((prevServices) =>
                prevServices.map((service) => {
                    if (!service.images || service.images.length <= 1) {
                        return service;
                    }
                    return {
                        ...service,
                        currentImage: ((service.currentImage || 0) + 1) % service.images.length,
                    };
                })
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // ✅ Handler: keep "clear suggestions" here (NOT inside useEffect)
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

    // Fetch suggestions when user types (no page reload)
    useEffect(() => {
        const text = query.trim();

        // ✅ Do nothing when less than 2 chars (no setState here)
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
        }, 250); // small delay to avoid too many requests

        return () => clearTimeout(timer);
    }, [query]);

    // Run search WITHOUT full page reload (Inertia request)
    function runSearch() {
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
        <div className="rounded-full mt-5 mx-2 backdrop-blur-sm border-b border-gray-500 fixed w-full z-30 py bg-primary-foreground/30">
            <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
                <Link className="hover:scale-105 duration-300" href="/">
                <div className="font-bold text-xl  ">PROfinder</div>
                </Link>
            

            <div className="hidden md:flex justify-between gap-15 ">
                <Link className="hover:scale-105 duration-300" href="/">
                Home
                </Link>
                <Link className="hover:scale-105 duration-300" href="/requests">
                Requests
                </Link>
                <Link className="hover:scale-105 duration-300" href="/services">
                Services
                </Link>
            </div>

            <div className="flex justify-between gap-3 text-sm">
                {auth.user ? (
                    <Link
                        href={dashboard()}
                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                        >
                        Dashboard
                    </Link>
                ):(
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

       {/* Hero (Fiverr-like) */}
<div className="relative overflow-hidden h-screen">
  {/* Background slider with 4 local images */}
  {[
    "./hero/njar.jpg",   // Developer on laptop
    "./hero/mason.jpg",      // Worker / handyman
    "./hero/laptop.jpg",     // Plumber / technician
    "./hero/coding.jpg" // Mason / construction
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
  <div className="flex place-items-start flex-col justify-center relative mx-auto max-w-6xl px-6 py-28 space-y-6 text-white">
    {/* Title */}
    <h1 className="text-3xl md:text-5xl font-bold leading-tight">
      Hire Professionals for Any Job, Fast
    </h1>

    {/* Subtitle */}
    <p className="text-sm md:text-base">
      Search, chat, and hire providers — all in one place.
    </p>

    {/* Search Bar */}
    <div className="bg-white/20 backdrop-blur-3xl dark:bg-black/70 border-1 border-gray-300 rounded-4xl p-3 flex flex-col md:flex-row gap-3 md:items-center">
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
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      onMouseDown={() => {
                        setOpen(false);
                        setCategory(c.slug);
                        router.get(
                          "/services",
                          {  category: c.slug || "",city: city || ""},
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
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
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
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setCategory(e.target.value)
        }
        className="h-10 w-full md:w-56 rounded-md border px-3 text-sm"
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
                setCategory(String(cat.id));
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
  <div className="flex gap-4 whitespace-nowrap animate-scroll">
    {featuredCategories.concat(featuredCategories).map((cat, index) => {
      const Icon = categoryIcon(cat.name);
      return (
        <div
          key={index}
          className="min-w-[100px] h-24 border rounded-lg p-4 text-center flex flex-col items-center justify-center gap-2 shrink-0"
        >
          <Icon className="h-6 w-6" />
          <span className="text-sm font-medium">{cat.name}</span>
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
            {popularServices.map((s) => (
                <button
                key={s.id}
                type="button"
                onClick={() => {
                    router.get(`/services/${s.slug}`);
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
