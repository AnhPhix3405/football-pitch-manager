import { getMetadataArgsStorage } from 'typeorm';
import { DATABASE_ENTITIES } from './database.entities';

const EXPECTED_TABLES = [
  'users',
  'user_profiles',
  'auth_sessions',
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

    expect(DATABASE_ENTITIES).toHaveLength(29);
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

  it('registers required indexes with explicit names on owner_profiles, fields, and approval_requests', () => {
    const storage = getMetadataArgsStorage();

    const getIndicesForTarget = (entityName: string) =>
      storage.indices.filter(
        ({ target }) =>
          typeof target === 'function' && target.name === entityName,
      );

    const ownerIndices = getIndicesForTarget('OwnerProfileEntity');
    const ownerIndexNames = ownerIndices.map((idx) => idx.name);
    expect(ownerIndexNames).toContain('IDX_owner_profiles_business_name');
    expect(ownerIndexNames).toContain('IDX_owner_profiles_verified_at');

    const fieldIndices = getIndicesForTarget('FieldEntity');
    const fieldIndexNames = fieldIndices.map((idx) => idx.name);
    expect(fieldIndexNames).toContain('IDX_fields_owner_id_created_at');
    expect(fieldIndexNames).toContain('IDX_fields_owner_id_status');
    expect(fieldIndexNames).toContain('IDX_fields_status_district');
    expect(fieldIndexNames).toContain('IDX_fields_status_created_at');
    expect(fieldIndexNames).toContain('IDX_fields_status_require_deposit');

    const approvalIndices = getIndicesForTarget('ApprovalRequestEntity');
    const approvalIndexNames = approvalIndices.map((idx) => idx.name);
    expect(approvalIndexNames).toContain(
      'IDX_approval_requests_type_status_created_at',
    );
    expect(approvalIndexNames).toContain(
      'IDX_approval_requests_target_id_status',
    );
  });
});

const TransactionEntityName = 'TransactionEntity';
const ApprovalRequestEntityName = 'ApprovalRequestEntity';
const NotificationEntityName = 'NotificationEntity';
