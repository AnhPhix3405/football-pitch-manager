import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblFieldCourts2026091900005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'field_courts',
        columns: [
          uuidPrimaryColumn(),
          { name: 'field_id', type: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'type', type: 'varchar' },
          { name: 'status', type: 'varchar', default: "'active'" },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['field_id'] },
          { columnNames: ['field_id', 'status'] },
        ],
        foreignKeys: [foreignKey('field_id', 'fields', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('field_courts');
  }
}
