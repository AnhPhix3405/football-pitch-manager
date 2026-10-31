import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddChatClearedAtToConversationMembers2026102900001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'conversation_members',
      new TableColumn({
        name: 'chat_cleared_at',
        type: 'timestamptz',
        isNullable: true,
      }),
    );

    await queryRunner.query(
      `UPDATE "conversation_members" SET "chat_cleared_at" = "deleted_at" WHERE "deleted_at" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('conversation_members', 'chat_cleared_at');
  }
}
