import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblFieldPricing2026091900008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'field_pricing',
        columns: [
          uuidPrimaryColumn(),
          { name: 'field_id', type: 'uuid' },
          { name: 'court_type', type: 'varchar' },
          { name: 'day_type', type: 'varchar' },
          { name: 'start_time', type: 'time' },
          { name: 'end_time', type: 'time' },
          { name: 'price', type: 'decimal', precision: 15, scale: 2 },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['field_id', 'court_type', 'day_type'] },
          {
            columnNames: [
              'field_id',
              'court_type',
              'day_type',
              'start_time',
              'end_time',
            ],
          },
        ],
        checks: [
          { expression: '"start_time" < "end_time"' },
          { expression: '"price" >= 0' },
        ],
        foreignKeys: [foreignKey('field_id', 'fields', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('field_pricing');
  }
}
