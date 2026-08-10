import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPointsTable1786027467640 implements MigrationInterface {
  name = 'CreateUserPointsTable1786027467640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_points" (
        "id"         INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        "user_id"    INTEGER NOT NULL,
        "balance"    INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "UQ_user_points_user_id" UNIQUE ("user_id"),
        CONSTRAINT "FK_user_points_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_points"`);
  }
}
