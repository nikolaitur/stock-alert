<?php

use App\Lib\CustomerCreator;
use App\Lib\DbSessionStorage;
use App\Lib\SendEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Shopify\Rest\Admin2024_01\Metafield;
use Shopify\Rest\Admin2024_01\Product;

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
    // $response
    try {
        $success = CustomerCreator::call($shop, $email, $request->get("productId"), $request->get("variantId"));
        // $success = true;
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

        Log::error("Failed to create customer: $error");
    } finally {
        return response()->json(["success" => $success, "error" => $error], $code);
    }

    // return response()->json($response);
});

Route::post("/product_update", function (Request $request) {
    $validated = $request->validate([
        'productId' => "required|string",
        "shop" => "required|string"
    ]);
    $productId = $request->get("productId");
    $shop = $request->get("shop");
    // find Session from shop name
    $dbSessionStorage = new DbSessionStorage();
    $session = $dbSessionStorage->findSessionByShop($shop);
    // $response
    $success = true;$error=null;$code=200;
    // Find product to get Variants and quantity
    try {
        $products = Product::find(
            $session,
            $productId,
            [],
            []
        );
        // dd($products);
        // make varaientsIds to check with saved varaients id
        $varientsId = [];
        foreach ($products->variants as $item) {
            array_push($varientsId, $item->id);
        }
        // find alerts table with products id to check the condition
        $alerts = \App\Models\StockAlert::where('product_id', $productId)->get();
        // find metafields data with stock_alert_settings fields, 
        $metafields = Metafield::all($session, [], ["metafield" => ["owner_id" => $productId, "owner_resource" => "product"]]);
        $stockAlertSettings = -1;
        foreach ($metafields as $metafield) {
            if ($metafield->key == "stock_alert_settings") {
                $stockAlertSettings = $metafield->value;
            }
        }
    
        if ($stockAlertSettings == -1) {
            return;
        }
        // will find alerts record and will compare product quentity is bigger than stock_alert_settings value
        foreach ($alerts as $alert) {
            // dd($alert);
            if ($alert->product_id == $productId && in_array($alert->variant_id, $varientsId)) {
                // dd($alert->variant_id);
                $variant = [];
                foreach ($products->variants as $item) {
                    if ($item->id == $alert->variant_id) {
                        $variant = $item;
                    }
                }
    
                if ($variant->inventory_quantity > $stockAlertSettings) {
                    // the condition is good, so will email with trigger flow
                    SendEmail::call($alert->customers->shopify_customer_id, $shop, $productId, $variant->title);
                }            
            }
        }
    
    
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

        Log::error("Failed to create customer: $error");
    } finally {
        return response()->json(["success" => $success, "error" => $error], $code);
    }

    // return response()->json($response);
});
