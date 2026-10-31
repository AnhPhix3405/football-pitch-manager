import { CalendarOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useConfirmModal } from '~/hooks'
import type { Conversation } from '../interface/chat.types'

interface ChatHeaderProps {
  conversation: Conversation
  onDeleteConversation?: (conversationId: string) => void
}

export function ChatHeader({ conversation, onDeleteConversation }: ChatHeaderProps) {
  const { t } = useTranslation()
  const { showConfirm, ConfirmDialog } = useConfirmModal()

  const handleDelete = () => {
    showConfirm({
      title: t('chat.deleteConversationConfirm', {
        defaultValue:
          'Bạn có chắc chắn muốn xóa đoạn chat này không? Lịch sử tin nhắn cũ sẽ không còn hiển thị.',
      }),
      okText: t('chat.deleteConversation', { defaultValue: 'Xóa đoạn chat' }),
      cancelText: t('common.cancel', { defaultValue: 'Hủy' }),
      danger: true,
      onOk: () => onDeleteConversation?.(conversation.id),
    })
  }

  return (
    <header>
      <div className="chat-panel__user">
        <div className="conversation-avatar conversation-avatar--header">
          {conversation.avatarUrl ? (
            <img
              src={conversation.avatarUrl}
              alt={conversation.name}
              decoding="async"
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Tooltip title={t('chat.deleteConversation', { defaultValue: 'Xóa đoạn chat' })}>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            aria-label={t('chat.deleteConversation', { defaultValue: 'Xóa đoạn chat' })}
          />
        </Tooltip>
        <Button
          type="text"
          icon={<InfoCircleOutlined />}
          aria-label={t('chat.infoAria', { defaultValue: 'Thông tin hội thoại' })}
        />
      </div>
      {ConfirmDialog}
    </header>
  )
}

