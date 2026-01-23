<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\City;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Dashboard',[
            'counts' => [
                'users' => User::count(),
                'categories' => Category::count(),
                'services' => Service::count(),
                'cities' => City::count(),
            ],
        ]);
    }
}
