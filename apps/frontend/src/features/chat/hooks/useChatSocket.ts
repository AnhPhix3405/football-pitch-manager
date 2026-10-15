import { useEffect, useState } from 'react'
import { connectChatSocket, getChatSocket } from '../service/chat-socket.service'
import { initialMessages } from '../../user/user.data'
import type { ChatMessage } from '../interface/chat.types'

export function useChatSocket(activeId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)

  useEffect(() => {
    try {
      const socket = connectChatSocket()
      if (activeId) {
        socket.emit('join_room', { conversationId: activeId })
      }
      const onReceiveMessage = (incoming: {
        id?: string
        conversationId?: string
        content?: string
        createdAt?: string
      }) => {
        if (incoming && incoming.conversationId === activeId) {
          setMessages((items) => [
            ...items,
            {
              id: incoming.id || crypto.randomUUID(),
              conversationId: incoming.conversationId || activeId,
              body: incoming.content || '',
              sentAt: new Intl.DateTimeFormat('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(incoming.createdAt || Date.now())),
              sender: 'them',
            },
          ])
        }
      }

      socket.on('message:receive', onReceiveMessage)
      socket.on('new_message', onReceiveMessage)

      return () => {
        socket.off('message:receive', onReceiveMessage)
        socket.off('new_message', onReceiveMessage)
        if (activeId) {
          socket.emit('leave_room', { conversationId: activeId })
        }
      }
    } catch {
      // Socket fallback
    }
  }, [activeId])

  const sendMessage = (body: string) => {
    if (!body.trim() || !activeId) return
    const now = new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      conversationId: activeId,
      body: body.trim(),
      sentAt: now,
      sender: 'me',
    }
    setMessages((items) => [...items, newMessage])

    try {
      const socket = getChatSocket()
      if (socket && socket.connected) {
        socket.emit('send_message', {
          conversationId: activeId,
          content: body.trim(),
        })
      }
    } catch {
      // Fallback
    }
  }

  return { messages, sendMessage }
}
