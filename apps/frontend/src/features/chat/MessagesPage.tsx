import { Empty } from 'antd'
import { useTranslation } from 'react-i18next'
import { ChatHeader } from './components/ChatHeader'
import { ConversationList } from './components/ConversationList'
import { MessageComposer } from './components/MessageComposer'
import { MessageThread } from './components/MessageThread'
import { useChatConversations } from './hooks/useChatConversations'
import { useChatSocket } from './hooks/useChatSocket'

export function MessagesPage() {
  const { t } = useTranslation()
  const {
    activeId,
    setActiveId,
    query,
    setQuery,
    activeConversation,
    visibleConversations,
  } = useChatConversations()

  const { messages, sendMessage } = useChatSocket(activeId)
  const visibleMessages = messages.filter((item) => item.conversationId === activeId)

  return (
    <section className="messages-page">
      <ConversationList
        conversations={visibleConversations}
        activeId={activeId}
        onSelectConversation={setActiveId}
        query={query}
        onQueryChange={setQuery}
      />
      <div className="chat-panel">
        {activeConversation ? (
          <>
            <ChatHeader conversation={activeConversation} />
            <MessageThread messages={visibleMessages} />
            <MessageComposer onSendMessage={sendMessage} />
          </>
        ) : (
          <Empty
            description={t('chat.emptyPrompt', {
              defaultValue: 'Chọn một cuộc trò chuyện để bắt đầu.',
            })}
          />
        )}
      </div>
    </section>
  )
}
