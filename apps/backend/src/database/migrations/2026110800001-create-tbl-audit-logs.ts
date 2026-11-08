import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  createdAtColumn,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblAuditLogs2026110800001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          uuidPrimaryColumn(),
          { name: 'actor_id', type: 'uuid', isNullable: true },
          {
            name: 'actor_email',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'actor_role',
            type: 'varchar',
            length: '50',
            default: "'admin'",
          },
          { name: 'action', type: 'varchar', length: '100', isNullable: false },
          {
            name: 'category',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'target_type',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'target_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'target_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          { name: 'details', type: 'jsonb', isNullable: true },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          { name: 'user_agent', type: 'text', isNullable: true },
          createdAtColumn(),
        ],
        indices: [
          {
            name: 'idx_audit_logs_action_created_at',
            columnNames: ['action', 'created_at'],
          },
          {
            name: 'idx_audit_logs_category_created_at',
            columnNames: ['category', 'created_at'],
          },
          {
            name: 'idx_audit_logs_actor_id_created_at',
            columnNames: ['actor_id', 'created_at'],
          },
          {
            name: 'idx_audit_logs_target_type_id',
            columnNames: ['target_type', 'target_id'],
          },
        ],
        foreignKeys: [foreignKey('actor_id', 'users', 'SET NULL')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('audit_logs');
  }
}
