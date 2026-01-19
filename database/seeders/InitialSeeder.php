<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\City;
use App\Models\FeeSetting;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
class InitialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //Admin User
        User::firstOrCreate(
            ['email' => 'admin@dzservices.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );

        //Fee Setting (7%)
        FeeSetting::firstOrCreate(
            ['active' => true],
            [
                'commission_rate'=> 0.0700 , 
                'fixed_fee' => null,
            ]
        );

        //Sample cities 
        $cities = [
            ['name' => 'Algiers' , 'wilaya_code' => '16'],
            ['name' => 'Oran' , 'wilaya_code' => '31'],
            ['name' => 'Constantine' , 'wilaya_code' => '25'],
        ];

        foreach ($cities as $c) {
            City::firstOrCreate(['name' => $c['name']],$c);
        }

        //Sample categories
        $categories = ['Plumbing' , 'Electricity' , 'Cleaning' , 'Web Development' , 'Design'];

        foreach ($categories as $name) {
            Category::firstOrCreate(
                ['slug' =>Str::slug($name)],
                ['name' => $name , 'parent_id' => null]
            );
        }
    }
}
