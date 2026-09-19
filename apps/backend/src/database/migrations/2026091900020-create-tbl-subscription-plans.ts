import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { auditColumns, uuidPrimaryColumn } from './migration-table.helpers';

export class CreateTblSubscriptionPlans2026091900020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'subscription_plans',
        columns: [
          uuidPrimaryColumn(),
          { name: 'name', type: 'varchar' },
          { name: 'price', type: 'decimal', precision: 15, scale: 2 },
          { name: 'duration_days', type: 'int' },
          { name: 'benefit', type: 'json', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          ...auditColumns(),
        ],
        checks: [
          { expression: '"price" >= 0' },
          { expression: '"duration_days" > 0' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('subscription_plans');
  }
}
