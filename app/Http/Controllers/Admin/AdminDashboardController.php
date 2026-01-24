<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Dispute;
use App\Models\Payout;
use App\Models\ProviderVerification;
use App\Models\Report;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    /**
     * Admin Dashboard (simple):
     * - No KPIs
     * - Only "Action Required" lists
     */
    public function index()
    {
        // Latest 5 pending provider verifications
        $verifications = ProviderVerification::query()
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get([
                'id',
                'provider_id',
                'doc_type',
                'doc_number',
                'status',
                'created_at',
            ]);

        // Latest 5 open reports
        $reports = Report::query()
            ->where('status', 'open')
            ->latest()
            ->take(5)
            ->get([
                'id',
                'reporter_id',
                'target_type',
                'target_id',
                'reason',
                'status',
                'created_at',
            ]);

        // Latest 5 open disputes
        $disputes = Dispute::query()
            ->where('status', 'open')
            ->latest()
            ->take(5)
            ->get([
                'id',
                'booking_id',
                'opened_by',
                'reason',
                'status',
                'created_at',
            ]);

        // Latest 5 pending payouts
        $payouts = Payout::query()
            ->where('status', 'pending')
            ->latest()
            ->take(5)
            ->get([
                'id',
                'provider_id',
                'amount',
                'status',
                'created_at',
            ]);

        return Inertia::render('Admin/Dashboard', [
            'actionRequired' => [
                'verifications' => $verifications,
                'reports' => $reports,
                'disputes' => $disputes,
                'payouts' => $payouts,
            ],
        ]);
    }
}
