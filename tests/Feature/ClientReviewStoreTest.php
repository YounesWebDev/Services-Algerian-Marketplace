<?php

use App\Models\Booking;
use App\Models\Category;
use App\Models\City;
use App\Models\Profile;
use App\Models\Service;
use App\Models\User;
use Illuminate\Support\Str;

test('client can review a request booking with provider rating only', function () {
    $provider = User::factory()->create(['role' => 'provider']);
    $client = User::factory()->create(['role' => 'client']);

    $booking = Booking::create([
        'source' => 'request_offer',
        'service_id' => null,
        'offer_id' => null,
        'client_id' => $client->id,
        'provider_id' => $provider->id,
        'scheduled_at' => null,
        'status' => 'completed',
        'total_amount' => 3500,
        'currency' => 'DZD',
    ]);

    $this->actingAs($client)
        ->post(route('client.bookings.review.store', $booking), [
            'provider_rating' => 4,
            'comment' => 'Great provider.',
        ])
        ->assertRedirect(route('client.bookings.show', $booking));

    $this->assertDatabaseHas('reviews', [
        'booking_id' => $booking->id,
        'service_id' => null,
        'provider_rating' => 4,
        'service_rating' => null,
        'rating' => 4,
    ]);
});

test('client can review a service booking with provider and service ratings', function () {
    $provider = User::factory()->create(['role' => 'provider']);
    $client = User::factory()->create(['role' => 'client']);

    $category = Category::create([
        'name' => 'Electrical',
        'slug' => 'electrical',
    ]);

    $city = City::create([
        'name' => 'Blida',
        'wilaya_code' => '09',
    ]);

    $service = Service::create([
        'provider_id' => $provider->id,
        'category_id' => $category->id,
        'city_id' => $city->id,
        'title' => 'Wiring Fix',
        'slug' => Str::slug('Wiring Fix'),
        'description' => 'Fixing wiring issues.',
        'base_price' => 5000,
        'pricing_type' => 'fixed',
        'payment_type' => 'cash',
        'status' => 'approved',
    ]);

    $booking = Booking::create([
        'source' => 'service',
        'service_id' => $service->id,
        'offer_id' => null,
        'client_id' => $client->id,
        'provider_id' => $provider->id,
        'scheduled_at' => null,
        'status' => 'completed',
        'total_amount' => 8500,
        'currency' => 'DZD',
    ]);

    $this->actingAs($client)
        ->post(route('client.bookings.review.store', $booking), [
            'provider_rating' => 5,
            'service_rating' => 3,
            'comment' => 'Service could be better.',
        ])
        ->assertRedirect(route('client.bookings.show', $booking));

    $this->assertDatabaseHas('reviews', [
        'booking_id' => $booking->id,
        'service_id' => $service->id,
        'provider_rating' => 5,
        'service_rating' => 3,
        'rating' => 3,
    ]);

    $profile = Profile::firstWhere('user_id', $provider->id);

    expect($profile)->not()->toBeNull()
        ->and((int) $profile->rating_count)->toBe(1)
        ->and((float) $profile->rating_avg)->toBe(5.0);
});
