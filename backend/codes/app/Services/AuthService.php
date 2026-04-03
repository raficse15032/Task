<?php

namespace App\Services;

use App\Enums\ResponseMessage;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService
{
    protected UserRepositoryInterface $userRepository;

    public function __construct(UserRepositoryInterface $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    /**
     * Register a new user.
     *
     * @param array $data
     * @return array
     */
    public function register(array $data): array
    {
        // Check if email already exists
        if ($this->userRepository->findByEmail($data['email'])) {
            throw ValidationException::withMessages([
                'email' => [ResponseMessage::EMAIL_TAKEN->value],
            ]);
        }

        $user = $this->userRepository->create($data);

        $token = Auth::guard('api')->login($user);

        return [
            'user' => $user,
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60
        ];
    }

    /**
     * Login a user.
     *
     * @param array $credentials
     * @return array
     * @throws ValidationException
     */
    public function login(array $credentials): array
    {
        if (!$token = Auth::guard('api')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => [ResponseMessage::INVALID_EMAIL_PASSWORD->value],
            ]);
        }

        return [
            'user' => Auth::guard('api')->user(),
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60
        ];
    }

    /**
     * Logout a user.
     *
     * @return void
     */
    public function logout(): void
    {
        Auth::guard('api')->logout();
    }

    /**
     * Refresh the JWT token.
     *
     * @return array
     */
    public function refresh(): array
    {
        $token = Auth::guard('api')->refresh();

        return [
            'token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60
        ];
    }

    /**
     * Get the authenticated user.
     *
     * @return \App\Models\User
     */
    public function me()
    {
        return Auth::guard('api')->user();
    }
}
