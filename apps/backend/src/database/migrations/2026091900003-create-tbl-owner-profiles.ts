import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblOwnerProfiles2026091900003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'owner_profiles',
        columns: [
          uuidPrimaryColumn(),
          { name: 'user_id', type: 'uuid', isUnique: true },
          { name: 'business_name', type: 'varchar', isNullable: true },
          { name: 'business_license', type: 'varchar', isNullable: true },
          { name: 'bank_account', type: 'varchar', isNullable: true },
          { name: 'verified_at', type: 'timestamptz', isNullable: true },
          ...auditColumns(),
        ],
        foreignKeys: [foreignKey('user_id', 'users', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('owner_profiles');
  }
}
