<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\Request as JobRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MyRequestController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $status = (string) $request->query('status', '');

        $query = JobRequest::query()
            ->where('client_id', $user->id)
            ->with([
                'category:id,name,slug',
                'city:id,name',
                'media:id,request_id,path,type,position',
            ])
            ->latest();

        if ($status !== '') {
            $query->where('status', $status);
        }

        $requests = $query->paginate(12)->withQueryString();

        return Inertia::render('Client/Requests/Index', [
            'requests' => $requests,
            'filters' => [
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        $categories = Category::orderBy('name')->get(['id', 'name', 'slug']);
        $cities = City::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Client/Requests/Create', [
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
            'budget_min' => ['nullable', 'numeric', 'min:0'],
            'budget_max' => ['nullable', 'numeric', 'min:0'],
            'urgency' => ['nullable', 'string', 'max:191'],
            'photos' => ['nullable', 'array', 'max:6'],
            'photos.*' => ['file', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ]);

        if ($data['budget_max'] !== null && $data['budget_min'] !== null && (float) $data['budget_max'] < (float) $data['budget_min']) {
            return back()->withErrors([
                'budget_max' => 'Budget max mut  be grater than or equal to budget min.',
            ])->withInput();
        }

        $JobRequest = JobRequest::create([
            'client_id' => $user->id,
            'category_id' => $data['category_id'],
            'city_id' => $data['city_id'],
            'title' => $data['title'],
            'description' => $data['description'],
            'budget_min' => $data['budget_min'],
            'budget_max' => $data['budget_max'],
            'urgency' => $data['urgency'],
            'status' => 'open',
        ]);

        if (! empty($data['photos'])) {
            foreach ($data['photos'] as $i => $file) {
                $path = $file->store("requests/{$JobRequest->id}", 'public');

                $JobRequest->media()->create([
                    'path' => $path,
                    'type' => 'image',
                    'position' => $i,
                ]);
            }
        }

        return redirect()->route('client.my.requests.index');
    }
}
