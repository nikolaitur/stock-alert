<?php

use App\Exceptions\ShopifyProductCreatorException;
use App\Lib\AuthRedirection;
use App\Lib\CustomerCreator;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Models\Session;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Shopify\Auth\OAuth;
use Shopify\Auth\Session as AuthSession;
use Shopify\Clients\HttpHeaders;
use Shopify\Clients\Rest;
use Shopify\Context;
use Shopify\Exception\InvalidWebhookException;
use Shopify\Rest\Admin2024_01\Metafield;
use Shopify\Rest\Admin2024_01\Product;
use Shopify\Rest\Admin2024_01\Variant;
use Shopify\Rest\Admin2024_01\Theme;
use Shopify\Utils;
use Shopify\Webhooks\Registry;
use Shopify\Webhooks\Topics;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
| If you are adding routes outside of the /api path, remember to also add a
| proxy rule for them in web/frontend/vite.config.js
|
*/

Route::fallback(function (Request $request) {
    if (Context::$IS_EMBEDDED_APP && $request->query("embedded", false) === "1") {
        if (env('APP_ENV') === 'production') {
            return file_get_contents(public_path('index.html'));
        } else {
            return file_get_contents(base_path('frontend/index.html'));
        }
    } else {
        return redirect(Utils::getEmbeddedAppUrl($request->query("host", null)) . "/" . $request->path());
    }
})->middleware('shopify.installed');

Route::get('/api/auth', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));
    Log::info($shop);
    // Delete any previously created OAuth sessions that were not completed (don't have an access token)
    Session::where('shop', $shop)->where('access_token', null)->delete();

    return AuthRedirection::redirect($request);
});

Route::get('/api/auth/callback', function (Request $request) {
    $session = OAuth::callback(
        $request->cookie(),
        $request->query(),
        ['App\Lib\CookieHandler', 'saveShopifyCookie'],
    );

    $host = $request->query('host');
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    $response = Registry::register('/api/webhooks', Topics::APP_UNINSTALLED, $shop, $session->getAccessToken());
    if ($response->isSuccess()) {
        Log::debug("Registered APP_UNINSTALLED webhook for shop $shop");
    } else {
        Log::error(
            "Failed to register APP_UNINSTALLED webhook for shop $shop with response body: " .
            print_r($response->getBody(), true)
        );
    }

    $response = Registry::register('/api/webhooks', Topics::PRODUCTS_UPDATE, $shop, $session->getAccessToken());
    if ($response->isSuccess()) {
        Log::debug("Registered PRODUCTS_UPDATE webhook for shop $shop");
    } else {
        Log::error(
            "Failed to register PRODUCTS_UPDATE webhook for shop $shop with response body: " .
            print_r($response->getBody(), true)
        );
    }

    $redirectUrl = Utils::getEmbeddedAppUrl($host);
    if (Config::get('shopify.billing.required')) {
        list ($hasPayment, $confirmationUrl) = EnsureBilling::check($session, Config::get('shopify.billing'));

        if (!$hasPayment) {
            $redirectUrl = $confirmationUrl;
        }
    }

    return redirect($redirectUrl);
});

Route::get('/api/alerts', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active
    // first get all alerts records
    $alerts = \App\Models\StockAlert::where('send_status', false)
        ->selectRaw('*, count(customer_id) as subscriptions')
        ->groupBy(['product_id', 'variant_id'])
        ->get();

    $response = [];
    foreach ($alerts as &$alert) {
        if ($alert->customers->shop == $session->getShop()) {
            $product = Product::find($session, $alert->product_id, []);
            $variant = Variant::find($session, $alert->variant_id, []);
            $alert->product_title = $product->title;
            $alert->variant_title = $variant->title;
            $alert->stockLevel = $variant->inventory_quantity;
            $alert->featuredImage = $product->images[0]->src;
            // $alert->product_title = $alert->product_id;
            // $alert->variant_title = 'Variant Title';
            array_push($response, $alert);
        }
    }
    return response()->json($response);

})->middleware('shopify.auth');


Route::get('/api/subscriptions/{product_id}', function (int $product_id, Request $request) {

    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active
    // first get all alerts records
    $alert = \App\Models\StockAlert::where('id', $product_id)
        ->selectRaw('*, count(customer_id) as subscriptions')
        ->groupBy(['product_id', 'variant_id'])
        ->first();

    

    // Make response with alert data with customers data
    $product = Product::find($session, $alert->product_id, []);
    $variant = Variant::find($session, $alert->variant_id, []);
    $alert->product_title = $product->title;
    $alert->variant_title = $variant->title;
    $alert->stockLevel = $variant->inventory_quantity;
    $alert->featuredImage = $product->images[0]->src;

    $emails = \App\Models\StockAlert::where("product_id", $alert->product_id)->get();
    $customers = array ();
    foreach ($emails as &$email) {
        array_push($customers, $email->customers);
    }
    return response()->json(['alert' => $alert, 'customers' => $customers]);

})->middleware('shopify.auth');

Route::get('/api/app/enable', function (Request $request) {
    $session = $request->get('shopifySession');
    $shop = $session->getShop();

    $appInfo = \App\Models\AppInfo::where('shop', $shop)->first();
    if (!isset ($appInfo)) {
        $appInfo = new \App\Models\AppInfo();
        $appInfo->shop = $shop;
        $appInfo->is_enable = true;
        $appInfo->save();
    } else {
        $appInfo->is_enable = true;
        $appInfo->save();
    }

    return response()->json(['msg' => 'ok']);
})->middleware('shopify.auth');

Route::get('/api/app/disable', function (Request $request) {
    $session = $request->get('shopifySession');
    $shop = $session->getShop();

    $appInfo = \App\Models\AppInfo::where('shop', $shop)->first();
    if (!isset ($appInfo)) {
        $appInfo = new \App\Models\AppInfo();
        $appInfo->shop = $shop;
        $appInfo->is_enable = false;
        $appInfo->save();
    } else {
        $appInfo->is_enable = false;
        $appInfo->save();
    }

    return response()->json(['msg' => 'ok']);
})->middleware('shopify.auth');

Route::get('/api/app/status', function (Request $request) {
    $session = $request->get('shopifySession');
    $shop = $session->getShop();

    $themes = Theme::all($session);

    $appInfo = \App\Models\AppInfo::where('shop', $shop)->first();
    $appInfo->themes = $themes;

    return response()->json($appInfo);
})->middleware('shopify.auth');

Route::get('/api/products/create', function (Request $request) {
    /** @var AuthSession */
    $session = $request->get('shopifySession'); // Provided by the shopify.auth middleware, guaranteed to be active

    $success = $code = $error = null;
    try {
        ProductCreator::call($session, 5);
        $success = true;
        $code = 200;
        $error = null;
    } catch (\Exception $e) {
        $success = false;

        if ($e instanceof ShopifyProductCreatorException) {
            $code = $e->response->getStatusCode();
            $error = $e->response->getDecodedBody();
            if (array_key_exists("errors", $error)) {
                $error = $error["errors"];
            }
        } else {
            $code = 500;
            $error = $e->getMessage();
        }

        Log::error("Failed to create products: $error");
    } finally {
        return response()->json(["success" => $success, "error" => $error], $code);
    }
})->middleware('shopify.auth');

Route::post('/api/webhooks', function (Request $request) {
    try {
        $topic = $request->header(HttpHeaders::X_SHOPIFY_TOPIC, '');

        $response = Registry::process($request->header(), $request->getContent());
        if (!$response->isSuccess()) {
            Log::error("Failed to process '$topic' webhook: {$response->getErrorMessage()}");
            return response()->json(['message' => "Failed to process '$topic' webhook"], 500);
        }
    } catch (InvalidWebhookException $e) {
        Log::error("Got invalid webhook request for topic '$topic': {$e->getMessage()}");
        return response()->json(['message' => "Got invalid webhook request for topic '$topic'"], 401);
    } catch (\Exception $e) {
        Log::error("Got an exception when handling '$topic' webhook: {$e->getMessage()}");
        return response()->json(['message' => "Got an exception when handling '$topic' webhook"], 500);
    }
});
