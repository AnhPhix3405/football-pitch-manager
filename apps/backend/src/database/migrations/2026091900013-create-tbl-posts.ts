import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblPosts2026091900013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'posts',
        columns: [
          uuidPrimaryColumn(),
          { name: 'user_id', type: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'content', type: 'text', isNullable: true },
          {
            name: 'lat',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          {
            name: 'lng',
            type: 'decimal',
            precision: 10,
            scale: 7,
            isNullable: true,
          },
          { name: 'play_date', type: 'date' },
          { name: 'start_time', type: 'time' },
          { name: 'end_time', type: 'time', isNullable: true },
          { name: 'skill_level_required', type: 'varchar', isNullable: true },
          { name: 'max_players', type: 'int' },
          { name: 'status', type: 'varchar', default: "'open'" },
          ...auditColumns(),
          { name: 'deleted_at', type: 'timestamptz', isNullable: true },
        ],
        indices: [
          { columnNames: ['user_id'] },
          { columnNames: ['status'] },
          { columnNames: ['play_date'] },
          { columnNames: ['deleted_at'] },
          { columnNames: ['status', 'created_at'] },
          { columnNames: ['status', 'play_date'] },
          { columnNames: ['lat', 'lng'] },
        ],
        checks: [
          { expression: '"end_time" IS NULL OR "start_time" < "end_time"' },
          { expression: '"max_players" > 0' },
        ],
        foreignKeys: [foreignKey('user_id', 'users', 'RESTRICT')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('posts');
  }
}
