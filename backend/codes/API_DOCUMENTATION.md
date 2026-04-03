# Authentication API Documentation

## Overview
This is a JWT-based authentication system with user registration and login functionality. The API follows RESTful conventions and uses API versioning (v1).

## Base URL
```
http://localhost:8830/api/v1
```

## Endpoints

### 1. Register User
Create a new user account.

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
}
```

**Success Response (201):**
```json
{
    "success": true,
    "message": "User registered successfully",
    "data": {
        "user": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        },
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "token_type": "bearer",
        "expires_in": 3600
    }
}
```

**Validation Rules:**
- `first_name`: required, string, max 255 characters
- `last_name`: required, string, max 255 characters
- `email`: required, valid email, unique in database
- `password`: required, minimum 8 characters, must be confirmed

---

### 2. Login
Authenticate a user and get access token.

**Endpoint:** `POST /api/v1/auth/login`

**Request Body:**
```json
{
    "email": "john.doe@example.com",
    "password": "password123"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "user": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com"
        },
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "token_type": "bearer",
        "expires_in": 3600
    }
}
```

**Error Response (401):**
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

---

### 3. Get Current User
Get authenticated user's information.

**Endpoint:** `GET /api/v1/auth/me`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "created_at": "2026-04-03T10:30:00.000000Z"
        }
    }
}
```

---

### 4. Logout
Invalidate the current access token.

**Endpoint:** `POST /api/v1/auth/logout`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Successfully logged out"
}
```

---

### 5. Refresh Token
Get a new access token without re-authentication.

**Endpoint:** `POST /api/v1/auth/refresh`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
        "token_type": "bearer",
        "expires_in": 3600
    }
}
```

---

## Architecture

### Design Pattern: Service-Repository Pattern

The implementation follows a clean architecture with separation of concerns:

1. **Repository Layer** (`app/Repositories/`)
   - `UserRepositoryInterface`: Defines contract for user data operations
   - `UserRepository`: Implements data access logic

2. **Service Layer** (`app/Services/`)
   - `AuthService`: Contains business logic for authentication operations

3. **Controller Layer** (`app/Http/Controllers/Api/V1/`)
   - `AuthController`: Handles HTTP requests and responses

4. **Model** (`app/Models/`)
   - `User`: Eloquent model implementing JWTSubject interface

### Directory Structure
```
app/
├── Http/
│   └── Controllers/
│       └── Api/
│           └── V1/
│               └── AuthController.php
├── Models/
│   └── User.php
├── Repositories/
│   ├── Contracts/
│   │   └── UserRepositoryInterface.php
│   └── UserRepository.php
├── Services/
│   └── AuthService.php
└── Providers/
    └── AppServiceProvider.php (binds repository interface)
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:8830/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8830/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "password123"
  }'
```

### Get User Profile
```bash
curl -X GET http://localhost:8830/api/v1/auth/me \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:8830/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:8830/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Security Features

1. **JWT Authentication**: Stateless token-based authentication
2. **Password Hashing**: Automatic password hashing using bcrypt
3. **Token Expiration**: Access tokens expire after 60 minutes (configurable)
4. **Email Validation**: Ensures valid email format and uniqueness
5. **Password Confirmation**: Required during registration
6. **Protected Routes**: Middleware protection for authenticated endpoints

---

## Configuration

### JWT Settings
Configuration file: `config/jwt.php`

Key settings:
- Token TTL: 60 minutes (default)
- Refresh TTL: 20160 minutes (2 weeks)
- Algorithm: HS256

### Environment Variables
Make sure these are set in your `.env` file:
```env
JWT_SECRET=your-secret-key
JWT_TTL=60
JWT_REFRESH_TTL=20160
```

---

## Error Handling

All endpoints return standardized error responses:

**Validation Error (422):**
```json
{
    "success": false,
    "message": "Validation error",
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

**Authentication Error (401):**
```json
{
    "success": false,
    "message": "Invalid credentials"
}
```

**Server Error (400):**
```json
{
    "success": false,
    "message": "Error message here"
}
```
