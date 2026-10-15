import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type {
  BackendPost,
  BackendPostComment,
  BackendPostListResponse,
  BackendPostMatch,
  CreatePostPayload,
  QueryPostParams,
  UpdatePostPayload,
} from '../interface/post.types'

// 1. Quản lý bài đăng tìm đối
export async function getPublicPosts(params?: QueryPostParams): Promise<BackendPostListResponse> {
  const response = await apiClient.get<ApiResponse<BackendPostListResponse>>('/posts', { params })
  return response.data.data
}

export async function getMyPosts(params?: QueryPostParams): Promise<BackendPostListResponse> {
  const response = await apiClient.get<ApiResponse<BackendPostListResponse>>('/posts/me', { params })
  return response.data.data
}

export async function getPostDetail(id: string): Promise<BackendPost> {
  const response = await apiClient.get<ApiResponse<BackendPost>>(`/posts/${id}`)
  return response.data.data
}

export async function createPost(payload: CreatePostPayload): Promise<BackendPost> {
  const response = await apiClient.post<ApiResponse<BackendPost>>('/posts', payload)
  return response.data.data
}

export async function updatePost(id: string, payload: UpdatePostPayload): Promise<BackendPost> {
  const response = await apiClient.patch<ApiResponse<BackendPost>>(`/posts/${id}`, payload)
  return response.data.data
}

export async function deletePost(id: string): Promise<void> {
  await apiClient.delete(`/posts/${id}`)
}

// 2. Ghép trận & Ứng tuyển bắt đối
export async function applyMatch(postId: string): Promise<BackendPostMatch> {
  const response = await apiClient.post<ApiResponse<BackendPostMatch>>(`/posts/${postId}/matches`)
  return response.data.data
}

export async function getPostMatches(postId: string): Promise<BackendPostMatch[]> {
  const response = await apiClient.get<ApiResponse<BackendPostMatch[]>>(`/posts/${postId}/matches`)
  return response.data.data
}

export async function acceptMatch(postId: string, matchId: string): Promise<BackendPostMatch> {
  const response = await apiClient.patch<ApiResponse<BackendPostMatch>>(
    `/posts/${postId}/matches/${matchId}/accept`,
  )
  return response.data.data
}

export async function rejectMatch(postId: string, matchId: string): Promise<BackendPostMatch> {
  const response = await apiClient.patch<ApiResponse<BackendPostMatch>>(
    `/posts/${postId}/matches/${matchId}/reject`,
  )
  return response.data.data
}

export async function cancelMatch(postId: string): Promise<void> {
  await apiClient.delete(`/posts/${postId}/matches/me`)
}

// 3. Thảo luận & Bình luận
export async function getPostComments(postId: string): Promise<BackendPostComment[]> {
  const response = await apiClient.get<ApiResponse<BackendPostComment[]>>(`/posts/${postId}/comments`)
  return response.data.data
}

export async function createPostComment(postId: string, content: string): Promise<BackendPostComment> {
  const response = await apiClient.post<ApiResponse<BackendPostComment>>(`/posts/${postId}/comments`, {
    content,
  })
  return response.data.data
}
