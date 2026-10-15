import { InfoCircleOutlined } from '@ant-design/icons'
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
      <div className="chat-panel__meta">
        <b>{conversation.name}</b>
        <small>
          {conversation.kind === 'field'
            ? t('chat.fieldChannel', { defaultValue: 'Kênh liên hệ sân bóng' })
            : t('chat.teamChannel', { defaultValue: 'Trưởng nhóm đối thủ' })}
        </small>
      </div>
      <Button
        type="text"
        icon={<InfoCircleOutlined />}
        aria-label={t('chat.infoAria', { defaultValue: 'Thông tin hội thoại' })}
      />
    </header>
  )
}
