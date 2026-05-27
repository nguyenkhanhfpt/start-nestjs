# Codebase Explanation

## Overview
This repository is a production-style NestJS starter that ships with:
- REST API + Swagger
- GraphQL (code-first)
- JWT auth (access + refresh)
- PostgreSQL via TypeORM
- Redis cache + token blacklist support
- BullMQ queue + separate worker process
- i18n, throttling, logging, and global error handling

It has **two runtime entry points**:
- API server: `src/main.ts`
- Worker server: `src/main-worker.ts`

## High-Level Architecture

### API Process (`AppModule`)
`src/app.module.ts` wires:
- `ConfigModule` with `app` + `database` config
- `TypeOrmModule` (async from env config)
- `GraphQLModule` (Apollo, auto-generated `schema.gql`)
- `I18nModule` (header-based language resolver)
- `ThrottlerModule` (global rate limiting)
- Feature modules: `AuthModule`, `UsersModule`, `PostsModule`, `QueueModule`, `LoggerModule`

Global guards:
- `ThrottlerGuard` (rate limiting)
- `AccessTokenGuard` (JWT auth + blacklist check)

Global middleware:
- `LoggerMiddleware` for request logging

### Worker Process (`WorkerModule`)
`src/worker.module.ts` wires only what is needed for jobs:
- config + database
- `QueueModule`
- queue processor/listener providers

`src/main-worker.ts` boots Nest without opening an HTTP port, then initializes worker providers.

## Bootstrapping and Cross-Cutting Concerns

`src/main.ts` configures:
- helmet security headers
- CORS from `app.corsOrigin`
- global prefix + URI versioning
- global `ValidationPipe` (transform + whitelist + stop at first error)
- global exception filters (bad request, unauthorized, not found, internal)
- global response transform interceptor
- Swagger setup (`/api`)

## Domain Modules

### Auth Module
Key files:
- `src/modules/auth/auth.controller.ts`
- `src/modules/auth/auth.service.ts`
- `src/modules/auth/strategies/*.ts`
- `src/modules/auth/services/token-blacklist.service.ts`

Responsibilities:
- register/login
- refresh token flow
- logout by blacklisting access token in Redis
- get current user

Token behavior:
- access and refresh tokens are signed with different secrets and expiry values from `app.jwt.*`
- `AccessTokenGuard` allows `@Public()` routes, validates JWT, then checks Redis blacklist

### Users Module
Key files:
- `src/modules/users/users.controller.ts`
- `src/modules/users/users.service.ts`

Current state:
- `findAll`, `findOne`, `findAllPosts` are implemented
- `create`, `update`, and `remove` currently return placeholder strings (not real persistence logic)

### Posts Module
Key files:
- `src/modules/posts/posts.controller.ts`
- `src/modules/posts/posts.service.ts`
- `src/modules/posts/posts.resolver.ts`

Responsibilities:
- REST CRUD for posts
- GraphQL queries: `posts`, `post(id)`
- ownership enforcement on update/delete (only post owner can modify)

### Queue Module
Key files:
- `src/modules/queue/queue.module.ts`
- `src/modules/queue/processors/queue.processor.ts`
- `src/modules/queue/listeners/queue.listener.ts`

Responsibilities:
- BullMQ connection config from `app.queue.*`
- default queue registration
- worker-side processing hooks (`QueueProcessor`)

### Redis Module
Key files:
- `src/modules/redis/redis.module.ts`
- `src/modules/redis/redis.service.ts`

Responsibilities:
- wraps cache-manager operations (`get`, `set`, `del`, `wrap`)
- used by token blacklist service

## Data Layer

Entities:
- `src/database/entities/user.entity.ts`
- `src/database/entities/post.entity.ts`
- shared base class: `src/database/entities/base.entity.ts`

Relations:
- user `1 -> many` posts
- post `many -> 1` user via `user_id`

Migrations live in:
- `src/database/migrations/`

## Security and API Behavior
- JWT auth via Passport strategies and global auth guard
- endpoint-level public access via `@Public()` decorator
- rate-limit decorators in `src/decorators/throttle.decorator.ts` (e.g. login/register/refresh profiles)
- centralized exception filters and response serialization/decorators

## Config and Environment
Primary config sources:
- `src/config/app.config.ts`
- `src/config/database.config.ts`

Important env groups:
- app port/prefix/version/CORS
- JWT secrets + expirations
- PostgreSQL connection
- Redis + queue connection
- throttle settings

## API Surface Summary
REST groups:
- `/auth/*`
- `/users/*`
- `/posts/*`

GraphQL:
- `/graphql`
- queries for posts are implemented via `PostsResolver`

## Notable Gaps / Follow-up
1. Users service has stubbed methods (`create`, `update`, `remove`) that should be fully implemented.
2. Queue processor currently logs and returns `true`; real job types and handlers are still needed.
3. Token blacklist service includes a placeholder `blacklistUserTokens` method.
4. Coverage includes unit specs, but the unfinished users methods should gain tests once implemented.

## Suggested Reading Order for New Contributors
1. `README.md`
2. `src/main.ts`
3. `src/app.module.ts`
4. `src/modules/auth/*`
5. `src/modules/posts/*`
6. `src/modules/users/*`
7. `src/modules/queue/*` + `src/main-worker.ts`
8. `src/config/*` + `src/database/*`
