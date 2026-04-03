<?php

namespace App\Enums;

enum ResponseMessage: string
{
    // Success messages
    case USER_REGISTERED = 'User registered successfully';
    case LOGIN_SUCCESS = 'Login successful';
    case LOGOUT_SUCCESS = 'Successfully logged out';
    case TOKEN_REFRESHED = 'Token refreshed successfully';
    
    // Error messages
    case REGISTRATION_FAILED = 'Registration failed';
    case VALIDATION_ERROR = 'Validation error';
    case INVALID_CREDENTIALS = 'Invalid credentials';
    case UNAUTHORIZED = 'Unauthorized';
    case FORBIDDEN = 'Forbidden';
    case NOT_FOUND = 'Resource not found';
    case SERVER_ERROR = 'Internal server error';
    case TOO_MANY_REQUESTS = 'Too many attempts. Please try again later.';
    
    // Validation specific messages
    case EMAIL_TAKEN = 'The email has already been taken.';
    case INVALID_EMAIL_PASSWORD = 'The provided credentials are incorrect.';
}
