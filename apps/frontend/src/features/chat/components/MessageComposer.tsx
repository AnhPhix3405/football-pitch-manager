import { PaperClipOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface MessageComposerProps {
  onSendMessage: (content: string) => void
  disabled?: boolean
}

export function MessageComposer({ onSendMessage, disabled }: MessageComposerProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')

  const handleSend = () => {
    if (!draft.trim() || disabled) return
    onSendMessage(draft.trim())
    setDraft('')
  }

  return (
    <footer>
      <Button
        type="text"
        icon={<PaperClipOutlined />}
        aria-label={t('chat.attachAria', { defaultValue: 'Đính kèm tệp' })}
        disabled={disabled}
      />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onPressEnter={handleSend}
        placeholder={t('chat.inputPlaceholder', { defaultValue: 'Nhập tin nhắn...' })}
        disabled={disabled}
      />
      <Button
        type="primary"
        icon={<SendOutlined />}
        onClick={handleSend}
        aria-label={t('chat.sendAria', { defaultValue: 'Gửi tin nhắn' })}
        disabled={disabled || !draft.trim()}
      />
    </footer>
  )
}
