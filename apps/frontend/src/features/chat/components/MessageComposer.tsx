import { CheckOutlined, CloseOutlined, PaperClipOutlined, SendOutlined } from '@ant-design/icons'
import { Button, Input, Tooltip, type InputRef } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { ChatMessage } from '~/features/chat/interface/chat.types'

interface MessageComposerProps {
  onSendMessage: (content: string) => void
  editingMessage?: ChatMessage | null
  onSaveEdit?: (messageId: string, content: string) => void
  onCancelEdit?: () => void
  disabled?: boolean
}

export function MessageComposer({
  onSendMessage,
  editingMessage,
  onSaveEdit,
  onCancelEdit,
  disabled,
}: MessageComposerProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')
  const inputRef = useRef<InputRef>(null)

  const isEditing = Boolean(editingMessage)

  useEffect(() => {
    if (editingMessage) {
      setDraft(editingMessage.body)
      setTimeout(() => {
        inputRef.current?.focus({ cursor: 'end' })
      }, 0)
    } else {
      setDraft('')
    }
  }, [editingMessage])

  const handleSubmit = () => {
    const trimmed = draft.trim()
    if (!trimmed || disabled) return

    if (isEditing && editingMessage) {
      onSaveEdit?.(editingMessage.id, trimmed)
    } else {
      onSendMessage(trimmed)
      setDraft('')
    }
  }

  const handleCancel = () => {
    onCancelEdit?.()
    setDraft('')
  }

  return (
    <footer className={`chat-composer ${isEditing ? 'is-editing' : ''}`}>
      {isEditing && (
        <div className="message-composer-edit-banner">
          <span className="message-composer-edit-title">
            {t('chat.editMessageTitle', { defaultValue: 'Chỉnh sửa tin nhắn' })}
          </span>
          <Tooltip title={t('chat.cancelEdit', { defaultValue: 'Hủy chỉnh sửa' })}>
            <button
              type="button"
              className="message-composer-edit-close"
              onClick={handleCancel}
              aria-label={t('chat.cancelEdit', { defaultValue: 'Hủy chỉnh sửa' })}
            >
              <CloseOutlined />
            </button>
          </Tooltip>
        </div>
      )}
      <div className="message-composer-input-row">
        {!isEditing && (
          <Button
            type="text"
            icon={<PaperClipOutlined />}
            aria-label={t('chat.attachAria', { defaultValue: 'Đính kèm tệp' })}
            disabled={disabled}
          />
        )}
        <Input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onPressEnter={handleSubmit}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && isEditing) {
              event.preventDefault()
              handleCancel()
            }
          }}
          placeholder={t('chat.inputPlaceholder', { defaultValue: 'Nhập tin nhắn...' })}
          disabled={disabled}
        />
        <Tooltip
          title={
            isEditing
              ? t('chat.saveEdit', { defaultValue: 'Lưu chỉnh sửa' })
              : t('chat.sendAria', { defaultValue: 'Gửi tin nhắn' })
          }
        >
          <Button
            type="primary"
            shape={isEditing ? 'circle' : undefined}
            icon={isEditing ? <CheckOutlined /> : <SendOutlined />}
            onClick={handleSubmit}
            className={isEditing ? 'message-composer-save-btn' : undefined}
            aria-label={
              isEditing
                ? t('chat.saveEdit', { defaultValue: 'Lưu chỉnh sửa' })
                : t('chat.sendAria', { defaultValue: 'Gửi tin nhắn' })
            }
            disabled={disabled || !draft.trim()}
          />
        </Tooltip>
      </div>
    </footer>
  )
}

