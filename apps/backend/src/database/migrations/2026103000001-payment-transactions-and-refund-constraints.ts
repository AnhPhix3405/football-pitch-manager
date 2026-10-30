import {
  MigrationInterface,
  QueryRunner,
  TableCheck,
  TableIndex,
} from 'typeorm';

export class PaymentTransactionsAndRefundConstraints2026103000001
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Check constraints on transactions
    await queryRunner.createCheckConstraint(
      'transactions',
      new TableCheck({
        name: 'CHK_transactions_status',
        expression: `"status" IN ('pending', 'success', 'failed', 'refunded', 'cancelled')`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'transactions',
      new TableCheck({
        name: 'CHK_transactions_type',
        expression: `"type" IN ('booking_deposit', 'subscription', 'refund')`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'transactions',
      new TableCheck({
        name: 'CHK_transactions_gateway',
        expression: `"gateway" IS NULL OR "gateway" IN ('cash', 'vnpay')`,
      }),
    );

    // 2. Composite indexes on transactions
    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_transactions_gateway_ref',
        columnNames: ['gateway', 'gateway_ref'],
      }),
    );

    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_transactions_user_status',
        columnNames: ['user_id', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_transactions_type_ref_status',
        columnNames: ['type', 'ref_id', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'transactions',
      'IDX_transactions_type_ref_status',
    );
    await queryRunner.dropIndex(
      'transactions',
      'IDX_transactions_user_status',
    );
    await queryRunner.dropIndex(
      'transactions',
      'IDX_transactions_gateway_ref',
    );

    await queryRunner.dropCheckConstraint(
      'transactions',
      'CHK_transactions_gateway',
    );
    await queryRunner.dropCheckConstraint(
      'transactions',
      'CHK_transactions_type',
    );
    await queryRunner.dropCheckConstraint(
      'transactions',
      'CHK_transactions_status',
    );
  }
}
