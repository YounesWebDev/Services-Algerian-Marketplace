<?php

use App\Http\Controllers\Admin\AdminPaymentController;
use App\Http\Controllers\Admin\AdminPayoutsController;
use App\Http\Controllers\Admin\AdminVerificationController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DisputeController as AdminDisputeController;
use App\Http\Controllers\Admin\ReportController as AdminReportController;
use App\Http\Controllers\Admin\RequestsController as AdminRequestsController;
use App\Http\Controllers\Admin\ServicesController as AdminServicesController;
use App\Http\Controllers\Admin\UsersController;
use App\Http\Controllers\Client\AcceptOfferController;
use App\Http\Controllers\Client\BookingController;
use App\Http\Controllers\Client\DisputeController;
use App\Http\Controllers\Client\MyRequestController;
use App\Http\Controllers\Client\OfferController;
use App\Http\Controllers\Client\ProviderDirectoryController;
use App\Http\Controllers\Client\ReviewController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Provider\MyServicesController;
use App\Http\Controllers\Provider\PayoutController;
use App\Http\Controllers\Provider\ProviderBookingController;
use App\Http\Controllers\Provider\ProviderVerificationController;
use App\Http\Controllers\Provider\SendOfferController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ServicesController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

// Admin Routes
Route::middleware(['auth', 'verified', 'role:admin'])
    ->name('admin.')
    ->group(function () {
        Route::resource('categories', CategoryController::class)->except(['show']);
        // Users management
        Route::get('/users', [UsersController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [UsersController::class, 'show'])->name('users.show');
        Route::post('/users/{user}/status', [UsersController::class, 'updateStatus'])->name('users.status');

        // services management
        Route::get('/services/management', [AdminServicesController::class, 'index'])->name('services.index');
        Route::get('/services/management/{service}', [AdminServicesController::class, 'show'])->name('services.show');
        Route::post('/services/management/{service}/approve', [AdminServicesController::class, 'approve'])->name('services.approve');
        Route::post('/services/management/{service}/reject', [AdminServicesController::class, 'reject'])->name('services.reject');
        Route::post('/services/management/{service}/hide', [AdminServicesController::class, 'hide'])->name('services.hide');

        // Request management
        Route::get('/requests/management', [AdminRequestsController::class, 'index'])->name('requests.index');
        Route::get('/requests/management/{requestModel}', [AdminRequestsController::class, 'show'])->name('requests.show');
        Route::post('/requests/management/{requestModel}/close', [AdminRequestsController::class, 'close'])->name('requests.close');
        Route::post('/requests/management/{requestModel}/reopen', [AdminRequestsController::class, 'reopen'])->name('requests.reopen');
        // Provider verifications
        Route::get('/verifications/providers', [AdminVerificationController::class, 'providersIndex'])->name('verifications.providers.index');
        Route::get('/verifications/providers/{verification}', [AdminVerificationController::class, 'providersShow'])->name('verifications.providers.show');
        Route::post('/verifications/providers/{verification}/approve', [AdminVerificationController::class, 'providersApprove'])->name('verifications.providers.approve');
        Route::post('/verifications/providers/{verification}/reject', [AdminVerificationController::class, 'providersReject'])->name('verifications.providers.reject');
        // disputes
        Route::get('/admin/disputes', [AdminDisputeController::class, 'index'])->name('disputes.index');
        Route::get('/admin/disputes/{dispute}', [AdminDisputeController::class, 'show'])->name('disputes.show');
        Route::post('/admin/disputes/{dispute}/resolve', [AdminDisputeController::class, 'resolve'])->name('disputes.resolve');
        // reports
        Route::get('/reports/management', [AdminReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/management/{report}', [AdminReportController::class, 'show'])->name('reports.show');
        Route::post('/reports/management/{report}/close', [AdminReportController::class, 'close'])->name('reports.close');
        // payments
        Route::get('/payments/management', [AdminPaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/management/{payment}', [AdminPaymentController::class, 'show'])->name('payments.show');
        // payouts
        Route::get('/payouts/management', [AdminPayoutsController::class, 'index'])->name('payouts.index');
        Route::get('/payouts/management/{payout}', [AdminPayoutsController::class, 'show'])->name('payouts.show');
        Route::post('/payouts/management/{payout}/mark-sent', [AdminPayoutsController::class, 'markSent'])->name('payouts.markSent');

    });

/**
 * ✅ Dashboard (same URL for all roles)
 * /dashboard
 */
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/profiles/{user}', [ProfileController::class, 'show'])->name('profiles.show');
    Route::get('/reports/create', [ReportController::class, 'create'])->name('reports.create');
    Route::post('/reports', [ReportController::class, 'store'])->name('reports.store');

});

/**
 * ✅ Provider: Requests (NO /provider prefix)
 * /requests
 */
Route::middleware(['auth', 'verified', 'role:provider', 'provider.verified'])
    ->name('provider.')
    ->group(function () {
        // Verification
        Route::get('/provider/verification', [ProviderVerificationController::class, 'show'])->name('verification.show');
        Route::post('/provider/verification', [ProviderVerificationController::class, 'store'])->name('verification.store');
        // Services
        Route::get('/my/services', [MyServicesController::class, 'index'])->name('my.services.index');
        Route::get('/services/create', [MyServicesController::class, 'create'])->name('my.services.create');
        Route::post('/services', [MyServicesController::class, 'store'])->name('my.services.store');
        Route::get('/my/services/{service}/edit', [MyServicesController::class, 'edit'])->name('my.services.edit');
        Route::put('/my/services/{service}', [MyServicesController::class, 'update'])->name('my.services.update');
        Route::delete('/my/services/{service}', [MyServicesController::class, 'destroy'])->name('my.services.destroy');

        // Requests
        Route::get('/requests', [RequestController::class, 'index'])->name('requests.index');
        Route::get('/requests/{requestModel}', [RequestController::class, 'show'])
            ->whereNumber('requestModel')
            ->name('requests.show');

        // provider bookings
        Route::get('/my/bookings', [ProviderBookingController::class, 'index'])->name('bookings.index');
        Route::get('/my/bookings/{booking}', [ProviderBookingController::class, 'show'])->name('bookings.show');
        Route::post('/my/bookings/{booking}/cash/confirm', [ProviderBookingController::class, 'confirmCash'])->name('bookings.cash.confirm');
        Route::post('/my/bookings/{booking}/status', [ProviderBookingController::class, 'updateStatus'])->name('bookings.status');
        // offers
        Route::post('/requests/{request}/offers', SendOfferController::class)->name('requests.offers.store');
        // payouts
        Route::get('/payouts', [PayoutController::class, 'index'])->name('payouts.index');
        Route::get('/payouts/{payout}', [PayoutController::class, 'show'])->name('payouts.show');

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
        Route::get('/my/requests/{request}', [MyRequestController::class, 'show'])->name('my.requests.show');
        Route::get('/requests/create', [MyRequestController::class, 'create'])->name('my.requests.create');
        Route::post('/requests', [MyRequestController::class, 'store'])->name('my.requests.store');

        // providers
        Route::get('/providers', [ProviderDirectoryController::class, 'index'])->name('providers.index');

        // Offers
        Route::get('/offers', [OfferController::class, 'index'])->name('offers.index');
        Route::post('/offers/{offer}/accept', AcceptOfferController::class)->name('offers.accept');

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index'])->name('bookings.index');
        Route::get('/bookings/{booking}', [BookingController::class, 'show'])->name('bookings.show');
        Route::post('/services/{service:slug}/book', [BookingController::class, 'storeFromService'])->name('services.book');
        Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

        // Payments
        Route::post('/bookings/{booking}/payment', [BookingController::class, 'payment'])->name('bookings.payment');
        Route::post('/bookings/{booking}/payment/confirm', [BookingController::class, 'confirmPayment'])->name('bookings.payment.confirm');

        // reviews
        Route::get('/bookings/{booking}/review', [ReviewController::class, 'create'])->name('bookings.review.create');
        Route::post('/bookings/{booking}/review', [ReviewController::class, 'store'])->name('bookings.review.store');

        // disputes
        Route::get('/bookings/{booking}/dispute', [DisputeController::class, 'create'])->name('bookings.dispute.create');
        Route::post('/bookings/{booking}/dispute', [DisputeController::class, 'store'])->name('bookings.dispute.store');

    });

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('/suggestions', [HomeController::class, 'suggestions'])->name('home.suggestions');

Route::get('/services', [ServicesController::class, 'index'])->name('services.index');
Route::get('/services/{service:slug}', [ServicesController::class, 'show'])
    ->where('service', '^(?!create$|management$).+')
    ->name('services.show');

require __DIR__.'/settings.php';
