/* eslint-disable @typescript-eslint/unbound-method */
import { QueryRunner } from 'typeorm';
import { PaymentTransactionsAndRefundConstraints2026103000001 } from '../2026103000001-payment-transactions-and-refund-constraints';

describe('PaymentTransactionsAndRefundConstraints2026103000001 Migration', () => {
  let migration: PaymentTransactionsAndRefundConstraints2026103000001;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new PaymentTransactionsAndRefundConstraints2026103000001();
    queryRunner = {
      createIndex: jest.fn().mockResolvedValue(undefined),
      dropIndex: jest.fn().mockResolvedValue(undefined),
      createCheckConstraint: jest.fn().mockResolvedValue(undefined),
      dropCheckConstraint: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  it('runs up() and applies check constraints and composite indexes on transactions table', async () => {
    await migration.up(queryRunner);

    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'transactions',
      expect.objectContaining({ name: 'CHK_transactions_status' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'transactions',
      expect.objectContaining({ name: 'CHK_transactions_type' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'transactions',
      expect.objectContaining({ name: 'CHK_transactions_gateway' }),
    );

    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'transactions',
      expect.objectContaining({ name: 'IDX_transactions_gateway_ref' }),
    );
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'transactions',
      expect.objectContaining({ name: 'IDX_transactions_user_status' }),
    );
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'transactions',
      expect.objectContaining({ name: 'IDX_transactions_type_ref_status' }),
    );
  });

  it('runs down() and drops all created check constraints and indexes', async () => {
    await migration.down(queryRunner);

    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'transactions',
      'IDX_transactions_type_ref_status',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'transactions',
      'IDX_transactions_user_status',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'transactions',
      'IDX_transactions_gateway_ref',
    );

    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'transactions',
      'CHK_transactions_gateway',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'transactions',
      'CHK_transactions_type',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'transactions',
      'CHK_transactions_status',
    );
  });
});
