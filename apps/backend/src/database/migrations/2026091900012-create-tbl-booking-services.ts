import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblBookingServices2026091900012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'booking_services',
        columns: [
          uuidPrimaryColumn(),
          { name: 'booking_id', type: 'uuid' },
          { name: 'service_id', type: 'uuid' },
          { name: 'quantity', type: 'int', default: 1 },
          { name: 'price_snapshot', type: 'decimal', precision: 15, scale: 2 },
          ...auditColumns(),
        ],
        indices: [
          { columnNames: ['booking_id', 'service_id'], isUnique: true },
          { columnNames: ['booking_id'] },
        ],
        checks: [
          { expression: '"quantity" > 0' },
          { expression: '"price_snapshot" >= 0' },
        ],
        foreignKeys: [
          foreignKey('booking_id', 'bookings', 'CASCADE'),
          foreignKey('service_id', 'field_services', 'RESTRICT'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('booking_services');
  }
}
