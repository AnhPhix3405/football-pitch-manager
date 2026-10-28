import { useEffect, useLayoutEffect, useRef } from 'react'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { Empty, Image, Spin, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { useConfirmModal } from '~/hooks'
import type { ChatMessage } from '../interface/chat.types'

interface MessageThreadProps {
  conversationId?: string
  messages: ChatMessage[]
  loading?: boolean
  loadingMore?: boolean
  hasMore?: boolean
  onLoadMore?: () => Promise<unknown> | void
  onStartEditMessage?: (message: ChatMessage) => void
  onDeleteMessage?: (messageId: string) => void
}

export function MessageThread({
  conversationId,
  messages,
  loading,
  loadingMore = false,
  hasMore = true,
  onLoadMore,
  onStartEditMessage,
  onDeleteMessage,
}: MessageThreadProps) {
  const { t } = useTranslation()
  const { showConfirm, ConfirmDialog } = useConfirmModal()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const prevFirstIdRef = useRef<string | undefined>(undefined)
  const prevLastIdRef = useRef<string | undefined>(undefined)
  const prevScrollHeightRef = useRef<number>(0)
  const prevScrollTopRef = useRef<number>(0)
  const isFetchingRef = useRef<boolean>(false)

  // Đồng bộ trạng thái fetching để chặn trigger nhiều lần liên tiếp
  useEffect(() => {
    isFetchingRef.current = loadingMore
  }, [loadingMore])

  // Giữ nguyên vị trí cuộn khi tin nhắn cũ được thêm vào đầu
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container || messages.length === 0) return

    const currentFirstId = messages[0]?.id
    const currentLastId = messages[messages.length - 1]?.id

    // Kiểm tra xem có phải tin nhắn cũ được thêm vào đầu không (firstId đổi, lastId giữ nguyên)
    const isPrepended =
      Boolean(prevFirstIdRef.current) &&
      prevFirstIdRef.current !== currentFirstId &&
      prevLastIdRef.current === currentLastId

    if (isPrepended) {
      const scrollDiff = container.scrollHeight - prevScrollHeightRef.current
      container.scrollTop = prevScrollTopRef.current + scrollDiff
    } else if (prevLastIdRef.current !== currentLastId) {
      // Tin nhắn mới ở cuối hoặc lần đầu mở cuộc trò chuyện
      if (!prevLastIdRef.current) {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' })
      } else {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    prevFirstIdRef.current = currentFirstId
    prevLastIdRef.current = currentLastId
    prevScrollHeightRef.current = container.scrollHeight
    prevScrollTopRef.current = container.scrollTop
  }, [messages])

  // Lắng nghe sự kiện scroll để tải thêm tin nhắn cũ khi cuộn lên đỉnh
  const handleScroll = () => {
    const container = containerRef.current
    if (!container) return

    // Liên tục lưu lại vị trí cuộn thực tế của người dùng
    prevScrollTopRef.current = container.scrollTop
    prevScrollHeightRef.current = container.scrollHeight

    if (
      container.scrollTop <= 60 &&
      hasMore &&
      !loadingMore &&
      !isFetchingRef.current &&
      !loading &&
      onLoadMore
    ) {
      isFetchingRef.current = true
      onLoadMore()
    }
  }

  // Reset tracking khi chuyển cuộc trò chuyện khác
  useEffect(() => {
    prevFirstIdRef.current = undefined
    prevLastIdRef.current = undefined
    prevScrollHeightRef.current = 0
    prevScrollTopRef.current = 0
    isFetchingRef.current = false
  }, [conversationId])


  if (loading && messages.length === 0) {
    return (
      <div className="message-thread" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin />
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="message-thread" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('chat.startConversationPrompt', {
            defaultValue: 'Gửi tin nhắn đầu tiên để bắt đầu cuộc trò chuyện.',
          })}
        />
      </div>
    )
  }

  return (
    <div className="message-thread" ref={containerRef} onScroll={handleScroll}>
      {loadingMore && (
        <div className="message-thread-loading-badge">
          <Spin size="small" />
        </div>
      )}
      {messages.map((msg) => (
        <article
          key={msg.id}
          className={`${msg.sender === 'me' ? 'mine' : ''} ${msg.isDeleted ? 'recalled' : ''}`}
        >
          <div className="message-bubble-wrapper">
            {msg.isDeleted ? (
              <p>{t('chat.recalled', { defaultValue: 'Đã thu hồi' })}</p>
            ) : msg.messageType === 'image' ? (
              <div className="message-image-bubble">
                <Image
                  src={msg.body}
                  alt="attachment"
                  className="message-attachment-image"
                  placeholder={<Spin size="small" />}
                />
              </div>
            ) : (
              <p>{msg.body}</p>
            )}
            {msg.sender === 'me' && !msg.isDeleted && (
              <div className="message-actions">
                {msg.messageType !== 'image' && (
                  <Tooltip title={t('chat.edit', { defaultValue: 'Chỉnh sửa' })}>
                    <button
                      type="button"
                      className="message-action-btn"
                      onClick={() => onStartEditMessage?.(msg)}
                      aria-label={t('chat.edit', { defaultValue: 'Chỉnh sửa' })}
                    >
                      <EditOutlined />
                    </button>
                  </Tooltip>
                )}
                <Tooltip title={t('chat.recall', { defaultValue: 'Thu hồi' })}>
                  <button
                    type="button"
                    className="message-action-btn message-action-btn--danger"
                    onClick={() => {
                      showConfirm({
                        title: t('chat.recallConfirm', {
                          defaultValue: 'Bạn có chắc chắn muốn thu hồi tin nhắn này không?',
                        }),
                        okText: t('chat.recall', { defaultValue: 'Thu hồi' }),
                        cancelText: t('common.cancel', { defaultValue: 'Hủy' }),
                        danger: true,
                        onOk: () => onDeleteMessage?.(msg.id),
                      })
                    }}
                    aria-label={t('chat.recall', { defaultValue: 'Thu hồi' })}
                  >
                    <DeleteOutlined />
                  </button>
                </Tooltip>
              </div>
            )}
          </div>
          <div className="message-meta">
            <small>{msg.sentAt}</small>
            {!msg.isDeleted && msg.isEdited && (
              <span className="message-edited-badge">
                {t('chat.edited', { defaultValue: 'Đã chỉnh sửa' })}
              </span>
            )}
          </div>
        </article>
      ))}
      <div ref={bottomRef} />


      {ConfirmDialog}
    </div>
  )
}
