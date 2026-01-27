<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isProvider(): bool
    {
        return $this->role === 'provider';
    }

    public function isClient(): bool
    {
        return $this->role === 'client';
    }

    public function providerProfile()
    {
        return $this->hasOne(\App\Models\ProviderProfile::class);
    }

    public function providerVerifications()
    {
        return $this->hasMany(\App\Models\ProviderVerification::class, 'provider_id');
    }

    public function services()
    {
        return $this->hasMany(\App\Models\Service::class, 'provider_id');
    }

    public function clientBookings()
    {
        return $this->hasMany(\App\Models\Booking::class, 'client_id');
    }

    public function providerBookings()
    {
        return $this->hasMany(\App\Models\Booking::class, 'provider_id');
    }

    public function clientChats()
    {
        return $this->hasMany(\App\Models\Chat::class, 'client_id');
    }

    public function providerChats()
    {
        return $this->hasMany(\App\Models\Chat::class, 'provider_id');
    }
}
