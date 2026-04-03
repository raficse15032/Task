<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting Configuration
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting for different endpoint types.
    | Values are in requests per minute.
    |
    */

    'auth' => [
        'attempts' => env('RATE_LIMIT_AUTH_ATTEMPTS', 5),
        'decay_minutes' => env('RATE_LIMIT_AUTH_DECAY', 1),
    ],

    'api' => [
        'attempts' => env('RATE_LIMIT_API_ATTEMPTS', 60),
        'decay_minutes' => env('RATE_LIMIT_API_DECAY', 1),
    ],

    'global' => [
        'attempts' => env('RATE_LIMIT_GLOBAL_ATTEMPTS', 100),
        'decay_minutes' => env('RATE_LIMIT_GLOBAL_DECAY', 1),
    ],

];
