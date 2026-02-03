<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Profile;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReviewController extends Controller
{
    public function create(Request $request, Booking $booking)
    {
        $user = $request->user();

        // only owner client
        if ($booking->client_id !== $user->id) {
            abort(403);
        }

        // only completed
        if ($booking->status !== 'completed') {
            return back()->withErrors([
                'review' => 'You can review only after the booking is completed',
            ]);
        }

        // only one review per booking
        if ($booking->review()->exists()) {
            return redirect()->route('client.bookings.show', $booking)->withErrors([
                'review' => 'You already submitted a review for this booking',
            ]);
        }

        $booking->load([
            'service:id,title,slug',
            'provider:id,name,avatar_path',
        ]);

        return Inertia::render('Client/Reviews/Create', [
            'booking' => $booking,
        ]);
    }

    public function store(Request $request, Booking $booking)
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id) {
            abort(403);
        }

        if ($booking->status !== 'completed') {
            return back()->withErrors([
                'review' => 'You can review only after the booking is completed',
            ]);
        }

        if ($booking->review()->exists()) {
            return back()->withErrors([
                'review' => 'Review already submitted',
            ]);
        }

        $data = $request->validate([
            'provider_rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'service_rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $providerRating = $data['provider_rating'] ?? null;
        $serviceRating = $booking->service_id ? ($data['service_rating'] ?? null) : null;
        $hasRating = $providerRating !== null || $serviceRating !== null;
        $hasComment = isset($data['comment']) && trim((string) $data['comment']) !== '';

        if (! $hasRating && ! $hasComment) {
            return back()->withErrors([
                'review' => 'Please add at least one rating or write a comment.',
            ]);
        }

        if ($providerRating === null && $serviceRating === null) {
            return back()->withErrors([
                'review' => 'Please add at least one rating.',
            ]);
        }

        $ratingForService = $serviceRating ?? $providerRating;

        $review = Review::create([
            'booking_id' => $booking->id,
            'service_id' => $booking->service_id,
            'client_id' => $booking->client_id,
            'provider_id' => $booking->provider_id,
            'provider_rating' => $providerRating,
            'service_rating' => $serviceRating,
            'rating' => $ratingForService,
            'comment' => $data['comment'] ?? null,
            'status' => 'published',
        ]);

        // Update provider rating in profiles
        $providerRatingForProfile = $review->provider_rating;

        if ($providerRatingForProfile !== null) {
            $profile = Profile::firstOrCreate(['user_id' => $booking->provider_id]);

            $count = (int) $profile->rating_count;
            $avg = (float) $profile->rating_avg;

            $newCount = $count + 1;
            $newAvg = (($avg * $count) + (int) $providerRatingForProfile) / $newCount;

            $profile->update([
                'rating_count' => $newCount,
                'rating_avg' => round($newAvg, 2),
            ]);
        }

        return redirect()->route('client.bookings.show', $booking)
            ->with('success', 'Thanks! Your review was submitted');
    }
}
