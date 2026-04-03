<?php

use App\Enums\HttpStatus;
use App\Enums\ResponseMessage;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->throttleApi();
        
        // Trust proxies for forwarded headers (Next.js, Nginx, Load Balancers)
        $middleware->trustProxies(at: '*', headers: 
            Request::HEADER_X_FORWARDED_FOR |
            Request::HEADER_X_FORWARDED_HOST |
            Request::HEADER_X_FORWARDED_PORT |
            Request::HEADER_X_FORWARDED_PROTO
        );

        // Prevent redirect to login route for API requests
        Authenticate::redirectUsing(function () {
            return null;
        });
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::UNAUTHORIZED->value,
            ], HttpStatus::UNAUTHORIZED->value);
        });
    })->create();
