import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * SQLite-compatible migration: initialize the entire schema for SQLite.
 * SQLite does not support SERIAL, TIMESTAMP, character varying — replaced with
 * INTEGER, datetime, TEXT respectively.
 */
export class InitSqliteSchema1000000000001 implements MigrationInterface {
  name = 'InitSqliteSchema1000000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"         INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        "name"       TEXT NOT NULL,
        "email"      TEXT NOT NULL,
        "password"   TEXT NOT NULL,
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `);

    // create posts table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "posts" (
        "id"         INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now')),
        "title"      TEXT NOT NULL,
        "content"    TEXT NOT NULL,
        "user_id"    INTEGER NOT NULL,
        CONSTRAINT "FK_posts_user_id" FOREIGN KEY ("user_id")
          REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
