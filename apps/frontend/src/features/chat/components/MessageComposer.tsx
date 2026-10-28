import { type ChangeEvent, type ClipboardEvent, useEffect, useRef, useState } from 'react'
import {
  CheckOutlined,
  CloseOutlined,
  PaperClipOutlined,
  SendOutlined,
} from '@ant-design/icons'
import { Button, Input, Spin, Tooltip, type InputRef } from 'antd'
import { useTranslation } from 'react-i18next'
import type { ChatMessage } from '~/features/chat/interface/chat.types'
import { useUploadImage } from '~/hooks/useUploadImage'

interface MessageComposerProps {
  onSendMessage: (content: string, messageType?: 'text' | 'image') => void
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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { file, previewUrl, isUploading, selectFile, clearFile, upload } =
    useUploadImage()

  const isEditing = Boolean(editingMessage)

  useEffect(() => {
    if (editingMessage) {
      setDraft(editingMessage.body)
      clearFile()
      setTimeout(() => {
        inputRef.current?.focus({ cursor: 'end' })
      }, 0)
    } else {
      setDraft('')
    }
  }, [editingMessage, clearFile])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      selectFile(selected)
    }
    // Reset file input so user can pick the same file again if needed
    e.target.value = ''
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    if (isEditing) return
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const pasted = e.clipboardData.files[0]
      if (pasted.type.startsWith('image/')) {
        e.preventDefault()
        selectFile(pasted)
      }
    }
  }

  const handleSubmit = async () => {
    if (isUploading || disabled) return

    if (isEditing && editingMessage) {
      const trimmed = draft.trim()
      if (!trimmed) return
      onSaveEdit?.(editingMessage.id, trimmed)
      return
    }

    // Upload & send image
    if (file) {
      const res = await upload()
      if (!res) return
      onSendMessage(res.url, 'image')
      if (draft.trim()) {
        onSendMessage(draft.trim(), 'text')
        setDraft('')
      }
      return
    }

    // Send regular text message
    const trimmed = draft.trim()
    if (!trimmed) return
    onSendMessage(trimmed, 'text')
    setDraft('')
  }

  const handleCancel = () => {
    onCancelEdit?.()
    setDraft('')
  }

  return (
    <footer className={`chat-composer ${isEditing ? 'is-editing' : ''}`}>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

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

      {!isEditing && previewUrl && (
        <div className="message-composer-image-preview">
          <div className="message-composer-image-preview__thumb">
            <img src={previewUrl} alt="Preview" />
            {isUploading && (
              <div className="message-composer-image-preview__loading">
                <Spin size="small" />
              </div>
            )}
            {!isUploading && (
              <button
                type="button"
                className="message-composer-image-preview__remove"
                onClick={clearFile}
                aria-label={t('chat.removeImage', { defaultValue: 'Gỡ ảnh' })}
              >
                <CloseOutlined />
              </button>
            )}
          </div>
          <div className="message-composer-image-preview__info">
            <span className="message-composer-image-preview__name">
              {file?.name}
            </span>
            <span className="message-composer-image-preview__size">
              {file ? `${(file.size / 1024).toFixed(0)} KB` : ''}
            </span>
          </div>
        </div>
      )}

      <div className="message-composer-input-row">
        {!isEditing && (
          <Tooltip title={t('chat.attachImage', { defaultValue: 'Đính kèm hình ảnh' })}>
            <Button
              type="text"
              icon={<PaperClipOutlined />}
              onClick={() => fileInputRef.current?.click()}
              aria-label={t('chat.attachImage', { defaultValue: 'Đính kèm hình ảnh' })}
              disabled={disabled || isUploading}
            />
          </Tooltip>
        )}
        <Input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onPressEnter={handleSubmit}
          onPaste={handlePaste}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && isEditing) {
              event.preventDefault()
              handleCancel()
            }
          }}
          placeholder={
            file
              ? t('chat.captionPlaceholder', { defaultValue: 'Thêm chú thích ảnh (tùy chọn)...' })
              : t('chat.inputPlaceholder', { defaultValue: 'Nhập tin nhắn...' })
          }
          disabled={disabled || isUploading}
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
            loading={isUploading}
            className={isEditing ? 'message-composer-save-btn' : undefined}
            aria-label={
              isEditing
                ? t('chat.saveEdit', { defaultValue: 'Lưu chỉnh sửa' })
                : t('chat.sendAria', { defaultValue: 'Gửi tin nhắn' })
            }
            disabled={disabled || isUploading || (!draft.trim() && !file)}
          />
        </Tooltip>
      </div>
    </footer>
  )
}
