import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblSubscriptions2026091900021 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscriptions',
        columns: [
          uuidPrimaryColumn(),
          { name: 'owner_id', type: 'uuid' },
          { name: 'plan_id', type: 'uuid' },
          { name: 'status', type: 'varchar', default: "'pending_payment'" },
          { name: 'start_date', type: 'date', isNullable: true },
          { name: 'end_date', type: 'date', isNullable: true },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['owner_id'] },
          { columnNames: ['plan_id'] },
          { columnNames: ['status'] },
          { columnNames: ['owner_id', 'status'] },
          { columnNames: ['status', 'end_date'] },
        ],
        foreignKeys: [
          foreignKey('owner_id', 'users', 'RESTRICT'),
          foreignKey('plan_id', 'subscription_plans', 'RESTRICT'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscriptions');
  }
}
