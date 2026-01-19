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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('source'); // service|request_offer

            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('offer_id')->nullable()->constrained('offers')->nullOnDelete();

            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('provider_id')->constrained('users')->cascadeOnDelete();

            $table->timestamp('scheduled_at')->nullable();
            $table->string('status')->default('pending'); // pending|confirmed|in_progress|completed|cancelled
            $table->decimal('total_amount', 10, 2);
            $table->string('currency')->default('DZD');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
