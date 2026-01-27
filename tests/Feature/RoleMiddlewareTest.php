<?php

use App\Models\User;

test('guests are redirected from the dashboard', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('admins can access the dashboard', function () {
    $user = User::factory()->create(['role' => 'admin']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

test('providers can access the dashboard', function () {
    $user = User::factory()->create(['role' => 'provider']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

test('clients can access the dashboard', function () {
    $user = User::factory()->create(['role' => 'client']);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});
