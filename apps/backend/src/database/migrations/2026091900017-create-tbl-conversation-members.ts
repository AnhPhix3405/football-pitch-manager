import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { createdAtColumn, foreignKey } from './migration-table.helpers';

export class CreateTblConversationMembers2026091900017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const joinedAt = createdAtColumn();
    joinedAt.name = 'joined_at';

    await queryRunner.createTable(
      new Table({
        name: 'conversation_members',
        columns: [
          { name: 'conversation_id', type: 'uuid', isPrimary: true },
          { name: 'user_id', type: 'uuid', isPrimary: true },
          joinedAt,
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
          { name: 'last_read_at', type: 'timestamptz', isNullable: true },
        ],
        indices: [
          { columnNames: ['user_id'] },
          { columnNames: ['user_id', 'deleted_at'] },
        ],
        foreignKeys: [
          foreignKey('conversation_id', 'conversations', 'CASCADE'),
          foreignKey('user_id', 'users', 'CASCADE'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('conversation_members');
  }
}
