import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblAuthSessions2026091900029 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'auth_sessions',
        columns: [
          uuidPrimaryColumn(),
          { name: 'user_id', type: 'uuid' },
          { name: 'refresh_token_hash', type: 'varchar', length: '64' },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'ip_address', type: 'varchar', length: '45', isNullable: true },
          { name: 'is_revoked', type: 'boolean', default: false },
          { name: 'expires_at', type: 'timestamptz' },
          ...auditColumns(),
        ],
        indices: [
          { name: 'idx_auth_sessions_user_id', columnNames: ['user_id'] },
          { name: 'idx_auth_sessions_expires_at', columnNames: ['expires_at'] },
          { name: 'idx_auth_sessions_is_revoked', columnNames: ['is_revoked'] },
        ],
        foreignKeys: [foreignKey('user_id', 'users', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('auth_sessions');
  }
}
