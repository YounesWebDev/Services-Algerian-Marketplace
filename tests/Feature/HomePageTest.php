<?php

use Inertia\Testing\AssertableInertia as Assert;

test('home page can be rendered for guests', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Home')
            ->has('canRegister')
            ->has('featuredCategories')
            ->has('topCities')
            ->has('popularServices')
            ->has('filters')
        );
});

test('services index page can be rendered for guests', function () {
    $this->get(route('services.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Services/Index')
            ->has('services')
            ->has('categories')
            ->has('cities')
            ->has('filters')
        );
});
