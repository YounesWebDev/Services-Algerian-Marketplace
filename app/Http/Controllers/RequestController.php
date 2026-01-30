<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\City;
use App\Models\Offer;
use App\Models\Request as JobRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

use function PHPUnit\Framework\isNumeric;

class RequestController extends Controller
{
    // Provider: list open requests
    public function index(Request $request)
    {
        $q = (string) $request->query('q', '');
        $city = (string) $request->query('city', '');
        $category = (string) $request->query('category', '');

        $query = JobRequest::query()
            ->where('status', 'open')
            ->with([
                'category:id,name,slug',
                'city:id,name',
                'client:id,name,avatar_path',
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
            if (isNumeric($category)) {
                $query->where('category_id', $category);
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
    public function show(Request $request, JobRequest $requestModel)
    {
        if ($requestModel->status !== 'open') {
            abort(404);
        }
        $requestModel->load([
            'category:id,name,slug',
            'city:id,name',
            'client:id,name,avatar_path',
            'media:id,request_id,path,type,position',
        ]);

        $hasOffer = Offer::where('request_id', $requestModel->id)
            ->where('provider_id', $request->user()->id)
            ->exists();

        return Inertia::render('Provider/Requests/Show', [
            'request' => $requestModel,
            'has_offer' => $hasOffer,
        ]);
    }
}
