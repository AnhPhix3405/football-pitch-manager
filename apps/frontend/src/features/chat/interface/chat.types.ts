export type ConversationKind = 'field' | 'team'
export type MessageSender = 'me' | 'them'

export interface LastMessage {
  id: string
  content: string | null
  senderId: string
  messageType?: string
  isDeleted?: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  type?: string
  name: string
  avatarUrl?: string | null
  online: boolean
  unread: number
  kind: ConversationKind
  relatedFieldId?: string | null
  relatedPostId?: string | null
  lastMessage?: LastMessage | null
  updatedAt?: string
  preview?: string
}

export interface ChatMessage {
  id: string
  conversationId: string
  body: string
  sentAt: string
  senderId?: string
  sender: MessageSender
  createdAt?: string
  isEdited?: boolean
  isDeleted?: boolean
  messageType?: string
}

export interface RawBackendMessage {
  id: string
  conversationId: string
  senderId: string
  content: string | null
  messageType: string
  isEdited: boolean
  deletedAt?: string | null
  createdAt: string
}

export interface CreateConversationPayload {
  targetUserId?: string
  relatedFieldId?: string
  relatedPostId?: string
  type?: string
}
