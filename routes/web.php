<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Client\AcceptOfferController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Client\MyRequestController;
use App\Http\Controllers\Client\OfferController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Provider\MyServicesController;
use App\Http\Controllers\Provider\ProviderBookingController;
use App\Http\Controllers\Provider\SendOfferController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ServicesController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/suggestions', [HomeController::class, 'suggestions'])->name('home.suggestions');

Route::get('/services', [ServicesController::class, 'index'])->name('services.index');
Route::get('/services/{service:slug}', [ServicesController::class, 'show'])
    ->where('service', '^(?!create$).+')
    ->name('services.show');

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
        //Services
        Route::get('/my/services', [MyServicesController::class, 'index'])->name('my.services.index');
        Route::get('/services/create', [MyServicesController::class, 'create'])->name('my.services.create');
        Route::post('/services', [MyServicesController::class, 'store'])->name('my.services.store');

        // Requests
        Route::get('/requests', [RequestController::class, 'index'])->name('requests.index');
        Route::get('/requests/{requestModel}', [RequestController::class, 'show'])
            ->whereNumber('requestModel')
            ->name('requests.show');

        //provider bookings
        Route::get('/my/bookings' , [ProviderBookingController::class , 'index'])->name('bookings.index');
        Route::get('/my/bookings/{booking}',[ProviderBookingController::class , 'show'])->name('bookings.show');
        Route::post('/my/bookings/{booking}/cash/confirm',[ProviderBookingController::class,'confirmCash'])->name('bookings.cash.confirm');
        // offers
        Route::post('/requests/{request}/offers', SendOfferController::class)->name('requests.offers.store');
    });

/**
 * ✅ Client: Offers + Bookings + Payments (NO /client prefix)
 * /offers , /bookings
 */
Route::middleware(['auth', 'verified', 'role:client'])
    ->name('client.')
    ->group(function () {

        // Requests
        Route::get('/my/requests', [MyRequestController::class, 'index'])->name('my.requests.index');
        Route::get('/requests/create', [MyRequestController::class, 'create'])->name('my.requests.create');
        Route::post('/requests', [MyRequestController::class, 'store'])->name('my.requests.store');

        // Offers
        Route::get('/offers', [OfferController::class, 'index'])->name('offers.index');
        Route::post('/offers/{offer}/accept', AcceptOfferController::class)->name('offers.accept');

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
        Route::post('/services/{service:slug}/book', [BookingController::class , 'storeFromService'])
    ->name('services.book');

        

        // Payments
        Route::post('/bookings/{booking}/payment', [BookingController::class, 'payment'])->name('bookings.payment');
        Route::post('/bookings/{booking}/payment/confirm', [BookingController::class, 'confirmPayment'])->name('bookings.payment.confirm');
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
