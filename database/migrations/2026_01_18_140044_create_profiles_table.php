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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();

            // one profile per user
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unique('user_id');

            // common fields (all roles)
            $table->string('phone', 30)->nullable();
            $table->foreignId('city_id')->nullable()->constrained('cities')->nullOnDelete();
            $table->string('address')->nullable();
            $table->text('bio')->nullable();

            // provider extra fields (nullable for others)
            $table->string('company_name')->nullable();
            $table->string('website')->nullable();

            // keep your provider-specific stats (nullable/0 for non-provider)
            $table->timestamp('verified_at')->nullable();
            $table->decimal('rating_avg', 3, 2)->default(0);
            $table->unsignedInteger('rating_count')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
