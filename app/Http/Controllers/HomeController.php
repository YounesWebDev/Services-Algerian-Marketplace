<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    /**
     * Home page:
     * - Shows hero + search bar
     * - Shows categories with icons (frontend)
     * - Shows "popular services" list (filtered)
     */
    public function index(Request $request)
    {
        // Read filters from the URL: /?q=...&city=...&category=...
        $q = $request->query('q', '');
        $cityId = $request->query('city', '');
        $categorySlug = $request->query('category', '');

        // Data for dropdowns + clickable categories
        $categories = Category::orderBy('name')->take(12)->get(['id', 'name', 'slug']);
        $cities = City::orderBy('name')->get(['id', 'name']); // all wilayas

        // Build services query (only approved)
        $servicesQuery = Service::where('status', 'approved');

        // Apply filters (only when user entered them)
        if ($q !== '') {
            $servicesQuery->where('title', 'like', "%{$q}%");
        }
        if ($cityId !== '') {
            $servicesQuery->where('city_id', $cityId);
        }
        if ($categorySlug !== '') {
            $categoryId = Category::where('slug', $categorySlug)->value('id');
            if ($categoryId) {
                $servicesQuery->where('category_id', $categoryId);
            }
        }

        // Get results to show on the home page
        $popularServices = $servicesQuery
            ->latest()
            ->take(8)
            ->with([
                'media' => fn ($q) => $q->orderBy('position'),
                'provider:id,name,avatar_path',
            ])
            ->get(['id','provider_id', 'title', 'slug', 'base_price', 'pricing_type', 'payment_type', 'city_id', 'category_id']);

        return Inertia::render('Public/Home', [
            'canRegister' => Features::enabled(Features::registration()),
            'featuredCategories' => $categories,
            'topCities' => $cities,
            'popularServices' => $popularServices,

            // Send current filters to UI to keep inputs filled
            'filters' => [
                'q' => $q,
                'city' => $cityId,
                'category' => $categorySlug,
            ],
        ]);
    }

    /**
     * Suggestions API (JSON):
     * - Used when user types in search input
     * - Returns suggestions without reloading the page
     */
    public function suggestions(Request $request)
    {
        $q = trim($request->query('q', ''));

        // If user typed less than 2 chars: return nothing
        if (mb_strlen($q) < 2) {
            return response()->json([
                'services' => [],
                'categories' => [],
            ]);
        }

        // Suggest services (approved only)
        $services = Service::where('status', 'approved')
            ->where('title', 'like', "%{$q}%")
            ->orderBy('title')
            ->take(6)
            ->get(['id', 'title', 'slug']);

        // Suggest categories
        $categories = Category::where('name', 'like', "%{$q}%")
            ->orderBy('name')
            ->take(6)
            ->get(['id', 'name', 'slug']);

        return response()->json([
            'services' => $services,
            'categories' => $categories,
        ]);
    }
}
