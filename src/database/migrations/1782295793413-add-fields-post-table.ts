import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsPostTable1782295793413 implements MigrationInterface {
  name = 'AddFieldsPostTable1782295793413';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "like_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "comment_count" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "posts" ADD "thumbnail" character varying NOT NULL DEFAULT 'default.jpg'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "thumbnail"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "comment_count"`);
    await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "like_count"`);
  }
}
