import { AiUsageLogEntity } from './ai-usage-log.entity';
import { ApprovalRequestEntity } from './approval-request.entity';
import { BookingServiceEntity } from './booking-service.entity';
import { BookingEntity } from './booking.entity';
import { ConversationMemberEntity } from './conversation-member.entity';
import { ConversationEntity } from './conversation.entity';
import { FieldBlockedSlotEntity } from './field-blocked-slot.entity';
import { FieldCourtEntity } from './field-court.entity';
import { FieldImageEntity } from './field-image.entity';
import { FieldOpeningHourEntity } from './field-opening-hour.entity';
import { FieldPricingEntity } from './field-pricing.entity';
import { FieldRatingSummaryEntity } from './field-rating-summary.entity';
import { FieldReviewEntity } from './field-review.entity';
import { FieldServiceEntity } from './field-service.entity';
import { FieldEntity } from './field.entity';
import { MessageEntity } from './message.entity';
import { NotificationEntity } from './notification.entity';
import { OwnerProfileEntity } from './owner-profile.entity';
import { PostCommentEntity } from './post-comment.entity';
import { PostMatchEntity } from './post-match.entity';
import { PostEntity } from './post.entity';
import { SubscriptionPlanEntity } from './subscription-plan.entity';
import { SubscriptionEntity } from './subscription.entity';
import { TransactionEntity } from './transaction.entity';
import { UserProfileEntity } from './user-profile.entity';
import { UserRatingSummaryEntity } from './user-rating-summary.entity';
import { UserReviewEntity } from './user-review.entity';
import { UserEntity } from './user.entity';

export const DATABASE_ENTITIES: Array<new () => object> = [
  UserEntity,
  UserProfileEntity,
  OwnerProfileEntity,
  FieldEntity,
  FieldCourtEntity,
  FieldImageEntity,
  FieldServiceEntity,
  FieldPricingEntity,
  FieldOpeningHourEntity,
  FieldBlockedSlotEntity,
  BookingEntity,
  BookingServiceEntity,
  PostEntity,
  PostCommentEntity,
  ConversationEntity,
  PostMatchEntity,
  ConversationMemberEntity,
  MessageEntity,
  NotificationEntity,
  SubscriptionPlanEntity,
  SubscriptionEntity,
  TransactionEntity,
  ApprovalRequestEntity,
  FieldReviewEntity,
  UserReviewEntity,
  FieldRatingSummaryEntity,
  UserRatingSummaryEntity,
  AiUsageLogEntity,
];
