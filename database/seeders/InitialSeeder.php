<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Category;
use App\Models\Chat;
use App\Models\City;
use App\Models\Dispute;
use App\Models\Message;
use App\Models\Offer;
use App\Models\Payment;
use App\Models\Payout;
use App\Models\Profile;
use App\Models\ProviderVerification;
use App\Models\Report;
use App\Models\Request as JobRequest;
use App\Models\RequestMedia;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceMedia;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InitialSeeder extends Seeder
{
    public function run(): void
    {
        // Allow mass-assignment inside this seeder (very important for your current models)
        Model::unguard();

        // ----------------------------
        // 1) Users (+ avatar_path)
        // ----------------------------
        $admin = User::updateOrCreate(
            ['email' => 'admin@dzservices.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
                'avatar_path' => '/storage/seed/avatars/admin.jpg',
            ]
        );

        $client1 = User::updateOrCreate(
            ['email' => 'client@dzservices.test'],
            [
                'name' => 'Demo Client',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'active',
                'avatar_path' => '/storage/seed/avatars/client1.jpg',
            ]
        );

        $client2 = User::updateOrCreate(
            ['email' => 'client2@dzservices.test'],
            [
                'name' => 'Demo Client 2',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'active',
                'avatar_path' => '/storage/seed/avatars/client2.jpg',
            ]
        );

        $provider1 = User::updateOrCreate(
            ['email' => 'provider@dzservices.test'],
            [
                'name' => 'Demo Provider',
                'password' => Hash::make('password'),
                'role' => 'provider',
                'status' => 'active',
                'avatar_path' => '/storage/seed/avatars/provider1.jpg',
            ]
        );

        $provider2 = User::updateOrCreate(
            ['email' => 'provider2@dzservices.test'],
            [
                'name' => 'Demo Provider 2',
                'password' => Hash::make('password'),
                'role' => 'provider',
                'status' => 'active',
                'avatar_path' => '/storage/seed/avatars/provider2.jpg',
            ]
        );

        $provider3 = User::updateOrCreate(
            ['email' => 'provider3@dzservices.test'],
            [
                'name' => 'Demo Provider 3',
                'password' => Hash::make('password'),
                'role' => 'provider',
                'status' => 'inactive', // test inactive provider
                'avatar_path' => '/storage/seed/avatars/provider3.jpg',
            ]
        );

        // ----------------------------
        // 2) Cities (58 Wilayas)
        // ----------------------------
        $wilayas = [
            ['01', 'Adrar'], ['02', 'Chlef'], ['03', 'Laghouat'], ['04', 'Oum El Bouaghi'],
            ['05', 'Batna'], ['06', 'Béjaïa'], ['07', 'Biskra'], ['08', 'Béchar'],
            ['09', 'Blida'], ['10', 'Bouira'], ['11', 'Tamanrasset'], ['12', 'Tébessa'],
            ['13', 'Tlemcen'], ['14', 'Tiaret'], ['15', 'Tizi Ouzou'], ['16', 'Alger'],
            ['17', 'Djelfa'], ['18', 'Jijel'], ['19', 'Sétif'], ['20', 'Saïda'],
            ['21', 'Skikda'], ['22', 'Sidi Bel Abbès'], ['23', 'Annaba'], ['24', 'Guelma'],
            ['25', 'Constantine'], ['26', 'Médéa'], ['27', 'Mostaganem'], ['28', "M'Sila"],
            ['29', 'Mascara'], ['30', 'Ouargla'], ['31', 'Oran'], ['32', 'El Bayadh'],
            ['33', 'Illizi'], ['34', 'Bordj Bou Arreridj'], ['35', 'Boumerdès'], ['36', 'El Tarf'],
            ['37', 'Tindouf'], ['38', 'Tissemsilt'], ['39', 'El Oued'], ['40', 'Khenchela'],
            ['41', 'Souk Ahras'], ['42', 'Tipaza'], ['43', 'Mila'], ['44', 'Aïn Defla'],
            ['45', 'Naâma'], ['46', 'Aïn Témouchent'], ['47', 'Ghardaïa'], ['48', 'Relizane'],
            ['49', 'Timimoun'], ['50', 'Bordj Badji Mokhtar'], ['51', 'Béni Abbès'], ['52', 'Ouled Djellal'],
            ['53', 'In Salah'], ['54', 'In Guezzam'], ['55', 'Touggourt'], ['56', 'Djanet'],
            ['57', "El M'Ghair"], ['58', 'El Meniaa'],
        ];

        foreach ($wilayas as [$code, $name]) {
            City::updateOrCreate(
                ['wilaya_code' => $code],
                ['name' => $name, 'wilaya_code' => $code]
            );
        }

        // ----------------------------
        // 4) Categories
        // ----------------------------
        $categories = [
            'Plumbing', 'Electricity', 'Home Cleaning', 'Painting',
            'Carpentry', 'Masonry', 'Air Conditioner Repair', 'Appliance Repair',
            'Car Repair', 'Phone Repair', 'Computer Repair', 'CCTV Installation',
            'Moving Service', 'Gardening', 'Pest Control', 'Babysitting',
            'Private Lessons', 'Translation', 'Photography', 'Video Editing',
            'Graphic Design', 'Web Development', 'Mobile Development', 'Digital Marketing',
            'Makeup Artist', 'Hairdresser',
        ];

        foreach ($categories as $name) {
            Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'parent_id' => null]
            );
        }

        $someCities = City::inRandomOrder()->take(10)->pluck('id')->toArray();
        $someCategories = Category::inRandomOrder()->take(12)->pluck('id')->toArray();

        // ----------------------------
        // 5) Profiles (for ALL users)
        // ----------------------------
        Profile::updateOrCreate(
            ['user_id' => $admin->id],
            [
                'phone' => '+213000000001',
                'city_id' => $someCities[0] ?? null,
                'address' => 'Algeria',
                'bio' => 'Admin profile',
                'company_name' => null,
                'website' => null,
                'verified_at' => null,
                'rating_avg' => 0,
                'rating_count' => 0,
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $client1->id],
            [
                'phone' => '+213000000101',
                'city_id' => $someCities[1] ?? null,
                'address' => 'Client Address 1',
                'bio' => 'Client profile 1 for testing.',
                'company_name' => null,
                'website' => null,
                'verified_at' => null,
                'rating_avg' => 0,
                'rating_count' => 0,
            ]
        );

        Profile::updateOrCreate(
            ['user_id' => $client2->id],
            [
                'phone' => '+213000000102',
                'city_id' => $someCities[2] ?? null,
                'address' => 'Client Address 2',
                'bio' => 'Client profile 2 for testing.',
                'company_name' => null,
                'website' => null,
                'verified_at' => null,
                'rating_avg' => 0,
                'rating_count' => 0,
            ]
        );

        $providers = [$provider1, $provider2, $provider3];

        foreach ($providers as $idx => $p) {
            Profile::updateOrCreate(
                ['user_id' => $p->id],
                [
                    'phone' => '+21300000020'.($idx + 1),
                    'city_id' => $someCities[3 + $idx] ?? null,
                    'address' => 'Algeria',
                    'bio' => 'Demo provider bio (#'.($idx + 1).').',
                    'company_name' => 'Demo Company '.($idx + 1),
                    'website' => 'https://example.com/provider-'.($idx + 1),
                    'verified_at' => $idx === 0 ? now() : null,
                    'rating_avg' => $idx === 0 ? 4.6 : 0,
                    'rating_count' => $idx === 0 ? 12 : 0,
                ]
            );
        }

        // ----------------------------
        // 6) Provider Verification (example)
        // ----------------------------
        ProviderVerification::updateOrCreate(
            [
                'provider_id' => $provider1->id,
                'doc_type' => 'national_id',
                'doc_number' => 'DZ-DEMO-0001',
            ],
            [
                'doc_path' => '/storage/seed/verifications/provider1-id.jpg',
                'status' => 'approved',
                'reviewed_by' => $admin->id,
            ]
        );

        // ----------------------------
        // 7) Demo Services + Service Media
        // ----------------------------
        $demoServices = [
            ['Plumbing repair and installation', 'fixed', 'cash', 'approved'],
            ['House deep cleaning service', 'fixed', 'online', 'approved'],
            ['Electrical wiring and fixes', 'hourly', 'both', 'pending'],
            ['AC installation and maintenance', 'quote', 'cash', 'approved'],
            ['Phone screen repair', 'fixed', 'online', 'rejected'],
            ['Laptop formatting and cleanup', 'fixed', 'cash', 'approved'],
            ['Car diagnostics and repair', 'hourly', 'cash', 'approved'],
            ['Professional wall painting', 'quote', 'both', 'pending'],
            ['CCTV installation', 'fixed', 'online', 'approved'],
            ['Moving and transport service', 'quote', 'cash', 'approved'],
            ['Garden cleaning and trimming', 'hourly', 'cash', 'approved'],
            ['Web development landing page', 'fixed', 'online', 'approved'],
            ['Pest control service', 'fixed', 'cash', 'approved'],
            ['Private math lessons', 'hourly', 'cash', 'approved'],
            ['Graphic design logo pack', 'fixed', 'online', 'approved'],
            ['Digital marketing for Instagram', 'quote', 'online', 'pending'],
        ];

        // put images here: public/storage/seed/services/
        $serviceImageFiles = [
            'service-01.jpg', 'service-02.jpg', 'service-03.jpg', 'service-04.jpg',
            'service-05.jpg', 'service-06.jpg', 'service-07.jpg', 'service-08.jpg',
            'service-09.jpg', 'service-10.jpg', 'service-11.jpg', 'service-12.jpg',
        ];

        $createdServices = [];

        foreach ($demoServices as $i => [$title, $pricingType, $paymentType, $status]) {
            $provider = $providers[$i % count($providers)];
            $categoryId = $someCategories[$i % count($someCategories)];
            $cityId = $someCities[$i % count($someCities)];

            $slug = Str::slug($title).'-'.($i + 1);

            $service = Service::updateOrCreate(
                ['slug' => $slug],
                [
                    'provider_id' => $provider->id,
                    'category_id' => $categoryId,
                    'city_id' => $cityId,
                    'title' => $title,
                    'description' => 'Demo service created by seeder for testing.',
                    'base_price' => 1500 + ($i * 250),
                    'pricing_type' => $pricingType,
                    'payment_type' => $paymentType,
                    'status' => $status,
                ]
            );

            $createdServices[] = $service;

            // reset media to avoid duplicates on re-seed
            ServiceMedia::where('service_id', $service->id)->delete();

            // add 3 images per service
            for ($pos = 0; $pos < 3; $pos++) {
                $img = $serviceImageFiles[($i + $pos) % count($serviceImageFiles)];

                ServiceMedia::create([
                    'service_id' => $service->id,
                    'path' => "/storage/seed/services/{$img}",
                    'type' => 'image',
                    'position' => $pos,
                ]);
            }
        }

        // ----------------------------
        // 8) Requests + Request Media
        // ----------------------------
        $requestSeeds = [
            ['Need a plumber urgently', 'open'],
            ['Looking for home deep cleaning', 'open'],
            ['Need electrician for new lights', 'open'],
            ['AC maintenance before summer', 'assigned'],
            ['Need a web landing page quickly', 'open'],
            ['Painting my apartment (2 rooms)', 'open'],
            ['Fix my phone screen today', 'cancelled'],
            ['Install CCTV for small shop', 'open'],
            ['Garden cleanup this weekend', 'cancelled'],
            ['Need car diagnostics', 'open'],
        ];

        // put images here: public/storage/seed/requests/
        $requestImageFiles = [
            'request-01.jpg', 'request-02.jpg', 'request-03.jpg', 'request-04.jpg', 'request-05.jpg',
        ];

        $createdRequests = [];

        foreach ($requestSeeds as $i => [$title, $status]) {
            $client = ($i % 2 === 0) ? $client1 : $client2;
            $categoryId = $someCategories[$i % count($someCategories)];
            $cityId = $someCities[$i % count($someCities)];

            $req = JobRequest::updateOrCreate(
                [
                    'title' => $title,
                    'client_id' => $client->id,
                ],
                [
                    'category_id' => $categoryId,
                    'city_id' => $cityId,
                    'description' => 'Demo request created by seeder for testing requests + offers + chats.',
                    'budget_min' => 2000 + ($i * 200),
                    'budget_max' => 9000 + ($i * 300),
                    'urgency' => ['low', 'medium', 'high'][$i % 3],
                    'status' => $status,
                    'expires_at' => now()->addDays(7 + $i),
                ]
            );

            $createdRequests[] = $req;

            // reset media to avoid duplicates
            RequestMedia::where('request_id', $req->id)->delete();

            // add 2 images per request
            for ($pos = 0; $pos < 2; $pos++) {
                $img = $requestImageFiles[($i + $pos) % count($requestImageFiles)];

                RequestMedia::create([
                    'request_id' => $req->id,
                    'path' => "/storage/seed/requests/{$img}",
                    'type' => 'image',
                    'position' => $pos,
                ]);
            }
        }

        // ----------------------------
        // 9) Offers (valid app statuses only)
        // sent|assigned|rejected
        // ----------------------------
        $createdOffers = [];

        foreach ($createdRequests as $i => $req) {
            // create 2 offers per request (provider1 + provider2)
            for ($k = 0; $k < 2; $k++) {
                $provider = $providers[$k];

                if ($req->status === 'open') {
                    $status = 'sent';
                } elseif ($req->status === 'assigned') {
                    $status = $k === 0 ? 'assigned' : 'rejected';
                } else {
                    $status = 'rejected';
                }

                $offer = Offer::updateOrCreate(
                    [
                        'request_id' => $req->id,
                        'provider_id' => $provider->id,
                    ],
                    [
                        'message' => 'Hello! I can help with this request. (seed)',
                        'proposed_price' => 3500 + ($i * 400) + ($k * 300),
                        'estimated_days' => 1 + (($i + $k) % 5),
                        'status' => $status,
                    ]
                );

                $createdOffers[] = $offer;
            }
        }

        // ensure at least one ASSIGNED offer + ASSIGNED request (to test booking from offer)
        $assignedOffer = Offer::query()
            ->where('status', 'sent')
            ->first();

        if ($assignedOffer) {
            $assignedOffer->update(['status' => 'assigned']);

            Offer::query()
                ->where('request_id', $assignedOffer->request_id)
                ->where('id', '!=', $assignedOffer->id)
                ->where('status', 'sent')
                ->update(['status' => 'rejected']);

            $specialReq = JobRequest::find($assignedOffer->request_id);
            if ($specialReq) {
                $specialReq->update(['status' => 'assigned']);
            }
        }

        // ----------------------------
        // 10) Chats + Messages
        // ----------------------------
        // Service chats
        foreach (array_slice($createdServices, 0, 4) as $service) {
            $chat = Chat::updateOrCreate(
                [
                    'type' => 'service',
                    'service_id' => $service->id,
                    'client_id' => $client1->id,
                    'provider_id' => $service->provider_id,
                ],
                [
                    'request_id' => null,
                    'last_message_at' => now()->subMinutes(10),
                ]
            );

            Message::create([
                'chat_id' => $chat->id,
                'sender_id' => $client1->id,
                'body' => 'Hi, I’m interested in your service. Are you available this week?',
                'read_at' => now(),
            ]);

            Message::create([
                'chat_id' => $chat->id,
                'sender_id' => $service->provider_id,
                'body' => 'Yes! I can schedule you. Please share your location and preferred time.',
                'read_at' => null,
            ]);

            $chat->update(['last_message_at' => now()]);
        }

        // Request chats (client + provider about offer)
        foreach (array_slice($createdOffers, 0, 6) as $offer) {
            $req = JobRequest::find($offer->request_id);
            if (! $req) {
                continue;
            }

            $chat = Chat::updateOrCreate(
                [
                    'type' => 'request',
                    'request_id' => $req->id,
                    'client_id' => $req->client_id,
                    'provider_id' => $offer->provider_id,
                ],
                [
                    'service_id' => null,
                    'last_message_at' => now()->subMinutes(5),
                ]
            );

            Message::create([
                'chat_id' => $chat->id,
                'sender_id' => $req->client_id,
                'body' => 'Thanks for the offer. Can you start tomorrow?',
                'read_at' => now(),
            ]);

            Message::create([
                'chat_id' => $chat->id,
                'sender_id' => $offer->provider_id,
                'body' => 'Yes, I can start tomorrow. I’ll confirm once you accept.',
                'read_at' => null,
            ]);

            $chat->update(['last_message_at' => now()]);
        }

        // ----------------------------
        // 11) Bookings (ALL cases)
        // ----------------------------
        $createdBookings = [];

        // A) Pending booking from ASSIGNED offer (request-first)
        if ($assignedOffer) {
            $req = JobRequest::find($assignedOffer->request_id);

            if ($req) {
                $booking = Booking::updateOrCreate(
                    [
                        'source' => 'request_offer',
                        'offer_id' => $assignedOffer->id,
                        'client_id' => $req->client_id,
                        'provider_id' => $assignedOffer->provider_id,
                    ],
                    [
                        'service_id' => null,
                        'scheduled_at' => null,
                        'status' => 'pending',
                        'total_amount' => $assignedOffer->proposed_price,
                        'currency' => 'DZD',
                    ]
                );

                $createdBookings[] = $booking;
            }
        }

        // B) Bookings from services with different statuses (service-first)
        $bookingStatusPool = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

        foreach (array_slice($createdServices, 0, 8) as $i => $service) {
            $client = ($i % 2 === 0) ? $client1 : $client2;

            $booking = Booking::updateOrCreate(
                [
                    'source' => 'service',
                    'service_id' => $service->id,
                    'client_id' => $client->id,
                    'provider_id' => $service->provider_id,
                ],
                [
                    'offer_id' => null,
                    'scheduled_at' => now()->addDays($i + 1),
                    'status' => $bookingStatusPool[$i % count($bookingStatusPool)],
                    'total_amount' => 4500 + ($i * 350),
                    'currency' => 'DZD',
                ]
            );

            $createdBookings[] = $booking;
        }

        // ----------------------------
        // 12) Payments (pending + paid) with your fake OTP metadata
        // ----------------------------
        $commissionRate = 0.07;

        foreach ($createdBookings as $i => $booking) {
            $amount = (float) $booking->total_amount;
            $platformFee = round($amount * $commissionRate, 2);
            $providerAmount = round($amount - $platformFee, 2);

            // mix payment types
            $paymentType = ($i % 2 === 0) ? 'online' : 'cash';

            // status rules (simple + realistic)
            // - online: pending until paid
            // - cash: pending until provider confirms cash
            $status = 'pending';
            if ($paymentType === 'online' && in_array($booking->status, ['confirmed', 'in_progress', 'completed'], true)) {
                $status = 'paid';
            }
            if ($paymentType === 'cash' && $booking->status === 'completed') {
                // you can decide if cash becomes paid only after provider confirm,
                // but for testing we keep it pending until confirmed in UI
                $status = 'pending';
            }

            Payment::updateOrCreate(
                ['booking_id' => $booking->id],
                [
                    'payer_id' => $booking->client_id,
                    'payment_type' => $paymentType,
                    'online_provider' => $paymentType === 'online' ? 'fake' : null,
                    'amount' => $amount,
                    'platform_fee' => $platformFee,
                    'provider_amount' => $providerAmount,
                    'status' => $status,
                    'paid_at' => $status === 'paid' ? now()->subDay() : null,
                    'metadata' => [
                        'seed' => true,
                        'phone' => '+000000000',
                        'code' => '000000',
                    ],
                ]
            );

            // ----------------------------
            // 13) Payouts (only for PAID ONLINE)
            // ----------------------------
            if ($status === 'paid' && $paymentType === 'online') {
                $payoutStatus = ($booking->status === 'completed') ? 'sent' : 'pending';

                Payout::updateOrCreate(
                    [
                        'provider_id' => $booking->provider_id,
                        'booking_id' => $booking->id,
                        'amount' => $providerAmount,
                    ],
                    [
                        'status' => $payoutStatus,
                        'sent_at' => $payoutStatus === 'sent' ? now()->subHours(6) : null,
                        'method' => $payoutStatus === 'sent' ? 'bank_transfer' : null,
                        'metadata' => $payoutStatus === 'sent'
                            ? [
                                'seed' => true,
                                'account_name' => 'Demo Provider',
                                'account_number' => '0000000000',
                            ]
                            : [
                                'seed' => true,
                                'note' => 'Awaiting admin payout details',
                            ],
                    ]
                );
            }
        }

        // ----------------------------
        // 14) Review (example for completed booking)
        // ----------------------------
        $completed = Booking::where('status', 'completed')->first();
        if ($completed) {
            Review::updateOrCreate(
                [
                    'booking_id' => $completed->id,
                    'client_id' => $completed->client_id,
                    'provider_id' => $completed->provider_id,
                ],
                [
                    'service_id' => $completed->service_id,
                    'rating' => 5,
                    'comment' => 'Great service! Fast and professional. (seed demo)',
                    'status' => 'published',
                ]
            );
        }

        // ----------------------------
        // 15) Dispute (example)
        // ----------------------------
        $anyBooking = Booking::first();
        if ($anyBooking) {
            Dispute::updateOrCreate(
                [
                    'booking_id' => $anyBooking->id,
                    'opened_by' => $anyBooking->client_id,
                ],
                [
                    'reason' => 'Scheduling issue',
                    'description' => 'Seed dispute example.',
                    'status' => 'open',
                    'resolution_note' => null,
                    'resolved_by' => null,
                ]
            );
        }

        // ----------------------------
        // 16) Report (example)
        // ----------------------------
        if (! empty($createdServices)) {
            $service = $createdServices[0];

            Report::updateOrCreate(
                [
                    'reporter_id' => $client1->id,
                    'target_type' => 'service',
                    'target_id' => $service->id,
                ],
                [
                    'reason' => 'Incorrect information',
                    'status' => 'open',
                ]
            );
        }

        Model::reguard();
    }
}
