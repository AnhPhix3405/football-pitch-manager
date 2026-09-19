import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblFieldImages2026091900006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'field_images',
        columns: [
          uuidPrimaryColumn(),
          { name: 'field_id', type: 'uuid' },
          { name: 'url', type: 'varchar' },
          { name: 'is_thumbnail', type: 'boolean', default: false },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['field_id'] },
          {
            columnNames: ['field_id'],
            isUnique: true,
            where: '"is_thumbnail" = true',
          },
        ],
        foreignKeys: [foreignKey('field_id', 'fields', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('field_images');
  }
}
