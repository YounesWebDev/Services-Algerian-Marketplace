<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\Profile;
use App\Models\Request as JobRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function show(Request $request, User $user): Response
    {
        $user->load(['profile']);
        $requests = null;
        $services = null;

        if ($user->role === 'provider') {
            $services = $user->services()
                ->latest()
                ->limit(6)
                ->get([
                    'id',
                    'title',
                    'slug',
                    'base_price',
                    'pricing_type',
                    'status',
                    'created_at',
                ]);
        } else {
            $requests = JobRequest::query()
                ->where('client_id', $user->id)
                ->latest()
                ->limit(6)
                ->get([
                    'id',
                    'title',
                    'status',
                    'budget_min',
                    'budget_max',
                    'created_at',
                ]);
        }

        return Inertia::render('Profiles/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'avatar_path' => $user->avatar_path,
            ],
            'profile' => $user->profile ? [
                'bio' => $user->profile->bio,
                'address' => $user->profile->address,
                'company_name' => $user->profile->company_name,
                'rating_avg' => (string) $user->profile->rating_avg,
                'rating_count' => (int) $user->profile->rating_count,
            ] : null,
            'requests' => $requests,
            'services' => $services,
        ]);
    }

    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profile' => $user->profile,
            'avatar_path' => $user->avatar_path,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        if ($request->hasFile('avatar')) {
            $file = $request->file('avatar');

            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
            }

            $path = $file->store("avatars/{$user->id}", 'public');
            $user->avatar_path = $path;
        }

        $request->user()->save();

        $profileData = $request->safe()->only('bio', 'address', 'company_name');

        Profile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'bio' => $profileData['bio'] ?? null,
                'address' => $profileData['address'] ?? null,
                'company_name' => $profileData['company_name'] ?? null,
            ]
        );

        return to_route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
