import { useMemo, useState } from 'react'
import { conversations } from '../../user/user.data'
import type { Conversation } from '../interface/chat.types'

export function useChatConversations(initialList: Conversation[] = conversations) {
  const [conversationList] = useState<Conversation[]>(initialList)
  const [activeId, setActiveId] = useState<string>(initialList[0]?.id ?? '')
  const [query, setQuery] = useState('')

  const activeConversation = useMemo(
    () => conversationList.find((conversation) => conversation.id === activeId),
    [conversationList, activeId],
  )

  const visibleConversations = useMemo(
    () =>
      conversationList.filter((conversation) =>
        conversation.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [conversationList, query],
  )

  return {
    activeId,
    setActiveId,
    query,
    setQuery,
    activeConversation,
    visibleConversations,
  }
}
