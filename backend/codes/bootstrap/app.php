<?php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            // Configure rate limiters from config
            RateLimiter::for('auth', function (Request $request) {
                $attempts = config('ratelimit.auth.attempts', 5);
                $decay = config('ratelimit.auth.decay_minutes', 1);
                
                return Limit::perMinutes($decay, $attempts)->by($request->ip());
            });
            
            RateLimiter::for('api', function (Request $request) {
                $attempts = config('ratelimit.api.attempts', 60);
                $decay = config('ratelimit.api.decay_minutes', 1);
                
                return Limit::perMinutes($decay, $attempts)->by($request->user()?->id ?: $request->ip());
            });
            
            RateLimiter::for('global', function (Request $request) {
                $attempts = config('ratelimit.global.attempts', 100);
                $decay = config('ratelimit.global.decay_minutes', 1);
                
                return Limit::perMinutes($decay, $attempts)->by($request->user()?->id ?: $request->ip());
            });
        },
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
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
