import { CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useTranslation } from 'react-i18next'
import type { Conversation } from '../interface/chat.types'

interface ChatHeaderProps {
  conversation: Conversation
}

export function ChatHeader({ conversation }: ChatHeaderProps) {
  const { t } = useTranslation()

  return (
    <header>
      <div className="chat-panel__user">
        <div className="conversation-avatar conversation-avatar--header">
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
        </div>
        <div className="chat-panel__meta">
          <b>{conversation.name}</b>
          <small>
            {conversation.kind === 'field'
              ? t('chat.fieldChannel', { defaultValue: 'Kênh liên hệ sân bóng' })
              : t('chat.teamChannel', { defaultValue: 'Trưởng nhóm đối thủ' })}
          </small>
        </div>
      </div>
      <Button
        type="text"
        icon={<InfoCircleOutlined />}
        aria-label={t('chat.infoAria', { defaultValue: 'Thông tin hội thoại' })}
      />
    </header>
  )
}
