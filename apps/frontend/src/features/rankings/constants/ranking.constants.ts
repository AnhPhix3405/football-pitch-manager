export const RANKING_TABS = {
  PLAYERS: 'players',
  FIELDS: 'fields',
} as const

export type RankingTabType = typeof RANKING_TABS[keyof typeof RANKING_TABS]

export const DEFAULT_RANKING_LIMIT = 20
