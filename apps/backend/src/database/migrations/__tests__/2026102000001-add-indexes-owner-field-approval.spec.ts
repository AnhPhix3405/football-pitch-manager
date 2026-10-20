/* eslint-disable @typescript-eslint/unbound-method */
import { QueryRunner } from 'typeorm';
import { AddIndexesOwnerFieldApproval2026102000001 } from '../2026102000001-add-indexes-owner-field-approval';

describe('AddIndexesOwnerFieldApproval2026102000001 Migration', () => {
  let migration: AddIndexesOwnerFieldApproval2026102000001;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new AddIndexesOwnerFieldApproval2026102000001();
    queryRunner = {
      createIndex: jest.fn().mockResolvedValue(undefined),
      dropIndex: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  describe('up', () => {
    it('creates all expected indexes on owner_profiles, fields, and approval_requests', async () => {
      await migration.up(queryRunner);

      // Verify owner_profiles indexes
      expect(queryRunner.createIndex).toHaveBeenCalledWith(
        'owner_profiles',
        expect.objectContaining({
          name: 'IDX_owner_profiles_business_name',
          columnNames: ['business_name'],
        }),
      );
      expect(queryRunner.createIndex).toHaveBeenCalledWith(
        'owner_profiles',
        expect.objectContaining({
          name: 'IDX_owner_profiles_verified_at',
          columnNames: ['verified_at'],
        }),
      );

      // Verify fields indexes
      expect(queryRunner.createIndex).toHaveBeenCalledWith(
        'fields',
        expect.objectContaining({
          name: 'IDX_fields_owner_id_created_at',
          columnNames: ['owner_id', 'created_at'],
        }),
      );
      expect(queryRunner.createIndex).toHaveBeenCalledWith(
        'fields',
        expect.objectContaining({
          name: 'IDX_fields_owner_id_status',
          columnNames: ['owner_id', 'status'],
        }),
      );
      expect(queryRunner.createIndex).toHaveBeenCalledWith(
        'fields',
        expect.objectContaining({
          name: 'IDX_fields_status_district',
          columnNames: ['status', 'district'],
        }),
      );
      expect(queryRunner.createIndex).toHaveBeenCalledWith(
        'fields',
        expect.objectContaining({
          name: 'IDX_fields_status_created_at',
          columnNames: ['status', 'created_at'],
        }),
      );
      expect(queryRunner.createIndex).toHaveBeenCalledWith(
        'fields',
        expect.objectContaining({
          name: 'IDX_fields_status_require_deposit',
          columnNames: ['status', 'require_deposit'],
        }),
      );

      // Verify approval_requests indexes
      expect(queryRunner.createIndex).toHaveBeenCalledWith(
        'approval_requests',
        expect.objectContaining({
          name: 'IDX_approval_requests_type_status_created_at',
          columnNames: ['type', 'status', 'created_at'],
        }),
      );
      expect(queryRunner.createIndex).toHaveBeenCalledWith(
        'approval_requests',
        expect.objectContaining({
          name: 'IDX_approval_requests_target_id_status',
          columnNames: ['target_id', 'status'],
        }),
      );

      // Total 9 indexes created
      expect(queryRunner.createIndex).toHaveBeenCalledTimes(9);
    });
  });

  describe('down', () => {
    it('drops all created indexes symmetrically with ifExists=true', async () => {
      await migration.down(queryRunner);

      // Verify owner_profiles indexes dropped
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'owner_profiles',
        'IDX_owner_profiles_business_name',
        true,
      );
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'owner_profiles',
        'IDX_owner_profiles_verified_at',
        true,
      );

      // Verify fields indexes dropped
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'fields',
        'IDX_fields_owner_id_created_at',
        true,
      );
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'fields',
        'IDX_fields_owner_id_status',
        true,
      );
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'fields',
        'IDX_fields_status_district',
        true,
      );
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'fields',
        'IDX_fields_status_created_at',
        true,
      );
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'fields',
        'IDX_fields_status_require_deposit',
        true,
      );

      // Verify approval_requests indexes dropped
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'approval_requests',
        'IDX_approval_requests_type_status_created_at',
        true,
      );
      expect(queryRunner.dropIndex).toHaveBeenCalledWith(
        'approval_requests',
        'IDX_approval_requests_target_id_status',
        true,
      );

      // Total 9 indexes dropped
      expect(queryRunner.dropIndex).toHaveBeenCalledTimes(9);
    });
  });
});
