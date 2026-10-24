export interface UserProfile {
  id: string
  userId: string
  email: string
  phone: string | null
  role: string
  status: string
  fullName: string | null
  avatarUrl: string | null
  bio: string | null
  skillLevel: string | null
  birthday: string | null
  gender: string | null
  createdAt: string
  updatedAt: string
}

export interface UpdateUserProfilePayload {
  fullName?: string
  bio?: string
  phone?: string
  avatarUrl?: string
  skillLevel?: string
  birthday?: string
  gender?: string
}
