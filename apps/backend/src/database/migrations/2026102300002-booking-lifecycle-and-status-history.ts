import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableCheck,
  TableColumn,
  TableIndex,
} from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class BookingLifecycleAndStatusHistory2026102300002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add version column on bookings for optimistic locking
    await queryRunner.addColumn(
      'bookings',
      new TableColumn({
        name: 'version',
        type: 'integer',
        isNullable: false,
        default: 1,
      }),
    );

    // 2. Create table booking_status_histories
    await queryRunner.createTable(
      new Table({
        name: 'booking_status_histories',
        columns: [
          uuidPrimaryColumn(),
          { name: 'booking_id', type: 'uuid', isNullable: false },
          { name: 'from_status', type: 'varchar', isNullable: true },
          { name: 'to_status', type: 'varchar', isNullable: false },
          { name: 'changed_by', type: 'uuid', isNullable: true },
          { name: 'reason', type: 'text', isNullable: true },
          ...auditColumns(),
        ],
        indices: [
          {
            name: 'IDX_booking_status_histories_booking',
            columnNames: ['booking_id', 'created_at'],
          },
        ],
        foreignKeys: [
          foreignKey('booking_id', 'bookings', 'CASCADE'),
          foreignKey('changed_by', 'users', 'SET NULL'),
        ],
      }),
    );

    // 3. Check constraints on bookings
    await queryRunner.createCheckConstraint(
      'bookings',
      new TableCheck({
        name: 'CHK_bookings_status',
        expression: `"status" IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'bookings',
      new TableCheck({
        name: 'CHK_bookings_court_type',
        expression: `"requested_court_type" IN ('5', '7', '11')`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'bookings',
      new TableCheck({
        name: 'CHK_bookings_payment_status',
        expression: `"payment_status" IN ('unpaid', 'pending', 'paid', 'refunded', 'failed')`,
      }),
    );

    // 4. Composite indexes on bookings
    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_bookings_field_date_status',
        columnNames: ['field_id', 'booking_date', 'status'],
      }),
    );

    await queryRunner.createIndex(
      'bookings',
      new TableIndex({
        name: 'IDX_bookings_user_status',
        columnNames: ['user_id', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('bookings', 'IDX_bookings_user_status');
    await queryRunner.dropIndex('bookings', 'IDX_bookings_field_date_status');

    await queryRunner.dropCheckConstraint(
      'bookings',
      'CHK_bookings_payment_status',
    );
    await queryRunner.dropCheckConstraint(
      'bookings',
      'CHK_bookings_court_type',
    );
    await queryRunner.dropCheckConstraint('bookings', 'CHK_bookings_status');

    await queryRunner.dropTable('booking_status_histories');
    await queryRunner.dropColumn('bookings', 'version');
  }
}
