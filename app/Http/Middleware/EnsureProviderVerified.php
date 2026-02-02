<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureProviderVerified
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        // Only apply to providers
        if ($user->role !== 'provider') {
            return $next($request);
        }

        // If provider is verified => allow
        $isVerified = (bool) optional($user->profile)->verified_at;

        if ($isVerified) {
            return $next($request);
        }

        // Allow verification page + settings pages even if not verified
        $allowedRoutes = [
            'provider.verification.show',
            'provider.verification.store',
            'profile.edit',
            'profile.update',
            'profile.destroy',
            'dashboard',
        ];

        if ($request->route() && in_array($request->route()->getName(), $allowedRoutes, true)) {
            return $next($request);
        }

        // Block everything else
        return redirect()
            ->route('provider.verification.show')
            ->withErrors([
                'verification' => 'You must verify your provider account before using this feature.',
            ]);
    }
}
