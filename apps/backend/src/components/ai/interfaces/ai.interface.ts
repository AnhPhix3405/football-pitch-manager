export interface AiMatchSuggestionResult {
  postId: string;
  recommendedUserId: string | null;
  compatibilityScore: number;
  reason: string;
  tokensUsed: number;
  provider: string;
}

export interface AiUserQuotaStatus {
  dailyRequestsUsed: number;
  dailyQuota: number;
  remainingRequests: number;
  totalTokensUsed: number;
}
