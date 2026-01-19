<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FeeSetting extends Model
{
    use HasFactory;

    protected $casts = [
        'active' => 'boolean',
        'comission_rate' => 'decimal:4',
        'fixed_fee' => 'decimal:2',
    ];
}
