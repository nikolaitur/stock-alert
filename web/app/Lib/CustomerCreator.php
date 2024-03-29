<?php

declare(strict_types=1);

namespace App\Lib;

use Shopify\Rest\Admin2024_01\Customer;
use App\Lib\DbSessionStorage;
use Shopify\Rest\Admin2024_01\Product;

class CustomerCreator
{
    private const GET_CUSTOMERS_BY_EMAIL = <<<'QUERY'
    query($email: string!) {
        customers(first: 1, query: "email:$email") {
          edges {
            node {
              id
            }
          }
        }
      }
    QUERY;

    public static function call(string $shop, string $email, string $productId, string $variantId)
    {
        $dbSession = new DbSessionStorage();
        $session = $dbSession->findSessionByShop($shop);
        // $product = Product::find($session, $productId);
        // dd($product);
        $customer = \App\Models\Customer::where("email", $email)->where('shop', $shop)->first();
        // $newCustomer = null;
        // dd($customer);
        if (!isset($customer) || is_null($customer)) {
            $shopifyCustomer = Customer::all($session, [], ["query" => "email" . $email]);
            $shopifyCustomer = count($shopifyCustomer) > 0 ? $shopifyCustomer[0] : null;
            if (is_null($shopifyCustomer)) {
                $shopifyCustomer = new Customer($session);
                $shopifyCustomer->email = $email;
                $shopifyCustomer->save(true);
            }
            
            $newCustomer = \App\Models\Customer::create([
                'email' => $email,
                'shopify_customer_id' => $shopifyCustomer->id,
                "shop" => $shop
            ]);

            $customer = $newCustomer;
        }

        \App\Models\StockAlert::create([
            'customer_id' => $customer->id,
            'product_id' => $productId,
            'variant_id' => $variantId,
        ]);

        return true;
    }
}
