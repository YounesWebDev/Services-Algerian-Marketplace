<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProviderDirectoryController extends Controller
{
    public function index(Request $request){
        $user = $request->user();

        $q = (string) $request->query('q' , '');
        $city = (string) $request->query('city' , '');
        $category = (string) $request->query('category' , '');

        $query = User::query()
                ->where('role','provider')
                ->where('status' , 'active')
                ->with([
                    'profile:user_id,bio,address,company_name,verified_at,rating_avg,rating_count',
                ])
                ->latest();

        // search by provider name or company name
        if($q !== ''){
            $query->where(function ($w) use ($q) {
                $w->where('name' , 'like', "%{$q}%")
                ->orWhereHas('profile',function ($p) use ($q){
                    $p->where('company_name','like',"%{$q}%");
                });
            });
        }

        if($city !== ''){
            $query->whereHas('services' , function ($s) use ($city) {
                $s->where('status' , 'approved')
                    ->where('city_id', $city);
            });
        }

        if($category !== ''){
            $query->whereHas('services' , function ($s) use ($category){
                $s->where('status' , 'approved')
                    ->where('category_id' , $category);
            });
        }

        $providers = $query
            ->withCount([
                'services as approved_services_count' => function($s){
                    $s->where('status','approved');
                },
            ])
            ->paginate(15)
            ->withQueryString();

            return Inertia::render('Client/Providers/Index' , [
                'providers' => $providers,
                'filters' =>[
                    'q' => $q,
                    'city' => $city,
                    'category' => $category,
                ],
            ]);
    }
}
