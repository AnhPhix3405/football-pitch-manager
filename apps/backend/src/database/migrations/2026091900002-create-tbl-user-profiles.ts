import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblUserProfiles2026091900002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_profiles',
        columns: [
          uuidPrimaryColumn(),
          { name: 'user_id', type: 'uuid', isUnique: true },
          { name: 'full_name', type: 'varchar', isNullable: true },
          { name: 'avatar_url', type: 'varchar', isNullable: true },
          { name: 'bio', type: 'text', isNullable: true },
          { name: 'skill_level', type: 'varchar', isNullable: true },
          { name: 'birthday', type: 'date', isNullable: true },
          { name: 'gender', type: 'varchar', isNullable: true },
          ...auditColumns(),
        ],
        foreignKeys: [foreignKey('user_id', 'users', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_profiles');
  }
}
