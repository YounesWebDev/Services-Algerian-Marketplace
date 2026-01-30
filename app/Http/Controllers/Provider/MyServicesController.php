<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class MyServicesController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $status = (string) $request->query('status', '');

        $query = Service::query()
            ->where('provider_id', $user->id)
            ->with([
                'category:id,name,slug',
                'city:id,name',
                'media:id,service_id,path,type,position',
            ])
            ->latest();

        if ($status !== '') {
            $query->where('status', $status);
        }

        $services = $query->paginate(12)->withQueryString();

        return Inertia::render('Provider/Services/Index', [
            'services' => $services,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $cities = City::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Provider/Services/Create', [
            'categories' => $categories,
            'cities' => $cities,
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'city_id' => ['required', 'integer', 'exists:cities,id'],
            'title' => ['required', 'string', 'min:5', 'max:191'],
            'description' => ['required', 'string', 'min:10'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'pricing_type' => ['required', 'in:fixed,hourly,quote'],
            'payment_type' => ['required', 'in:cash,online,both'],
            'photos' => ['nullable', 'array', 'max:6'],
            'photos.*' => ['file', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ]);

        $baseSlug = Str::slug($data['title']);
        $slug = $baseSlug;

        $i = 2;
        while (Service::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $i;
            $i++;
        }

        $service = Service::create([
            'provider_id' => $user->id,
            'category_id' => $data['category_id'],
            'city_id' => $data['city_id'],
            'title' => $data['title'],
            'slug' => $slug,
            'description' => $data['description'],
            'base_price' => $data['base_price'] !== '' ? $data['base_price'] : null,
            'pricing_type' => $data['pricing_type'],
            'payment_type' => $data['payment_type'],
            'status' => 'pending',
        ]);

        if (! empty($data['photos'])) {
            foreach ($data['photos'] as $i => $file) {
                $path = $file->store("services/{$service->id}", 'public');

                $service->media()->create([
                    'path' => $path,
                    'type' => 'image',
                    'position' => $i,
                ]);
            }
        }

        return redirect()->route('provider.my.services.index')->with('success', 'Service created (pending approval)');
        
    }
}
