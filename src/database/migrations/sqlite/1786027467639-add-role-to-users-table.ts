import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoleToUsersTable1786027467639 implements MigrationInterface {
  name = 'AddRoleToUsersTable1786027467639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role"`);
  }
}
