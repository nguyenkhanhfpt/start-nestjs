# Postman Collection Guide

This guide explains how to import and use the Postman collection for testing the NestJS API.

## 📥 Import the Collection

### Method 1: Import from File
1. Open Postman
2. Click **File** → **Import**
3. Select the **postman_collection.json** file from the project root
4. Click **Import**

### Method 2: Copy as cURL
1. Copy the collection link
2. Open Postman
3. Click **Import** → **Paste Raw Text**
4. Paste the JSON and click **Import**

## 🔧 Setup Environment Variables

The collection uses environment variables to manage authentication tokens and base URL.

### Required Variables:
```
baseUrl: http://localhost:4000              # API base URL
accessToken: (auto-populated after login)   # JWT access token
refreshToken: (auto-populated after login)  # JWT refresh token
userId: (auto-populated after login)        # Current user ID
```

### Setting Variables Manually:
1. Click **Environments** (top right)
2. Create a new environment or edit the existing one
3. Add the variables above
4. Click **Save**

## 📋 Collection Structure

The collection is organized into 3 main folders (modules):

### 1. **Auth Module** (5 endpoints)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login with email/password
- `GET /auth/refresh` - Refresh access token
- `GET /auth/get-user` - Get current user info
- `GET /auth/logout` - Logout

### 2. **Users Module** (6 endpoints)
- `POST /users` - Create user
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `GET /users/:id/posts` - Get user's posts

### 3. **Posts Module** (5 endpoints)
- `POST /posts` - Create post
- `GET /posts` - Get all posts
- `GET /posts/:id` - Get post by ID
- `PATCH /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

## 🚀 Quick Start Workflow

### Step 1: Register a New User

1. Go to **Auth Module** → **Register**
2. The request body is pre-filled with example data:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "Password123"
   }
   ```
3. Click **Send**
4. The response will include `accessToken` and `refreshToken`
5. These tokens are **automatically saved** to environment variables

✅ **Result**: You now have valid tokens for authenticated requests

### Step 2: Create a Post

1. Go to **Posts Module** → **Create Post**
2. Pre-filled with example data:
   ```json
   {
     "title": "My First Post",
     "content": "This is the content of my first post. It must be at least 10 characters long."
   }
   ```
3. Click **Send** (no need to manually add Authorization header - it uses `{{accessToken}}`)
4. The created post will be returned with ID

✅ **Result**: Post successfully created

### Step 3: Fetch the Post

1. Go to **Posts Module** → **Get Post by ID**
2. The URL shows: `{{baseUrl}}/api/v1/posts/1`
3. Replace `1` with the actual post ID from Step 2
4. Click **Send**

✅ **Result**: Retrieved your created post

### Step 4: Update the Post

1. Go to **Posts Module** → **Update Post**
2. Update the request body with new data
3. Ensure the post ID in the URL is correct
4. Click **Send**

✅ **Result**: Post successfully updated

### Step 5: Delete the Post

1. Go to **Posts Module** → **Delete Post**
2. Ensure the correct post ID in URL
3. Click **Send**

✅ **Result**: Post successfully deleted

## 🔑 Authentication Flow

### Login Flow:
```
1. POST /auth/register  →  Get accessToken + refreshToken
                            ↓ (automatically saved)
2. All future requests use accessToken in Authorization header
                            ↓ (when token expires)
3. GET /auth/refresh    →  Get new accessToken
                            ↓ (automatically saved)
4. Continue with new token
```

### Tokens in Headers:
All protected endpoints automatically include:
```
Authorization: Bearer {{accessToken}}
```

### Token Expiration:
- **Access Token**: Expires in 1 hour
- **Refresh Token**: Expires in 7 days
- When access token expires, use the refresh endpoint to get a new one

## 📝 Request Examples

### Register/Login (Automatic Token Saving)
```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}

# Response automatically populates:
# accessToken: "eyJhbGc..."
# refreshToken: "eyJhbGc..."
# userId: 1
```

### Protected Request (Create Post)
```bash
POST /api/v1/posts
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
  "title": "Post Title",
  "content": "This is the post content. Must be at least 10 characters."
}
```

### Get User Posts
```bash
GET /api/v1/users/{{userId}}/posts
Authorization: Bearer {{accessToken}}
```

## ⚡ Pre-request Scripts

The collection includes **pre-request scripts** that automatically handle token management.

### What They Do:
1. **Login/Register endpoints** → Automatically save tokens to environment
2. **Refresh endpoint** → Automatically get and save new access token
3. **All protected endpoints** → Use saved access token in Authorization header

### Example Script (in Login endpoint):
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set('accessToken', jsonData.accessToken);
    pm.environment.set('refreshToken', jsonData.refreshToken);
    pm.environment.set('userId', jsonData.user.id);
    console.log('Login successful - tokens saved');
}
```

## 🐛 Common Issues & Solutions

### Issue: "Unauthorized" Error
**Cause**: Missing or invalid access token

**Solution**:
1. Run the **Login** or **Register** endpoint first
2. Check that `accessToken` is populated in environment variables
3. Verify the token hasn't expired (1 hour)

### Issue: "Invalid Email" Error
**Cause**: Email already exists or email format is wrong

**Solution**:
1. Use a different email for registration
2. Verify email format is valid
3. Check password has uppercase, lowercase, and number

### Issue: "Post Not Found" Error
**Cause**: Wrong post ID

**Solution**:
1. Get all posts first: `GET /posts`
2. Use the correct post ID from the list
3. Verify you're using the ID from the URL path, not body

### Issue: Can't Update/Delete Post
**Cause**: Not the post owner

**Solution**:
1. Only the post creator can update/delete
2. Create your own post first
3. Then update/delete that post

### Issue: No Authorization Header
**Cause**: Environment variable not set

**Solution**:
1. Ensure `accessToken` is populated in environment
2. Verify the header shows `Authorization: Bearer {{accessToken}}`
3. Run login endpoint again to refresh token

## 🔄 Refresh Token Flow

When your access token expires (1 hour):

1. Click **Refresh Token** endpoint
2. Uses `{{refreshToken}}` from environment
3. Automatically gets new `{{accessToken}}`
4. New token is saved to environment
5. All subsequent requests use new token

## 📊 Response Examples

### Successful Registration/Login:
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

### Get All Posts:
```json
[
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
]
```

### Error Response (400):
```json
{
  "statusCode": 400,
  "message": "Invalid email format",
  "error": "Bad Request"
}
```

## 🎯 Testing Workflow

### Test User Management:
1. **Register** → Create new user
2. **Get All Users** → List all users
3. **Get User by ID** → Fetch specific user
4. **Update User** → Modify user details
5. **Get User Posts** → View their posts
6. **Delete User** → Remove user

### Test Post Management:
1. **Create Post** → Add new post
2. **Get All Posts** → View all posts
3. **Get Post by ID** → Fetch specific post
4. **Update Post** → Edit post content
5. **Delete Post** → Remove post

### Test Authentication:
1. **Register** → Create account
2. **Login** → Get tokens
3. **Get Current User** → Verify logged-in user
4. **Refresh Token** → Get new token
5. **Logout** → End session

## 🔐 Security Notes

### Token Management:
- Never share access tokens in chat or commits
- Tokens are stored locally in Postman environment
- Clear tokens before sharing Postman workspace

### Request Body Validation:
- **Email**: Must be valid email format, unique in system
- **Password**: Must have uppercase, lowercase, and number
- **Post Title**: 3-255 characters
- **Post Content**: 10-10000 characters

### Database Port (Docker):
If running with Docker:
- Database is on `localhost:5440` (not 5432)
- Redis is on `localhost:6380` (not 6379)
- Update `baseUrl` if needed: `http://localhost:4000`

## 💡 Tips & Tricks

### Tip 1: Duplicate Requests
Right-click any request → **Duplicate** to create variations

### Tip 2: Save Responses
Click **Save Response** → **Save as Example** to store example responses

### Tip 3: Auto-run Collections
Use **Collection Runner** to run multiple requests sequentially

### Tip 4: Monitor Requests
Use **Postman Monitor** to schedule collection runs

### Tip 5: Share Collection
Click **Share** to share collection with team members

## 📚 Related Documentation

- [CLAUDE.md](./CLAUDE.md) - Project architecture
- [DOCKER.md](./DOCKER.md) - Docker setup
- [QUICK_START.md](./QUICK_START.md) - Getting started
- [ISSUES_AND_ROADMAP.md](./ISSUES_AND_ROADMAP.md) - Known issues and planned features

---

**Last Updated**: 2026-03-13
**API Version**: v1
**Collection Version**: 1.0
