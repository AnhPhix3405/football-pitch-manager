import { getMetadataArgsStorage } from 'typeorm';
import { DATABASE_ENTITIES } from './database.entities';

const EXPECTED_TABLES = [
  'users',
  'user_profiles',
  'owner_profiles',
  'fields',
  'field_courts',
  'field_images',
  'field_services',
  'field_pricing',
  'field_opening_hours',
  'field_blocked_slots',
  'bookings',
  'booking_services',
  'posts',
  'post_comments',
  'conversations',
  'post_matches',
  'conversation_members',
  'messages',
  'notifications',
  'subscription_plans',
  'subscriptions',
  'transactions',
  'approval_requests',
  'field_reviews',
  'user_reviews',
  'field_rating_summary',
  'user_rating_summary',
  'ai_usage_logs',
].sort();

describe('database schema metadata', () => {
  it('registers every table from the specification exactly once', () => {
    const entityTargets = new Set(DATABASE_ENTITIES);
    const tables = getMetadataArgsStorage()
      .tables.filter((table) => entityTargets.has(table.target))
      .map((table) => table.name)
      .sort();

    expect(DATABASE_ENTITIES).toHaveLength(28);
    expect(tables).toEqual(EXPECTED_TABLES);
  });

  it('does not create relations for polymorphic reference columns', () => {
    const storage = getMetadataArgsStorage();
    const polymorphicRelations = storage.relations.filter(
      ({ target, propertyName }) =>
        [
          [TransactionEntityName, 'refId'],
          [ApprovalRequestEntityName, 'targetId'],
          [NotificationEntityName, 'refId'],
        ].some(
          ([entityName, referenceProperty]) =>
            typeof target === 'function' &&
            target.name === entityName &&
            propertyName === referenceProperty,
        ),
    );

    expect(polymorphicRelations).toHaveLength(0);
  });
});

const TransactionEntityName = 'TransactionEntity';
const ApprovalRequestEntityName = 'ApprovalRequestEntity';
const NotificationEntityName = 'NotificationEntity';
