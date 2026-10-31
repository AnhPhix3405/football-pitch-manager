export const POST_MORNING_SLOTS = [
  '06:00 - 07:30',
  '07:30 - 09:00',
  '09:00 - 10:30',
] as const

export const POST_AFTERNOON_EVENING_SLOTS = [
  '16:00 - 17:30',
  '17:30 - 19:00',
  '19:00 - 20:30',
  '20:30 - 22:00',
  '22:00 - 23:30',
] as const

export const POST_SKILL_LEVEL_OPTIONS = [
  { value: 'Phong trào', labelKey: 'posts.skillLevels.recreational', defaultLabel: 'Phong trào (Vui là chính)' },
  { value: 'Trung bình khá', labelKey: 'posts.skillLevels.intermediate', defaultLabel: 'Trung bình khá' },
  { value: 'Khá', labelKey: 'posts.skillLevels.advanced', defaultLabel: 'Khá' },
  { value: 'Bán chuyên', labelKey: 'posts.skillLevels.semiPro', defaultLabel: 'Bán chuyên' },
] as const

export const DEFAULT_POST_MAX_PLAYERS = 14
export const MIN_POST_PLAYERS = 2
export const MAX_POST_PLAYERS = 30
