export interface BackendPostUser {
  id: string
  email: string
  fullName?: string | null
  phone?: string | null
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
  status: 'open' | 'matched' | 'closed'
  lat?: string | null
  lng?: string | null
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
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
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
}

export interface UpdatePostPayload extends Partial<CreatePostPayload> {
  status?: 'open' | 'matched' | 'closed'
}

export interface QueryPostParams {
  page?: number
  limit?: number
  search?: string
  skillLevel?: string
  playDate?: string
  status?: string
}
