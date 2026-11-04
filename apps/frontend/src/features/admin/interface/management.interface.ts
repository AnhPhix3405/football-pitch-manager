export type ManagementTab = 'users' | 'posts' | 'reviews'

export type ManagedUserRole = 'user' | 'owner' | 'admin'

export type ManagedUserStatus = 'active' | 'suspended'

export interface ManagedUserItem {
  id: string
  name: string
  email: string
  role: ManagedUserRole
  joinedAt: string
  reports: number
  status: ManagedUserStatus
}

export interface ModerationContentItem {
  id: string
  type: 'post' | 'review'
  author: string
  content: string
  reportedAt: string
  reason: string
  status: 'pending' | 'resolved'
}

