<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\HttpStatus;
use App\Enums\ResponseMessage;
use App\Http\Controllers\Controller;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;

class ImageController extends Controller
{
    protected ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * Upload an image to MinIO.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function upload(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'image'  => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:10240',
            'folder' => 'sometimes|string|max:100|regex:/^[a-zA-Z0-9_\-\/]+$/',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors'  => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        try {
            $folder = $request->input('folder', 'images');
            $result = $this->imageService->upload($request->file('image'), $folder);

            return response()->json([
                'success' => true,
                'message' => ResponseMessage::IMAGE_UPLOADED->value,
                'data'    => $result,
            ], HttpStatus::CREATED->value);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::IMAGE_UPLOAD_FAILED->value,
                'error'   => $e->getMessage(),
            ], HttpStatus::INTERNAL_SERVER_ERROR->value);
        }
    }

    /**
     * Serve an image from MinIO through Laravel.
     *
     * @param Request $request
     * @return Response|JsonResponse
     */
    public function show(Request $request): Response|JsonResponse
    {
        $validator = Validator::make(['path' => $request->query('path')], [
            'path' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors'  => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        try {
            $image = $this->imageService->getImage($request->query('path'));

            if (!$image) {
                return response()->json([
                    'success' => false,
                    'message' => ResponseMessage::NOT_FOUND->value,
                ], HttpStatus::NOT_FOUND->value);
            }

            return response($image['content'], HttpStatus::OK->value)
                ->header('Content-Type', $image['mime'])
                ->header('Cache-Control', 'public, max-age=3600');
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::NOT_FOUND->value,
                'error'   => $e->getMessage(),
            ], HttpStatus::NOT_FOUND->value);
        }
    }

    /**
     * Delete an image from MinIO.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(Request $request): JsonResponse
    {
        $validator = Validator::make(['path' => $request->query('path')], [
            'path' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors'  => $validator->errors(),
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        try {
            $deleted = $this->imageService->delete($request->query('path'));

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => ResponseMessage::NOT_FOUND->value,
                ], HttpStatus::NOT_FOUND->value);
            }

            return response()->json([
                'success' => true,
                'message' => ResponseMessage::IMAGE_DELETED->value,
            ], HttpStatus::OK->value);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::SERVER_ERROR->value,
                'error'   => $e->getMessage(),
            ], HttpStatus::INTERNAL_SERVER_ERROR->value);
        }
    }
}
