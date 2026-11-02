export interface FieldRankingItem {
  rank: number
  fieldId: string
  name: string
  address: string
  district: string
  avgRating: number
  totalReviews: number
  bayesianScore: number
  thumbnailUrl: string | null
}

export interface PlayerRankingItem {
  rank: number
  userId: string
  name: string
  avatarUrl: string | null
  skillLevel: string
  avgRating: number
  totalReviews: number
  sportsmanshipScore: number
}
