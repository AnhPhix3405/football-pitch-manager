import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';
import { foreignKey } from './migration-table.helpers';

export class AddModerationTrackingColumns2026111300001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add moderated_by to posts
    await queryRunner.addColumn(
      'posts',
      new TableColumn({
        name: 'moderated_by',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'posts',
      new TableForeignKey(foreignKey('moderated_by', 'users', 'SET NULL')),
    );

    // 2. Add suspended_by to users
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'suspended_by',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey(foreignKey('suspended_by', 'users', 'SET NULL')),
    );

    // 3. Add moderated_by to field_reviews
    await queryRunner.addColumn(
      'field_reviews',
      new TableColumn({
        name: 'moderated_by',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'field_reviews',
      new TableForeignKey(foreignKey('moderated_by', 'users', 'SET NULL')),
    );

    // 4. Add moderated_by to user_reviews
    await queryRunner.addColumn(
      'user_reviews',
      new TableColumn({
        name: 'moderated_by',
        type: 'uuid',
        isNullable: true,
      }),
    );
    await queryRunner.createForeignKey(
      'user_reviews',
      new TableForeignKey(foreignKey('moderated_by', 'users', 'SET NULL')),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Helper to drop foreign key by column name
    const dropFkAndColumn = async (tableName: string, columnName: string) => {
      const table = await queryRunner.getTable(tableName);
      if (table) {
        const fk = table.foreignKeys.find((f) =>
          f.columnNames.includes(columnName),
        );
        if (fk) {
          await queryRunner.dropForeignKey(tableName, fk);
        }
      }
      await queryRunner.dropColumn(tableName, columnName);
    };

    await dropFkAndColumn('user_reviews', 'moderated_by');
    await dropFkAndColumn('field_reviews', 'moderated_by');
    await dropFkAndColumn('users', 'suspended_by');
    await dropFkAndColumn('posts', 'moderated_by');
  }
}
