<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    use HasFactory;

    public static function findTokenByShop(string $shop)
    {
        return Session::where("shop", $shop)->first()->sessionId;
    }
}
