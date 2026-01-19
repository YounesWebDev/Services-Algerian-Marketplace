<?php

use App\Models\User;

test('guests are redirected from the admin dashboard', function () {
    $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
});

test('non-admin users are forbidden from the admin dashboard', function () {
    $user = User::factory()->create(['role' => 'provider']);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admins can access the admin dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('non-provider users are forbidden from the provider dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)
        ->get(route('provider.dashboard'))
        ->assertForbidden();
});

test('providers can access the provider dashboard', function () {
    $user = User::factory()->create(['role' => 'provider']);

    $this->actingAs($user)
        ->get(route('provider.dashboard'))
        ->assertOk();
});
