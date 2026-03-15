# Quick Start Guide

Get up and running with this NestJS starter project in under 5 minutes!

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (recommended)
- Git

## Option 1: Docker Setup (Recommended) ⭐

This is the easiest way to get started, especially if you have PostgreSQL or Redis already running on your local machine.

### Steps

```bash
# 1. Clone the repository (if not already done)
git clone <your-repo-url>
cd start-nestjs

# 2. Copy the local development environment file
cp .env.example .env

# 3. Generate strong JWT secrets (run this command twice)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 4. Update .env with the generated secrets
# Replace JWT_ACCESS_SECRET and JWT_REFRESH_SECRET values

# 5. Install dependencies (for IDE support)
npm install

# 6. Start all services (PostgreSQL, Redis, API, Worker)
docker-compose -f docker-compose.local.yml up -d

# 7. Run database migrations
docker-compose -f docker-compose.local.yml exec api npm run migration:up

# 8. Check if everything is running
docker-compose -f docker-compose.local.yml ps

# 9. View API logs
docker-compose -f docker-compose.local.yml logs -f api
```

### Access Points

- **API**: http://localhost:4000
- **Swagger Docs**: http://localhost:4000/api
- **PostgreSQL**: `localhost:5440` (user: postgres_user, password: secret)
- **Redis**: `localhost:6400` (password: redispass)

### Port Mapping (Important!)

Docker uses **different ports** to avoid conflicts with your local services:

| Service | Your Local Machine | Docker External Port |
|---------|-------------------|---------------------|
| PostgreSQL | 5432 (your local DB) | **5440** (Docker) |
| Redis | 6379 (your local Redis) | **6400** (Docker) |

This means you can keep your local PostgreSQL and Redis running without any conflicts!

---

## Option 2: Local Development (Without Docker)

If you prefer to run everything locally without Docker:

### Prerequisites

- PostgreSQL 15+ installed and running
- Redis installed and running

### Steps

```bash
# 1. Clone the repository (if not already done)
git clone <your-repo-url>
cd start-nestjs

# 2. Copy the environment file
cp .env.example .env

# 3. Generate strong JWT secrets (run this command twice)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# 4. Update .env file
# Set DATABASE_HOST=localhost
# Set REDIS_HOST=localhost
# Update JWT secrets with generated values

# 5. Install dependencies
npm install

# 6. Create database
psql -U postgres -c "CREATE DATABASE postgres;"
psql -U postgres -c "CREATE USER postgres_user WITH PASSWORD 'secret';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE postgres TO postgres_user;"

# 7. Run migrations
npm run migration:up

# 8. Start the API server
npm run start:dev

# 9. In a separate terminal, start the worker
npm run start:worker
```

---

## Testing the Setup

### 1. Health Check

```bash
curl http://localhost:4000/
```

Expected response:
```json
"Hello World!"
```

### 2. Register a User

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123"
  }'
```

Expected response:
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Access Swagger Documentation

Open your browser and go to:
```
http://localhost:4000/api
```

You'll see the interactive API documentation where you can test all endpoints!

---

## Common Commands

### Docker Commands

```bash
# Start services
docker-compose -f docker-compose.local.yml up -d

# Stop services
docker-compose -f docker-compose.local.yml down

# View logs
docker-compose -f docker-compose.local.yml logs -f

# Restart a service
docker-compose -f docker-compose.local.yml restart api

# Run migrations
docker-compose -f docker-compose.local.yml exec api npm run migration:up

# Access database
docker-compose -f docker-compose.local.yml exec database psql -U postgres_user -d postgres

# Access Redis
docker-compose -f docker-compose.local.yml exec redis redis-cli -a redispass
```

### Development Commands

```bash
# Start in dev mode
npm run start:dev

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format

# Generate migration
npm run migration:generate --name=my_migration

# Run migrations
npm run migration:up

# Revert migration
npm run migration:down
```

---

## Connecting to the Database

### From Your Host Machine

#### Using psql (Command Line)

```bash
# With Docker
psql -h localhost -p 5440 -U postgres_user -d postgres

# Without Docker
psql -h localhost -p 5432 -U postgres_user -d postgres
```

#### Using GUI Tools (TablePlus, pgAdmin, DBeaver)

**With Docker:**
```
Host: localhost
Port: 5440
Database: postgres
Username: postgres_user
Password: secret
```

**Without Docker:**
```
Host: localhost
Port: 5432
Database: postgres
Username: postgres_user
Password: secret
```

---

## Troubleshooting

### Port Already in Use

**Error:**
```
Error: bind: address already in use
```

**Solution:**

With Docker, this shouldn't happen because we use ports 5440 and 6400. If you still get this error:

1. Check what's using the port:
   ```bash
   lsof -i :5440
   ```

2. Change the port in `.env`:
   ```bash
   DATABASE_PORT_EXTERNAL=5434
   ```

### Can't Connect to Database

**Docker:**
- Make sure containers are running: `docker-compose -f docker-compose.local.yml ps`
- Check logs: `docker-compose -f docker-compose.local.yml logs database`
- Ensure you're using port 5440 (not 5432!)

**Local:**
- Make sure PostgreSQL is running: `brew services list`
- Check connection: `psql -h localhost -U postgres_user -d postgres`

### Migrations Failed

```bash
# Check database connection
docker-compose -f docker-compose.local.yml exec api npm run typeorm -- query "SELECT 1"

# Drop and recreate (⚠️ deletes all data!)
docker-compose -f docker-compose.local.yml down -v
docker-compose -f docker-compose.local.yml up -d
docker-compose -f docker-compose.local.yml exec api npm run migration:up
```

---

## Next Steps

1. ✅ Read [CLAUDE.md](./CLAUDE.md) for architecture overview
2. ✅ Read [DOCKER.md](./DOCKER.md) for detailed Docker documentation
3. ✅ Read [ISSUES_AND_ROADMAP.md](./ISSUES_AND_ROADMAP.md) for known issues and planned features
4. ✅ Explore the Swagger documentation at http://localhost:4000/api
5. ✅ Check out the example endpoints in `src/modules/`

---

## Project Structure

```
src/
├── modules/          # Feature modules (auth, users, posts, queue)
├── database/         # TypeORM entities and migrations
├── guards/           # Authentication guards
├── decorators/       # Custom decorators (@Public, @User)
├── filters/          # Exception filters
├── interceptors/     # Response transformation
├── shared/           # Shared utilities, constants, validators
├── config/           # Configuration files
├── models/           # GraphQL models
├── main.ts          # API entry point
└── main-worker.ts   # Worker entry point
```

---

## Support

- **Issues**: Create an issue in the repository
- **Documentation**: See CLAUDE.md, DOCKER.md, and ISSUES_AND_ROADMAP.md
- **Swagger**: http://localhost:4000/api

---

**Happy Coding! 🚀**
