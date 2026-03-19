<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<p align="center">
  A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
</p>

## Description

A production-ready NestJS starter application with REST API, GraphQL, background job processing, JWT authentication, PostgreSQL/TypeORM integration, Redis caching, and internationalization support.

## Features

- **Dual Entry Points**: API server and background worker (BullMQ)
- **REST API**: With Swagger documentation at `/api`
- **GraphQL**: Code-first approach with Apollo Server (schema auto-generated)
- **Authentication**: JWT with access tokens (1h) and refresh tokens (7d)
- **Database**: TypeORM with PostgreSQL, migrations support
- **Caching**: Redis-based caching with cache-manager
- **Background Jobs**: BullMQ for job processing
- **Internationalization**: nestjs-i18n with header-based language selection
- **Rate Limiting**: Built-in throttling protection
- **Security**: Helmet middleware, CORS configuration
- **Logging**: Winston logger with request logging middleware
- **Request Context**: nestjs-cls for async context storage

## Quick Start

### Prerequisites

- Node.js 20+
- Docker (optional, for PostgreSQL and Redis)

### Installation

```bash
npm install
```

### Configuration

Copy the environment file and configure as needed:

```bash
cp .env.example .env
```

### Running the Application

#### With Docker (Recommended)

```bash
# Start all services (PostgreSQL, Redis, API, Worker)
docker-compose -f docker-compose.local.yml up -d

# View logs
docker-compose -f docker-compose.local.yml logs -f api

# Run migrations
docker-compose -f docker-compose.local.yml exec api npm run migration:up
```

#### Local Development

```bash
# Start API server in watch mode
npm run start:dev

# Start background worker in watch mode
npm run start:worker

# Start with debugger
npm run start:debug
```

#### Production

```bash
# Build the application
npm run build

# Run API server
npm run start:prod

# Run background worker
npm run start:worker-prod
```

## API Documentation

- **Swagger UI**: `http://localhost:4000/api`
- **GraphQL Playground**: `http://localhost:4000/graphql`
- **API Prefix**: `/api/v1` (configurable via `API_PREFIX`)

## Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## Database Migrations

```bash
# Generate migration from entity changes
npm run migration:generate --name=migration_name

# Run pending migrations
npm run migration:up

# Revert last migration
npm run migration:down
```

## Project Structure

```
src/
├── main.ts                    # API server entry point
├── main-worker.ts             # Background worker entry point
├── app.module.ts              # API module
├── worker.module.ts           # Worker module
├── config/                    # Configuration files
├── database/
│   ├── entities/              # TypeORM entities
│   ├── migrations/            # Database migrations
│   └── data-source.ts         # TypeORM data source
├── modules/
│   ├── auth/                  # Authentication module
│   ├── users/                 # Users module
│   ├── posts/                 # Posts module
│   ├── queue/                 # BullMQ queue module
│   ├── redis/                 # Redis cache module
│   └── logger/                # Winston logger module
├── decorators/                # Custom decorators
├── guards/                    # Auth guards
├── filters/                   # Exception filters
├── interceptors/              # Response interceptors
├── shared/
│   ├── dtos/                 # Shared DTOs
│   ├── constants/            # Constants
│   ├── validators/           # Custom validators
│   ├── utils/                # Utilities
│   └── logger/                # Logger configuration
├── models/                    # GraphQL models
└── i18n/                     # Translation files
```

## Key Modules

### Authentication

- JWT-based authentication with access and refresh tokens
- Two strategies: `AccessTokenStrategy` and `RefreshTokenStrategy`
- Public routes with `@Public()` decorator
- User extraction with `@User()` decorator

### Database

- TypeORM with PostgreSQL
- Base entity with `id`, `createdAt`, `updatedAt`
- Automatic migrations generation

### Background Jobs

- BullMQ integration with Redis
- Processors in `src/modules/queue/processors/`
- Event listeners in `src/modules/queue/listeners/`

### Caching

- Redis-based caching via `@nestjs/cache-manager`
- Shared Redis instance with queue

### Internationalization

- Header-based language selection (`x-lang`)
- Fallback language: `en`
- Translation files in `src/i18n/`

## Docker Ports

| Service     | Host Port | Container Port |
|-------------|-----------|----------------|
| PostgreSQL  | 5440      | 5432           |
| Redis       | 6400      | 6379           |
| API         | 4000      | 4000           |

## License

MIT