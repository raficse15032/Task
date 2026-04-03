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

---

---

# Images API

## Base URL
```
http://localhost:8830/api/v1/images
```

---

### 6. Upload Image
Upload an image to storage. Requires authentication.

**Endpoint:** `POST /api/v1/images`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Fields:**
- `image` (required): Image file — jpg, jpeg, png, gif, webp — max 10MB
- `folder` (optional): Storage folder path, e.g. `posts` (default: `images`)

**Success Response (201):**
```json
{
    "success": true,
    "message": "Image uploaded successfully",
    "data": {
        "path": "images/filename.jpg",
        "url": "http://..."
    }
}
```

```bash
curl -X POST http://localhost:8830/api/v1/images \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  -F "folder=posts"
```

---

### 7. Get Image
Serve an image by its storage path. Public endpoint.

**Endpoint:** `GET /api/v1/images?path={path}`

**Query Parameters:**
- `path` (required): Storage path returned from upload, e.g. `images/filename.jpg`

**Success Response (200):** Raw image binary with appropriate `Content-Type` header.

```bash
curl -X GET "http://localhost:8830/api/v1/images?path=images/filename.jpg" \
  -H "Accept: application/json"
```

---

### 8. Delete Image
Delete an image from storage. Requires authentication.

**Endpoint:** `DELETE /api/v1/images?path={path}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `path` (required): Storage path of the image to delete

**Success Response (200):**
```json
{
    "success": true,
    "message": "Image deleted successfully"
}
```

```bash
curl -X DELETE "http://localhost:8830/api/v1/images?path=images/filename.jpg" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

---

# Feed API

---

### 9. Get Feed
Get a paginated list of public posts. Requires authentication.

**Endpoint:** `GET /api/v1/feed`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `per_page` (optional): Items per page (default: 15)
- `page` (optional): Page number (default: 1)

**Success Response (200):**
```json
{
    "success": true,
    "message": "Feed fetched successfully",
    "data": {
        "current_page": 1,
        "data": [ ... ],
        "per_page": 15,
        "total": 100
    }
}
```

```bash
curl -X GET "http://localhost:8830/api/v1/feed?per_page=15&page=1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

---

# Posts API

## Base URL
```
http://localhost:8830/api/v1/posts
```

All post endpoints require authentication.

---

### 10. Get My Posts
Get a paginated list of the authenticated user's posts.

**Endpoint:** `GET /api/v1/posts/my`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Query Parameters:**
- `per_page` (optional): Items per page (default: 15)
- `page` (optional): Page number (default: 1)

```bash
curl -X GET "http://localhost:8830/api/v1/posts/my?per_page=15&page=1" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 11. Get Post
Get a single post by ID. Private posts are only visible to their owner.

**Endpoint:** `GET /api/v1/posts/{post}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Post fetched successfully",
    "data": {
        "id": 1,
        "user_id": 1,
        "title": "My Post",
        "content": "Post content here",
        "visibility": "public",
        "image": "images/filename.jpg",
        "created_at": "2026-04-03T10:30:00.000000Z"
    }
}
```

```bash
curl -X GET http://localhost:8830/api/v1/posts/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 12. Create Post
Create a new post, optionally with an image.

**Endpoint:** `POST /api/v1/posts`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Fields:**
- `title` (required): string, max 255 characters
- `content` (required): string, max 5000 characters
- `visibility` (optional): `public` or `private` (default: `public`)
- `image` (optional): Image file — jpeg, png, jpg, gif, webp — max 5MB

**Success Response (201):**
```json
{
    "success": true,
    "message": "Post created successfully",
    "data": { ... }
}
```

```bash
# Without image (JSON)
curl -X POST http://localhost:8830/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My Post Title",
    "content": "Post content here",
    "visibility": "public"
  }'

# With image (multipart)
curl -X POST http://localhost:8830/api/v1/posts \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=My Post Title" \
  -F "content=Post content here" \
  -F "visibility=public" \
  -F "image=@/home/abc/Pictures/Screenshots/Screenshot from 2026-02-19 05-43-18.png"
```

---

### 13. Update Post
Update an existing post. Only the post owner can update it.

**Endpoint:** `PUT /api/v1/posts/{post}`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Form Fields:** (all optional, at least one required)
- `title`: string, max 255 characters
- `content`: string, max 5000 characters
- `visibility`: `public` or `private`
- `image`: Image file — jpeg, png, jpg, gif, webp — max 5MB

**Success Response (200):**
```json
{
    "success": true,
    "message": "Post updated successfully",
    "data": { ... }
}
```

```bash
# Without image (JSON)
curl -X PUT http://localhost:8830/api/v1/posts/1 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content",
    "visibility": "private"
  }'
```

---

### 14. Delete Post
Delete a post. Only the post owner can delete it.

**Endpoint:** `DELETE /api/v1/posts/{post}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Post deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8830/api/v1/posts/1 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 15. Toggle Post Like / Dislike
Like, unlike, dislike, or undislike a post.

**Endpoint:** `POST /api/v1/posts/{post}/like`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "type": "like"
}
```

**Fields:**
- `type` (optional): `like` (default) or `dislike`

**Success Response (200):**
```json
{
    "success": true,
    "message": "Liked",
    "data": {
        "action": "liked"
    }
}
```

Possible `action` values: `liked`, `unliked`, `disliked`, `undisliked`

```bash
# Like a post
curl -X POST http://localhost:8830/api/v1/posts/1/like \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"type": "like"}'

# Dislike a post
curl -X POST http://localhost:8830/api/v1/posts/1/like \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"type": "dislike"}'
```

---

### 16. Get Post Likers
Get a list of users who liked a post.

**Endpoint:** `GET /api/v1/posts/{post}/likers`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Likers fetched successfully",
    "data": [ ... ]
}
```

```bash
curl -X GET http://localhost:8830/api/v1/posts/1/likers \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

---

# Comments API

## Base URL
```
http://localhost:8830/api/v1/posts/{post}/comments
```

All comment endpoints require authentication.

---

### 17. Get Comments
Get top-level comments for a post.

**Endpoint:** `GET /api/v1/posts/{post}/comments`

**Headers:**
```
Authorization: Bearer {access_token}
```

```bash
curl -X GET http://localhost:8830/api/v1/posts/1/comments \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 18. Create Comment / Reply
Add a comment to a post. Pass `parent_id` to create a reply.

**Endpoint:** `POST /api/v1/posts/{post}/comments`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "content": "This is a comment",
    "parent_id": null
}
```

**Fields:**
- `content` (required): string, max 2000 characters
- `parent_id` (optional): ID of the parent comment to reply to

**Success Response (201):**
```json
{
    "success": true,
    "message": "Comment created successfully",
    "data": { ... }
}
```

```bash
# Create a top-level comment
curl -X POST http://localhost:8830/api/v1/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"content": "This is a comment"}'

# Reply to a comment
curl -X POST http://localhost:8830/api/v1/posts/1/comments \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"content": "This is a reply", "parent_id": 5}'
```

---

### 19. Update Comment
Update a comment. Only the comment owner can update it.

**Endpoint:** `PUT /api/v1/posts/{post}/comments/{comment}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "content": "Updated comment text"
}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Comment updated successfully",
    "data": { ... }
}
```

```bash
curl -X PUT http://localhost:8830/api/v1/posts/1/comments/5 \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"content": "Updated comment text"}'
```

---

### 20. Delete Comment
Delete a comment. Only the comment owner can delete it.

**Endpoint:** `DELETE /api/v1/posts/{post}/comments/{comment}`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Success Response (200):**
```json
{
    "success": true,
    "message": "Comment deleted successfully"
}
```

```bash
curl -X DELETE http://localhost:8830/api/v1/posts/1/comments/5 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 21. Get Comment Replies
Get replies for a specific comment.

**Endpoint:** `GET /api/v1/posts/{post}/comments/{comment}/replies`

**Headers:**
```
Authorization: Bearer {access_token}
```

```bash
curl -X GET http://localhost:8830/api/v1/posts/1/comments/5/replies \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 22. Toggle Comment Like / Dislike
Like, unlike, dislike, or undislike a comment.

**Endpoint:** `POST /api/v1/posts/{post}/comments/{comment}/like`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Request Body:**
```json
{
    "type": "like"
}
```

**Fields:**
- `type` (optional): `like` (default) or `dislike`

**Success Response (200):**
```json
{
    "success": true,
    "message": "Liked",
    "data": {
        "action": "liked"
    }
}
```

```bash
# Like a comment
curl -X POST http://localhost:8830/api/v1/posts/1/comments/5/like \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"type": "like"}'

# Dislike a comment
curl -X POST http://localhost:8830/api/v1/posts/1/comments/5/like \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"type": "dislike"}'
```

---

### 23. Get Comment Likers
Get a list of users who liked a comment.

**Endpoint:** `GET /api/v1/posts/{post}/comments/{comment}/likers`

**Headers:**
```
Authorization: Bearer {access_token}
```

```bash
curl -X GET http://localhost:8830/api/v1/posts/1/comments/5/likers \
  -H "Accept: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```
