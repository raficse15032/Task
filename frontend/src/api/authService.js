import axiosInstance from './axiosInstance';

export const registerUser = (data) =>
  axiosInstance.post('/auth/register', data);

export const loginUser = (data) =>
  axiosInstance.post('/auth/login', data);

export const logoutUser = () =>
  axiosInstance.post('/auth/logout');

export const getFeed = (page = 1, perPage = 15) =>
  axiosInstance.get(`/feed?per_page=${perPage}&page=${page}`);

export const createPost = (formData) =>
  axiosInstance.post('/posts', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getPostComments = (postId, page = 1) =>
  axiosInstance.get(`/posts/${postId}/comments?page=${page}`);

export const createComment = (postId, content) =>
  axiosInstance.post(`/posts/${postId}/comments`, { content });

export const getCommentReplies = (postId, commentId, page = 1) =>
  axiosInstance.get(`/posts/${postId}/comments/${commentId}/replies?page=${page}`);

export const createReply = (postId, commentId, content) =>
  axiosInstance.post(`/posts/${postId}/comments`, { content, parent_id: commentId });

export const likePost = (postId, type) =>
  axiosInstance.post(`/posts/${postId}/like`, { type });
