import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblPostComments2026091900014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post_comments',
        columns: [
          uuidPrimaryColumn(),
          { name: 'post_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'content', type: 'text' },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['post_id'] },
          { columnNames: ['user_id'] },
          { columnNames: ['post_id', 'created_at'] },
        ],
        foreignKeys: [
          foreignKey('post_id', 'posts', 'CASCADE'),
          foreignKey('user_id', 'users', 'RESTRICT'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('post_comments');
  }
}
