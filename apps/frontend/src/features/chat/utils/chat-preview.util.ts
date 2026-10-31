import type { Conversation } from '../interface/chat.types'

/**
 * Checks if a message represents an image based on messageType or URL pattern.
 */
export function isImageContent(messageType?: string, content?: string | null): boolean {
  if (messageType === 'image') {
    return true
  }
  if (!content) {
    return false
  }
  // Detect Supabase storage public URL, bucket path, or image file extension
  if (
    content.includes('.supabase.co/') ||
    content.includes('/storage/v1/object/public/') ||
    content.includes('/chat/') ||
    content.includes('/avatars/')
  ) {
    return true
  }
  return /https?:\/\/[^\s]+(?:\.(?:jpg|jpeg|png|webp|gif|svg))/i.test(content)
}

/**
 * Counts the number of images within a message content string (handles single URL, JSON array, or newline/comma separated).
 */
export function countImagesInContent(content?: string | null): number {
  if (!content) return 1

  const trimmed = content.trim()
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.length
      }
    } catch {
      // Fallback
    }
  }

  const parts = trimmed.split(/[\n,]/).map((item) => item.trim()).filter((item) => item.startsWith('http'))
  if (parts.length > 1) {
    return parts.length
  }

  return 1
}

/**
 * Generates the preview text for a conversation item in the conversation list.
 * Converts image messages from raw URLs to "Đã gửi {count} ảnh".
 */
export function getConversationPreview(
  conversation: Conversation,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const lastMsg = conversation.lastMessage
  if (lastMsg?.isDeleted) {
    return t('chat.recalled', { defaultValue: 'Đã thu hồi' })
  }

  const rawContent = lastMsg?.content || conversation.preview
  if (!rawContent) {
    return t('chat.noMessagesYet', { defaultValue: 'Chưa có tin nhắn nào' })
  }

  if (isImageContent(lastMsg?.messageType, rawContent)) {
    const count = countImagesInContent(rawContent)
    return t('chat.sentImages', {
      count,
      defaultValue: `Đã gửi ${count} ảnh`,
    })
  }

  return rawContent
}
