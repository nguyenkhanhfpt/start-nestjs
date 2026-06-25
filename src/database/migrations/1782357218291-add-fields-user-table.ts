import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFieldsUserTable1782357218291 implements MigrationInterface {
  name = 'AddFieldsUserTable1782357218291';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "username" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "avatar" character varying NOT NULL DEFAULT 'default.jpg'`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "bio" text`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "phone" character varying(20)`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "bio"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatar"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "username"`);
  }
}
