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
  lat: number | null
  lng: number | null
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
  lat?: number
  lng?: number
}

export interface UpdateUserLocationPayload {
  lat: number
  lng: number
}

export interface ProfileForm {
  name: string
  email: string
  phone?: string
  bio: string
  lat?: number
  lng?: number
}

export interface PasswordForm {
  current: string
  next: string
  confirm: string
}


