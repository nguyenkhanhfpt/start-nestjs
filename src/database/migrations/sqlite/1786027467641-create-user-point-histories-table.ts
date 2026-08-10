import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserPointHistoriesTable1786027467641
  implements MigrationInterface
{
  name = 'CreateUserPointHistoriesTable1786027467641';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQLite has no native ENUM type; "type" is stored as TEXT and validated
    // at the application level via the PointTransactionType enum.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_point_histories" (
        "id"            INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at"    datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at"    datetime NOT NULL DEFAULT (datetime('now')),
        "user_id"       INTEGER NOT NULL,
        "type"          TEXT NOT NULL,
        "amount"        INTEGER NOT NULL,
        "balance_after" INTEGER NOT NULL,
        "note"          TEXT,
        "performed_by"  INTEGER,
        CONSTRAINT "FK_user_point_histories_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_user_point_histories_performed_by" FOREIGN KEY ("performed_by")
          REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_point_histories_user_id" ON "user_point_histories" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_point_histories_created_at" ON "user_point_histories" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_point_histories"`);
  }
}
