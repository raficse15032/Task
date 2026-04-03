<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\HttpStatus;
use App\Enums\ResponseMessage;
use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Register a new user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors' => $validator->errors()
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        try {
            $result = $this->authService->register($request->only([
                'first_name',
                'last_name',
                'email',
                'password'
            ]));

            return response()->json([
                'success' => true,
                'message' => ResponseMessage::USER_REGISTERED->value,
                'data' => [
                    'user' => [
                        'id' => $result['user']->id,
                        'first_name' => $result['user']->first_name,
                        'last_name' => $result['user']->last_name,
                        'email' => $result['user']->email,
                    ],
                    'access_token' => $result['token'],
                    'token_type' => $result['token_type'],
                    'expires_in' => $result['expires_in'],
                ]
            ], HttpStatus::CREATED->value);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::REGISTRATION_FAILED->value,
                'error' => $e->getMessage(),
            ], HttpStatus::BAD_REQUEST->value);
        }
    }

    /**
     * Login a user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::VALIDATION_ERROR->value,
                'errors' => $validator->errors()
            ], HttpStatus::UNPROCESSABLE_ENTITY->value);
        }

        try {
            $result = $this->authService->login($request->only('email', 'password'));

            return response()->json([
                'success' => true,
                'message' => ResponseMessage::LOGIN_SUCCESS->value,
                'data' => [
                    'user' => [
                        'id' => $result['user']->id,
                        'first_name' => $result['user']->first_name,
                        'last_name' => $result['user']->last_name,
                        'email' => $result['user']->email,
                    ],
                    'access_token' => $result['token'],
                    'token_type' => $result['token_type'],
                    'expires_in' => $result['expires_in'],
                ]
            ], HttpStatus::OK->value);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => ResponseMessage::INVALID_CREDENTIALS->value,
            ], HttpStatus::UNAUTHORIZED->value);
        }
    }

    /**
     * Logout the user.
     *
     * @return JsonResponse
     */
    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::LOGOUT_SUCCESS->value
        ], HttpStatus::OK->value);
    }

    /**
     * Refresh the JWT token.
     *
     * @return JsonResponse
     */
    public function refresh(): JsonResponse
    {
        $result = $this->authService->refresh();

        return response()->json([
            'success' => true,
            'message' => ResponseMessage::TOKEN_REFRESHED->value,
            'data' => [
                'access_token' => $result['token'],
                'token_type' => $result['token_type'],
                'expires_in' => $result['expires_in'],
            ]
        ], HttpStatus::OK->value);
    }

    /**
     * Get the authenticated user.
     *
     * @return JsonResponse
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->me();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'email' => $user->email,
                ]
            ]
        ], HttpStatus::OK->value);
    }
}
