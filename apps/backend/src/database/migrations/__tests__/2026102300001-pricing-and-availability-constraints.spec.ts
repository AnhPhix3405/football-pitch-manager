/* eslint-disable @typescript-eslint/unbound-method */
import { QueryRunner } from 'typeorm';
import { PricingAndAvailabilityConstraints2026102300001 } from '../2026102300001-pricing-and-availability-constraints';

describe('PricingAndAvailabilityConstraints2026102300001 Migration', () => {
  let migration: PricingAndAvailabilityConstraints2026102300001;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new PricingAndAvailabilityConstraints2026102300001();
    queryRunner = {
      createIndex: jest.fn().mockResolvedValue(undefined),
      dropIndex: jest.fn().mockResolvedValue(undefined),
      createCheckConstraint: jest.fn().mockResolvedValue(undefined),
      dropCheckConstraint: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  it('runs up() and executes all check and index additions', async () => {
    await migration.up(queryRunner);

    // 1. Checks on field_pricing
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'field_pricing',
      expect.objectContaining({ name: 'CHK_field_pricing_court_type' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'field_pricing',
      expect.objectContaining({ name: 'CHK_field_pricing_day_type' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'field_pricing',
      expect.objectContaining({ name: 'CHK_field_pricing_price_positive' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'field_pricing',
      expect.objectContaining({ name: 'CHK_field_pricing_time_order' }),
    );

    // 2. Composite indexes on field_pricing & bookings
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'field_pricing',
      expect.objectContaining({ name: 'IDX_field_pricing_lookup' }),
    );
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'field_pricing',
      expect.objectContaining({ name: 'IDX_field_pricing_time_range' }),
    );
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'bookings',
      expect.objectContaining({ name: 'IDX_bookings_court_date_times' }),
    );
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'bookings',
      expect.objectContaining({ name: 'IDX_bookings_court_date_status' }),
    );
  });

  it('runs down() and reverts all check and index additions', async () => {
    await migration.down(queryRunner);

    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'field_pricing',
      'CHK_field_pricing_court_type',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'field_pricing',
      'CHK_field_pricing_day_type',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'field_pricing',
      'CHK_field_pricing_price_positive',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'field_pricing',
      'CHK_field_pricing_time_order',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'field_pricing',
      'IDX_field_pricing_lookup',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'field_pricing',
      'IDX_field_pricing_time_range',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'bookings',
      'IDX_bookings_court_date_times',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'bookings',
      'IDX_bookings_court_date_status',
    );
  });
});
