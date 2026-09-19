import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblPostMatches2026091900016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'post_matches',
        columns: [
          uuidPrimaryColumn(),
          { name: 'post_id', type: 'uuid' },
          { name: 'applicant_id', type: 'uuid' },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'conversation_id', type: 'uuid', isNullable: true },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['post_id', 'applicant_id'], isUnique: true },
          { columnNames: ['post_id'] },
          { columnNames: ['applicant_id'] },
          { columnNames: ['post_id', 'status'] },
        ],
        foreignKeys: [
          foreignKey('post_id', 'posts', 'CASCADE'),
          foreignKey('applicant_id', 'users', 'RESTRICT'),
          foreignKey('conversation_id', 'conversations', 'SET NULL'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('post_matches');
  }
}
