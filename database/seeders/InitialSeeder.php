<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\FeeSetting;
use App\Models\Category;
use App\Models\City;
use App\Models\Service;
use App\Models\ServiceMedia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InitialSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------------
        // 1) Users (admin + demo users)
        // ----------------------------
        User::firstOrCreate(
            ['email' => 'admin@dzservices.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        User::firstOrCreate(
            ['email' => 'client@dzservices.test'],
            [
                'name' => 'Demo Client',
                'password' => Hash::make('password'),
                'role' => 'client',
                'status' => 'active',
            ]
        );

        User::firstOrCreate(
            ['email' => 'provider@dzservices.test'],
            [
                'name' => 'Demo Provider',
                'password' => Hash::make('password'),
                'role' => 'provider',
                'status' => 'active',
            ]
        );

        // ----------------------------
        // 2) Fee setting (platform income)
        // ----------------------------
        FeeSetting::firstOrCreate(
            ['active' => true],
            ['commission_rate' => 0.0700, 'fixed_fee' => null] // 7% fee
        );

        // ----------------------------
        // 3) Cities = All 58 Wilayas
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
        // 4) Categories (more choices)
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
        // 5) Demo services + media (for testing Home + /services)
        // ----------------------------
        $provider = User::where('email', 'provider@dzservices.test')->first();

        if ($provider) {
            $someCities = City::inRandomOrder()->take(6)->pluck('id')->toArray();
            $someCategories = Category::inRandomOrder()->take(6)->pluck('id')->toArray();

            // These must exist in: storage/app/public/seed/services/
            // And must be accessible via: /storage/seed/services/{file}
            $demoImages = [
                'plumbing-1.jpg',
                'plumbing-2.jpg',
                'electrical-1.jpg',
                'cleaning-1.jpg',
                'mechanic-1.jpg',
            ];

            $demoServices = [
                'Plumbing repair and installation',
                'House deep cleaning service',
                'Electrical wiring and fixes',
                'AC installation and maintenance',
                'Phone screen repair',
                'Laptop formatting and cleanup',
                'Car diagnostics and repair',
                'Professional wall painting',
                'CCTV installation',
                'Moving and transport service',
                'Garden cleaning and trimming',
                'Web development landing page',
            ];

            foreach ($demoServices as $i => $title) {
                $categoryId = $someCategories[$i % count($someCategories)];
                $cityId = $someCities[$i % count($someCities)];

                // Keep slug stable between runs
                $slug = Str::slug($title) . '-' . ($i + 1);

                // Create/update service
                $service = Service::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'provider_id' => $provider->id,
                        'category_id' => $categoryId,
                        'city_id' => $cityId,
                        'title' => $title,
                        'description' => 'Demo service created by seeder for testing the home page and services pages.',
                        'base_price' => 1500 + ($i * 250),
                        'pricing_type' => 'fixed',
                        'payment_type' => 'online',
                        'status' => 'approved',
                    ]
                );

                // Add/update 1 cover image (position 0)
                $imageFile = $demoImages[$i % count($demoImages)];

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
        }
    }
}
