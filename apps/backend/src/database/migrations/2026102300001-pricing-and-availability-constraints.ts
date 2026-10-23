import {
  MigrationInterface,
  QueryRunner,
  TableCheck,
  TableIndex,
} from 'typeorm';

export class PricingAndAvailabilityConstraints2026102300001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Checks on field_pricing
    await queryRunner.createCheckConstraint(
      'field_pricing',
      new TableCheck({
        name: 'CHK_field_pricing_court_type',
        expression: `"court_type" IN ('5', '7', '11')`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'field_pricing',
      new TableCheck({
        name: 'CHK_field_pricing_day_type',
        expression: `"day_type" IN ('weekday', 'weekend', 'holiday')`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'field_pricing',
      new TableCheck({
        name: 'CHK_field_pricing_price_positive',
        expression: `"price" >= 0`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'field_pricing',
      new TableCheck({
        name: 'CHK_field_pricing_time_order',
        expression: `"start_time" < "end_time"`,
      }),
    );

    // 2. Composite indexes on field_pricing
    await queryRunner.createIndex(
      'field_pricing',
      new TableIndex({
        name: 'IDX_field_pricing_lookup',
        columnNames: ['field_id', 'court_type', 'day_type'],
      }),
    );

    await queryRunner.createIndex(
      'field_pricing',
      new TableIndex({
        name: 'IDX_field_pricing_time_range',
        columnNames: [
          'field_id',
          'court_type',
          'day_type',
          'start_time',
          'end_time',
        ],
      }),
    );

    // 3. Composite indexes on bookings for availability lookup
    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_bookings_court_date_times',
        columnNames: [
          'field_court_id',
          'booking_date',
          'start_time',
          'end_time',
        ],
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_bookings_court_date_status',
        columnNames: ['field_court_id', 'booking_date', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('bookings', 'IDX_bookings_court_date_status');
    await queryRunner.dropIndex('bookings', 'IDX_bookings_court_date_times');
    await queryRunner.dropIndex(
      'field_pricing',
      'IDX_field_pricing_time_range',
    );
    await queryRunner.dropIndex('field_pricing', 'IDX_field_pricing_lookup');

    await queryRunner.dropCheckConstraint(
      'field_pricing',
      'CHK_field_pricing_time_order',
    );
    await queryRunner.dropCheckConstraint(
      'field_pricing',
      'CHK_field_pricing_price_positive',
    );
    await queryRunner.dropCheckConstraint(
      'field_pricing',
      'CHK_field_pricing_day_type',
    );
    await queryRunner.dropCheckConstraint(
      'field_pricing',
      'CHK_field_pricing_court_type',
    );
  }
}
