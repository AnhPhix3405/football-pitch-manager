import { PostStatusType, SkillLevelType } from '../constants/post.constant';

export interface FindPublicPostsFilter {
  page?: number;
  limit?: number;
  search?: string;
  skillLevel?: SkillLevelType;
  playDate?: string;
  lat?: number | string;
  lng?: number | string;
}

export interface FindMyPostsFilter {
  page?: number;
  limit?: number;
  status?: PostStatusType;
}

export interface MatchAcceptedEventPayload {
  matchId: string;
  postId: string;
  conversationId: string;
  postTitle: string;
}
