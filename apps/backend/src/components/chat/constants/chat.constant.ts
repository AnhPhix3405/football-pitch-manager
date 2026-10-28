export const CONVERSATION_TYPE = {
  DIRECT: 'direct',
  FIELD: 'field',
  POST: 'post',
} as const;

export type ConversationType =
  (typeof CONVERSATION_TYPE)[keyof typeof CONVERSATION_TYPE];

export const MESSAGE_TYPE = {
  TEXT: 'text',
  IMAGE: 'image',
} as const;

export type MessageType = (typeof MESSAGE_TYPE)[keyof typeof MESSAGE_TYPE];
