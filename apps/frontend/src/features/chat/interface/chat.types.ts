import type {
  CONVERSATION_KIND,
  CONVERSATION_TYPE,
  MESSAGE_SENDER,
  MESSAGE_TYPE,
} from '~/constants/chat.constant'

export type ConversationType =
  (typeof CONVERSATION_TYPE)[keyof typeof CONVERSATION_TYPE]
export type ConversationKind =
  (typeof CONVERSATION_KIND)[keyof typeof CONVERSATION_KIND]
export type MessageType =
  (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE]
export type MessageSender =
  (typeof MESSAGE_SENDER)[keyof typeof MESSAGE_SENDER]

export interface LastMessage {
  id: string
  content: string | null
  senderId: string
  messageType?: MessageType | string
  isDeleted?: boolean
  createdAt: string
}

export interface Conversation {
  id: string
  type?: ConversationType | string
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

export type BackendConversation = Conversation & {
  unreadCount?: number
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
  messageType?: MessageType | string
}

export interface RawBackendMessage {
  id: string
  conversationId: string
  senderId: string
  content: string | null
  messageType: MessageType | string
  isEdited: boolean
  deletedAt?: string | null
  createdAt: string
}

export interface CreateConversationPayload {
  targetUserId?: string
  relatedFieldId?: string
  relatedPostId?: string
  type?: ConversationType | string
}

export interface MessageDeletedPayload {
  messageId: string
  conversationId: string
}

export interface MessageReadPayload {
  userId: string
  conversationId: string
}

export interface MatchAcceptedPayload {
  conversationId?: string
}

export interface ChatHeaderProps {
  conversation: Conversation
  onDeleteConversation?: (conversationId: string) => void
}

export interface ConversationListProps {
  conversations: Conversation[]
  activeId: string
  onSelectConversation: (id: string) => void
  query: string
  onQueryChange: (query: string) => void
  loading?: boolean
}

export interface MessageComposerProps {
  onSendMessage: (content: string, messageType?: MessageType) => void
  editingMessage?: ChatMessage | null
  onSaveEdit?: (messageId: string, content: string) => void
  onCancelEdit?: () => void
  onFocusInput?: () => void
  disabled?: boolean
}

export interface MessageThreadProps {
  conversationId?: string
  messages: ChatMessage[]
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => Promise<unknown> | void
  onStartEditMessage?: (message: ChatMessage) => void
  onDeleteMessage?: (messageId: string) => void
}
