<?php

use App\Http\Controllers\Public\HomeController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/',[HomeController::class , 'index'])->name('home.public');

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