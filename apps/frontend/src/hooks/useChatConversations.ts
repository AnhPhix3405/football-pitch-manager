import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppSelector } from '~/app/hooks'
import type {
  Conversation,
  CreateConversationPayload,
  RawBackendMessage,
} from '~/features/chat/interface/chat.types'
import {
  createConversationApi,
  deleteConversationApi,
  getConversationsApi,
} from '~/features/chat/service/chat.service'
import { connectChatSocket } from '~/features/chat/service/chat-socket.service'

export function useChatConversations() {
  const currentUser = useAppSelector((state) => state.auth.user)
  const currentUserId = currentUser?.id

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveIdState] = useState<string>('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeIdRef = useRef(activeId)
  const currentUserIdRef = useRef(currentUserId)

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  useEffect(() => {
    currentUserIdRef.current = currentUserId
  }, [currentUserId])

  const setActiveId = useCallback((action: string | ((prev: string) => string)) => {
    setActiveIdState((prev) => {
      const nextId = typeof action === 'function' ? action(prev) : action
      activeIdRef.current = nextId
      return nextId
    })
  }, [])

  const clearConversationUnread = useCallback((id: string) => {
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, unread: 0 } : conv)),
    )
  }, [])

  const fetchConversations = useCallback(async (preserveActiveId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getConversationsApi()
      let resolvedId = activeIdRef.current
      if (preserveActiveId && data.some((c) => c.id === preserveActiveId)) {
        resolvedId = preserveActiveId
      } else if (!resolvedId || !data.some((c) => c.id === resolvedId)) {
        resolvedId = data[0]?.id ?? ''
      }

      setActiveIdState(resolvedId)
      setConversations(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tải cuộc trò chuyện'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations, currentUserId])

  useEffect(() => {
    try {
      const socket = connectChatSocket()
      const onMatchAccepted = (data?: { conversationId?: string }) => {
        fetchConversations(data?.conversationId)
      }

      const onReceiveMessage = (raw: RawBackendMessage) => {
        if (!raw) return
        setConversations((prev) => {
          const exists = prev.some((conv) => conv.id === raw.conversationId)
          if (!exists) {
            fetchConversations()
            return prev
          }
          const isFromOther = raw.senderId !== currentUserIdRef.current

          const updated = prev.map((conv) => {
            if (conv.id === raw.conversationId) {
              return {
                ...conv,
                unread: isFromOther ? (conv.unread || 0) + 1 : conv.unread,
                lastMessage: {
                  id: raw.id,
                  content: raw.content,
                  senderId: raw.senderId,
                  messageType: raw.messageType,
                  createdAt: raw.createdAt,
                },
                updatedAt: raw.createdAt,
              }
            }
            return conv
          })
          return [...updated].sort(
            (a, b) =>
              new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime(),
          )
        })
      }

      const onMessageDeleted = (payload: { messageId: string; conversationId: string }) => {
        if (!payload) return
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id === payload.conversationId && conv.lastMessage?.id === payload.messageId) {
              return {
                ...conv,
                lastMessage: {
                  ...conv.lastMessage,
                  content: null,
                  isDeleted: true,
                },
              }
            }
            return conv
          }),
        )
      }

      const onMessageRead = (payload: { userId: string; conversationId: string }) => {
        if (payload && payload.userId === currentUserIdRef.current) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === payload.conversationId ? { ...conv, unread: 0 } : conv,
            ),
          )
        }
      }

      socket.on('match:accepted', onMatchAccepted)
      socket.on('receive_message', onReceiveMessage)
      socket.on('message_deleted', onMessageDeleted)
      socket.on('message_read', onMessageRead)

      return () => {
        socket.off('match:accepted', onMatchAccepted)
        socket.off('receive_message', onReceiveMessage)
        socket.off('message_deleted', onMessageDeleted)
        socket.off('message_read', onMessageRead)
      }
    } catch {
      // fallback
    }
  }, [fetchConversations, currentUserId])

  const startConversation = useCallback(
    async (payload: CreateConversationPayload) => {
      const conv = await createConversationApi(payload)
      await fetchConversations(conv.id)
      return conv
    },
    [fetchConversations],
  )

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      await deleteConversationApi(conversationId)
      setConversations((prev) => prev.filter((conv) => conv.id !== conversationId))
      setActiveId((current) => {
        if (current === conversationId) {
          const remaining = conversations.filter((c) => c.id !== conversationId)
          return remaining[0]?.id ?? ''
        }
        return current
      })
    },
    [conversations, setActiveId],
  )

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId),
    [conversations, activeId],
  )

  const visibleConversations = useMemo(
    () =>
      conversations.filter((conversation) =>
        conversation.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [conversations, query],
  )

  return {
    conversations,
    loading,
    error,
    activeId,
    setActiveId,
    query,
    setQuery,
    activeConversation,
    visibleConversations,
    clearConversationUnread,
    refetchConversations: fetchConversations,
    startConversation,
    deleteConversation,
  }
}

