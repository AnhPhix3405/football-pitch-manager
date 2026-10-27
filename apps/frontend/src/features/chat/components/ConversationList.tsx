import { CalendarOutlined, SearchOutlined } from '@ant-design/icons'
import { Empty, Input, Spin } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Conversation } from '../interface/chat.types'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string
  onSelectConversation: (id: string) => void
  query: string
  onQueryChange: (query: string) => void
  loading?: boolean
}

export function ConversationList({
  conversations,
  activeId,
  onSelectConversation,
  query,
  onQueryChange,
  loading,
}: ConversationListProps) {
  const { t } = useTranslation()

  return (
    <aside className="conversation-list">
      <header>
        <h1>{t('chat.title')}</h1>
        <Input
          prefix={<SearchOutlined />}
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={t('chat.searchPlaceholder', { defaultValue: 'Tìm hội thoại...' })}
          allowClear
        />
      </header>

      {loading && conversations.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
          <Spin />
        </div>
      ) : conversations.length === 0 ? (
        <div style={{ padding: '24px 16px', textAlign: 'center' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={t('chat.noConversations', { defaultValue: 'Chưa có hội thoại nào' })}
          />
        </div>
      ) : (
        conversations.map((conversation) => {
          const previewText =
            conversation.preview ||
            conversation.lastMessage?.content ||
            t('chat.noMessagesYet', { defaultValue: 'Chưa có tin nhắn nào' })

          return (
            <button
              type="button"
              className={conversation.id === activeId ? 'active' : ''}
              onClick={() => onSelectConversation(conversation.id)}
              key={conversation.id}
            >
              <span className="conversation-avatar">
                {conversation.avatarUrl ? (
                  <img
                    src={conversation.avatarUrl}
                    alt={conversation.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : conversation.kind === 'field' ? (
                  <CalendarOutlined />
                ) : (
                  <span className="conversation-avatar-text">
                    {conversation.name?.trim() ? conversation.name.trim().charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
                <i className={conversation.online ? 'online' : ''} />
              </span>
              <span>
                <b>{conversation.name}</b>
                <small>{previewText}</small>
              </span>
              {conversation.unread > 0 && <em>{conversation.unread}</em>}
            </button>
          )
        })
      )}
    </aside>
  )
}
