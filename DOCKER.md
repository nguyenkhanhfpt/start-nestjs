# Docker Configuration Guide

This document explains how to use Docker with this NestJS application and how to avoid port conflicts with local services.

## Quick Start

### Local Development (Recommended)

```bash
# 1. Copy the local environment template
cp .env.example .env

# 2. Start all services
docker-compose -f docker-compose.local.yml up -d

# 3. View logs
docker-compose -f docker-compose.local.yml logs -f

# 4. Stop all services
docker-compose -f docker-compose.local.yml down
```

### Production

```bash
# 1. Copy and configure production environment
cp .env.example .env
# Edit .env with production values

# 2. Start all services
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop all services
docker-compose down
```

---

## Port Mapping Strategy

### Problem: Port Conflicts

When you have PostgreSQL, Redis, or other services running on your local machine, Docker containers trying to use the same ports will fail with errors like:

```
Error: bind: address already in use
```

### Solution: Different External Ports

We use **different external ports** for Docker containers to avoid conflicts with your local services.

#### Port Mapping Table

| Service | Local Machine | Docker Container Internal | Docker Host External | Connect From App | Connect From Host Machine |
|---------|--------------|---------------------------|---------------------|------------------|--------------------------|
| **PostgreSQL** | 5432 (your local DB) | 5432 | **5440** | `database:5432` | `localhost:5440` |
| **Redis** | 6379 (your local Redis) | 6379 | **6400** | `redis:6379` | `localhost:6400` |
| **API** | - | 4000 | 4000 | - | `localhost:4000` |
| **LocalStack** | - | 4566 | 4566 | `localstack:4566` | `localhost:4566` |

---

## Environment Variables Explained

### For Application Running Inside Docker

When your NestJS app runs **inside Docker** (recommended), use these settings:

```bash
# .env file for Docker Compose
DATABASE_HOST=database          # Docker service name
DATABASE_PORT=5432              # Internal container port
REDIS_HOST=redis                # Docker service name
REDIS_PORT=6379                 # Internal container port
```

The app container connects to other containers using **Docker service names** and **internal ports**.

### For External Access (Database Clients)

When connecting **from your host machine** (e.g., TablePlus, pgAdmin, Redis CLI):

```bash
# PostgreSQL connection
Host: localhost
Port: 5440                      # External port (not 5432!)
Database: postgres
User: postgres_user
Password: secret

# Redis connection
Host: localhost
Port: 6400                      # External port (not 6379!)
Password: redispass
```

---

## Configuration Files

### `.env.example`
- Template environment file for all environments
- **For Docker development**: Uses external ports 5440 (PostgreSQL) and 6400 (Redis) to avoid conflicts
- **For local development without Docker**: Change `DATABASE_HOST=localhost` and `REDIS_HOST=localhost`, use standard ports 5432 and 6379
- **For production**: Update with production values and secrets
- Copy to `.env` and customize based on your environment

### `docker-compose.local.yml`
- Development environment
- Includes LocalStack for S3 mocking
- Uses volume mounts for hot-reload
- **Mapped ports**: PostgreSQL (5440), Redis (6400)

### `docker-compose.yml`
- Production environment
- Optimized builds
- Named containers
- Can use standard ports or custom via `*_EXTERNAL` variables

---

## Common Commands

### Start Services

```bash
# Local development
docker-compose -f docker-compose.local.yml up -d

# Production
docker-compose up -d

# Start specific service
docker-compose -f docker-compose.local.yml up -d database
```

### Stop Services

```bash
# Stop all services
docker-compose -f docker-compose.local.yml down

# Stop and remove volumes (⚠️ deletes all data!)
docker-compose -f docker-compose.local.yml down -v
```

### View Logs

```bash
# All services
docker-compose -f docker-compose.local.yml logs -f

# Specific service
docker-compose -f docker-compose.local.yml logs -f api

# Last 100 lines
docker-compose -f docker-compose.local.yml logs --tail=100 -f
```

### Execute Commands Inside Containers

```bash
# Run migrations
docker-compose -f docker-compose.local.yml exec api npm run migration:up

# Access PostgreSQL shell
docker-compose -f docker-compose.local.yml exec database psql -U postgres_user -d postgres

# Access Redis CLI
docker-compose -f docker-compose.local.yml exec redis redis-cli -a redispass

# Access API container bash
docker-compose -f docker-compose.local.yml exec api sh
```

### Rebuild Containers

```bash
# Rebuild all services
docker-compose -f docker-compose.local.yml up -d --build

# Rebuild specific service
docker-compose -f docker-compose.local.yml up -d --build api
```

---

## Troubleshooting

### Port Already in Use Error

**Error:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:5432: bind: address already in use
```

**Solution:**

1. **Check what's using the port:**
   ```bash
   # On macOS/Linux
   lsof -i :5432

   # On Windows
   netstat -ano | findstr :5432
   ```

2. **Option A: Use the local environment file (recommended)**
   ```bash
   cp .env.example .env
   docker-compose -f docker-compose.local.yml up -d
   ```
   This uses ports 5440 and 6400 instead.

3. **Option B: Stop your local service**
   ```bash
   # Stop local PostgreSQL (macOS)
   brew services stop postgresql

   # Stop local Redis (macOS)
   brew services stop redis
   ```

4. **Option C: Customize ports**
   ```bash
   # In your .env file, set:
   DATABASE_PORT_EXTERNAL=5434  # Or any free port
   REDIS_PORT_EXTERNAL=6381     # Or any free port
   ```

### Connection Refused from Host

If you can't connect to the database from your host machine:

1. **Verify the container is running:**
   ```bash
   docker-compose -f docker-compose.local.yml ps
   ```

2. **Check you're using the correct external port:**
   - PostgreSQL: `localhost:5440` (not 5432)
   - Redis: `localhost:6400` (not 6379)

3. **Check the logs:**
   ```bash
   docker-compose -f docker-compose.local.yml logs database
   ```

### App Can't Connect to Database

If the NestJS app can't connect to the database:

1. **Verify environment variables:**
   ```bash
   DATABASE_HOST=database  # NOT localhost!
   DATABASE_PORT=5432      # Internal port, NOT 5440!
   ```

2. **Check network connectivity:**
   ```bash
   docker-compose -f docker-compose.local.yml exec api ping database
   ```

3. **Verify database is ready:**
   ```bash
   docker-compose -f docker-compose.local.yml exec database pg_isready -U postgres_user
   ```

### Clean Slate (Reset Everything)

```bash
# Stop all containers and remove volumes
docker-compose -f docker-compose.local.yml down -v

# Remove all unused Docker resources
docker system prune -a --volumes

# Start fresh
docker-compose -f docker-compose.local.yml up -d
```

---

## Database Access Examples

### From Host Machine (Development Tools)

#### TablePlus / pgAdmin / DBeaver
```
Host: localhost
Port: 5440
Database: postgres
Username: postgres_user
Password: secret
```

#### psql Command Line
```bash
psql -h localhost -p 5440 -U postgres_user -d postgres
```

#### Redis CLI
```bash
redis-cli -h localhost -p 6400 -a redispass
```

#### RedisInsight / Another Redis GUI
```
Host: localhost
Port: 6400
Password: redispass
```

### From Inside Docker Container

```bash
# PostgreSQL
docker-compose -f docker-compose.local.yml exec database psql -U postgres_user -d postgres

# Redis
docker-compose -f docker-compose.local.yml exec redis redis-cli -a redispass
```

---

## Best Practices

### Local Development

1. ✅ Use `docker-compose.local.yml` for local development
2. ✅ Copy `.env.example` to `.env`
3. ✅ Keep your local PostgreSQL/Redis running if needed (no conflicts!)
4. ✅ Use volume mounts for hot-reload
5. ✅ Use LocalStack for S3 development

### Production

1. ✅ Use `docker-compose.yml` for production
2. ✅ Set strong passwords and secrets
3. ✅ Don't expose database ports externally (remove port mapping)
4. ✅ Use Docker secrets or environment variable injection
5. ✅ Set `DATABASE_SYNCHRONIZE=false`
6. ✅ Use managed databases (RDS, etc.) instead of containerized databases

### Security

1. ⚠️ Never commit `.env` files
2. ⚠️ Change default passwords
3. ⚠️ Use strong JWT secrets
4. ⚠️ Don't expose database ports in production
5. ⚠️ Use Docker networks for inter-container communication

---

## Migration Workflow

### Running Migrations in Docker

```bash
# Generate migration
docker-compose -f docker-compose.local.yml exec api npm run migration:generate --name=my_migration

# Run migrations
docker-compose -f docker-compose.local.yml exec api npm run migration:up

# Revert last migration
docker-compose -f docker-compose.local.yml exec api npm run migration:down
```

### Initial Setup

```bash
# Start services
docker-compose -f docker-compose.local.yml up -d

# Wait for database to be ready
sleep 5

# Run migrations
docker-compose -f docker-compose.local.yml exec api npm run migration:up

# Start the API
docker-compose -f docker-compose.local.yml restart api
```

---

## VS Code Integration

Add this to `.vscode/tasks.json` for quick Docker commands:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Docker: Start Local",
      "type": "shell",
      "command": "docker-compose -f docker-compose.local.yml up -d",
      "problemMatcher": []
    },
    {
      "label": "Docker: Stop Local",
      "type": "shell",
      "command": "docker-compose -f docker-compose.local.yml down",
      "problemMatcher": []
    },
    {
      "label": "Docker: Logs",
      "type": "shell",
      "command": "docker-compose -f docker-compose.local.yml logs -f",
      "problemMatcher": []
    }
  ]
}
```

---

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [Redis Docker Image](https://hub.docker.com/_/redis)
- [LocalStack Documentation](https://docs.localstack.cloud/)

---

**Last Updated**: 2026-03-13
