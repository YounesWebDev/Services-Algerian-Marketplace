<?php

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    // ✅ Load the form first to start session + get CSRF token
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

    $response->assertSessionHasNoErrors();

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
    ]);

    $this->assertAuthenticated();

    $response->assertRedirect(route('dashboard', absolute: false));
});
