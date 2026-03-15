# Docker Port Conflict Fix - Summary

## Problem

When running `docker-compose.local.yml up`, you encountered port conflicts:

```
Error: bind: address already in use
```

This happened because Docker was trying to map PostgreSQL to port 5432 and Redis to port 6379, which were already in use by your local PostgreSQL and Redis installations.

## Solution Implemented

Changed the port mapping strategy to use **different external ports** for Docker containers while keeping internal container ports unchanged.

### Port Mapping Changes

| Service | Before (Conflict) | After (No Conflict) | Container Internal |
|---------|------------------|---------------------|-------------------|
| PostgreSQL | `5432:5432` | **`5440:5432`** | 5432 |
| Redis | `6379:6379` | **`6400:6379`** | 6379 |
| LocalStack | `4566:4566` | `4566:4566` | 4566 |

### How It Works

**Before:**
```yaml
database:
  ports:
    - "5432:5432"  # ❌ Conflicts with local PostgreSQL
```

**After:**
```yaml
database:
  ports:
    # Map to port 5440 on host to avoid conflict with local PostgreSQL (5432)
    # Container internal port remains 5432
    - "${DATABASE_PORT_EXTERNAL:-5440}:5432"  # ✅ No conflict!
```

## Files Modified

### 1. `docker-compose.local.yml` ✅
- Changed PostgreSQL port mapping to `5440:5432`
- Changed Redis port mapping to `6400:6379`
- Added environment variable support for `DATABASE_PORT_EXTERNAL` and `REDIS_PORT_EXTERNAL`
- Added helpful comments explaining port mapping

### 2. `docker-compose.yml` ✅
- Updated for consistency with local development
- Added environment variable support for production flexibility

### 3. `.env.example` ✅ NEW FILE
- Created dedicated environment file for local Docker development
- Documents the port mapping strategy
- Includes connection examples for both app and host machine access
- Contains helpful comments explaining the difference between internal and external ports

## Files Created

### 1. `DOCKER.md` ✅ NEW FILE
Comprehensive Docker documentation including:
- Quick start guide
- Port mapping explanation
- Troubleshooting guide
- Common commands
- Database connection examples
- Best practices

### 2. `QUICK_START.md` ✅ NEW FILE
Step-by-step guide for new developers:
- Docker setup (recommended)
- Local setup (without Docker)
- Testing instructions
- Common commands
- Troubleshooting

### 3. `DOCKER_PORT_FIX_SUMMARY.md` ✅ NEW FILE
This file - explains the port conflict fix.

### 4. Updated `CLAUDE.md` ✅
- Added Docker section with port mapping table
- Added Docker commands
- Added references to new documentation files

## How to Use

### Start Docker Services (No More Conflicts!)

```bash
# 1. Copy the local development environment file
cp .env.example .env

# 2. Start all services
docker-compose -f docker-compose.local.yml up -d

# 3. Verify services are running
docker-compose -f docker-compose.local.yml ps
```

### Connect to Services

#### From Your Application (Inside Docker)

The application runs **inside Docker** and connects to other containers using Docker service names and **internal ports**:

```bash
# .env configuration for app
DATABASE_HOST=database    # Docker service name
DATABASE_PORT=5432        # Internal container port
REDIS_HOST=redis          # Docker service name
REDIS_PORT=6379           # Internal container port
```

#### From Your Host Machine (Database Clients)

When connecting from your **local machine** (e.g., TablePlus, Redis CLI), use **external ports**:

**PostgreSQL:**
```bash
psql -h localhost -p 5440 -U postgres_user -d postgres
```

**Redis:**
```bash
redis-cli -h localhost -p 6400 -a redispass
```

**Database GUI (TablePlus, pgAdmin, DBeaver):**
```
Host: localhost
Port: 5440       # ← Note: 5440, not 5432!
Database: postgres
User: postgres_user
Password: secret
```

## Benefits

### ✅ No More Port Conflicts
- Your local PostgreSQL (5432) and Docker PostgreSQL (5440) can run simultaneously
- Your local Redis (6379) and Docker Redis (6400) can run simultaneously

### ✅ Clear Separation
- Easy to identify which database you're connecting to
- Port 5432/6379 → Local services
- Port 5440/6400 → Docker services

### ✅ Flexibility
- Can customize ports via environment variables
- Different configurations for local, staging, and production
- Easy to troubleshoot connection issues

### ✅ Team Consistency
- Everyone uses the same port mapping
- No more "works on my machine" issues
- Clear documentation for new team members

## Environment Variable Reference

### For Docker Development (`.env.example`)

```bash
# Database connection from app (inside Docker)
DATABASE_HOST=database          # Docker service name
DATABASE_PORT=5432              # Internal container port

# Database port exposed to host machine
DATABASE_PORT_EXTERNAL=5440     # External port (avoid conflict)

# Redis connection from app (inside Docker)
REDIS_HOST=redis                # Docker service name
REDIS_PORT=6379                 # Internal container port

# Redis port exposed to host machine
REDIS_PORT_EXTERNAL=6400        # External port (avoid conflict)
```

### For Local Development (`.env.example`)

```bash
# Database connection (no Docker)
DATABASE_HOST=localhost
DATABASE_PORT=5432              # Standard PostgreSQL port

# Redis connection (no Docker)
REDIS_HOST=localhost
REDIS_PORT=6379                 # Standard Redis port
```

## Troubleshooting

### Still Getting Port Conflict?

1. **Check what's using the ports:**
   ```bash
   lsof -i :5440
   lsof -i :6400
   ```

2. **Change to different ports in `.env`:**
   ```bash
   DATABASE_PORT_EXTERNAL=5434
   REDIS_PORT_EXTERNAL=6381
   ```

3. **Restart Docker services:**
   ```bash
   docker-compose -f docker-compose.local.yml down
   docker-compose -f docker-compose.local.yml up -d
   ```

### Can't Connect to Database from App

Ensure your `.env` file uses Docker service names:

```bash
DATABASE_HOST=database    # ✅ Correct for Docker
# DATABASE_HOST=localhost  # ❌ Wrong for Docker
```

### Can't Connect to Database from Host

Ensure you're using the external port:

```bash
psql -h localhost -p 5440  # ✅ Correct external port
# psql -h localhost -p 5432  # ❌ Wrong, that's your local PostgreSQL
```

## Migration Guide

If you're upgrading from the old configuration:

```bash
# 1. Stop old containers
docker-compose -f docker-compose.local.yml down

# 2. Copy new environment file
cp .env.example .env

# 3. Update your database GUI connections to use port 5440
# (TablePlus, pgAdmin, etc.)

# 4. Update your Redis GUI connections to use port 6400
# (RedisInsight, etc.)

# 5. Start with new configuration
docker-compose -f docker-compose.local.yml up -d

# 6. Run migrations
docker-compose -f docker-compose.local.yml exec api npm run migration:up
```

## Additional Resources

- [DOCKER.md](./DOCKER.md) - Comprehensive Docker documentation
- [QUICK_START.md](./QUICK_START.md) - Quick start guide for new developers
- [CLAUDE.md](./CLAUDE.md) - Project architecture and development guide
- [Docker Compose Port Mapping](https://docs.docker.com/compose/networking/)

## Summary

✅ **Problem Solved**: Docker containers now use ports 5440 (PostgreSQL) and 6400 (Redis) to avoid conflicts with local services

✅ **Easy to Use**: Simple copy `.env.example` and start Docker

✅ **Well Documented**: Three new documentation files explain everything

✅ **Flexible**: Customize ports via environment variables if needed

✅ **Team Ready**: Clear guidelines for everyone on the team

---

**Last Updated**: 2026-03-13
**Status**: ✅ Fixed and Documented
