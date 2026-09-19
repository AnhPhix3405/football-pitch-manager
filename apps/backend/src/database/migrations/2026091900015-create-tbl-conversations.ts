import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblConversations2026091900015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'conversations',
        columns: [
          uuidPrimaryColumn(),
          { name: 'type', type: 'varchar', default: "'direct'" },
          { name: 'related_post_id', type: 'uuid', isNullable: true },
          { name: 'related_field_id', type: 'uuid', isNullable: true },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['related_post_id'] },
          { columnNames: ['related_field_id'] },
        ],
        foreignKeys: [
          foreignKey('related_post_id', 'posts', 'SET NULL'),
          foreignKey('related_field_id', 'fields', 'SET NULL'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('conversations');
  }
}
