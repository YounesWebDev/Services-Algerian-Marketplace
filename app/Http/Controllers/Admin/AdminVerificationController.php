<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Profile;
use App\Models\ProviderVerification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminVerificationController extends Controller
{
    // provider verification
    public function providersIndex(Request $request)
    {
        $status = (string) $request->query('status', 'pending'); // default
        $q = (string) $request->query('q', '');

        $query = ProviderVerification::query()
            ->with(['provider:id,name,email,avatar_path'])
            ->latest();

        if ($status !== '') {
            $query->where('status', $status);
        }

        if ($q !== '') {
            $query->whereHas('provider', function ($p) use ($q) {
                $p->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        $verifications = $query->paginate(12)->withQueryString();

        return Inertia::render('Admin/Verifications/ProvidersIndex', [
            'verifications' => $verifications,
            'filters' => [
                'status' => $status,
                'q' => $q,
            ],
        ]);
    }

    public function providersShow(Request $request, ProviderVerification $verification)
    {
        $verification->load([
            'provider:id,name,email,avatar_path',
            'provider:id,name',
        ]);

        return Inertia::render('Admin/Verifications/ProvidersShow', [
            'verification' => [
                'id' => $verification->id,
                'status' => $verification->status,
                'doc_type' => $verification->doc_type,
                'doc_number' => $verification->doc_number,
                'doc_path' => $verification->doc_path,
                'created_at' => $verification->created_at?->toDateTimeString(),
                'provider' => [
                    'id' => $verification->provider->id,
                    'name' => $verification->provider->name,
                    'email' => $verification->provider->email,
                    'avatar_path' => $verification->provider->avatar_path,
                    'is_verified' => (bool) optional($verification->profile)->verified_at,
                ],
                'reviewer' => $verification->reviewer ? [
                    'id' => $verification->id,
                    'name' => $verification->name,
                ] : null,
            ],
        ]);
    }

    public function providersApprove(Request $request, ProviderVerification $verification)
    {
        $admin = $request->user();

        if ($verification->status !== 'pending') {
            return back()->withErrors(['status' => 'Only pending verifications can be approved.']);
        }

        $verification->update([
            'status' => 'approved',
            'reviewed_by' => $admin->id,
        ]);

        // mark provider as verified
        Profile::query()->updateOrCreate(
            ['user_id' => $verification->provider_id],
            ['verified_at' => now()]
        );

        return redirect()
            ->route('admin.verifications.providers.show', $verification->id)
            ->with('success', 'Provider verification approved.');
    }

    public function providersReject(Request $request, ProviderVerification $verification)
    {
        $admin = $request->user();

        if ($verification->status !== 'pending') {
            return back()->withErrors(['status' => 'Only pending verification can be rejected']);
        }

        $verification->update([
            'status' => 'rejected',
            'reviewed_by' => $admin->id,
        ]);

        // Keep provider unverified
        Profile::query()
            ->where('user_id', $verification->provider_id)
            ->update(['verified_at' => null]);

        return redirect()
            ->route('admin.verifications.providers.show', $verification->id)
            ->with('success', 'Provider verification rejected');
    }
}
