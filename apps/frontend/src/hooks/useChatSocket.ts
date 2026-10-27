import { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from '~/app/hooks'
import type {
  ChatMessage,
  RawBackendMessage,
} from '~/features/chat/interface/chat.types'
import { connectChatSocket, getChatSocket } from '~/features/chat/service/chat-socket.service'
import { getConversationMessagesApi } from '~/features/chat/service/chat.service'

function formatMessageTime(isoString?: string): string {
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

function mapRawToChatMessage(raw: RawBackendMessage, currentUserId?: string): ChatMessage {
  const isDeleted = Boolean(raw.deletedAt)
  return {
    id: raw.id,
    conversationId: raw.conversationId,
    body: isDeleted ? '' : raw.content || '',
    sentAt: formatMessageTime(raw.createdAt),
    senderId: raw.senderId,
    sender: currentUserId && raw.senderId === currentUserId ? 'me' : 'them',
    createdAt: raw.createdAt,
    isEdited: Boolean(raw.isEdited),
    isDeleted,
  }
}

export function useChatSocket(activeId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const currentUser = useAppSelector((state) => state.auth.user)
  const currentUserId = currentUser?.id

  // 1. Load message history when activeId changes
  useEffect(() => {
    if (!activeId) {
      setMessages([])
      setHasMore(true)
      return
    }

    let isSubscribed = true
    setLoading(true)
    setHasMore(true)

    getConversationMessagesApi(activeId, { limit: 20 })
      .then((history) => {
        if (!isSubscribed) return
        if (history.length < 20) {
          setHasMore(false)
        }
        setMessages(history.map((m) => mapRawToChatMessage(m, currentUserId)))
      })
      .catch(() => {
        if (!isSubscribed) return
        setMessages([])
      })
      .finally(() => {
        if (isSubscribed) setLoading(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [activeId, currentUserId])

  // 1.1 Load older messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!activeId || loading || loadingMore || !hasMore || messages.length === 0) {
      return false
    }

    const oldestMessage = messages[0]
    if (!oldestMessage.createdAt) {
      setHasMore(false)
      return false
    }

    setLoadingMore(true)
    try {
      const olderHistory = await getConversationMessagesApi(activeId, {
        limit: 20,
        before: oldestMessage.createdAt,
      })

      if (olderHistory.length < 20) {
        setHasMore(false)
      }

      if (olderHistory.length === 0) {
        return false
      }

      const mappedOlder = olderHistory.map((m) => mapRawToChatMessage(m, currentUserId))

      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id))
        const uniqueOlder = mappedOlder.filter((m) => !existingIds.has(m.id))
        return [...uniqueOlder, ...prev]
      })

      return true
    } catch {
      return false
    } finally {
      setLoadingMore(false)
    }
  }, [activeId, loading, loadingMore, hasMore, messages, currentUserId])

  // 2. Connect socket and handle real-time events
  useEffect(() => {
    if (!activeId) return

    let socket: ReturnType<typeof connectChatSocket> | null = null
    try {
      socket = connectChatSocket()
      socket.emit('join_room', { conversationId: activeId })
      socket.emit('mark_as_read', { conversationId: activeId })

      const onReceiveMessage = (raw: RawBackendMessage) => {
        if (raw && raw.conversationId === activeId) {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === raw.id)) {
              return prev
            }
            return [...prev, mapRawToChatMessage(raw, currentUserId)]
          })

          if (raw.senderId !== currentUserId) {
            socket?.emit('mark_as_read', { conversationId: activeId })
          }
        }
      }

      const onMessageDeleted = (payload: { messageId: string; conversationId: string }) => {
        if (payload && payload.conversationId === activeId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === payload.messageId
                ? { ...m, body: '', isDeleted: true }
                : m,
            ),
          )
        }
      }

      const onMessageEdited = (edited: RawBackendMessage) => {
        if (edited && edited.conversationId === activeId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === edited.id
                ? { ...m, body: edited.content || '', isEdited: true }
                : m,
            ),
          )
        }
      }

      socket.on('receive_message', onReceiveMessage)
      socket.on('message_deleted', onMessageDeleted)
      socket.on('message_edited', onMessageEdited)

      return () => {
        if (socket) {
          socket.emit('leave_room', { conversationId: activeId })
          socket.off('receive_message', onReceiveMessage)
          socket.off('message_deleted', onMessageDeleted)
          socket.off('message_edited', onMessageEdited)
        }
      }
    } catch {
      // Socket fallback
    }
  }, [activeId, currentUserId])

  // 3. Send message
  const sendMessage = useCallback(
    (body: string) => {
      if (!body.trim() || !activeId) return

      try {
        const socket = getChatSocket()
        if (socket && socket.connected) {
          socket.emit('send_message', {
            conversationId: activeId,
            content: body.trim(),
            messageType: 'text',
          })
        }
      } catch {
        // Fallback
      }
    },
    [activeId],
  )

  // 4. Edit message
  const editMessage = useCallback(
    (messageId: string, content: string) => {
      if (!messageId || !content.trim()) return

      try {
        const socket = getChatSocket()
        if (socket && socket.connected) {
          socket.emit('edit_message', {
            messageId,
            content: content.trim(),
          })
        }
      } catch {
        // Fallback
      }
    },
    [],
  )

  // 5. Delete (Recall) message
  const deleteMessage = useCallback(
    (messageId: string) => {
      if (!messageId) return

      try {
        const socket = getChatSocket()
        if (socket && socket.connected) {
          socket.emit('delete_message', {
            messageId,
          })
        }
      } catch {
        // Fallback
      }
    },
    [],
  )

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
  }
}
