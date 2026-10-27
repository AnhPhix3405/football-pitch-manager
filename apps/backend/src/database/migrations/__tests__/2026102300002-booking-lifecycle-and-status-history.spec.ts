/* eslint-disable @typescript-eslint/unbound-method */
import { QueryRunner } from 'typeorm';
import { BookingLifecycleAndStatusHistory2026102300002 } from '../2026102300002-booking-lifecycle-and-status-history';

describe('BookingLifecycleAndStatusHistory2026102300002 Migration', () => {
  let migration: BookingLifecycleAndStatusHistory2026102300002;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new BookingLifecycleAndStatusHistory2026102300002();
    queryRunner = {
      addColumn: jest.fn().mockResolvedValue(undefined),
      dropColumn: jest.fn().mockResolvedValue(undefined),
      createTable: jest.fn().mockResolvedValue(undefined),
      dropTable: jest.fn().mockResolvedValue(undefined),
      createIndex: jest.fn().mockResolvedValue(undefined),
      dropIndex: jest.fn().mockResolvedValue(undefined),
      createCheckConstraint: jest.fn().mockResolvedValue(undefined),
      dropCheckConstraint: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  it('runs up() and executes all additions', async () => {
    await migration.up(queryRunner);

    expect(queryRunner.addColumn).toHaveBeenCalledWith(
      'bookings',
      expect.objectContaining({ name: 'version', type: 'integer' }),
    );

    expect(queryRunner.createTable).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'booking_status_histories' }),
    );

    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'bookings',
      expect.objectContaining({ name: 'CHK_bookings_status' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'bookings',
      expect.objectContaining({ name: 'CHK_bookings_court_type' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'bookings',
      expect.objectContaining({ name: 'CHK_bookings_payment_status' }),
    );

    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'bookings',
      expect.objectContaining({ name: 'IDX_bookings_field_date_status' }),
    );
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'bookings',
      expect.objectContaining({ name: 'IDX_bookings_user_status' }),
    );
  });

  it('runs down() and reverts all additions', async () => {
    await migration.down(queryRunner);

    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'bookings',
      'IDX_bookings_user_status',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'bookings',
      'IDX_bookings_field_date_status',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'bookings',
      'CHK_bookings_payment_status',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'bookings',
      'CHK_bookings_court_type',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'bookings',
      'CHK_bookings_status',
    );
    expect(queryRunner.dropTable).toHaveBeenCalledWith(
      'booking_status_histories',
    );
    expect(queryRunner.dropColumn).toHaveBeenCalledWith('bookings', 'version');
  });
});
