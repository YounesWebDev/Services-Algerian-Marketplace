<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Client\AcceptOfferController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Client\BookingShowController;
use App\Http\Controllers\Client\OfferController;
use App\Http\Controllers\Client\Payments\ConfirmPaymentController;
use App\Http\Controllers\Client\Payments\CreatePaymentController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ServicesController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/suggestions', [HomeController::class, 'suggestions'])->name('home.suggestions');

Route::get('/services', [ServicesController::class, 'index'])->name('services.index');
Route::get('/services/{service:slug}', [ServicesController::class, 'show'])->name('services.show');

/**
 * ✅ Dashboard (same URL for all roles)
 * /dashboard
 */
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
});

/**
 * ✅ Provider: Requests (NO /provider prefix)
 * /requests
 */
Route::middleware(['auth', 'verified', 'role:provider'])
    ->name('provider.')
    ->group(function () {
        Route::get('/requests', [RequestController::class, 'index'])->name('requests.index');
        Route::get('/requests/{requestModel}', [RequestController::class, 'show'])->name('requests.show');
    });

/**
 * ✅ Client: Offers + Bookings + Payments (NO /client prefix)
 * /offers , /bookings
 */
Route::middleware(['auth', 'verified', 'role:client'])
    ->name('client.')
    ->group(function () {

        // Offers
        Route::get('/offers', [OfferController::class, 'index'])->name('offers.index');
        Route::post('/offers/{offer}/accept', AcceptOfferController::class)->name('offers.accept');

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', BookingShowController::class)->name('bookings.show');

        // Payments
        // Route::post('/bookings/{booking}/payment', CreatePaymentController::class)->name('bookings.payment.create');
        // Route::post('/bookings/{booking}/payment/confirm', ConfirmPaymentController::class)->name('bookings.payment.confirm');
    });

/**
 * ✅ Admin: Categories (NO /admin prefix)
 * /categories
 */
Route::middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.')
    ->group(function () {
        Route::resource('categories', CategoryController::class)->except(['show']);
    });

require __DIR__.'/settings.php';
