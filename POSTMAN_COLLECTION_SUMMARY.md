# Postman Collection Summary

Complete Postman collection for testing the NestJS API with all endpoints organized by module.

## 📦 What's Included

### File: `postman_collection.json`
- **16 Total Endpoints** across 3 modules
- **Organized Folder Structure** - One folder per module
- **Pre-request Scripts** - Automatic token management
- **Environment Variables** - baseUrl, accessToken, refreshToken, userId
- **Example Requests** - Pre-filled with valid sample data
- **Example Responses** - Shows expected response formats
- **Comprehensive Documentation** - Each endpoint has detailed descriptions

## 📁 Module Breakdown

### Auth Module (5 endpoints)
```
├── Register (POST)          - Create new user account
├── Login (POST)             - Authenticate user
├── Refresh Token (GET)      - Get new access token
├── Get Current User (GET)   - Fetch logged-in user info
└── Logout (GET)             - End user session
```

### Users Module (6 endpoints)
```
├── Create User (POST)       - Create new user
├── Get All Users (GET)      - List all users
├── Get User by ID (GET)     - Fetch specific user
├── Update User (PATCH)      - Modify user details
├── Delete User (DELETE)     - Remove user
└── Get User Posts (GET)     - Fetch user's posts
```

### Posts Module (5 endpoints)
```
├── Create Post (POST)       - Create new post
├── Get All Posts (GET)      - List all posts
├── Get Post by ID (GET)     - Fetch specific post
├── Update Post (PATCH)      - Modify post
└── Delete Post (DELETE)     - Remove post
```

## 🚀 Quick Start

### 1. Import Collection
```bash
# In Postman:
File → Import → postman_collection.json
```

### 2. Register a User
```bash
# Go to: Auth Module → Register
# Pre-filled data:
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
# Click Send → Tokens auto-saved to environment ✅
```

### 3. Create a Post
```bash
# Go to: Posts Module → Create Post
# Pre-filled data:
{
  "title": "My First Post",
  "content": "This is the content of my first post..."
}
# Click Send → Post created ✅
```

### 4. Get All Posts
```bash
# Go to: Posts Module → Get All Posts
# Click Send → See all posts with author info ✅
```

## 🔑 Environment Variables

All automatically managed via pre-request scripts:

| Variable | Purpose | Set By |
|----------|---------|--------|
| `baseUrl` | API base URL | Manual (default: http://localhost:4000) |
| `accessToken` | JWT access token | Login/Register endpoint |
| `refreshToken` | JWT refresh token | Login/Register endpoint |
| `userId` | Current user ID | Login/Register endpoint |

### Manual Setup (Optional):
```bash
# If needed, set in Postman Environment:
baseUrl: http://localhost:4000
accessToken: <your-jwt-token>
refreshToken: <your-jwt-token>
userId: <user-id>
```

## 🔐 Authentication

### Flow:
1. **Register** or **Login** → Get tokens
2. Tokens automatically saved to environment
3. All protected endpoints use `Authorization: Bearer {{accessToken}}`
4. When token expires (1 hour), use **Refresh Token** endpoint
5. New token automatically saved

### Token Expiration:
- **Access Token**: 1 hour
- **Refresh Token**: 7 days

## 📊 Endpoint Summary Table

| Module | Method | Endpoint | Auth | Status |
|--------|--------|----------|------|--------|
| **Auth** | POST | /auth/register | ❌ | ✅ |
| | POST | /auth/login | ❌ | ✅ |
| | GET | /auth/refresh | ❌ | ✅ |
| | GET | /auth/get-user | ✅ | ✅ |
| | GET | /auth/logout | ✅ | ✅ |
| **Users** | POST | /users | ✅ | ⚠️ Incomplete |
| | GET | /users | ✅ | ✅ |
| | GET | /users/:id | ✅ | ✅ |
| | PATCH | /users/:id | ✅ | ⚠️ Incomplete |
| | DELETE | /users/:id | ✅ | ✅ |
| | GET | /users/:id/posts | ✅ | ✅ |
| **Posts** | POST | /posts | ✅ | ✅ |
| | GET | /posts | ✅ | ✅ |
| | GET | /posts/:id | ✅ | ✅ |
| | PATCH | /posts/:id | ✅ | ✅ |
| | DELETE | /posts/:id | ✅ | ✅ |

**Legend:**
- ✅ = Fully implemented
- ⚠️ = Partially implemented
- ❌ = Public (no auth required)

## 🎯 Common Testing Workflows

### Test 1: User Registration & Authentication
```
1. Register                    → Create account
2. Get Current User           → Verify logged-in user
3. Refresh Token              → Get new token
4. Logout                     → End session
```

### Test 2: Post CRUD Operations
```
1. Create Post                → Create new post
2. Get All Posts              → List all posts
3. Get Post by ID             → Fetch specific post
4. Update Post                → Edit post
5. Delete Post                → Remove post
```

### Test 3: User Management
```
1. Get All Users              → List all users
2. Get User by ID             → Fetch specific user
3. Update User                → Modify user
4. Get User Posts             → View user's posts
5. Delete User                → Remove user
```

## 📝 Request/Response Examples

### Register Response:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Create Post Response:
```json
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "userId": 1,
  "createdAt": "2026-03-13T10:15:00.000Z",
  "updatedAt": "2026-03-13T10:15:00.000Z"
}
```

### Get Post Response:
```json
{
  "id": 1,
  "title": "My First Post",
  "content": "This is the content of my first post.",
  "userId": 1,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  },
  "createdAt": "2026-03-13T10:15:00.000Z",
  "updatedAt": "2026-03-13T10:15:00.000Z"
}
```

## ⚙️ Configuration

### Port Mapping (Docker):
```
API:        http://localhost:4000
Database:   localhost:5440 (Docker) or 5432 (Local)
Redis:      localhost:6380 (Docker) or 6379 (Local)
```

### Update baseUrl if needed:
```
Local Development:  http://localhost:4000
Docker Development: http://localhost:4000 (same, port exposed on 4000)
Production:        https://your-api-domain.com
```

## 🔍 Pre-request Scripts

Automatically manage tokens for you:

### Login/Register Script:
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set('accessToken', jsonData.accessToken);
    pm.environment.set('refreshToken', jsonData.refreshToken);
    pm.environment.set('userId', jsonData.user.id);
}
```

### Refresh Token Script:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set('accessToken', jsonData.accessToken);
    pm.environment.set('refreshToken', jsonData.refreshToken);
}
```

## ⚠️ Known Issues

### 1. Incomplete User CRUD
- Create user DTO is empty
- Update user DTO is incomplete
- Consider implementing proper DTOs

### 2. No Token Blacklist
- Logout doesn't invalidate tokens
- Tokens remain valid until expiration
- TODO: Implement token blacklist

### 3. No Pagination
- Get all endpoints return all records
- No limit/offset parameters
- TODO: Add pagination support

### 4. No Rate Limiting
- Auth endpoints vulnerable to brute force
- TODO: Add rate limiting

### 5. Missing Error Handling
- Some edge cases not handled
- See ISSUES_AND_ROADMAP.md for details

## 📚 Documentation

For more information:
- **Setup Guide**: [QUICK_START.md](./QUICK_START.md)
- **Detailed Usage**: [POSTMAN_GUIDE.md](./POSTMAN_GUIDE.md)
- **Known Issues**: [ISSUES_AND_ROADMAP.md](./ISSUES_AND_ROADMAP.md)
- **Architecture**: [CLAUDE.md](./CLAUDE.md)
- **Docker Setup**: [DOCKER.md](./DOCKER.md)

## 🎓 Testing Best Practices

### 1. Always Start with Auth
```
Register/Login → Get tokens → Use in other requests
```

### 2. Verify Responses
Check status codes and response structure match examples

### 3. Test Error Cases
Try invalid data to verify error handling

### 4. Test Authorization
Try accessing resources you don't own (should fail)

### 5. Check Timestamps
Verify `createdAt` and `updatedAt` are correct

## 🤝 Share Collection

To share with team:
1. Click **Share** in Postman
2. Generate share link
3. Team members import from link
4. All requests and pre-scripts included

## 📦 Export for CI/CD

Can be used in CI/CD pipelines:
```bash
# Run with Newman (Postman CLI)
npm install -g newman
newman run postman_collection.json
```

## ✅ Checklist for API Testing

- [ ] Register new user
- [ ] Login with credentials
- [ ] Get current user info
- [ ] Create a post
- [ ] Fetch all posts
- [ ] Fetch single post
- [ ] Update post
- [ ] Delete post
- [ ] Get user posts
- [ ] Refresh access token
- [ ] Logout
- [ ] Test invalid email
- [ ] Test short password
- [ ] Test missing fields
- [ ] Test unauthorized access

---

**Status**: ✅ Complete
**Last Updated**: 2026-03-13
**Total Endpoints**: 16
**Total Collections**: 3 (Auth, Users, Posts)
