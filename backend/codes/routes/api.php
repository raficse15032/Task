<?php

use App\Http\Controllers\Api\V1\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// API v1 Routes
Route::prefix('v1')->group(function () {
    // Authentication routes
    Route::prefix('auth')->group(function () {
        // Public routes with rate limiting
        Route::middleware('throttle:auth')->group(function () {
            Route::post('register', [AuthController::class, 'register'])->name('api.v1.auth.register');
            Route::post('login', [AuthController::class, 'login'])->name('api.v1.auth.login');
        });
        
        // Protected routes
        Route::middleware('auth:api')->group(function () {
            Route::post('logout', [AuthController::class, 'logout'])->name('api.v1.auth.logout');
            Route::post('refresh', [AuthController::class, 'refresh'])->name('api.v1.auth.refresh');
            Route::get('me', [AuthController::class, 'me'])->name('api.v1.auth.me');
        });
    });
});
