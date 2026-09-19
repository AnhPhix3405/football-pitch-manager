import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblUserReviews2026091900025 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_reviews',
        columns: [
          uuidPrimaryColumn(),
          { name: 'target_user_id', type: 'uuid' },
          { name: 'reviewer_id', type: 'uuid' },
          { name: 'post_id', type: 'uuid' },
          { name: 'rating', type: 'int' },
          { name: 'comment', type: 'text', isNullable: true },
          { name: 'is_flagged', type: 'boolean', default: false },
          ...auditColumns(),
        ],
        indices: [
          {
            columnNames: ['post_id', 'target_user_id', 'reviewer_id'],
            isUnique: true,
          },
          { columnNames: ['target_user_id'] },
          { columnNames: ['reviewer_id'] },
          { columnNames: ['target_user_id', 'created_at'] },
        ],
        checks: [{ expression: '"rating" BETWEEN 1 AND 5' }],
        foreignKeys: [
          foreignKey('target_user_id', 'users', 'RESTRICT'),
          foreignKey('reviewer_id', 'users', 'RESTRICT'),
          foreignKey('post_id', 'posts', 'RESTRICT'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_reviews');
  }
}
