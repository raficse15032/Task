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
    
    // Image messages
    case IMAGE_UPLOADED = 'Image uploaded successfully';
    case IMAGE_FETCHED = 'Image URL retrieved successfully';
    case IMAGE_DELETED = 'Image deleted successfully';
    case IMAGE_UPLOAD_FAILED = 'Image upload failed';

    // Feed messages
    case FEED_FETCHED = 'Feed retrieved successfully';

    // Post messages
    case POST_FETCHED = 'Post retrieved successfully';
    case POST_CREATED = 'Post created successfully';
    case POST_UPDATED = 'Post updated successfully';
    case POST_DELETED = 'Post deleted successfully';

    // Comment messages
    case COMMENTS_FETCHED = 'Comments retrieved successfully';
    case COMMENT_CREATED = 'Comment created successfully';
    case COMMENT_UPDATED = 'Comment updated successfully';
    case COMMENT_DELETED = 'Comment deleted successfully';

    // Reply messages
    case REPLIES_FETCHED = 'Replies retrieved successfully';
    case REPLY_CREATED = 'Reply created successfully';
    case REPLY_UPDATED = 'Reply updated successfully';
    case REPLY_DELETED = 'Reply deleted successfully';

    // Like messages
    case LIKED = 'Liked successfully';
    case UNLIKED = 'Unliked successfully';
    case DISLIKED = 'Disliked successfully';
    case UNDISLIKED = 'Dislike removed successfully';
    case LIKERS_FETCHED = 'Likers retrieved successfully';

    // Validation specific messages
    case EMAIL_TAKEN = 'The email has already been taken.';
    case INVALID_EMAIL_PASSWORD = 'The provided credentials are incorrect.';
}
