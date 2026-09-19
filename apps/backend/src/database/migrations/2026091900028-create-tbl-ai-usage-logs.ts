import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  createdAtColumn,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblAiUsageLogs2026091900028 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'ai_usage_logs',
        columns: [
          uuidPrimaryColumn(),
          { name: 'user_id', type: 'uuid' },
          { name: 'feature', type: 'varchar' },
          { name: 'tokens_used', type: 'int', default: 0 },
          createdAtColumn(),
        ],
        indices: [
          { columnNames: ['user_id'] },
          { columnNames: ['feature'] },
          { columnNames: ['user_id', 'created_at'] },
          { columnNames: ['user_id', 'feature', 'created_at'] },
        ],
        checks: [{ expression: '"tokens_used" >= 0' }],
        foreignKeys: [foreignKey('user_id', 'users', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('ai_usage_logs');
  }
}
