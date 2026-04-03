<?php

namespace App\Providers;

use App\Repositories\Contracts\CommentLikeRepositoryInterface;
use App\Repositories\Contracts\CommentRepositoryInterface;
use App\Repositories\Contracts\ImageRepositoryInterface;
use App\Repositories\Contracts\PostLikeRepositoryInterface;
use App\Repositories\Contracts\PostRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\CommentLikeRepository;
use App\Repositories\CommentRepository;
use App\Repositories\ImageRepository;
use App\Repositories\PostLikeRepository;
use App\Repositories\PostRepository;
use App\Repositories\UserRepository;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Bind repository interfaces to their implementations
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(ImageRepositoryInterface::class, ImageRepository::class);
        $this->app->bind(PostRepositoryInterface::class, PostRepository::class);
        $this->app->bind(CommentRepositoryInterface::class, CommentRepository::class);
        $this->app->bind(PostLikeRepositoryInterface::class, PostLikeRepository::class);
        $this->app->bind(CommentLikeRepositoryInterface::class, CommentLikeRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
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
    }
}
