# Rate Limiting Guide

Rate limiting protects your API from abuse, brute force attacks, and denial of service.

## Overview

This project uses `@nestjs/throttler` for rate limiting with:
- **Global rate limiting** for all endpoints
- **Custom decorators** for auth endpoints with stricter limits
- **Configurable via environment variables**

---

## Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Default rate limits (for general API endpoints)
THROTTLE_TTL=60000          # Time window in milliseconds (60 seconds)
THROTTLE_LIMIT=100          # Max requests per time window

# Auth-specific rate limits
THROTTLE_LOGIN_TTL=60000    # Login: 1 minute window
THROTTLE_LOGIN_LIMIT=5      # Login: 5 attempts per minute

THROTTLE_REGISTER_TTL=3600000  # Register: 1 hour window
THROTTLE_REGISTER_LIMIT=3      # Register: 3 attempts per hour
```

### Rate Limit Defaults

| Endpoint | Limit | Time Window | Purpose |
|----------|-------|-------------|---------|
| **Login** | 5 requests | 1 minute | Prevent brute force attacks |
| **Register** | 3 requests | 1 hour | Prevent spam account creation |
| **Refresh** | 20 requests | 1 minute | Allow frequent token refresh |
| **Default** | 100 requests | 1 minute | General API protection |
| **Strict** | 10 requests | 1 minute | Sensitive operations |
| **Relaxed** | 200 requests | 1 minute | Read-heavy endpoints |

---

## Usage

### Available Decorators

#### 1. `@ThrottleLogin()`
Strict rate limiting for login endpoints (5 attempts/minute)

```typescript
import { ThrottleLogin } from '@decorators';

@ThrottleLogin()
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
```

#### 2. `@ThrottleRegister()`
Very strict rate limiting for registration (3 attempts/hour)

```typescript
import { ThrottleRegister } from '@decorators';

@ThrottleRegister()
@Post('register')
async register(@Body() dto: RegisterDto) {
  return this.authService.register(dto);
}
```

#### 3. `@ThrottleRefresh()`
Moderate rate limiting for token refresh (20 attempts/minute)

```typescript
import { ThrottleRefresh } from '@decorators';

@ThrottleRefresh()
@Get('refresh')
refresh(@User() user: any) {
  return this.authService.refresh(user.email, user.refreshToken);
}
```

#### 4. `@ThrottlePasswordReset()`
Rate limiting for password reset (3 attempts/15 minutes)

```typescript
import { ThrottlePasswordReset } from '@decorators';

@ThrottlePasswordReset()
@Post('reset-password')
async resetPassword(@Body() dto: ResetPasswordDto) {
  return this.authService.resetPassword(dto);
}
```

#### 5. `@ThrottleStrict()`
Strict rate limiting for sensitive operations (10 requests/minute)

```typescript
import { ThrottleStrict } from '@decorators';

@ThrottleStrict()
@Post('sensitive-operation')
async sensitiveOperation() {
  // ...
}
```

#### 6. `@ThrottleRelaxed()`
Relaxed rate limiting for read-heavy endpoints (200 requests/minute)

```typescript
import { ThrottleRelaxed } from '@decorators';

@ThrottleRelaxed()
@Get('public-data')
async getPublicData() {
  // ...
}
```

#### 7. `@ThrottleCustom(ttl, limit, name?)`
Custom rate limiting with configurable values

```typescript
import { ThrottleCustom } from '@decorators';

// 50 requests per 30 seconds
@ThrottleCustom(30000, 50, 'custom-endpoint')
@Get('custom')
async custom() {
  // ...
}
```

#### 8. `@SkipThrottle()`
Skip rate limiting for specific endpoints (use sparingly)

```typescript
import { SkipThrottle } from '@decorators';

@SkipThrottle()
@Get('health')
async healthCheck() {
  return { status: 'ok' };
}
```

---

## Response Headers

When rate limiting is active, these headers are included in responses:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests allowed |
| `X-RateLimit-Remaining` | Requests remaining in current window |
| `X-RateLimit-Reset` | Time when the limit resets (Unix timestamp) |
| `Retry-After` | Seconds to wait before retrying (on 429 error) |

---

## Error Response

When rate limit is exceeded, the API returns:

```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

---

## Implementation Details

### Global Guard

The `ThrottlerGuard` is registered globally in `app.module.ts`:

```typescript
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: 'default',
            ttl: configService.get<number>('app.throttle.ttl'),
            limit: configService.get<number>('app.throttle.limit'),
          },
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### Custom Decorators

Located in `src/decorators/throttle.decorator.ts`:

```typescript
export const THROTTLE_CONFIG = {
  LOGIN: { ttl: 60000, limit: 5 },
  REGISTER: { ttl: 3600000, limit: 3 },
  PASSWORD_RESET: { ttl: 900000, limit: 3 },
  REFRESH: { ttl: 60000, limit: 20 },
  DEFAULT: { ttl: 60000, limit: 100 },
  STRICT: { ttl: 60000, limit: 10 },
  RELAXED: { ttl: 60000, limit: 200 },
};
```

---

## Testing Rate Limits

### Using curl

```bash
# Test login rate limit (should fail after 5 attempts)
for i in {1..10}; do
  curl -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    -w "\nStatus: %{http_code}\n"
done
```

### Using Postman

1. Create a Collection Runner
2. Set iterations to 10
3. Run login request
4. Check response codes - should get 429 after 5 attempts

---

## Best Practices

### 1. Don't Skip Rate Limits
Only use `@SkipThrottle()` for:
- Health check endpoints
- Metrics endpoints
- Internal service communication

### 2. Use Appropriate Limits
- **Auth endpoints**: Strict (prevent brute force)
- **Write operations**: Moderate (prevent spam)
- **Read operations**: Relaxed (allow heavy usage)
- **Public APIs**: Based on expected traffic

### 3. Monitor Rate Limit Hits
Log when rate limits are exceeded to identify potential attacks:

```typescript
// Add to a custom ThrottlerGuard
protected throwThrottlingException(): void {
  this.logger.warn('Rate limit exceeded', {
    ip: this.request.ip,
    path: this.request.path,
  });
  throw new ThrottlerException();
}
```

### 4. Consider IP vs User-based Limits
The default implementation uses IP-based limiting. For user-based limits:

```typescript
// Custom tracker
@Injectable()
export class UserThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.user?.id || req.ip;
  }
}
```

---

## Endpoints with Rate Limiting

### Auth Controller

| Endpoint | Method | Rate Limit | Description |
|----------|--------|------------|-------------|
| `/auth/login` | POST | 5/min | User login |
| `/auth/register` | POST | 3/hour | User registration |
| `/auth/refresh` | GET | 20/min | Token refresh |
| `/auth/logout` | GET | Default | User logout |
| `/auth/get-user` | GET | Default | Get current user |

### Other Controllers

All other endpoints use the default rate limit (100 requests/minute) unless decorated otherwise.

---

## Troubleshooting

### Rate Limit Not Working?

1. **Check ThrottlerGuard is registered**
   ```typescript
   providers: [
     {
       provide: APP_GUARD,
       useClass: ThrottlerGuard,
     },
   ]
   ```

2. **Check environment variables**
   ```bash
   echo $THROTTLE_TTL
   echo $THROTTLE_LIMIT
   ```

3. **Check decorator order**
   Throttle decorators should be applied before route decorators.

### Too Many False Positives?

1. Increase `THROTTLE_LIMIT` in environment
2. Use `@ThrottleRelaxed()` for high-traffic endpoints
3. Consider user-based instead of IP-based limiting

### Testing in Development?

Use larger limits during development:
```env
THROTTLE_TTL=60000
THROTTLE_LIMIT=1000
THROTTLE_LOGIN_LIMIT=100
THROTTLE_REGISTER_LIMIT=100
```

---

## Security Considerations

### 1. Rate Limiting is NOT Enough
Combine with:
- CAPTCHA for registration
- Account lockout after failed logins
- IP blocking for persistent abusers
- Web Application Firewall (WAF)

### 2. Distributed Attacks
IP-based limits can be bypassed with multiple IPs. Consider:
- Redis-based distributed rate limiting
- User-based limits after authentication
- Cloudflare or similar services

### 3. Legitimate Users
Ensure limits don't impact real users:
- Monitor rate limit errors
- Provide clear error messages
- Allow retry after cooldown

---

## Files Modified

- `src/app.module.ts` - Added ThrottlerModule and ThrottlerGuard
- `src/config/app.config.ts` - Added throttle configuration
- `src/decorators/throttle.decorator.ts` - Created custom decorators
- `src/decorators/index.ts` - Exported throttle decorators
- `src/modules/auth/auth.controller.ts` - Applied rate limiting to auth endpoints
- `.env.example` - Added throttle environment variables

---

## References

- [NestJS Throttler Documentation](https://docs.nestjs.com/security/rate-limiting)
- [@nestjs/throttler npm](https://www.npmjs.com/package/@nestjs/throttler)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)

---

**Status**: ✅ Implemented
**Package**: @nestjs/throttler
**Tests**: All passing
