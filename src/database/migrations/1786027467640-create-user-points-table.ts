import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPointsTable1786027467640 implements MigrationInterface {
  name = 'CreateUserPointsTable1786027467640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_points" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "balance" integer NOT NULL DEFAULT 0, CONSTRAINT "UQ_user_points_user_id" UNIQUE ("user_id"), CONSTRAINT "PK_user_points_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_points" ADD CONSTRAINT "FK_user_points_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_points" DROP CONSTRAINT "FK_user_points_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "user_points"`);
  }
}
