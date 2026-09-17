import { CalendarOutlined, InfoCircleOutlined, PaperClipOutlined, SearchOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons'
import { Button, Empty, Input } from 'antd'
import { useMemo, useState } from 'react'
import { conversations, initialMessages, type ChatMessage } from '../user/user.data'

export function MessagesPage() {
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? '')
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const active = conversations.find((conversation) => conversation.id === activeId)
  const visibleConversations = useMemo(() => conversations.filter((conversation) => conversation.name.toLowerCase().includes(query.toLowerCase())), [query])
  const visibleMessages = messages.filter((item) => item.conversationId === activeId)
  const send = () => { const body = draft.trim(); if (!body) return; setMessages((items) => [...items, { id: crypto.randomUUID(), conversationId: activeId, body, sentAt: new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(new Date()), sender: 'me' }]); setDraft('') }
  return <section className="messages-page"><aside className="conversation-list"><header><span className="eyebrow">COMMS_LINK</span><h1>Tin nhắn</h1><Input prefix={<SearchOutlined />} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm hội thoại..." /></header>{visibleConversations.map((conversation) => <button type="button" className={conversation.id === activeId ? 'active' : ''} onClick={() => setActiveId(conversation.id)} key={conversation.id}><span className="conversation-avatar">{conversation.kind === 'field' ? <CalendarOutlined /> : <TeamOutlined />}<i className={conversation.online ? 'online' : ''} /></span><span><b>{conversation.name}</b><small>{conversation.preview}</small></span>{conversation.unread > 0 && <em>{conversation.unread}</em>}</button>)}</aside><div className="chat-panel">{active ? <><header><div><span className="conversation-avatar"><CalendarOutlined /><i className={active.online ? 'online' : ''} /></span><span><b>{active.name}</b><small>{active.online ? 'ONLINE_SYS' : 'OFFLINE'}</small></span></div><Button type="text" icon={<InfoCircleOutlined />} aria-label="Thông tin hội thoại" /></header><div className="message-thread"><span className="date-chip">SYSTEM DATE: 2026-10-24</span>{visibleMessages.map((item) => <article className={item.sender === 'me' ? 'mine' : ''} key={item.id}><p>{item.body}</p><small>{item.sentAt}</small></article>)}</div><footer><Button type="text" icon={<PaperClipOutlined />} aria-label="Đính kèm tệp" /><Input value={draft} onChange={(event) => setDraft(event.target.value)} onPressEnter={send} placeholder="Nhập tin nhắn..." /><Button type="primary" icon={<SendOutlined />} onClick={send} aria-label="Gửi tin nhắn" /></footer></> : <Empty description="Chọn một hội thoại để bắt đầu." />}</div></section>
}
