<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\Request as JobRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequestsController extends Controller
{
    public function index(Request $request)
    {
        $q = (string) $request->query('q', '');
        $status = (string) $request->query('status', '');
        $city = (string) $request->query('city', '');
        $category = (string) $request->query('category', '');

        $query = JobRequest::query()
            ->with([
                'category:id,name,slug',
                'city:id,name',
                'client:id,name,email,avatar_path,status,role',
                'media:id,request_id,path,type,position',
            ])
            ->withCount('offers')
            ->latest();

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhereHas('client', function ($c) use ($q) {
                        $c->where('name', 'like', "%{$q}%")
                            ->orWhere('email', 'like', "%{$q}%");
                    });
            });
        }

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($city !== '' && is_numeric($city)) {
            $query->where('city_id', (int) $city);
        }

        if ($category !== '') {
            if (is_numeric($city)) {
                $query->where('city_id', (int) $city);
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

        return Inertia::render('Admin/Requests/Index', [
            'requests' => $requests,
            'categories' => $categories,
            'cities' => $cities,
            'filters' => [
                'q' => $q,
                'status' => $status,
                'city' => $city,
                'category' => $category,
            ],
        ]);
    }

    public function show(JobRequest $requestModel)
    {
        $requestModel->load([
            'category:id,name,slug',
            'city:id,name',
            'client:id,name,email,avatar_path,status,role',
            'media:id,request_id,path,type,position',
            'offers:id,request_id,provider_id,message,proposed_price,estimated_days,status,created_at',
            'offers.provider:id,name,email,avatar_path,status,role',
        ]);

        return Inertia::render('Admin/Requests/Show', [
            'request' => $requestModel,
        ]);
    }

    public function close(Request $request, JobRequest $requestModel)
    {
        if ($requestModel->status === 'cancelled') {
            return back();
        }

        $requestModel->update([
            'status' => 'cancelled',
        ]);

        return back()->with('success', 'Request cancelled');
    }

    public function reopen(Request $request, JobRequest $requestModel)
    {
        if ($requestModel->status !== 'cancelled') {
            return back();
        }

        $requestModel->update([
            'status' => 'open',
        ]);

        return back()->with('success', 'Request reopened successfully');
    }
}
