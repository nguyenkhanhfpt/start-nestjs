# /debug

Diagnose and fix issues in this NestJS project — runtime errors, migration failures, auth issues, queue problems, or Docker/Redis/DB connectivity.

## Usage
```
/debug [symptom or error message]
```
Example: `/debug 401 on all requests after logout` or `/debug migration fails with column already exists`

## Arguments
`$ARGUMENTS` = symptom or error paste

## Diagnostic playbook

### Auth / JWT issues
1. Check `AccessTokenGuard` at `src/guards/access-token.guard.ts` — ensure `IS_PUBLIC_KEY` check runs first
2. Check token blacklist: `TokenBlacklistService` at `src/modules/auth/services/token-blacklist.service.ts` — if Redis is down, `isTokenBlacklisted` returns `false` (graceful) but check `RedisService` connection
3. Verify JWT secret matches between sign and verify: `src/config/app.config.ts` → `jwt.accessSecret`
4. Confirm the Bearer token format — strategies extract via `ExtractJwt.fromAuthHeaderAsBearerToken()`
5. Check token expiry: access = `jwt.accessExpiresIn`, refresh = `jwt.refreshExpiresIn`

### Validation errors (400) with no detail
1. `BadRequestExceptionFilter` at `src/filters/bad-request-exception.filter.ts` translates errors via i18n
2. Check that the key exists in `src/i18n/en/error.<EntityName>.json` — missing key returns raw key string
3. DTO must have `public static readonly resource = <Entity>.name` for i18n lookup to work
4. Confirm `ValidationPipe` is applied globally in `src/main.ts` with `stopAtFirstError: true`

### 404 errors unexpectedly
1. Check route prefix: all routes are under `/api/v1` (set by `API_PREFIX` + `API_VERSION` env vars)
2. Verify the entity exists in DB — `findOneOrFail` throws `EntityNotFoundError`, caught by `NotFoundExceptionFilter`
3. Confirm `TypeOrmModule.forFeature([Entity])` is in the module's imports

### Migration failures
1. Check `src/database/data-source.ts` — entity must be listed in `entities` array
2. `synchronize: false` always — never auto-sync
3. If `column already exists`: migration was partially applied — manually check `migrations` table in DB and delete the broken record, then rerun
4. If entity changes not detected: confirm entity file is in `src/database/entities/` and exported

### Redis / Queue issues
1. Check Redis connection: `src/config/app.config.ts` → `redis.host`, `redis.port`, `redis.password`
2. BullMQ queue name must match between `QueueModule` registration and processor `@Processor()` decorator
3. Worker must be started separately: `npm run start:worker` (it does NOT run inside the API process)
4. Check `src/modules/queue/processors/` for unhandled promise rejections — BullMQ swallows errors silently without a listener

### Docker connectivity
1. From API container, DB is at `database:5432` (service name), NOT `localhost:5440`
2. From host machine, DB is at `localhost:5440`
3. Redis: container → `redis:6379`, host → `localhost:6400`
4. Verify env vars in `.env` match the docker-compose service names

### Response shape wrong / missing fields
1. Check `@Expose()` on the DTO field — without it, `excludeExtraneousValues: true` strips the field
2. Check `@Serialize(CorrectDto)` is on the controller method
3. For nested objects: `@Type(() => NestedDto)` required on the parent field

### TypeORM relationship not loading
1. Check the `relations` array in `findOne` / `findAndCount` options
2. For lazy loading, the relation property must be `Promise<T>` type — not used in this project (eager relations only)
3. Check `@JoinColumn({ name: 'foreign_key_column' })` is on the owning side of the relation

## General approach
1. Read the error message and stack trace first — identify which filter/guard/interceptor caught it
2. Read the relevant source file before suggesting changes
3. Check the actual env vars are set: `cat .env` or inside Docker: `docker-compose exec api env | grep <VAR>`
4. For DB issues: connect directly — `psql -h localhost -p 5440 -U postgres_user -d postgres`
5. For Redis issues: `redis-cli -h localhost -p 6400 -a redispass ping`
