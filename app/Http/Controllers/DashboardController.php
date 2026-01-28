<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Payout;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $user = $request->user();

        // Admin dashboard (keep your current logic)
        if ($user->role === 'admin') {
            return app(AdminDashboardController::class)->index();
        }

        // Provider dashboard (simple stats)
        if ($user->role === 'provider') {
            $pendingBookings = Booking::where('provider_id', $user->id)
                ->where('status', 'pending')
                ->count();

            $confirmedBookings = Booking::where('provider_id', $user->id)
                ->where('status', 'confirmed')
                ->count();

            $pendingPayouts = Payout::where('provider_id', $user->id)
                ->where('status', 'pending')
                ->count();

            return Inertia::render('Provider/Dashboard', [
                'stats' => [
                    'pending_bookings' => $pendingBookings,
                    'confirmed_bookings' => $confirmedBookings,
                    'pending_payouts' => $pendingPayouts,
                ],
            ]);
        }

        // Client dashboard (Week 3 focus: bookings + payments)
        $totalBookings = Booking::where('client_id', $user->id)->count();

        $pendingBookings = Booking::where('client_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $confirmedBookings = Booking::where('client_id', $user->id)
            ->where('status', 'confirmed')
            ->count();

        // Pending payments = booking pending AND (no payment OR payment pending)
        $pendingPayments = Booking::where('client_id', $user->id)
            ->where('status', 'pending')
            ->where(function ($q) {
                $q->whereDoesntHave('payment')
                    ->orWhereHas('payment', function ($qq) {
                        $qq->where('status', 'pending');
                    });
            })
            ->count();

        return Inertia::render('Client/Dashboard', [
            'stats' => [
                'total_bookings' => $totalBookings,
                'pending_bookings' => $pendingBookings,
                'confirmed_bookings' => $confirmedBookings,
                'pending_payments' => $pendingPayments,
            ],
        ]);
    }
}
