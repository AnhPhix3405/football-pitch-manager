export const REVIEW_STATUS = {
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
  FLAGGED: 'flagged',
} as const;

export const MODERATION_ACTION = {
  DISMISS: 'dismiss',
  HIDE: 'hide',
} as const;

export type ModerationAction =
  (typeof MODERATION_ACTION)[keyof typeof MODERATION_ACTION];

export const RATING_LIMITS = {
  MIN: 1,
  MAX: 5,
} as const;

export const DEFAULT_BAYESIAN_PARAMS = {
  // C: Prior confidence weight (threshold count of reviews)
  C: 5,
  // M: Prior mean rating
  M: 3.5,
} as const;
