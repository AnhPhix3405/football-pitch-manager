import { MigrationInterface, QueryRunner, TableIndex } from 'typeorm';

export class AddIndexesOwnerFieldApproval2026102000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. owner_profiles indexes
    await queryRunner.createIndex(
      'owner_profiles',
      new TableIndex({
        name: 'IDX_owner_profiles_business_name',
        columnNames: ['business_name'],
      }),
    );
    await queryRunner.createIndex(
      'owner_profiles',
      new TableIndex({
        name: 'IDX_owner_profiles_verified_at',
        columnNames: ['verified_at'],
      }),
    );

    // 2. fields indexes
    await queryRunner.createIndex(
      'fields',
      new TableIndex({
        name: 'IDX_fields_owner_id_created_at',
        columnNames: ['owner_id', 'created_at'],
      }),
    );
    await queryRunner.createIndex(
      'fields',
      new TableIndex({
        name: 'IDX_fields_owner_id_status',
        columnNames: ['owner_id', 'status'],
      }),
    );
    await queryRunner.createIndex(
      'fields',
      new TableIndex({
        name: 'IDX_fields_status_district',
        columnNames: ['status', 'district'],
      }),
    );
    await queryRunner.createIndex(
      'fields',
      new TableIndex({
        name: 'IDX_fields_status_created_at',
        columnNames: ['status', 'created_at'],
      }),
    );
    await queryRunner.createIndex(
      'fields',
      new TableIndex({
        name: 'IDX_fields_status_require_deposit',
        columnNames: ['status', 'require_deposit'],
      }),
    );

    // 3. approval_requests indexes
    await queryRunner.createIndex(
      'approval_requests',
      new TableIndex({
        name: 'IDX_approval_requests_type_status_created_at',
        columnNames: ['type', 'status', 'created_at'],
      }),
    );
    await queryRunner.createIndex(
      'approval_requests',
      new TableIndex({
        name: 'IDX_approval_requests_target_id_status',
        columnNames: ['target_id', 'status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop approval_requests indexes
    await queryRunner.dropIndex(
      'approval_requests',
      'IDX_approval_requests_target_id_status',
      true,
    );
    await queryRunner.dropIndex(
      'approval_requests',
      'IDX_approval_requests_type_status_created_at',
      true,
    );

    // Drop fields indexes
    await queryRunner.dropIndex(
      'fields',
      'IDX_fields_status_require_deposit',
      true,
    );
    await queryRunner.dropIndex('fields', 'IDX_fields_status_created_at', true);
    await queryRunner.dropIndex('fields', 'IDX_fields_status_district', true);
    await queryRunner.dropIndex('fields', 'IDX_fields_owner_id_status', true);
    await queryRunner.dropIndex(
      'fields',
      'IDX_fields_owner_id_created_at',
      true,
    );

    // Drop owner_profiles indexes
    await queryRunner.dropIndex(
      'owner_profiles',
      'IDX_owner_profiles_verified_at',
      true,
    );
    await queryRunner.dropIndex(
      'owner_profiles',
      'IDX_owner_profiles_business_name',
      true,
    );
  }
}
