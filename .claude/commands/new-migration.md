# /new-migration

Guide creating, running, and reverting TypeORM migrations for this project.

## Usage
```
/new-migration <action> [migration_name]
```
Actions: `generate`, `run`, `revert`, `status`, `create`

## Arguments
`$ARGUMENTS` = `<action> [migration_name]`

## What to do per action

### `generate <migration_name>`
Generate a migration from entity changes (TypeORM diffs current schema vs DB):
```bash
npm run migration:generate --name=<migration_name>
```
- Use snake_case for migration names: `create_products_table`, `add_status_to_orders`, `add_index_users_email`
- Always inspect the generated file in `src/database/migrations/` before running — TypeORM may include unintended drops
- Check that `up()` and `down()` are symmetric

### `run`
Apply all pending migrations:
```bash
npm run migration:up
```
In Docker:
```bash
docker-compose -f docker-compose.local.yml exec api npm run migration:up
```

### `revert`
Revert the last applied migration:
```bash
npm run migration:down
```

### `status`
Check which migrations are pending/applied — run via TypeORM CLI:
```bash
npm run typeorm -- migration:show -d src/database/data-source.ts
```

### `create <migration_name>`
Create an empty migration file (for manual SQL):
```bash
npm run typeorm -- migration:create src/database/migrations/<migration_name>
```

## Migration file conventions
Follow the existing pattern in `src/database/migrations/`:
- Class name matches filename timestamp: `class CreateUsersTable1234567890123`
- Column names: snake_case (`user_id`, `created_at`)
- Always add `NOT NULL` with a DEFAULT where appropriate for new columns on existing tables
- Use `queryRunner.createForeignKey()` for FK constraints with explicit names: `FK_<table>_<column>`
- Index names: `IDX_<table>_<column>`

## Naming conventions
| Operation | Name pattern | Example |
|-----------|-------------|---------|
| New table | `create_<table>s_table` | `create_products_table` |
| Add column | `add_<column>_to_<table>s` | `add_status_to_orders` |
| Remove column | `remove_<column>_from_<table>s` | `remove_bio_from_users` |
| Add index | `add_index_<table>s_<column>` | `add_index_users_email` |
| Add FK | `add_fk_<table>_<ref>` | `add_fk_posts_user` |
| Rename | `rename_<table>_<old>_to_<new>` | `rename_users_username_to_name` |

## After migration
1. Verify the migration ran: `npm run typeorm -- migration:show -d src/database/data-source.ts`
2. If adding a new entity, ensure it is registered in `src/database/data-source.ts` entities array
3. Update any affected services/queries to use new column names
4. Test the `down()` method works: `npm run migration:down` then `npm run migration:up`

## Important
- `synchronize` is `false` in all envs — never enable it in production
- `data-source.ts` is the single source of truth for migration config
- Never modify an already-applied migration — create a new one instead
