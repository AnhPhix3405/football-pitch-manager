import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblBookings2026091900011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'bookings',
        columns: [
          uuidPrimaryColumn(),
          { name: 'user_id', type: 'uuid' },
          { name: 'field_id', type: 'uuid' },
          { name: 'requested_court_type', type: 'varchar' },
          { name: 'field_court_id', type: 'uuid', isNullable: true },
          { name: 'booking_date', type: 'date' },
          { name: 'start_time', type: 'time' },
          { name: 'end_time', type: 'time' },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'total_price', type: 'decimal', precision: 15, scale: 2 },
          { name: 'payment_method', type: 'varchar', isNullable: true },
          { name: 'payment_status', type: 'varchar', default: "'unpaid'" },
          {
            name: 'deposit_amount',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: true,
            default: 0,
          },
          { name: 'owner_note', type: 'text', isNullable: true },
          { name: 'cancelled_by', type: 'uuid', isNullable: true },
          { name: 'cancel_reason', type: 'text', isNullable: true },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['user_id'] },
          { columnNames: ['field_id'] },
          { columnNames: ['field_court_id'] },
          { columnNames: ['booking_date'] },
          { columnNames: ['status'] },
          { columnNames: ['user_id', 'created_at'] },
          { columnNames: ['field_id', 'booking_date'] },
          { columnNames: ['field_court_id', 'booking_date'] },
          {
            columnNames: [
              'field_court_id',
              'booking_date',
              'start_time',
              'end_time',
            ],
          },
        ],
        checks: [
          { expression: '"start_time" < "end_time"' },
          { expression: '"total_price" >= 0' },
          { expression: '"deposit_amount" >= 0' },
        ],
        foreignKeys: [
          foreignKey('user_id', 'users', 'RESTRICT'),
          foreignKey('field_id', 'fields', 'RESTRICT'),
          foreignKey('field_court_id', 'field_courts', 'SET NULL'),
          foreignKey('cancelled_by', 'users', 'SET NULL'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('bookings');
  }
}
