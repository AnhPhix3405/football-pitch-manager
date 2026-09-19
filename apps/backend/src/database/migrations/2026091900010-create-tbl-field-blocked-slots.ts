import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblFieldBlockedSlots2026091900010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'field_blocked_slots',
        columns: [
          uuidPrimaryColumn(),
          { name: 'field_court_id', type: 'uuid' },
          { name: 'blocked_date', type: 'date' },
          { name: 'start_time', type: 'time' },
          { name: 'end_time', type: 'time' },
          { name: 'reason', type: 'varchar', isNullable: true },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['field_court_id'] },
          { columnNames: ['field_court_id', 'blocked_date'] },
          {
            columnNames: [
              'field_court_id',
              'blocked_date',
              'start_time',
              'end_time',
            ],
          },
        ],
        checks: [{ expression: '"start_time" < "end_time"' }],
        foreignKeys: [foreignKey('field_court_id', 'field_courts', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('field_blocked_slots');
  }
}
