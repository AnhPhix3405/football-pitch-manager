export const FIELD_FORMATS = {
  FIVE: '5v5',
  SEVEN: '7v7',
  ELEVEN: '11v11',
} as const

export type FieldFormat = (typeof FIELD_FORMATS)[keyof typeof FIELD_FORMATS]

export const FIELD_SURFACES = {
  ARTIFICIAL: 'Cỏ nhân tạo',
  NATURAL: 'Cỏ tự nhiên',
} as const

export type FieldSurface = (typeof FIELD_SURFACES)[keyof typeof FIELD_SURFACES]
