import { useEffect, useMemo, useState } from 'react'
import { Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import chatPanelBg from '../../assets/chat_panel.jpg'
import { useChatConversations } from '~/hooks/useChatConversations'
import { useChatSocket } from '~/hooks/useChatSocket'
import type { ChatMessage } from './interface/chat.types'
import { ChatHeader } from './components/ChatHeader'
import { ConversationList } from './components/ConversationList'
import { MessageComposer } from './components/MessageComposer'
import { MessageThread } from './components/MessageThread'

export function MessagesPage() {
  const { t } = useTranslation()
  const {
    activeId,
    setActiveId,
    query,
    setQuery,
    activeConversation,
    visibleConversations,
    loading: conversationsLoading,
  } = useChatConversations()

  const {
    messages,
    loading: messagesLoading,
    loadingMore,
    hasMore,
    loadMoreMessages,
    sendMessage,
    editMessage,
    deleteMessage,
  } = useChatSocket(activeId)
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null)

  useEffect(() => {
    setEditingMessage(null)
  }, [activeId])

  const visibleMessages = useMemo(
    () => messages.filter((item) => item.conversationId === activeId),
    [messages, activeId],
  )

  return (
    <div className="messages-page-wrapper">
      <div
        className="messages-page-backdrop"
        style={{ backgroundImage: `url(${chatPanelBg})` }}
      />
      <section className="messages-page">
        <ConversationList
          conversations={visibleConversations}
          activeId={activeId}
          onSelectConversation={setActiveId}
          query={query}
          onQueryChange={setQuery}
          loading={conversationsLoading}
        />
        <div className="chat-panel">
          {activeConversation ? (
            <>
              <ChatHeader conversation={activeConversation} />
              <MessageThread
                conversationId={activeId}
                messages={visibleMessages}
                loading={messagesLoading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={loadMoreMessages}
                onStartEditMessage={setEditingMessage}
                onDeleteMessage={deleteMessage}
              />
              <MessageComposer
                onSendMessage={sendMessage}
                editingMessage={editingMessage}
                onSaveEdit={(messageId, content) => {
                  editMessage(messageId, content)
                  setEditingMessage(null)
                }}
                onCancelEdit={() => setEditingMessage(null)}
              />
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Empty
                description={t('chat.emptyPrompt', {
                  defaultValue: 'Chọn một cuộc trò chuyện để bắt đầu.',
                })}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
