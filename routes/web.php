<?php

use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\ServicesController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/',[HomeController::class , 'index'])->name('home');
Route::get('/suggestions',[HomeController::class,'suggestions'])->name('home.suggestions');
Route::get('/services',[ServicesController::class,'index'])->name('services.index');
Route::get('/services/{service:slug}',[ServicesController::class,'show'])->name('services.show');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $user = request()->user();

        return match ($user->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'provider' => redirect()->route('provider.dashboard'),
            default => Inertia::render('Client/Dashboard'),
        };
    })->name('dashboard');

    Route::get('/provider/dashboard', function () {
        return Inertia::render('Provider/Dashboard');
    })->middleware('role:provider')->name('provider.dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/admin.php';