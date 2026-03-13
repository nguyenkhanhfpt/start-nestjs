import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueEmailConstraint1756307057552
  implements MigrationInterface
{
  name = 'AddUniqueEmailConstraint1756307057552';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);
  }
}
