import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblTransactions2026091900022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
        columns: [
          uuidPrimaryColumn(),
          { name: 'user_id', type: 'uuid' },
          { name: 'type', type: 'varchar' },
          { name: 'ref_id', type: 'uuid' },
          { name: 'amount', type: 'decimal', precision: 15, scale: 2 },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'gateway', type: 'varchar', isNullable: true },
          { name: 'gateway_ref', type: 'varchar', isNullable: true },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['user_id'] },
          { columnNames: ['ref_id'] },
          { columnNames: ['status'] },
          { columnNames: ['gateway_ref'] },
          { columnNames: ['user_id', 'created_at'] },
          { columnNames: ['type', 'ref_id'] },
        ],
        checks: [{ expression: '"amount" >= 0' }],
        foreignKeys: [foreignKey('user_id', 'users', 'RESTRICT')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('transactions');
  }
}
