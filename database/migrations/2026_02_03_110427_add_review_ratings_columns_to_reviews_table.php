<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (! Schema::hasColumn('reviews', 'provider_rating')) {
                $table->unsignedTinyInteger('provider_rating')->nullable();
            }

            if (! Schema::hasColumn('reviews', 'service_rating')) {
                $table->unsignedTinyInteger('service_rating')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            if (Schema::hasColumn('reviews', 'provider_rating')) {
                $table->dropColumn('provider_rating');
            }

            if (Schema::hasColumn('reviews', 'service_rating')) {
                $table->dropColumn('service_rating');
            }
        });
    }
};
