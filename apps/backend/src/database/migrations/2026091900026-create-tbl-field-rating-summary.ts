import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { foreignKey, updatedAtColumn } from './migration-table.helpers';

export class CreateTblFieldRatingSummary2026091900026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'field_rating_summary',
        columns: [
          { name: 'field_id', type: 'uuid', isPrimary: true },
          {
            name: 'avg_rating',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0,
          },
          { name: 'total_reviews', type: 'int', default: 0 },
          {
            name: 'bayesian_score',
            type: 'decimal',
            precision: 5,
            scale: 3,
            default: 0,
          },
          updatedAtColumn(),
        ],
        indices: [
          { columnNames: ['bayesian_score'] },
          { columnNames: ['avg_rating'] },
        ],
        checks: [{ expression: '"total_reviews" >= 0' }],
        foreignKeys: [foreignKey('field_id', 'fields', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('field_rating_summary');
  }
}
