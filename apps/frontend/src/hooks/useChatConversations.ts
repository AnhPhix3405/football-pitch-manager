import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  Conversation,
  CreateConversationPayload,
} from '~/features/chat/interface/chat.types'
import {
  createConversationApi,
  getConversationsApi,
} from '~/features/chat/service/chat.service'
import { connectChatSocket } from '~/features/chat/service/chat-socket.service'

export function useChatConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchConversations = useCallback(async (preserveActiveId?: string) => {
    setLoading(true)
    setError(null)
    try {
      const data = await getConversationsApi()
      setConversations(data)
      setActiveId((current) => {
        if (preserveActiveId && data.some((c) => c.id === preserveActiveId)) {
          return preserveActiveId
        }
        if (current && data.some((c) => c.id === current)) {
          return current
        }
        return data[0]?.id ?? ''
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Lỗi khi tải cuộc trò chuyện'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    try {
      const socket = connectChatSocket()
      const onMatchAccepted = (data?: { conversationId?: string }) => {
        fetchConversations(data?.conversationId)
      }

      socket.on('match:accepted', onMatchAccepted)

      return () => {
        socket.off('match:accepted', onMatchAccepted)
      }
    } catch {
      // fallback
    }
  }, [fetchConversations])

  const startConversation = useCallback(
    async (payload: CreateConversationPayload) => {
      const conv = await createConversationApi(payload)
      await fetchConversations(conv.id)
      return conv
    },
    [fetchConversations],
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
    refetchConversations: fetchConversations,
    startConversation,
  }
}
