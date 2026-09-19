import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblFieldReviews2026091900024 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'field_reviews',
        columns: [
          uuidPrimaryColumn(),
          { name: 'field_id', type: 'uuid' },
          { name: 'reviewer_id', type: 'uuid' },
          { name: 'booking_id', type: 'uuid' },
          { name: 'rating', type: 'int' },
          { name: 'comment', type: 'text', isNullable: true },
          { name: 'is_flagged', type: 'boolean', default: false },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['booking_id', 'reviewer_id'], isUnique: true },
          { columnNames: ['field_id'] },
          { columnNames: ['reviewer_id'] },
          { columnNames: ['field_id', 'created_at'] },
        ],
        checks: [{ expression: '"rating" BETWEEN 1 AND 5' }],
        foreignKeys: [
          foreignKey('field_id', 'fields', 'RESTRICT'),
          foreignKey('reviewer_id', 'users', 'RESTRICT'),
          foreignKey('booking_id', 'bookings', 'RESTRICT'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('field_reviews');
  }
}
