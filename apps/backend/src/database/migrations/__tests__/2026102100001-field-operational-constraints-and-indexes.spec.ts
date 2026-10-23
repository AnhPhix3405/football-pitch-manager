/* eslint-disable @typescript-eslint/unbound-method */
import { QueryRunner } from 'typeorm';
import { FieldOperationalConstraintsAndIndexes2026102100001 } from '../2026102100001-field-operational-constraints-and-indexes';

describe('FieldOperationalConstraintsAndIndexes2026102100001 Migration', () => {
  let migration: FieldOperationalConstraintsAndIndexes2026102100001;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new FieldOperationalConstraintsAndIndexes2026102100001();
    queryRunner = {
      addColumn: jest.fn().mockResolvedValue(undefined),
      dropColumn: jest.fn().mockResolvedValue(undefined),
      createIndex: jest.fn().mockResolvedValue(undefined),
      dropIndex: jest.fn().mockResolvedValue(undefined),
      createCheckConstraint: jest.fn().mockResolvedValue(undefined),
      dropCheckConstraint: jest.fn().mockResolvedValue(undefined),
      createUniqueConstraint: jest.fn().mockResolvedValue(undefined),
      dropUniqueConstraint: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  it('runs up() and executes all column, index, check, and unique additions', async () => {
    await migration.up(queryRunner);

    // 1. Column addition
    expect(queryRunner.addColumn).toHaveBeenCalledWith(
      'field_images',
      expect.objectContaining({
        name: 'display_order',
        type: 'int',
        default: 0,
      }),
    );

    // 2. Index additions
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'field_images',
      expect.objectContaining({
        name: 'IDX_field_images_field_id_display_order',
      }),
    );
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'field_courts',
      expect.objectContaining({
        name: 'IDX_field_courts_field_id_type_status',
      }),
    );

    // 3. Unique and check constraints
    expect(queryRunner.createUniqueConstraint).toHaveBeenCalledWith(
      'field_courts',
      expect.objectContaining({ name: 'UQ_field_courts_field_id_name' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'field_courts',
      expect.objectContaining({ name: 'CHK_field_courts_type' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'field_courts',
      expect.objectContaining({ name: 'CHK_field_courts_status' }),
    );
    expect(queryRunner.createUniqueConstraint).toHaveBeenCalledWith(
      'field_services',
      expect.objectContaining({ name: 'UQ_field_services_field_id_name' }),
    );
  });

  it('runs down() and reversibly drops all additions in symmetric order', async () => {
    await migration.down(queryRunner);

    expect(queryRunner.dropColumn).toHaveBeenCalledWith(
      'field_images',
      'display_order',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'field_images',
      'IDX_field_images_field_id_display_order',
      true,
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'field_courts',
      'IDX_field_courts_field_id_type_status',
      true,
    );
    expect(queryRunner.dropUniqueConstraint).toHaveBeenCalledWith(
      'field_services',
      'UQ_field_services_field_id_name',
    );
    expect(queryRunner.dropUniqueConstraint).toHaveBeenCalledWith(
      'field_courts',
      'UQ_field_courts_field_id_name',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'field_courts',
      'CHK_field_courts_status',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'field_courts',
      'CHK_field_courts_type',
    );
  });
});
