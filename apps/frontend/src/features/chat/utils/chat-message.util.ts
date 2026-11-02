import { MESSAGE_SENDER, MESSAGE_TYPE } from '~/constants/chat.constant'
import type {
  ChatMessage,
  Conversation,
  RawBackendMessage,
} from '../interface/chat.types'

/**
 * Format ISO datetime string to localized 24-hour time (HH:mm)
 */
export function formatMessageTime(isoString?: string): string {
  if (!isoString) return ''
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString))
  } catch {
    return ''
  }
}

/**
 * Maps a raw backend message payload to the UI ChatMessage format
 */
export function mapRawToChatMessage(
  raw: RawBackendMessage,
  currentUserId?: string,
): ChatMessage {
  const isDeleted = Boolean(raw.deletedAt)
  const isMine = Boolean(currentUserId && raw.senderId === currentUserId)

  return {
    id: raw.id,
    conversationId: raw.conversationId,
    body: isDeleted ? '' : raw.content || '',
    sentAt: formatMessageTime(raw.createdAt),
    senderId: raw.senderId,
    sender: isMine ? MESSAGE_SENDER.ME : MESSAGE_SENDER.THEM,
    createdAt: raw.createdAt,
    isEdited: Boolean(raw.isEdited),
    isDeleted,
    messageType: raw.messageType || MESSAGE_TYPE.TEXT,
  }
}

/**
 * Sorts conversations descending by updatedAt timestamp
 */
export function sortConversationsByLatest(
  conversations: Conversation[],
): Conversation[] {
  return [...conversations].sort((a, b) => {
    const timeA = new Date(a.updatedAt || 0).getTime()
    const timeB = new Date(b.updatedAt || 0).getTime()
    return timeB - timeA
  })
}
