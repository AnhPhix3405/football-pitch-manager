import { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from '~/app/hooks'
import {
  CHAT_PAGINATION_LIMIT,
  CHAT_SOCKET_EVENTS,
  MESSAGE_TYPE,
} from '~/constants/chat.constant'
import type {
  ChatMessage,
  MessageDeletedPayload,
  MessageType,
  RawBackendMessage,
} from '../interface/chat.types'
import {
  connectChatSocket,
  getChatSocket,
} from '../service/chat-socket.service'
import { getConversationMessagesApi } from '../service/chat.service'
import { mapRawToChatMessage } from '../utils/chat-message.util'

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

    getConversationMessagesApi(activeId, { limit: CHAT_PAGINATION_LIMIT })
      .then((history) => {
        if (!isSubscribed) return
        if (history.length < CHAT_PAGINATION_LIMIT) {
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
        limit: CHAT_PAGINATION_LIMIT,
        before: oldestMessage.createdAt,
      })

      if (olderHistory.length < CHAT_PAGINATION_LIMIT) {
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
      socket.emit(CHAT_SOCKET_EVENTS.JOIN_ROOM, { conversationId: activeId })

      const onReceiveMessage = (raw: RawBackendMessage) => {
        if (raw && raw.conversationId === activeId) {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === raw.id)) {
              return prev
            }
            return [...prev, mapRawToChatMessage(raw, currentUserId)]
          })
        }
      }

      const onMessageDeleted = (payload: MessageDeletedPayload) => {
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

      socket.on(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, onReceiveMessage)
      socket.on(CHAT_SOCKET_EVENTS.MESSAGE_DELETED, onMessageDeleted)
      socket.on(CHAT_SOCKET_EVENTS.MESSAGE_EDITED, onMessageEdited)

      return () => {
        if (socket) {
          socket.emit(CHAT_SOCKET_EVENTS.LEAVE_ROOM, { conversationId: activeId })
          socket.off(CHAT_SOCKET_EVENTS.RECEIVE_MESSAGE, onReceiveMessage)
          socket.off(CHAT_SOCKET_EVENTS.MESSAGE_DELETED, onMessageDeleted)
          socket.off(CHAT_SOCKET_EVENTS.MESSAGE_EDITED, onMessageEdited)
        }
      }
    } catch {
      // Socket fallback
    }
  }, [activeId, currentUserId])

  // 3. Send message
  const sendMessage = useCallback(
    (body: string, messageType: MessageType = MESSAGE_TYPE.TEXT) => {
      if (!body.trim() || !activeId) return

      try {
        const socket = getChatSocket()
        if (socket && socket.connected) {
          socket.emit(CHAT_SOCKET_EVENTS.SEND_MESSAGE, {
            conversationId: activeId,
            content: body.trim(),
            messageType,
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
          socket.emit(CHAT_SOCKET_EVENTS.EDIT_MESSAGE, {
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
          socket.emit(CHAT_SOCKET_EVENTS.DELETE_MESSAGE, {
            messageId,
          })
        }
      } catch {
        // Fallback
      }
    },
    [],
  )

  const markAsRead = useCallback(() => {
    if (!activeId) return
    try {
      const socket = connectChatSocket()
      socket.emit(CHAT_SOCKET_EVENTS.MARK_AS_READ, { conversationId: activeId })
    } catch {
      // Fallback
    }
  }, [activeId])

  return {
    messages,
    loading,
    loadingMore,
    hasMore,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
    markAsRead,
  }
}
