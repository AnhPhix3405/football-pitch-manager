import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../interface/chat.types'

interface MessageThreadProps {
  messages: ChatMessage[]
}

export function MessageThread({ messages }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="message-thread">
      {messages.map((msg) => (
        <article key={msg.id} className={msg.sender === 'me' ? 'mine' : ''}>
          <p>{msg.body}</p>
          <small>{msg.sentAt}</small>
        </article>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
