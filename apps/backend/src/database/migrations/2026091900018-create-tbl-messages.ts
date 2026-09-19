import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblMessages2026091900018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'messages',
        columns: [
          uuidPrimaryColumn(),
          { name: 'conversation_id', type: 'uuid' },
          { name: 'sender_id', type: 'uuid' },
          { name: 'content', type: 'text', isNullable: true },
          { name: 'message_type', type: 'varchar', default: "'text'" },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['conversation_id'] },
          { columnNames: ['sender_id'] },
          { columnNames: ['conversation_id', 'created_at'] },
        ],
        foreignKeys: [
          foreignKey('conversation_id', 'conversations', 'CASCADE'),
          foreignKey('sender_id', 'users', 'RESTRICT'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('messages');
  }
}
