import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { foreignKey, updatedAtColumn } from './migration-table.helpers';

export class CreateTblUserRatingSummary2026091900027 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'user_rating_summary',
        columns: [
          { name: 'user_id', type: 'uuid', isPrimary: true },
          {
            name: 'avg_rating',
            type: 'decimal',
            precision: 3,
            scale: 2,
            default: 0,
          },
          { name: 'total_reviews', type: 'int', default: 0 },
          {
            name: 'sportsmanship_score',
            type: 'decimal',
            precision: 5,
            scale: 2,
            default: 0,
          },
          updatedAtColumn(),
        ],
        indices: [
          { columnNames: ['avg_rating'] },
          { columnNames: ['sportsmanship_score'] },
        ],
        checks: [{ expression: '"total_reviews" >= 0' }],
        foreignKeys: [foreignKey('user_id', 'users', 'CASCADE')],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user_rating_summary');
  }
}
