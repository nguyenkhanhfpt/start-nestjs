import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPointHistoriesTable1786027467641
  implements MigrationInterface
{
  name = 'CreateUserPointHistoriesTable1786027467641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_point_histories_type_enum" AS ENUM('INCREASE', 'DECREASE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_point_histories" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "type" "user_point_histories_type_enum" NOT NULL, "amount" integer NOT NULL, "balance_after" integer NOT NULL, "note" character varying(255), "performed_by" integer, CONSTRAINT "PK_user_point_histories_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_point_histories_user_id" ON "user_point_histories" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_point_histories_created_at" ON "user_point_histories" ("created_at")`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_point_histories" ADD CONSTRAINT "FK_user_point_histories_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_point_histories" ADD CONSTRAINT "FK_user_point_histories_performed_by" FOREIGN KEY ("performed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_point_histories" DROP CONSTRAINT "FK_user_point_histories_performed_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_point_histories" DROP CONSTRAINT "FK_user_point_histories_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_user_point_histories_created_at"`);
    await queryRunner.query(`DROP INDEX "IDX_user_point_histories_user_id"`);
    await queryRunner.query(`DROP TABLE "user_point_histories"`);
    await queryRunner.query(`DROP TYPE "user_point_histories_type_enum"`);
  }
}
