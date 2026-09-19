import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import {
  auditColumns,
  foreignKey,
  uuidPrimaryColumn,
} from './migration-table.helpers';

export class CreateTblApprovalRequests2026091900023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'approval_requests',
        columns: [
          uuidPrimaryColumn(),
          { name: 'type', type: 'varchar' },
          { name: 'target_id', type: 'uuid' },
          { name: 'requested_by', type: 'uuid' },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'reviewed_by', type: 'uuid', isNullable: true },
          { name: 'note', type: 'text', isNullable: true },
          ...auditColumns(),
          { name: 'reviewed_at', type: 'timestamptz', isNullable: true },
        ],
        indices: [
          { columnNames: ['requested_by'] },
          { columnNames: ['reviewed_by'] },
          { columnNames: ['status'] },
          { columnNames: ['type', 'target_id'] },
          { columnNames: ['status', 'created_at'] },
        ],
        foreignKeys: [
          foreignKey('requested_by', 'users', 'RESTRICT'),
          foreignKey('reviewed_by', 'users', 'SET NULL'),
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('approval_requests');
  }
}
