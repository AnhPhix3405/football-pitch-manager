import { io, Socket } from 'socket.io-client'
import { ACCESS_TOKEN_KEY } from '../../../config/axios.config'
import { env } from '../../../config/env'

let socket: Socket | null = null

export function getChatSocket(): Socket {
  if (!socket) {
    const token = window.localStorage.getItem(ACCESS_TOKEN_KEY) || ''
    socket = io(`${env.apiUrl}/chat`, {
      transports: ['websocket', 'polling'],
      auth: { token },
      autoConnect: false,
    })
  }
  return socket
}

export function connectChatSocket(): Socket {
  const s = getChatSocket()
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY) || ''
  s.auth = { token }
  if (!s.connected) {
    s.connect()
  }
  return s
}

export function disconnectChatSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
