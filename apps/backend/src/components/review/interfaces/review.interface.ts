export interface RatingSummaryCalculated {
  avgRating: string;
  totalReviews: number;
  bayesianScore?: string;
  sportsmanshipScore?: string;
}

export interface ReviewFilterOptions {
  page?: number;
  limit?: number;
  rating?: number;
}
