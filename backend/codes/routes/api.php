<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\FeedController;
use App\Http\Controllers\Api\V1\ImageController;
use App\Http\Controllers\Api\V1\PostController;
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
        });
    });

    // Image routes
    Route::prefix('images')->group(function () {
        Route::get('/', [ImageController::class, 'show'])->name('api.v1.images.show');
    });

    // Feed & Post routes (all protected)
    Route::middleware('auth:api')->group(function () {
        // Feed
        Route::get('feed', [FeedController::class, 'index'])->name('api.v1.feed.index');

        // Posts
        Route::prefix('posts')->group(function () {
            Route::post('/', [PostController::class, 'store'])->name('api.v1.posts.store');
            Route::put('{post}', [PostController::class, 'update'])->name('api.v1.posts.update');
            Route::delete('{post}', [PostController::class, 'destroy'])->name('api.v1.posts.destroy');
            Route::post('{post}/like', [PostController::class, 'toggleLike'])->name('api.v1.posts.like');
            Route::get('{post}/likers', [PostController::class, 'likers'])->name('api.v1.posts.likers');

            // Comments on a post
            Route::prefix('{post}/comments')->group(function () {
                Route::get('/', [CommentController::class, 'index'])->name('api.v1.comments.index');
                Route::post('/', [CommentController::class, 'store'])->name('api.v1.comments.store');
                Route::put('{comment}', [CommentController::class, 'update'])->name('api.v1.comments.update');
                Route::delete('{comment}', [CommentController::class, 'destroy'])->name('api.v1.comments.destroy');
                Route::get('{comment}/replies', [CommentController::class, 'replies'])->name('api.v1.comments.replies');
                Route::post('{comment}/like', [CommentController::class, 'toggleLike'])->name('api.v1.comments.like');
                Route::get('{comment}/likers', [CommentController::class, 'likers'])->name('api.v1.comments.likers');
            });
        });
    });
});
