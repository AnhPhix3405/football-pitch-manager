export const POST_STATUS = {
  OPEN: 'open',
  MATCHED: 'matched',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

export type PostStatusType = (typeof POST_STATUS)[keyof typeof POST_STATUS];

export const POST_MATCH_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
} as const;

export type PostMatchStatusType =
  (typeof POST_MATCH_STATUS)[keyof typeof POST_MATCH_STATUS];

export const SKILL_LEVEL = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  ALL: 'all',
} as const;

export type SkillLevelType = (typeof SKILL_LEVEL)[keyof typeof SKILL_LEVEL];

export const POST_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
} as const;
