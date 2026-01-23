<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\Service;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ServicesController extends Controller
{
    public function index(Request $request)
    {
        //Read filters from query
        $q = trim((string) $request->query('q' , ''));
        $cityId = (string) $request->query('city' , '');
        $categorySlug = (string) $request->query('category' , '');

        //Resolve category slug -> category id (only if provided)
        $categoryId = null;
        if($categorySlug !== ''){
            $category = \App\Models\Category::where('slug' , $categorySlug)->first();
            if($categorySlug){
                $categoryId = Category::where('slug' , $categorySlug)->value('id');
            }
        }

        //Base query (Public only)
        $servicesQuery = Service::query()->where('status' , 'approved')->with([
            'city:id,name',
            'category:id,name,slug',
            //media ordered use the first as cover in UI
            'media' => fn($q) => $q->orderBy('position'),
        ])->orderByDesc('id');

        //Apply filters
        if($q !== ''){
            $servicesQuery->where(function ($sub) use ($q){
                $sub->where('title' , 'like' , "%${q}%")
                    ->orWhere('description' , 'like' , "%${q}%");
            });
        }
        if($cityId !== ''){
            $servicesQuery->where('city_id' , $cityId);
        }
        if($categoryId !== null){
            $servicesQuery->where('category_id' , $categoryId);
        }

        //Paginated results
        $services = $servicesQuery
                    ->select(['id','provider_id','category_id','city_id','title','slug','base_price','pricing_type'])
                    ->paginate(12)
                    ->withQueryString(); //keep filters in pagination links

        //Filters  dropdown data
        $cities = City::orderBy('name')->get(['id','name']);
        $categories = Category::orderBy('name')->get(['id','name','slug']);

        return Inertia::render('Public/Services/Index' , [
            'services' => $services,
            'cities' => $cities,
            'categories' => $categories,

            //keep the filters in UI inputs
            'filters' => [
                'q'=>$q,
                'city'=>$cityId,
                'category'=>$categorySlug,
            ]
        ]);
    }

    public function show(Service $service)
    {
        //Only approved services can be shown publicly
        if($service->status !=='approved'){
            abort(404);
        }

        $service->load([
            'city:id,name',
            'category:id,name,slug',
            //full media gallery
            'media'=> fn ($q) => $q->orderBy('position'),
        ]);

        return Inertia::render('Public/Services/Show' , [
            'service' => $service,
        ]);
    }
}
