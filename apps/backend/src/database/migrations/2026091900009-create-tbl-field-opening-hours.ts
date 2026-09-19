import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblFieldOpeningHours2026091900009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'field_opening_hours',
        columns: [
          uuidPrimaryColumn(),
          { name: 'field_id', type: 'uuid' },
          { name: 'day_of_week', type: 'int' },
          { name: 'open_time', type: 'time', isNullable: true },
          { name: 'close_time', type: 'time', isNullable: true },
          { name: 'is_closed', type: 'boolean', default: false },
          ...auditColumns(),
        ],
        indices: [{ columnNames: ['field_id', 'day_of_week'], isUnique: true }],
        checks: [
          { expression: '"day_of_week" BETWEEN 1 AND 7' },
          {
            expression:
              '"is_closed" = true OR ("open_time" IS NOT NULL AND "close_time" IS NOT NULL AND "open_time" < "close_time")',
          },
        ],
        foreignKeys: [foreignKey('field_id', 'fields', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('field_opening_hours');
  }
}
