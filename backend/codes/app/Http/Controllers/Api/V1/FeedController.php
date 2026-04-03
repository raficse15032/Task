<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\HttpStatus;
use App\Enums\ResponseMessage;
use App\Http\Controllers\Controller;
use App\Services\PostService;
use App\Services\LikeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class FeedController extends Controller
{
    protected PostService $postService;

    public function __construct(PostService $postService)
    {
        $this->postService = $postService;
    }

    public function index(Request $request): JsonResponse
    {
        $userId = Auth::guard('api')->id();
        $perPage = $request->integer('per_page', 15);
        $page = $request->integer('page', 1);

        $posts = $this->postService->getFeed($userId, $perPage, $page);

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::FEED_FETCHED->value,
            'data' => $posts,
        ], HttpStatus::OK->value);
    }
}
