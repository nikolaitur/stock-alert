<?php

use App\Lib\CustomerCreator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});

Route::post("/customer", function (Request $request) {
    $validated = $request->validate([
        'email' => "required|email",
        "shop" => "required|string",
    ]);
    $email = $request->get("email");
    $shop = $request->get("shop");
    CustomerCreator::call($shop, $email, $request->get("productId"), $request->get("variantId"));
    return response()->json(['request' => $email]);
});
