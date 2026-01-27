<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\Request as JobRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequestController extends Controller
{
    // Provider: list open requests
    public function index(Request $request)
    {
        $user = $request->user();

        // only provider can access
        if (! $user || $user->role !== 'provider') {
            abort(403);
        }

        $q = (string) $request->query('q', '');
        $city = (string) $request->query('city', '');
        $category = (string) $request->query('category', '');

        $query = JobRequest::query()
            ->where('status', 'open')
            ->with([
                'category:id,name,slug',
                'city:id,name',
                'client:id,name',
                'media:id,request_id,path,type,position',
            ])
            ->latest();

        if ($q !== '') {
            $query->where('title', 'like', "%{$q}%");
        }

        if ($city !== '') {
            $query->where('city_id', $city);
        }

        if ($category !== '') {
            if (is_numeric($category)) {
                $query->where('category_id', (int) $category);
            } else {
                $categoryId = Category::where('slug', $category)->value('id');
                if ($categoryId) {
                    $query->where('category_id', $categoryId);
                }
            }
        }

        $requests = $query->paginate(12)->withQueryString();

        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $cities = City::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Provider/Requests/Index', [
            'requests' => $requests,
            'categories' => $categories,
            'cities' => $cities,
            'filters' => [
                'q' => $q,
                'city' => $city,
                'category' => $category,
            ],
        ]);
    }

    // Provider: request details
    public function show(JobRequest $requestModel, Request $request)
    {
        $user = $request->user();

        // only provider can access
        if (! $user || $user->role !== 'provider') {
            abort(403);
        }

        $requestModel->load([
            'category:id,name,slug',
            'city:id,name',
            'client:id,name',
            'media:id,request_id,path,type,position',
        ]);

        // only open visible
        if ($requestModel->status !== 'open') {
            abort(404);
        }

        return Inertia::render('Provider/Requests/Show', [
            'request' => $requestModel,
        ]);
    }
}
