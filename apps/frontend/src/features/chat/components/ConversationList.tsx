import { CalendarOutlined, SearchOutlined, TeamOutlined } from '@ant-design/icons'
import { Input } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Conversation } from '../interface/chat.types'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string
  onSelectConversation: (id: string) => void
  query: string
  onQueryChange: (query: string) => void
}

export function ConversationList({
  conversations,
  activeId,
  onSelectConversation,
  query,
  onQueryChange,
}: ConversationListProps) {
  const { t } = useTranslation()

  return (
    <aside className="conversation-list">
      <header>
        <span className="eyebrow">{t('chat.eyebrow', { defaultValue: 'COMMS_LINK' })}</span>
        <h1>{t('chat.title', { defaultValue: 'Tin nhắn' })}</h1>
        <Input
          prefix={<SearchOutlined />}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('chat.searchPlaceholder', { defaultValue: 'Tìm hội thoại...' })}
        />
      </header>
      {conversations.map((conversation) => (
        <button
          type="button"
          className={conversation.id === activeId ? 'active' : ''}
          onClick={() => onSelectConversation(conversation.id)}
          key={conversation.id}
        >
          <span className="conversation-avatar">
            {conversation.kind === 'field' ? <CalendarOutlined /> : <TeamOutlined />}
            <i className={conversation.online ? 'online' : ''} />
          </span>
          <span>
            <b>{conversation.name}</b>
            <small>{conversation.preview}</small>
          </span>
          {conversation.unread > 0 && <em>{conversation.unread}</em>}
        </button>
      ))}
    </aside>
  )
}
