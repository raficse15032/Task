<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\HttpStatus;
use App\Enums\ResponseMessage;
use App\Http\Controllers\Controller;
use App\Services\CommentService;
use App\Services\PostService;
use App\Services\CommentLikeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    protected CommentService $commentService;
    protected PostService $postService;
    protected CommentLikeService $commentLikeService;

    public function __construct(
        CommentService $commentService,
        PostService $postService,
        CommentLikeService $commentLikeService
    ) {
        $this->commentService = $commentService;
        $this->postService = $postService;
        $this->commentLikeService = $commentLikeService;
    }

    public function index(int $postId): JsonResponse
    {
        $post = $this->postService->getPost($postId);

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

        $comments = $this->commentService->getPostComments($postId);

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::COMMENTS_FETCHED->value,
            'data' => $comments,
        ], HttpStatus::OK->value);
    }

    public function store(Request $request, int $postId): JsonResponse
    {
        $post = $this->postService->getPost($postId);

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

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:2000',
            'parent_id' => 'nullable|integer|exists:comments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        $parentId = $request->input('parent_id');
        if ($parentId) {
            $parent = $this->commentService->getComment($parentId);
            if (!$parent || $parent->post_id !== $postId) {
                return response()->json([
                    'success' => false,
                    'message' => ResponseMessage::NOT_FOUND->value,
                ], HttpStatus::NOT_FOUND->value);
            }
        }

        $comment = $this->commentService->createComment(
            $userId,
            $postId,
            $request->only('content'),
            $parentId
        );

        $message = $parentId ? ResponseMessage::REPLY_CREATED : ResponseMessage::COMMENT_CREATED;

        return response()->json([
            'success' => true,
            'message' => $message->value,
            'data' => $comment,
        ], HttpStatus::CREATED->value);
    }

    public function update(Request $request, int $postId, int $commentId): JsonResponse
    {
        $comment = $this->commentService->getComment($commentId);

        if (!$comment || $comment->post_id !== $postId) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
            ], HttpStatus::NOT_FOUND->value);
        }

        if ($comment->user_id !== Auth::guard('api')->id()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::FORBIDDEN->value,
            ], HttpStatus::FORBIDDEN->value);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors' => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        $comment = $this->commentService->updateComment($comment, $request->only('content'));

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::COMMENT_UPDATED->value,
            'data' => $comment,
        ], HttpStatus::OK->value);
    }

    public function destroy(int $postId, int $commentId): JsonResponse
    {
        $comment = $this->commentService->getComment($commentId);

        if (!$comment || $comment->post_id !== $postId) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
            ], HttpStatus::NOT_FOUND->value);
        }

        if ($comment->user_id !== Auth::guard('api')->id()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::FORBIDDEN->value,
            ], HttpStatus::FORBIDDEN->value);
        }

        $this->commentService->deleteComment($comment);

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::COMMENT_DELETED->value,
        ], HttpStatus::OK->value);
    }

    public function toggleLike(Request $request, int $postId, int $commentId): JsonResponse
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

        $comment = $this->commentService->getComment($commentId);

        if (!$comment || $comment->post_id !== $postId) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
            ], HttpStatus::NOT_FOUND->value);
        }

        $type   = $request->input('type', 'like');
        $result = $this->commentLikeService->toggleLike($commentId, Auth::guard('api')->id(), $type);

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

    public function likers(int $postId, int $commentId): JsonResponse
    {
        $comment = $this->commentService->getComment($commentId);

        if (!$comment || $comment->post_id !== $postId) {
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

        $likers = $this->commentLikeService->getLikers($commentId, 15, $type ?: null);

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::LIKERS_FETCHED->value,
            'data' => $likers,
        ], HttpStatus::OK->value);
    }

    public function replies(int $postId, int $commentId): JsonResponse
    {
        $comment = $this->commentService->getComment($commentId);

        if (!$comment || $comment->post_id !== $postId) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
            ], HttpStatus::NOT_FOUND->value);
        }

        $replies = $this->commentService->getReplies($commentId);

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::REPLIES_FETCHED->value,
            'data' => $replies,
        ], HttpStatus::OK->value);
    }
}
