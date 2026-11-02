import { apiClient, type ApiResponse } from '../../../config/axios.config'
import type {
  FieldRankingItem,
  PlayerRankingItem,
} from '../interface/ranking.types'

export const rankingService = {
  async getFieldRankings(limit = 20): Promise<FieldRankingItem[]> {
    const res = await apiClient.get<ApiResponse<FieldRankingItem[]>>(
      '/rankings/fields',
      { params: { limit } },
    )
    return res.data.data
  },

  async getPlayerRankings(limit = 20): Promise<PlayerRankingItem[]> {
    const res = await apiClient.get<ApiResponse<PlayerRankingItem[]>>(
      '/rankings/players',
      { params: { limit } },
    )
    return res.data.data
  },
}
