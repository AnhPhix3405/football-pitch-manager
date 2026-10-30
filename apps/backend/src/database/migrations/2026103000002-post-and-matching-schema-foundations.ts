import {
  MigrationInterface,
  QueryRunner,
  TableCheck,
  TableColumn,
  TableIndex,
} from 'typeorm';

export class PostAndMatchingSchemaFoundations2026103000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add current_players and version to posts
    await queryRunner.addColumn(
      'posts',
      new TableColumn({
        name: 'current_players',
        type: 'int',
        default: 0,
        isNullable: false,
      }),
    );

    await queryRunner.addColumn(
      'posts',
      new TableColumn({
        name: 'version',
        type: 'int',
        default: 1,
        isNullable: false,
      }),
    );

    // 2. Check constraints
    await queryRunner.createCheckConstraint(
      'posts',
      new TableCheck({
        name: 'CHK_posts_players_count',
        expression: `"current_players" >= 0 AND "current_players" <= "max_players"`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'posts',
      new TableCheck({
        name: 'CHK_posts_status',
        expression: `"status" IN ('open', 'matched', 'closed', 'cancelled')`,
      }),
    );

    await queryRunner.createCheckConstraint(
      'post_matches',
      new TableCheck({
        name: 'CHK_post_matches_status',
        expression: `"status" IN ('pending', 'accepted', 'rejected', 'cancelled')`,
      }),
    );

    // 3. Composite indexes
    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_posts_status_playdate_deleted',
        columnNames: ['status', 'play_date', 'deleted_at'],
      }),
    );

    await queryRunner.createIndex(
      'posts',
      new TableIndex({
        name: 'IDX_posts_user_status_deleted',
        columnNames: ['user_id', 'status', 'deleted_at'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('posts', 'IDX_posts_user_status_deleted');
    await queryRunner.dropIndex('posts', 'IDX_posts_status_playdate_deleted');

    await queryRunner.dropCheckConstraint(
      'post_matches',
      'CHK_post_matches_status',
    );
    await queryRunner.dropCheckConstraint('posts', 'CHK_posts_status');
    await queryRunner.dropCheckConstraint('posts', 'CHK_posts_players_count');

    await queryRunner.dropColumn('posts', 'version');
    await queryRunner.dropColumn('posts', 'current_players');
  }
}
