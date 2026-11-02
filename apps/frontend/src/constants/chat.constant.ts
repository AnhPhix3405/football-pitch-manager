export const CONVERSATION_TYPE = {
  DIRECT: 'direct',
  FIELD: 'field',
  POST: 'post',
} as const

export const CONVERSATION_KIND = {
  FIELD: 'field',
  TEAM: 'team',
} as const

export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
} as const

export const MESSAGE_SENDER = {
  ME: 'me',
  THEM: 'them',
} as const

export const CHAT_SOCKET_EVENTS = {
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  MARK_AS_READ: 'mark_as_read',
  MESSAGE_READ: 'message_read',
  EDIT_MESSAGE: 'edit_message',
  MESSAGE_EDITED: 'message_edited',
  DELETE_MESSAGE: 'delete_message',
  MESSAGE_DELETED: 'message_deleted',
  MATCH_ACCEPTED: 'match:accepted',
} as const

export const CHAT_PAGINATION_LIMIT = 20
