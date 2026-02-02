<?php

use App\Models\Category;
use App\Models\City;
use App\Models\Profile;
use App\Models\Request as JobRequest;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('service show includes provider id for profile link', function () {
    $provider = User::factory()->create(['role' => 'provider']);

    $category = Category::create([
        'name' => 'Plumbing',
        'slug' => 'plumbing',
    ]);

    $city = City::create([
        'name' => 'Algiers',
        'wilaya_code' => '16',
    ]);

    $service = Service::create([
        'provider_id' => $provider->id,
        'category_id' => $category->id,
        'city_id' => $city->id,
        'title' => 'Pipe Fix',
        'slug' => Str::slug('Pipe Fix'),
        'description' => 'Fixing leaks.',
        'base_price' => 5000,
        'pricing_type' => 'fixed',
        'payment_type' => 'cash',
        'status' => 'approved',
    ]);

    $this->get(route('services.show', $service))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Public/Services/Show')
            ->where('service.provider.id', $provider->id)
        );
});

test('provider request show includes client id for profile link', function () {
    $provider = User::factory()->create(['role' => 'provider']);
    $client = User::factory()->create(['role' => 'client']);

    Profile::create([
        'user_id' => $provider->id,
        'verified_at' => now(),
    ]);

    $category = Category::create([
        'name' => 'Cleaning',
        'slug' => 'cleaning',
    ]);

    $city = City::create([
        'name' => 'Oran',
        'wilaya_code' => '31',
    ]);

    $requestModel = JobRequest::create([
        'client_id' => $client->id,
        'category_id' => $category->id,
        'city_id' => $city->id,
        'title' => 'Home cleaning',
        'description' => 'Need a full home clean.',
        'status' => 'open',
    ]);

    $this->actingAs($provider)
        ->get(route('provider.requests.show', $requestModel))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Provider/Requests/Show')
            ->where('request.client.id', $client->id)
        );
});
