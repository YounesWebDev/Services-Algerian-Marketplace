<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Laravel\Fortify\Features;

class HomeController extends Controller
{
    //Load home page + send data to the UI
    public function index(){
        $categories = Category::orderBy('name')->take(8)->get(['id','name','slug']);
        $cities = City::orderBy('name')->take(10)->get(['id' , 'name']);
        
        return Inertia::render('Public/Home' , [
            'canRegister' => Features::enabled(Features::registration()),
            'featuredCategories' => $categories,
            'topCities' => $cities ,
        ]);
    }
}
