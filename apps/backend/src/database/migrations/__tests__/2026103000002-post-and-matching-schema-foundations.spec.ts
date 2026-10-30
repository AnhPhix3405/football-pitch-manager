import { QueryRunner, TableCheck, TableColumn, TableIndex } from 'typeorm';
import { PostAndMatchingSchemaFoundations2026103000002 } from '../2026103000002-post-and-matching-schema-foundations';

describe('PostAndMatchingSchemaFoundations2026103000002', () => {
  let migration: PostAndMatchingSchemaFoundations2026103000002;
  let queryRunner: jest.Mocked<QueryRunner>;

  beforeEach(() => {
    migration = new PostAndMatchingSchemaFoundations2026103000002();
    queryRunner = {
      addColumn: jest.fn(),
      dropColumn: jest.fn(),
      createCheckConstraint: jest.fn(),
      dropCheckConstraint: jest.fn(),
      createIndex: jest.fn(),
      dropIndex: jest.fn(),
    } as unknown as jest.Mocked<QueryRunner>;
  });

  it('should apply columns, check constraints, and composite indexes in up()', async () => {
    await migration.up(queryRunner);

    expect(queryRunner.addColumn).toHaveBeenCalledTimes(2);
    expect(queryRunner.addColumn).toHaveBeenCalledWith(
      'posts',
      expect.objectContaining({ name: 'current_players', type: 'int' }),
    );
    expect(queryRunner.addColumn).toHaveBeenCalledWith(
      'posts',
      expect.objectContaining({ name: 'version', type: 'int' }),
    );

    expect(queryRunner.createCheckConstraint).toHaveBeenCalledTimes(3);
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'posts',
      expect.objectContaining({ name: 'CHK_posts_players_count' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'posts',
      expect.objectContaining({ name: 'CHK_posts_status' }),
    );
    expect(queryRunner.createCheckConstraint).toHaveBeenCalledWith(
      'post_matches',
      expect.objectContaining({ name: 'CHK_post_matches_status' }),
    );

    expect(queryRunner.createIndex).toHaveBeenCalledTimes(2);
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'posts',
      expect.objectContaining({ name: 'IDX_posts_status_playdate_deleted' }),
    );
    expect(queryRunner.createIndex).toHaveBeenCalledWith(
      'posts',
      expect.objectContaining({ name: 'IDX_posts_user_status_deleted' }),
    );
  });

  it('should drop all composite indexes, check constraints, and columns in down()', async () => {
    await migration.down(queryRunner);

    expect(queryRunner.dropIndex).toHaveBeenCalledTimes(2);
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'posts',
      'IDX_posts_user_status_deleted',
    );
    expect(queryRunner.dropIndex).toHaveBeenCalledWith(
      'posts',
      'IDX_posts_status_playdate_deleted',
    );

    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledTimes(3);
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'post_matches',
      'CHK_post_matches_status',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'posts',
      'CHK_posts_status',
    );
    expect(queryRunner.dropCheckConstraint).toHaveBeenCalledWith(
      'posts',
      'CHK_posts_players_count',
    );

    expect(queryRunner.dropColumn).toHaveBeenCalledTimes(2);
    expect(queryRunner.dropColumn).toHaveBeenCalledWith('posts', 'version');
    expect(queryRunner.dropColumn).toHaveBeenCalledWith(
      'posts',
      'current_players',
    );
  });
});
