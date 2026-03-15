# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS application with REST API, GraphQL, background job processing via BullMQ, JWT authentication, TypeORM PostgreSQL integration, Redis caching, and internationalization support.

## Development Commands

### Docker (Recommended for Local Development)

```bash
# Start all services (PostgreSQL, Redis, API, Worker)
docker-compose -f docker-compose.local.yml up -d

# View logs
docker-compose -f docker-compose.local.yml logs -f api

# Stop all services
docker-compose -f docker-compose.local.yml down

# Run migrations in Docker
docker-compose -f docker-compose.local.yml exec api npm run migration:up

# Access database from host
psql -h localhost -p 5440 -U postgres_user -d postgres

# Access Redis from host
redis-cli -h localhost -p 6400 -a redispass
```

**Important**: When using Docker, ports are mapped to avoid conflicts with local services:
- PostgreSQL: `localhost:5440` (container internal: 5432)
- Redis: `localhost:6400` (container internal: 6379)

See [DOCKER.md](./DOCKER.md) for comprehensive Docker documentation.

### Local Development (Without Docker)

```bash
# Development
npm run start:dev          # Start API server in watch mode
npm run start:worker       # Start background worker in watch mode
npm run start:debug        # Start with debugger

# Production
npm run start:prod         # Run compiled API server
npm run start:worker-prod  # Run compiled worker

# Build & Format
npm run build              # Compile TypeScript
npm run format             # Format with Prettier
npm run lint               # Lint and auto-fix with ESLint

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Database Migrations
npm run migration:generate --name=migration_name  # Generate migration from entity changes
npm run migration:up       # Run pending migrations
npm run migration:down     # Revert last migration
npm run typeorm            # Direct TypeORM CLI access
```

## Architecture

### Dual Entry Points

The application has two separate entry points for different concerns:

1. **API Server** (`src/main.ts` → `AppModule`)
   - Handles HTTP REST endpoints and GraphQL queries
   - Applies global guards, filters, interceptors
   - Runs on port defined in `APP_PORT` (default 4000)
   - Swagger documentation auto-generated at `/api` prefix

2. **Background Worker** (`src/main-worker.ts` → `WorkerModule`)
   - Processes BullMQ jobs from Redis queue
   - Minimal bootstrap (no HTTP server, guards, or interceptors)
   - Runs processors and listeners from `src/modules/queue/`
   - Start separately with `npm run start:worker`

### Authentication & Authorization

- **Global JWT Guard**: `AccessTokenGuard` is applied globally via `APP_GUARD` in `AppModule`
- **Public Routes**: Use `@Public()` decorator to bypass authentication (see `src/decorators/public.decorator.ts`)
- **JWT Strategy**: Two strategies in `src/modules/auth/strategies/`:
  - `access-token.strategy.ts` - Short-lived access tokens (default: 1h)
  - `refresh-token.strategy.ts` - Long-lived refresh tokens (default: 7d)
- **User Extraction**: Use `@User()` decorator in controllers to access authenticated user from request

### Exception Handling

Custom exception filters in `src/filters/` handle different HTTP exceptions:
- `BadRequestExceptionFilter` - 400 errors
- `UnauthorizedExceptionFilter` - 401 errors
- `NotFoundExceptionFilter` - 404 errors
- `InternalServerExceptionFilter` - 500 errors

All filters use `LoggerService` for consistent logging and return standardized error DTOs from `src/shared/dtos/`.

### Response Transformation

`ResponseTransformInterceptor` (applied globally) handles DTO serialization:
- Use `@Serialize(YourDto)` decorator on controller methods
- Transforms responses using `class-transformer` with `excludeExtraneousValues: true`
- Automatically strips sensitive fields not marked with `@Expose()`

### Database Layer

- **TypeORM Entities**: Located in `src/database/entities/`, all extend `BaseEntity` (id, createdAt, updatedAt)
- **Migrations**: Stored in `src/database/migrations/`, managed via TypeORM CLI
- **Data Source**: Configured in `src/database/data-source.ts`, loaded by both app and migrations
- **Models**: GraphQL object types in `src/models/` (separate from TypeORM entities)

### Module Structure

Each feature module typically contains:
- `*.module.ts` - Module definition with imports/providers
- `*.controller.ts` - REST API endpoints
- `*.resolver.ts` - GraphQL queries/mutations (if applicable)
- `*.service.ts` - Business logic
- `dtos/*.dto.ts` - Request/response DTOs with validation

### Path Aliases

TypeScript paths configured in `tsconfig.json`:
- `@*` - Maps to `./src/*` (e.g., `@app.module`)
- `@modules` - Maps to `./src/modules`
- Import examples: `@guards`, `@filters`, `@decorators`, `@database/entities/user.entity`

### Configuration

Environment variables loaded via `@nestjs/config`:
- **Database**: PostgreSQL connection in `src/config/database.config.ts`
- **Application**: JWT, Redis, Queue, CORS, API settings in `src/config/app.config.ts`
- Both configs are globally available via `ConfigService`

### Internationalization

- Configured via `nestjs-i18n` with header resolver
- Translation files in `src/i18n/` directory
- Language header: `x-lang` (configurable via `APP_LOCATE_LANGUAGE`)
- Fallback language: `en` (configurable via `FALLBACK_LANGUAGE`)

### Background Jobs

- **Queue Module**: BullMQ integration with Redis backend
- **Default Queue**: Named queue registered in `QueueModule`
- **Processors**: Job handlers in `src/modules/queue/processors/`
- **Listeners**: Event listeners in `src/modules/queue/listeners/`
- Queue connection shares Redis instance with cache (can be configured separately)

### GraphQL

- Code-first approach with `@nestjs/graphql` and Apollo Server
- Schema auto-generated to `schema.gql` in project root
- Resolvers in module directories (e.g., `src/modules/users/user.resolver.ts`)
- Uses separate model classes (`src/models/`) decorated with `@ObjectType()`

### Shared Utilities

- **Constants**: Error codes, validation patterns in `src/shared/constants/`
- **Validators**: Custom class-validator decorators in `src/shared/validators/`
- **Utils**: Helper functions for Swagger setup, stack traces in `src/shared/utils/`
- **Logging**: Winston logger configuration in `src/shared/logger/`
- **Middleware**: Request logger in `src/shared/middlewares/logger.middleware.ts` (applied globally)

### Request Context

- Uses `nestjs-cls` for async context storage (configured globally in `AppModule`)
- Provides request-scoped storage without dependency injection

## Docker Configuration

### Port Mapping for Local Development

To avoid conflicts with local PostgreSQL and Redis instances:

| Service | Container Internal | Host External | Connect From App | Connect From Host |
|---------|-------------------|---------------|------------------|-------------------|
| PostgreSQL | 5432 | **5440** | `database:5432` | `localhost:5440` |
| Redis | 6379 | **6400** | `redis:6379` | `localhost:6400` |
| API | 4000 | 4000 | - | `localhost:4000` |

### Environment Files

- `.env.example` - Use with `docker-compose.local.yml` (ports 5440, 6400)
- `.env.example` - Use for non-Docker or production (standard ports)

### Quick Setup

```bash
# 1. Copy the appropriate environment file
cp .env.example .env

# 2. Start Docker services
docker-compose -f docker-compose.local.yml up -d

# 3. Run migrations
docker-compose -f docker-compose.local.yml exec api npm run migration:up
```

## Important Notes

- API prefix: All routes prefixed with `/api/v1` (configurable via `API_PREFIX` and `API_VERSION`)
- Validation: Global `ValidationPipe` with `transform: true`, `whitelist: true`, `stopAtFirstError: true`
- CORS: Configured in `main.ts` with origins from `CORS_ORIGIN` env variable (comma-separated)
- Security: Helmet middleware applied globally for security headers
- Database synchronize: Should be `false` in production, use migrations instead
- Docker: See [DOCKER.md](./DOCKER.md) for comprehensive Docker documentation and troubleshooting
