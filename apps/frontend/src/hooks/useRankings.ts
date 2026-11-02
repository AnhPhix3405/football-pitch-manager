import { useCallback, useEffect, useState } from 'react'
import {
  DEFAULT_RANKING_LIMIT,
  RANKING_TABS,
  type RankingTabType,
} from '../features/rankings/constants/ranking.constants'
import type {
  FieldRankingItem,
  PlayerRankingItem,
} from '../features/rankings/interface/ranking.types'
import { rankingService } from '../features/rankings/services/ranking.service'

export function useRankings(initialTab: RankingTabType = RANKING_TABS.PLAYERS) {
  const [activeTab, setActiveTab] = useState<RankingTabType>(initialTab)
  const [playerRankings, setPlayerRankings] = useState<PlayerRankingItem[]>([])
  const [fieldRankings, setFieldRankings] = useState<FieldRankingItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRankings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (activeTab === RANKING_TABS.PLAYERS) {
        const data = await rankingService.getPlayerRankings(DEFAULT_RANKING_LIMIT)
        setPlayerRankings(data)
      } else {
        const data = await rankingService.getFieldRankings(DEFAULT_RANKING_LIMIT)
        setFieldRankings(data)
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Không thể tải bảng xếp hạng'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    void fetchRankings()
  }, [fetchRankings])

  return {
    activeTab,
    setActiveTab,
    playerRankings,
    fieldRankings,
    loading,
    error,
    refreshRankings: fetchRankings,
  }
}
