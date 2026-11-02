import type { PostMatchStatus, PostStatus } from '../../../constants'

export interface BackendPostUser {
  id: string
  email: string
  fullName?: string | null
  phone?: string | null
  avatarUrl?: string | null
}

export interface BackendPost {
  id: string
  userId: string
  user?: BackendPostUser
  title: string
  content?: string | null
  playDate: string
  startTime: string
  endTime?: string | null
  skillLevelRequired?: string | null
  maxPlayers: number
  status: PostStatus
  lat?: string | null
  lng?: string | null
  imageUrl?: string | null
  createdAt: string
  updatedAt: string
}


export interface BackendPostListResponse {
  items: BackendPost[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BackendPostMatch {
  id: string
  postId: string
  applicantId: string
  applicant?: BackendPostUser
  status: PostMatchStatus
  createdAt: string
}

export interface BackendPostComment {
  id: string
  postId: string
  userId: string
  user?: BackendPostUser
  content: string
  createdAt: string
}

export interface CreatePostPayload {
  title: string
  content?: string
  playDate: string
  startTime: string
  endTime?: string
  skillLevelRequired?: string
  maxPlayers?: number
  lat?: number | string
  lng?: number | string
  imageUrl?: string
}

export interface UpdatePostPayload extends Partial<CreatePostPayload> {
  status?: PostStatus
}


export interface QueryPostParams {
  page?: number
  limit?: number
  search?: string
  skillLevel?: string
  playDate?: string
  status?: string
}

export interface OpponentFilterValues {
  search: string
  skillLevel: string
  playDate: string | null
}
