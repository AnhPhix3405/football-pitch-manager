import { io, Socket } from 'socket.io-client'
import { ACCESS_TOKEN_KEY } from '../../../constants/auth.constant'
import { env } from '../../../config/env'

let socket: Socket | null = null
let currentSocketToken: string | null = null

export function getChatSocket(): Socket {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY) || ''

  if (socket && currentSocketToken !== token) {
    socket.disconnect()
    socket = null
    currentSocketToken = null
  }

  if (!socket) {
    currentSocketToken = token
    socket = io(`${env.apiUrl}/chat`, {
      transports: ['websocket', 'polling'],
      auth: { token },
      autoConnect: false,
    })
  }
  return socket
}

export function connectChatSocket(): Socket {
  const token = window.localStorage.getItem(ACCESS_TOKEN_KEY) || ''

  if (socket && currentSocketToken !== token) {
    socket.disconnect()
    socket = null
    currentSocketToken = null
  }

  const s = getChatSocket()
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
    currentSocketToken = null
  }
}
