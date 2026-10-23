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

    const courtIndices = getIndicesForTarget('FieldCourtEntity').map(
      (i) => i.name,
    );
    expect(courtIndices).toContain('IDX_field_courts_field_id');
    expect(courtIndices).toContain('IDX_field_courts_field_id_status');
    expect(courtIndices).toContain('IDX_field_courts_field_id_type_status');

    const imageIndices = getIndicesForTarget('FieldImageEntity').map(
      (i) => i.name,
    );
    expect(imageIndices).toContain('IDX_field_images_field_id');
    expect(imageIndices).toContain('IDX_field_images_field_id_display_order');
    expect(imageIndices).toContain('IDX_field_images_field_id_thumbnail');

    const serviceIndices = getIndicesForTarget('FieldServiceEntity').map(
      (i) => i.name,
    );
    expect(serviceIndices).toContain('IDX_field_services_field_id');
    expect(serviceIndices).toContain('IDX_field_services_field_id_is_active');

    const openingHourIndices = getIndicesForTarget(
      'FieldOpeningHourEntity',
    ).map((i) => i.name);
    expect(openingHourIndices).toContain(
      'IDX_field_opening_hours_field_id_day_of_week',
    );

    const blockedSlotIndices = getIndicesForTarget(
      'FieldBlockedSlotEntity',
    ).map((i) => i.name);
    expect(blockedSlotIndices).toContain('IDX_field_blocked_slots_court_id');
    expect(blockedSlotIndices).toContain('IDX_field_blocked_slots_court_date');
    expect(blockedSlotIndices).toContain(
      'IDX_field_blocked_slots_court_date_time',
    );
  });

  it('registers required check and unique constraints on field operational entities', () => {
    const storage = getMetadataArgsStorage();

    const courtChecks = storage.checks
      .filter(
        ({ target }) =>
          typeof target === 'function' && target.name === 'FieldCourtEntity',
      )
      .map((c) => c.name);
    expect(courtChecks).toContain('CHK_field_courts_type');
    expect(courtChecks).toContain('CHK_field_courts_status');

    const courtUniques = storage.uniques
      .filter(
        ({ target }) =>
          typeof target === 'function' && target.name === 'FieldCourtEntity',
      )
      .map((u) => u.name);
    expect(courtUniques).toContain('UQ_field_courts_field_id_name');

    const serviceUniques = storage.uniques
      .filter(
        ({ target }) =>
          typeof target === 'function' && target.name === 'FieldServiceEntity',
      )
      .map((u) => u.name);
    expect(serviceUniques).toContain('UQ_field_services_field_id_name');
  });
});

const TransactionEntityName = 'TransactionEntity';
const ApprovalRequestEntityName = 'ApprovalRequestEntity';
const NotificationEntityName = 'NotificationEntity';
