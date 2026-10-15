import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AlterTblMessages2026091900029 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('messages', [
      new TableColumn({
        name: 'is_edited',
        type: 'boolean',
        default: false,
      }),
      new TableColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('messages', 'deleted_at');
    await queryRunner.dropColumn('messages', 'is_edited');
  }
}
