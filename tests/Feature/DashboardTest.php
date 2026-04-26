<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $this->actingAs($user = User::factory()->create());

    $this->get(route('dashboard'))->assertOk();
});

test('admin dashboard shares flash messages with inertia props', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)
        ->withSession([
            'success' => 'Provider verification approved.',
            'error' => 'Another action is still pending.',
        ])
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->where('flash.success', 'Provider verification approved.')
            ->where('flash.error', 'Another action is still pending.')
        );
});
