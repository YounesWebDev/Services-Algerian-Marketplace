<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $q = (string) $request->query('q', '');
        $role = (string) $request->query('role', '');
        $status = (string) $request->query('status', '');

        $query = User::query()
            ->select(['id', 'name', 'email', 'role', 'status', 'avatar_path', 'created_at'])
            ->whereIn('role', ['provider', 'client'])
            ->latest();

        if ($q !== '') {
            $query->where(function ($w) use ($q) {
                $w->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        if ($role !== '' && in_array($role, ['provider', 'client'], true)) {
            $query->where('role', $role);
        }

        if ($status !== '') {
            $query->where('status', $status);
        }

        $users = $query->paginate(12)->withQueryString();

        return Inertia::render('Admin/Users/Index',[
            'users' => $users,
            'filters' => [
                'q' => $q,
                'role' => $role,
                'status' => $status,
            ]
        ]);
    }

    public function show(User $user)
    {
        if ($user->role === 'admin') {
            abort(404);
        }
        // Basic counts
        $servicesCount = $user->services()->count();
        $requestsCount = $user->requests()->count();
        $bookingsAsClientCount = $user->clientBookings()->count();
        $bookingsAsProviderCount = $user->providerBookings()->count();
        $reportsMadeCount = $user->reportsMade()->count();
        $providerVerification = null;

        if($user->role === 'provider'){
            $providerVerification = $user->providerVerifications()->first();
        }

        return Inertia::render('Admin/Users/Show' , [
            'user' => $user->only([
                'id' , 'name' , 'email' , 'role' , 'status' ,'avatar_path' ,'created_at',
            ]),
            'stats' => [
                'servicesCount' => $servicesCount,
                'requestsCount' => $requestsCount,
                'bookingsAsClientCount' => $bookingsAsClientCount,
                'bookingsAsProviderCount' => $bookingsAsProviderCount,
                'reportsMadeCount' => $reportsMadeCount,
            ],
            'providerVerification' => $providerVerification 
        ]);

    }

    public function updateStatus(Request $request,User $user){
        $data = $request->validate([
            'status' => ['required' , 'in:active,inactive'],
        ]);

        $user->update([
            'status' => $data['status'],
        ]);

        return back()->with('success' , 'User status updated successfully');
    }

}
