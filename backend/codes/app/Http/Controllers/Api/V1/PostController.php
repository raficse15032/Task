<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\HttpStatus;
use App\Enums\ResponseMessage;
use App\Http\Controllers\Controller;
use App\Services\PostService;
use App\Services\PostLikeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    protected PostService $postService;
    protected PostLikeService $postLikeService;

    public function __construct(PostService $postService, PostLikeService $postLikeService)
    {
        $this->postService = $postService;
        $this->postLikeService = $postLikeService;
    }

    public function show(int $id): JsonResponse
    {
        $post = $this->postService->getPost($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
            ], HttpStatus::NOT_FOUND->value);
        }

        $userId = Auth::guard('api')->id();

        if ($post->visibility === 'private' && $post->user_id !== $userId) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::FORBIDDEN->value,
            ], HttpStatus::FORBIDDEN->value);
        }

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::POST_FETCHED->value,
            'data' => $post,
        ], HttpStatus::OK->value);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'visibility' => 'nullable|in:public,private',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        try {
            $post = $this->postService->createPost(
                Auth::guard('api')->id(),
                $request->only('content', 'visibility'),
                $request->file('image')
            );

            return response()->json([
                'success' => true,
                'message' => ResponseMessage::POST_CREATED->value,
                'data' => $post,
            ], HttpStatus::CREATED->value);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::SERVER_ERROR->value,
                'error' => $e->getMessage(),
            ], HttpStatus::INTERNAL_SERVER_ERROR->value);
        }
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = $this->postService->getPost($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
            ], HttpStatus::NOT_FOUND->value);
        }

        if ($post->user_id !== Auth::guard('api')->id()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::FORBIDDEN->value,
            ], HttpStatus::FORBIDDEN->value);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|required|string|max:5000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'visibility' => 'nullable|in:public,private',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        try {
            $post = $this->postService->updatePost(
                $post,
                $request->only('content', 'visibility'),
                $request->file('image')
            );

            return response()->json([
                'success' => true,
                'message' => ResponseMessage::POST_UPDATED->value,
                'data' => $post,
            ], HttpStatus::OK->value);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::SERVER_ERROR->value,
                'error' => $e->getMessage(),
            ], HttpStatus::INTERNAL_SERVER_ERROR->value);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        $post = $this->postService->getPost($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
            ], HttpStatus::NOT_FOUND->value);
        }

        if ($post->user_id !== Auth::guard('api')->id()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::FORBIDDEN->value,
            ], HttpStatus::FORBIDDEN->value);
        }

        $this->postService->deletePost($post);

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::POST_DELETED->value,
        ], HttpStatus::OK->value);
    }

    public function toggleLike(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'type' => 'sometimes|in:like,dislike',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors'  => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        $post = $this->postService->getPost($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
            ], HttpStatus::NOT_FOUND->value);
        }

        $type   = $request->input('type', 'like');
        $result = $this->postLikeService->toggleLike($id, Auth::guard('api')->id(), $type);

        $message = match ($result['action']) {
            'liked'      => ResponseMessage::LIKED->value,
            'unliked'    => ResponseMessage::UNLIKED->value,
            'disliked'   => ResponseMessage::DISLIKED->value,
            'undisliked' => ResponseMessage::UNDISLIKED->value,
        };

        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $result,
        ], HttpStatus::OK->value);
    }

    public function likers(int $id): JsonResponse
    {
        $post = $this->postService->getPost($id);

        if (!$post) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
            ], HttpStatus::NOT_FOUND->value);
        }

        $type = request()->query('type');
        if ($type !== null && !in_array($type, ['like', 'dislike'], true)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid type. Must be like or dislike.',
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        $likers = $this->postLikeService->getLikers($id, 15, $type ?: null);

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::LIKERS_FETCHED->value,
            'data' => $likers,
        ], HttpStatus::OK->value);
    }

    public function myPosts(Request $request): JsonResponse
    {
        $userId = Auth::guard('api')->id();
        $perPage = $request->integer('per_page', 15);
        $page = $request->integer('page', 1);

        $posts = $this->postService->getUserPosts($userId, $perPage, $page);

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::FEED_FETCHED->value,
            'data' => $posts,
        ], HttpStatus::OK->value);
    }
}
