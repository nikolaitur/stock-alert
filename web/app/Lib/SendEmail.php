<?php

declare(strict_types=1);

namespace App\Lib;

use Shopify\Clients\Graphql;
use App\Lib\DbSessionStorage;
use Illuminate\Support\Facades\Log;

class SendEmail
{
    private const FLOW_TRIGGER_RECEIVE = <<<'QUERY'
    mutation flowTriggerReceive($payload: JSON!) {
        flowTriggerReceive(
            handle: "stock-alert-trigger",
            payload: $payload
        )
            {
                userErrors {field, message}
            }
    }
    QUERY;

    public static function call(string $customer_id, string $shop, string $productId, string $variantTitle)
    {
        // dd($productId);
        $dbSession = new DbSessionStorage();
        $session = $dbSession->findSessionByShop($shop);
        // product, customerEmail, varaintTitle
        $client = new Graphql($session->getShop(), $session->getAccessToken());
        $customer = \Shopify\Rest\Admin2024_01\Customer::find(
            $session,
            $customer_id,
            []
        );
        $product = \Shopify\Rest\Admin2024_01\Product::find(
            $session,
            $productId,
            []
        );
        // dd($product);
        Log::debug("Handling shop redaction request for $shop");
        $client->query(
            [
                "query" => self::FLOW_TRIGGER_RECEIVE,
                "variables" => [
                    "payload" => [
                        "variantTitle" => $variantTitle,
                        "productTitle" => $product->title,
                        "email" => $customer->email,
                    ]
                ]
            ],
        );
        // dd($response->getDecodedBody());
        return true;
    }
}
