<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    /**
     * GET /services
     * List approved services with filters + media + pagination
     */
    public function index(Request $request)
    {
        if ($request->user() && $request->user()->role !== 'client') {
            abort(403);
        }

        // Read filters from URL: /services?q=&city=&category=
        $q = (string) $request->query('q', '');
        $city = (string) $request->query('city', '');
        $category = (string) $request->query('category', '');

        // Dropdown data (for UI filters)
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $cities = City::orderBy('name')->get(['id', 'name']);

        // Base query (only approved)
        $servicesQuery = Service::query()
            ->where('status', 'approved')
            ->with([
                // Load media (ordered)
                'media' => fn ($q) => $q->orderBy('position'),
            ]);

        // Filter: q (title search)
        if ($q !== '') {
            $servicesQuery->where('title', 'like', "%{$q}%");
        }

        // Filter: city (expects city_id)
        if ($city !== '' && is_numeric($city)) {
            $servicesQuery->where('city_id', (int) $city);
        }

        // Filter: category
        // Your UI sometimes sends category slug, sometimes id
        if ($category !== '') {
            if (is_numeric($category)) {
                $servicesQuery->where('category_id', (int) $category);
            } else {
                // slug -> find category id
                $catId = Category::where('slug', $category)->value('id');
                if ($catId) {
                    $servicesQuery->where('category_id', $catId);
                }
            }
        }

        // Paginate (withQueryString keeps filters when switchin1g pages)
        $services = $servicesQuery
            ->latest()
            ->select([
                'id',
                'provider_id',
                'category_id',
                'city_id',
                'title',
                'slug',
                'description',
                'base_price',
                'pricing_type',
                'payment_type',
                'status',
                'featured_until',
                'created_at',
            ])
            ->paginate(12)
            ->withQueryString();

            $services->getCollection()->load('provider:id,name,avatar_path');


        return Inertia::render('Public/Services/Index', [
            'services' => $services,
            'categories' => $categories,
            'cities' => $cities,
            'filters' => [
                'q' => $q,
                'city' => $city,
                'category' => $category,
            ],
        ]);
    }

    /**
     * GET /services/{service:slug}
     * Show one service details + media gallery
     */
    public function show(Service $service)
    {
        // Make sure we load relations we need for the show page
        $service->load([
            'media' => fn ($q) => $q->orderBy('position'),
            'category:id,name,slug',
            'city:id,name',
            'provider:id,name',
        ]);

        return Inertia::render('Public/Services/Show', [
            'service' => $service,
        ]);
    }
}
