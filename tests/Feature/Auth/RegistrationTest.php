<?php

use Illuminate\Support\Facades\Auth;

beforeEach(function () {
    // ✅ Make sure this file always runs as a guest
    Auth::logout();
    $this->flushSession();
});

test('registration screen can be rendered', function () {
    $this->assertGuest();

    $response = $this->get(route('register'));
    $response->assertOk();
});

test('new users can register', function () {
    $this->assertGuest();

    // Load the form first to start session + get CSRF token
    $page = $this->get(route('register'));
    $page->assertOk();

    $response = $this->post(route('register.store'), [
        '_token' => session()->token(),

        'name' => 'Test User',
        'email' => 'test@example.com',
        'role' => 'client',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    // ✅ If guest middleware blocked it, this will reveal it immediately
    $response->assertStatus(302);

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);

    $this->assertAuthenticated();

    $response->assertRedirect(route('dashboard', absolute: false));
});
