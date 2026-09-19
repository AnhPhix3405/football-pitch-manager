import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { auditColumns, uuidPrimaryColumn } from './migration-table.helpers';

export class CreateTblUsers2026091900001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          uuidPrimaryColumn(),
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'phone', type: 'varchar', isNullable: true, isUnique: true },
          { name: 'password_hash', type: 'varchar', isNullable: true },
          { name: 'auth_provider', type: 'varchar', default: "'local'" },
          { name: 'provider_id', type: 'varchar', isNullable: true },
          { name: 'role', type: 'varchar', default: "'user'" },
          { name: 'status', type: 'varchar', default: "'active'" },
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
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['auth_provider', 'provider_id'], isUnique: true },
          { columnNames: ['role'] },
          { columnNames: ['status'] },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
