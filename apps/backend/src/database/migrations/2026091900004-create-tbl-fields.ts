import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblFields2026091900004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'fields',
        columns: [
          uuidPrimaryColumn(),
          { name: 'owner_id', type: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'address', type: 'varchar' },
          { name: 'district', type: 'varchar', isNullable: true },
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
          { name: 'description', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'require_deposit', type: 'boolean', default: false },
          { name: 'deposit_type', type: 'varchar', isNullable: true },
          {
            name: 'deposit_value',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
          },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['owner_id'] },
          { columnNames: ['status'] },
          { columnNames: ['district'] },
          { columnNames: ['lat', 'lng'] },
        ],
        checks: [
          { expression: '"deposit_value" IS NULL OR "deposit_value" >= 0' },
        ],
        foreignKeys: [foreignKey('owner_id', 'users', 'RESTRICT')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('fields');
  }
}
