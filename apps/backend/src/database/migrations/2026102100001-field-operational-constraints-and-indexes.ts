import {
  MigrationInterface,
  QueryRunner,
  TableCheck,
  TableColumn,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class FieldOperationalConstraintsAndIndexes2026102100001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. field_images: add display_order column and composite index
    await queryRunner.addColumn(
      'field_images',
      new TableColumn({
        name: 'display_order',
        type: 'int',
        default: 0,
        isNullable: false,
      }),
    );

    await queryRunner.createIndex(
      'field_images',
      new TableIndex({
        name: 'IDX_field_images_field_id_display_order',
        columnNames: ['field_id', 'display_order'],
      }),
    );

    // 2. field_courts: composite index, unique name per field, and check constraints
    await queryRunner.createIndex(
      'field_courts',
      new TableIndex({
        name: 'IDX_field_courts_field_id_type_status',
        columnNames: ['field_id', 'type', 'status'],
      }),
    );

    await queryRunner.createUniqueConstraint(
      'field_courts',
      new TableUnique({
        name: 'UQ_field_courts_field_id_name',
        columnNames: ['field_id', 'name'],
      }),
    );

    await queryRunner.createCheckConstraint(
      'field_courts',
      new TableCheck({
        name: 'CHK_field_courts_type',
        expression: `"type" IN ('5', '7', '11')`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'field_courts',
      new TableCheck({
        name: 'CHK_field_courts_status',
        expression: `"status" IN ('active', 'inactive', 'maintenance')`,
      }),
    );

    // 3. field_services: unique name per field
    await queryRunner.createUniqueConstraint(
      'field_services',
      new TableUnique({
        name: 'UQ_field_services_field_id_name',
        columnNames: ['field_id', 'name'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Drop constraints and indexes in reverse order
    await queryRunner.dropColumn('field_images', 'display_order');
    await queryRunner.dropIndex(
      'field_images',
      'IDX_field_images_field_id_display_order',
      true,
    );

    await queryRunner.dropIndex(
      'field_courts',
      'IDX_field_courts_field_id_type_status',
      true,
    );

    await queryRunner.dropUniqueConstraint(
      'field_services',
      'UQ_field_services_field_id_name',
    );

    await queryRunner.dropUniqueConstraint(
      'field_courts',
      'UQ_field_courts_field_id_name',
    );

    await queryRunner.dropCheckConstraint(
      'field_courts',
      'CHK_field_courts_status',
    );

    await queryRunner.dropCheckConstraint(
      'field_courts',
      'CHK_field_courts_type',
    );
  }
}
