import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblNotifications2026091900019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          uuidPrimaryColumn(),
          { name: 'user_id', type: 'uuid' },
          { name: 'type', type: 'varchar' },
          { name: 'title', type: 'varchar' },
          { name: 'content', type: 'text', isNullable: true },
          { name: 'ref_id', type: 'uuid', isNullable: true },
          { name: 'is_read', type: 'boolean', default: false },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['user_id'] },
          { columnNames: ['user_id', 'is_read'] },
          { columnNames: ['user_id', 'created_at'] },
          { columnNames: ['user_id', 'is_read', 'created_at'] },
        ],
        foreignKeys: [foreignKey('user_id', 'users', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}
