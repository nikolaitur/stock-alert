<?php

declare(strict_types=1);

namespace App\Lib\Handlers\Privacy;

use App\Lib\DbSessionStorage;
use App\Lib\SendEmail;
use Illuminate\Support\Facades\Log;
use Shopify\Rest\Admin2024_01\Metafield;
use Shopify\Rest\Admin2024_01\Product;
use Shopify\Webhooks\Handler;

/**
 * 48 hours after a store owner uninstalls your app, Shopify invokes this privacy
 * webhook.
 *
 * https://shopify.dev/docs/apps/webhooks/configuration/mandatory-webhooks#shop-redact
 */
class ShopProductsUpdateData implements Handler
{
    public function handle(string $topic, string $shop, array $body): void
    {
        Log::debug("Handling shop redaction request for $shop");
        // error_log()
        $dbSessionStorage = new DbSessionStorage();
        $session = $dbSessionStorage->findSessionByShop($shop);
        $productId = $body['id'];
        // $products = Product::find(
        //     $session,
        //     $body['id'],
        //     [],
        //     []
        // );
        // Find product to get Variants and quantity
        try {
            $products = Product::find(
                $session,
                $productId,
                [],
                []
            );
            // dd($products);
            // Log::debug($products->id);
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
                    // Log::debug($variant->inventory_quantity.$variant->old_inventory_quantity.$stockAlertSettings);
                    // will trigger with not send alerts and current quantity is bigger than stock_alert_settings
                    if ($variant->inventory_quantity > $stockAlertSettings && !$alert->send_status) {
                        // the condition is good, so will email with trigger flow
                        SendEmail::call($alert->customers->shopify_customer_id, $shop, $productId."", $variant->title);
                        $alert->send_status = true;
                        $alert->save(); 
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
            // return response()->json(["success" => $success, "error" => $error], $code);
        }


        // Payload has the following shape:
        // {
        //   "shop_id": 954889,
        //   "shop_domain": "{shop}.myshopify.com"
        // }
    }
}
