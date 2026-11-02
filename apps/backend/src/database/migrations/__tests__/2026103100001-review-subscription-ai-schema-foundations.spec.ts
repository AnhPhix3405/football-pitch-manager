import { QueryRunner } from 'typeorm';
import { ReviewSubscriptionAiSchemaFoundations2026103100001 } from '../2026103100001-review-subscription-ai-schema-foundations';

describe('ReviewSubscriptionAiSchemaFoundations2026103100001', () => {
  let migration: ReviewSubscriptionAiSchemaFoundations2026103100001;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new ReviewSubscriptionAiSchemaFoundations2026103100001();
    queryRunner = {
      addColumn: jest.fn(),
      dropColumn: jest.fn(),
      createCheckConstraint: jest.fn(),
      dropCheckConstraint: jest.fn(),
      createIndex: jest.fn(),
      dropIndex: jest.fn(),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  it('should apply columns, check constraints, and composite indexes in up()', async () => {
    await migration.up(queryRunner);

    // 4 columns added: flag_reason in field_reviews & user_reviews; version in field_rating_summary & user_rating_summary
    expect(queryRunner.addColumn).toHaveBeenCalledWith(
      'field_reviews',
      expect.objectContaining({ name: 'flag_reason' }),
    );
    expect(queryRunner.addColumn).toHaveBeenCalledWith(
      'user_reviews',
      expect.objectContaining({ name: 'flag_reason' }),
    );
    expect(queryRunner.addColumn).toHaveBeenCalledWith(
      'field_rating_summary',
      expect.objectContaining({ name: 'version', type: 'int' }),
    );
    expect(queryRunner.addColumn).toHaveBeenCalledWith(
      'user_rating_summary',
      expect.objectContaining({ name: 'version', type: 'int' }),
    );

    // Check constraints
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'subscriptions',
      expect.objectContaining({ name: 'CHK_subscriptions_status' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'subscriptions',
      expect.objectContaining({ name: 'CHK_subscriptions_date_order' }),
    );

    // Indexes
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'field_reviews',
      expect.objectContaining({
        name: 'IDX_field_reviews_field_rating_created',
      }),
    );
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'user_reviews',
      expect.objectContaining({
        name: 'IDX_user_reviews_target_rating_created',
      }),
    );
  });

  it('should drop all composite indexes, check constraints, and columns in down()', async () => {
    await migration.down(queryRunner);

    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'user_reviews',
      'IDX_user_reviews_target_rating_created',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'field_reviews',
      'IDX_field_reviews_field_rating_created',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'subscriptions',
      'CHK_subscriptions_date_order',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'subscriptions',
      'CHK_subscriptions_status',
    );
    expect(queryRunner.dropColumn).toHaveBeenCalledWith(
      'user_rating_summary',
      'version',
    );
    expect(queryRunner.dropColumn).toHaveBeenCalledWith(
      'field_rating_summary',
      'version',
    );
    expect(queryRunner.dropColumn).toHaveBeenCalledWith(
      'user_reviews',
      'flag_reason',
    );
    expect(queryRunner.dropColumn).toHaveBeenCalledWith(
      'field_reviews',
      'flag_reason',
    );
  });
});
