import {
  MigrationInterface,
  QueryRunner,
  TableCheck,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class ReviewSubscriptionAiSchemaFoundations2026103100001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add flag_reason to field_reviews and user_reviews
    await queryRunner.addColumn(
      'field_reviews',
      new TableColumn({
        name: 'flag_reason',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'user_reviews',
      new TableColumn({
        name: 'flag_reason',
        type: 'varchar',
        length: '255',
        isNullable: true,
      }),
    );

    // 2. Add version to field_rating_summary and user_rating_summary
    await queryRunner.addColumn(
      'field_rating_summary',
      new TableColumn({
        name: 'version',
        type: 'int',
        default: 1,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'user_rating_summary',
      new TableColumn({
        name: 'version',
        type: 'int',
        default: 1,
        isNullable: false,
      }),
    );

    // 3. Add check constraints for subscriptions
    await queryRunner.createCheckConstraint(
      'subscriptions',
      new TableCheck({
        name: 'CHK_subscriptions_status',
        expression: `"status" IN ('pending_payment', 'active', 'expired', 'cancelled')`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'subscriptions',
      new TableCheck({
        name: 'CHK_subscriptions_date_order',
        expression: `"end_date" IS NULL OR "start_date" <= "end_date"`,
      }),
    );

    // 4. Add composite indexes for rating queries
    await queryRunner.createIndex(
      'field_reviews',
      new TableIndex({
        name: 'IDX_field_reviews_field_rating_created',
        columnNames: ['field_id', 'rating', 'created_at'],
      }),
    );

    await queryRunner.createIndex(
      'user_reviews',
      new TableIndex({
        name: 'IDX_user_reviews_target_rating_created',
        columnNames: ['target_user_id', 'rating', 'created_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'user_reviews',
      'IDX_user_reviews_target_rating_created',
    );
    await queryRunner.dropIndex(
      'field_reviews',
      'IDX_field_reviews_field_rating_created',
    );

    await queryRunner.dropCheckConstraint(
      'subscriptions',
      'CHK_subscriptions_date_order',
    );
    await queryRunner.dropCheckConstraint(
      'subscriptions',
      'CHK_subscriptions_status',
    );

    await queryRunner.dropColumn('user_rating_summary', 'version');
    await queryRunner.dropColumn('field_rating_summary', 'version');
    await queryRunner.dropColumn('user_reviews', 'flag_reason');
    await queryRunner.dropColumn('field_reviews', 'flag_reason');
  }
}
