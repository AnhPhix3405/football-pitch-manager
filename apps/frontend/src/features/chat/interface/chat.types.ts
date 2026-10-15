export type ConversationKind = 'field' | 'team'
export type MessageSender = 'me' | 'them'

export interface Conversation {
  id: string
  name: string
  preview: string
  online: boolean
  unread: number
  kind: ConversationKind
}

export interface ChatMessage {
  id: string
  conversationId: string
  body: string
  sentAt: string
  sender: MessageSender
}
