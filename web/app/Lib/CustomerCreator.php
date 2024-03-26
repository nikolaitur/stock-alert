<?php

declare(strict_types=1);

namespace App\Lib;

use App\Exceptions\ShopifyProductCreatorException;
use App\Models\Session;
use Shopify\Clients\Graphql;
use Illuminate\Support\Facades\DB;
use Shopify\Rest\Admin2024_01\Customer;
use App\Lib\DbSessionStorage;

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

    public static function call(string $shop, string $email, string $variantId, string $productId)
    {
        $dbSession = new DbSessionStorage();
        $session = $dbSession->findSessionByShop($shop);

        $customers = Customer::search(
            $session, // Session
            [], // Url Ids
            ["query" => "email:" . $email], // Params
        );
        dd($customers);

        // $customer = Customer::search($session, [], ['query' => "email:".$email]);
        // for ($i = 0; $i < $count; $i++) {
        //     $response = $client->query(
        //         [
        //             "query" => self::CREATE_PRODUCTS_MUTATION,
        //             "variables" => [
        //                 "input" => [
        //                     "title" => self::randomTitle(),
        //                     "variants" => [["price" => self::randomPrice()]],
        //                 ]
        //             ]
        //         ],
        //     );

        //     if ($response->getStatusCode() !== 200) {
        //         throw new ShopifyProductCreatorException($response->getBody()->__toString(), $response);
        //     }
        // }
    }

    private static function randomTitle()
    {
        $adjective = self::ADJECTIVES[mt_rand(0, count(self::ADJECTIVES) - 1)];
        $noun = self::NOUNS[mt_rand(0, count(self::NOUNS) - 1)];

        return "$adjective $noun";
    }

    private static function randomPrice()
    {

        return (100.0 + mt_rand(0, 1000)) / 100;
    }

    private const ADJECTIVES = [
        "autumn",
        "hidden",
        "bitter",
        "misty",
        "silent",
        "empty",
        "dry",
        "dark",
        "summer",
        "icy",
        "delicate",
        "quiet",
        "white",
        "cool",
        "spring",
        "winter",
        "patient",
        "twilight",
        "dawn",
        "crimson",
        "wispy",
        "weathered",
        "blue",
        "billowing",
        "broken",
        "cold",
        "damp",
        "falling",
        "frosty",
        "green",
        "long",
    ];

    private const NOUNS = [
        "waterfall",
        "river",
        "breeze",
        "moon",
        "rain",
        "wind",
        "sea",
        "morning",
        "snow",
        "lake",
        "sunset",
        "pine",
        "shadow",
        "leaf",
        "dawn",
        "glitter",
        "forest",
        "hill",
        "cloud",
        "meadow",
        "sun",
        "glade",
        "bird",
        "brook",
        "butterfly",
        "bush",
        "dew",
        "dust",
        "field",
        "fire",
        "flower",
    ];
}
