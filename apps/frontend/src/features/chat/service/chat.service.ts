import { apiClient, type ApiResponse } from '~/config/axios.config'
import type {
  Conversation,
  CreateConversationPayload,
  RawBackendMessage,
} from '../interface/chat.types'

type BackendConversation = Conversation & { unreadCount?: number }

export async function getConversationsApi(): Promise<Conversation[]> {
  const response = await apiClient.get<ApiResponse<BackendConversation[]>>('/chat/conversations')
  const list = response.data?.data ?? []
  return list.map((c) => ({
    ...c,
    unread: c.unread ?? c.unreadCount ?? 0,
    preview: c.lastMessage?.content || '',
  }))
}

export async function getConversationMessagesApi(
  conversationId: string,
  params?: { limit?: number; before?: string },
): Promise<RawBackendMessage[]> {
  const response = await apiClient.get<ApiResponse<RawBackendMessage[]>>(
    `/chat/conversations/${conversationId}/messages`,
    { params },
  )
  return response.data?.data ?? []
}

export async function createConversationApi(
  payload: CreateConversationPayload,
): Promise<Conversation> {
  const response = await apiClient.post<ApiResponse<BackendConversation>>('/chat/conversations', payload)
  const conv = response.data?.data
  return {
    ...conv,
    unread: conv?.unread ?? conv?.unreadCount ?? 0,
    preview: conv?.lastMessage?.content || '',
  }
}
