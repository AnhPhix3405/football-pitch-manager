import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblFieldServices2026091900007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'field_services',
        columns: [
          uuidPrimaryColumn(),
          { name: 'field_id', type: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'price', type: 'decimal', precision: 15, scale: 2 },
          { name: 'unit', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['field_id'] },
          { columnNames: ['field_id', 'is_active'] },
        ],
        checks: [{ expression: '"price" >= 0' }],
        foreignKeys: [foreignKey('field_id', 'fields', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('field_services');
  }
}
