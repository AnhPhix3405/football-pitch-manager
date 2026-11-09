import { MigrationInterface, QueryRunner } from 'typeorm';

export class OwnerPaymentSettings2026110900001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE owner_payment_merchants (
        id uuid PRIMARY KEY, owner_id uuid NOT NULL REFERENCES users(id),
        terminal_code varchar(32) NOT NULL, encrypted_secret text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE INDEX "IDX_owner_payment_merchants_owner" ON owner_payment_merchants(owner_id, created_at);
      ALTER TABLE fields ADD COLUMN payment_options varchar[];
      ALTER TABLE bookings ADD COLUMN payment_options varchar[], ADD COLUMN paid_amount decimal(15,2),
        ADD COLUMN payment_hold_until timestamptz;
      ALTER TABLE transactions ADD COLUMN merchant_id uuid REFERENCES owner_payment_merchants(id),
        ADD COLUMN expires_at timestamptz;
      ALTER TABLE bookings DROP CONSTRAINT "CHK_bookings_payment_status";
      ALTER TABLE bookings ADD CONSTRAINT "CHK_bookings_payment_status" CHECK (
        payment_status IN ('unpaid','pending','paid','partially_paid','refunded','partially_refunded','penalty_deducted','failed')
      );
      ALTER TABLE transactions DROP CONSTRAINT "CHK_transactions_type";
      ALTER TABLE transactions ADD CONSTRAINT "CHK_transactions_type" CHECK (
        type IN ('booking_deposit','booking_full','booking_balance','subscription','refund')
      );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE transactions DROP CONSTRAINT "CHK_transactions_type";
      ALTER TABLE transactions ADD CONSTRAINT "CHK_transactions_type" CHECK (type IN ('booking_deposit','subscription','refund'));
      ALTER TABLE bookings DROP CONSTRAINT "CHK_bookings_payment_status";
      ALTER TABLE bookings ADD CONSTRAINT "CHK_bookings_payment_status" CHECK (payment_status IN ('unpaid','pending','paid','refunded','failed'));
      ALTER TABLE transactions DROP COLUMN merchant_id, DROP COLUMN expires_at;
      ALTER TABLE bookings DROP COLUMN payment_options, DROP COLUMN paid_amount, DROP COLUMN payment_hold_until;
      ALTER TABLE fields DROP COLUMN payment_options;
      DROP TABLE owner_payment_merchants;
    `);
  }
}
