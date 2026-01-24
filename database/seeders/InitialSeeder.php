<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\FeeSetting;
use App\Models\Category;
use App\Models\City;
use App\Models\Service;
use App\Models\ServiceMedia;

use App\Models\ProviderProfile;
use App\Models\ProviderVerification;

use App\Models\Request as JobRequest; // IMPORTANT: your model name may be Request, but we alias it to avoid Illuminate\Http\Request
use App\Models\RequestMedia;

use App\Models\Offer;
use App\Models\Chat;
use App\Models\Message;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Payout;

use App\Models\Review;
use App\Models\Dispute;
use App\Models\Report;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;

class InitialSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------
        // 1) Users
        // ----------------------------
        $admin = User::firstOrCreate(
            ['email' => 'admin@dzservices.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        $client1 = User::firstOrCreate(
            ['email' => 'client@dzservices.test'],
            [
                'name' => 'Demo Client',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'active',
            ]
        );

        $client2 = User::firstOrCreate(
            ['email' => 'client2@dzservices.test'],
            [
                'name' => 'Demo Client 2',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'active',
            ]
        );

        $provider1 = User::firstOrCreate(
            ['email' => 'provider@dzservices.test'],
            [
                'name' => 'Demo Provider',
                'password' => Hash::make('password'),
                'role' => 'provider',
                'status' => 'active',
            ]
        );

        $provider2 = User::firstOrCreate(
            ['email' => 'provider2@dzservices.test'],
            [
                'name' => 'Demo Provider 2',
                'password' => Hash::make('password'),
                'role' => 'provider',
                'status' => 'active',
            ]
        );

        $provider3 = User::firstOrCreate(
            ['email' => 'provider3@dzservices.test'],
            [
                'name' => 'Demo Provider 3',
                'password' => Hash::make('password'),
                'role' => 'provider',
                'status' => 'active',
            ]
        );

        // ----------------------------
        // 2) Fee setting
        // ----------------------------
        FeeSetting::firstOrCreate(
            ['active' => true],
            ['commission_rate' => 0.0700, 'fixed_fee' => null]
        );

        // ----------------------------
        // 3) Cities (58 Wilayas)
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

        // ----------------------------
        // 5) Provider Profiles
        // ----------------------------
        $providers = [$provider1, $provider2, $provider3];

        foreach ($providers as $idx => $p) {
            ProviderProfile::updateOrCreate(
                ['user_id' => $p->id],
                [
                    'bio' => "Demo provider bio (#" . ($idx + 1) . "). Available for professional work across multiple wilayas.",
                    'address' => 'Algeria',
                    'company_name' => 'Demo Company ' . ($idx + 1),
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
        $someCities = City::inRandomOrder()->take(8)->pluck('id')->toArray();
        $someCategories = Category::inRandomOrder()->take(10)->pluck('id')->toArray();

        $demoServices = [
            ['Plumbing repair and installation', 'fixed', 'cash'],
            ['House deep cleaning service', 'fixed', 'online'],
            ['Electrical wiring and fixes', 'hourly', 'both'],
            ['AC installation and maintenance', 'quote', 'cash'],
            ['Phone screen repair', 'fixed', 'online'],
            ['Laptop formatting and cleanup', 'fixed', 'cash'],
            ['Car diagnostics and repair', 'hourly', 'cash'],
            ['Professional wall painting', 'quote', 'both'],
            ['CCTV installation', 'fixed', 'online'],
            ['Moving and transport service', 'quote', 'cash'],
            ['Garden cleaning and trimming', 'hourly', 'cash'],
            ['Web development landing page', 'fixed', 'online'],
        ];

        $serviceImageFiles = [
            'service-01-plumbing-repair-and-installation.jpg',
            'service-02-house-deep-cleaning-service.jpg',
            'service-03-electrical-wiring-and-fixes.jpg',
            'service-04-ac-installation-and-maintenance.jpg',
            'service-05-phone-screen-repair.jpg',
            'service-06-laptop-formatting-and-cleanup.jpg',
            'service-07-car-diagnostics-and-repair.jpg',
            'service-08-professional-wall-painting.jpg',
            'service-09-cctv-installation.jpg',
            'service-10-moving-and-transport-service.jpg',
            'service-11-garden-cleaning-and-trimming.jpg',
            'service-12-web-development-landing-page.jpg',
        ];

        $createdServices = [];

        foreach ($demoServices as $i => [$title, $pricingType, $paymentType]) {
            $provider = $providers[$i % count($providers)];
            $categoryId = $someCategories[$i % count($someCategories)];
            $cityId = $someCities[$i % count($someCities)];

            $slug = Str::slug($title) . '-' . ($i + 1);

            $service = Service::updateOrCreate(
                ['slug' => $slug],
                [
                    'provider_id' => $provider->id,
                    'category_id' => $categoryId,
                    'city_id' => $cityId,
                    'title' => $title,
                    'description' => 'Demo service created by seeder for testing the home page and services pages.',
                    'base_price' => 1500 + ($i * 250),
                    'pricing_type' => $pricingType,
                    'payment_type' => $paymentType, // <-- new column in services
                    'status' => 'approved',
                ]
            );

            $createdServices[] = $service;

            // cover image
            $imageFile = $serviceImageFiles[$i] ?? $serviceImageFiles[$i % count($serviceImageFiles)];

            ServiceMedia::updateOrCreate(
                [
                    'service_id' => $service->id,
                    'position' => 0,
                ],
                [
                    'path' => "/storage/seed/services/{$imageFile}",
                    'type' => 'image',
                    'position' => 0,
                ]
            );
        }

        // ----------------------------
        // 8) Requests + Request Media
        // ----------------------------
        $requestTitles = [
            'Need a plumber urgently',
            'Looking for home deep cleaning',
            'Need electrician for new lights',
            'AC maintenance before summer',
            'Need a web landing page quickly',
        ];

        $createdRequests = [];

        foreach ($requestTitles as $i => $title) {
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
                    'budget_min' => 2000,
                    'budget_max' => 9000,
                    'urgency' => ['low', 'medium', 'high'][$i % 3],
                    'status' => 'open',
                    'visibility' => 'providers_only',
                    'expires_at' => now()->addDays(7 + $i),
                ]
            );

            $createdRequests[] = $req;

            // add 1 media for first 3 requests
            if ($i < 3) {
                RequestMedia::updateOrCreate(
                    [
                        'request_id' => $req->id,
                        'position' => 0,
                    ],
                    [
                        'path' => "/storage/seed/services/" . $serviceImageFiles[$i], // reuse demo images
                        'type' => 'image',
                        'position' => 0,
                    ]
                );
            }
        }

        // ----------------------------
        // 9) Offers
        // ----------------------------
        $createdOffers = [];

        foreach ($createdRequests as $i => $req) {
            $provider = $providers[$i % count($providers)];

            $offer = Offer::updateOrCreate(
                [
                    'request_id' => $req->id,
                    'provider_id' => $provider->id,
                ],
                [
                    'message' => 'Hello! I can help with this request. Here is my offer (demo seed).',
                    'proposed_price' => 3500 + ($i * 400),
                    'estimated_days' => 1 + ($i % 5),
                    'status' => 'sent',
                ]
            );

            $createdOffers[] = $offer;
        }

        // ----------------------------
        // 10) Chats + Messages (service chats + request chats)
        // ----------------------------
        $createdChats = [];

        // Service chats (client1 talks with providers on some services)
        for ($i = 0; $i < min(4, count($createdServices)); $i++) {
            $service = $createdServices[$i];

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

            $createdChats[] = $chat;

            Message::updateOrCreate(
                [
                    'chat_id' => $chat->id,
                    'sender_id' => $client1->id,
                    'body' => 'Hi, I’m interested in your service. Are you available this week?',
                ],
                [
                    'attachment_path' => null,
                    'read_at' => now(),
                ]
            );

            Message::updateOrCreate(
                [
                    'chat_id' => $chat->id,
                    'sender_id' => $service->provider_id,
                    'body' => 'Yes! I can schedule you. Please share your location and preferred time.',
                ],
                [
                    'attachment_path' => null,
                    'read_at' => null,
                ]
            );

            $chat->update(['last_message_at' => now()]);
        }

        // Request chats (client + provider about offer)
        foreach ($createdOffers as $i => $offer) {
            $req = $createdRequests[$i];
            $providerId = $offer->provider_id;
            $clientId = $req->client_id;

            $chat = Chat::updateOrCreate(
                [
                    'type' => 'request',
                    'request_id' => $req->id,
                    'client_id' => $clientId,
                    'provider_id' => $providerId,
                ],
                [
                    'service_id' => null,
                    'last_message_at' => now()->subMinutes(5),
                ]
            );

            $createdChats[] = $chat;

            Message::updateOrCreate(
                [
                    'chat_id' => $chat->id,
                    'sender_id' => $clientId,
                    'body' => 'Thanks for the offer. Can you start tomorrow?',
                ],
                [
                    'attachment_path' => null,
                    'read_at' => now(),
                ]
            );

            Message::updateOrCreate(
                [
                    'chat_id' => $chat->id,
                    'sender_id' => $providerId,
                    'body' => 'Yes, I can start tomorrow. I’ll confirm once you accept.',
                ],
                [
                    'attachment_path' => null,
                    'read_at' => null,
                ]
            );

            $chat->update(['last_message_at' => now()]);
        }

        // ----------------------------
        // 11) Bookings (from service + from accepted offer)
        // ----------------------------
        $createdBookings = [];

        // booking from service (client1 -> provider on service #1)
        if (!empty($createdServices)) {
            $service = $createdServices[0];

            $booking = Booking::updateOrCreate(
                [
                    'source' => 'service',
                    'service_id' => $service->id,
                    'client_id' => $client1->id,
                    'provider_id' => $service->provider_id,
                ],
                [
                    'offer_id' => null,
                    'scheduled_at' => now()->addDays(2),
                    'status' => 'completed',
                    'total_amount' => 5000,
                    'currency' => 'DZD',
                ]
            );

            $createdBookings[] = $booking;
        }

        // booking from offer (client2 accepts offer #2 for request #2)
        if (count($createdOffers) >= 2) {
            $offer = $createdOffers[1];
            $req = $createdRequests[1];

            // mark offer accepted (demo)
            $offer->update(['status' => 'accepted']);
            $req->update(['status' => 'assigned']);

            $booking = Booking::updateOrCreate(
                [
                    'source' => 'request_offer',
                    'offer_id' => $offer->id,
                    'client_id' => $req->client_id,
                    'provider_id' => $offer->provider_id,
                ],
                [
                    'service_id' => null,
                    'scheduled_at' => now()->addDays(3),
                    'status' => 'confirmed',
                    'total_amount' => $offer->proposed_price,
                    'currency' => 'DZD',
                ]
            );

            $createdBookings[] = $booking;
        }

        // ----------------------------
        // 12) Payments (for bookings)
        // ----------------------------
        $fee = FeeSetting::where('active', true)->first();
        $commissionRate = $fee ? (float) $fee->commission_rate : 0.07;

        foreach ($createdBookings as $i => $booking) {
            $amount = (float) $booking->total_amount;
            $platformFee = round($amount * $commissionRate, 2);
            $providerAmount = round($amount - $platformFee, 2);

            $paymentType = ($i % 2 === 0) ? 'online' : 'cash';

            Payment::updateOrCreate(
                [
                    'booking_id' => $booking->id,
                ],
                [
                    'payer_id' => $booking->client_id,
                    'payment_type' => $paymentType, // payments table field
                    'online_provider' => $paymentType === 'online' ? 'stripe' : null,
                    'amount' => $amount,
                    'platform_fee' => $platformFee,
                    'provider_amount' => $providerAmount,
                    'status' => $paymentType === 'online' ? 'paid' : 'pending',
                    'paid_at' => $paymentType === 'online' ? now()->subDay() : null,
                    'metadata' => json_encode(['seed' => true]),
                ]
            );

            // ----------------------------
            // 13) Payouts (only for paid & completed bookings)
            // ----------------------------
            if ($paymentType === 'online' && $booking->status === 'completed') {
                Payout::updateOrCreate(
                    [
                        'provider_id' => $booking->provider_id,
                        'amount' => $providerAmount,
                    ],
                    [
                        'status' => 'sent',
                        'sent_at' => now()->subHours(6),
                        'method' => 'bank_transfer',
                        'metadata' => json_encode(['seed' => true, 'booking_id' => $booking->id]),
                    ]
                );
            }
        }

        // ----------------------------
        // 14) Reviews (for completed booking)
        // ----------------------------
        if (!empty($createdBookings) && !empty($createdServices)) {
            $booking = $createdBookings[0];
            $service = $createdServices[0];

            Review::updateOrCreate(
                [
                    'booking_id' => $booking->id,
                    'client_id' => $booking->client_id,
                    'provider_id' => $booking->provider_id,
                ],
                [
                    'service_id' => $service->id,
                    'rating' => 5,
                    'comment' => 'Great service! Fast and professional. (seed demo)',
                    'status' => 'published',
                ]
            );
        }

        // ----------------------------
        // 15) Disputes (example)
        // ----------------------------
        if (count($createdBookings) >= 2) {
            $booking = $createdBookings[1];

            Dispute::updateOrCreate(
                [
                    'booking_id' => $booking->id,
                    'opened_by' => $booking->client_id,
                ],
                [
                    'reason' => 'Scheduling issue',
                    'description' => 'Provider asked to reschedule multiple times (seed demo).',
                    'status' => 'open',
                    'resolution_note' => null,
                    'resolved_by' => null,
                ]
            );
        }

        // ----------------------------
        // 16) Reports (example)
        // ----------------------------
        if (!empty($createdServices)) {
            $service = $createdServices[2] ?? $createdServices[0];

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

        if (!empty($createdChats)) {
            $chat = $createdChats[0];
            $msg = Message::where('chat_id', $chat->id)->first();

            if ($msg) {
                Report::updateOrCreate(
                    [
                        'reporter_id' => $client1->id,
                        'target_type' => 'message',
                        'target_id' => $msg->id,
                    ],
                    [
                        'reason' => 'Spam / suspicious',
                        'status' => 'open',
                    ]
                );
            }
        }
    }
}
