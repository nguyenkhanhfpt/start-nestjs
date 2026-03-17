import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';

/**
 * Rate limit configuration for different operation types
 */
export const THROTTLE_CONFIG = {
  // Login: 5 attempts per minute (strict)
  LOGIN: { ttl: 60000, limit: 5 },

  // Register: 3 attempts per hour (very strict - prevent spam accounts)
  REGISTER: { ttl: 3600000, limit: 3 },

  // Password reset: 3 attempts per 15 minutes
  PASSWORD_RESET: { ttl: 900000, limit: 3 },

  // Token refresh: 20 attempts per minute
  REFRESH: { ttl: 60000, limit: 20 },

  // General API: 100 requests per minute
  DEFAULT: { ttl: 60000, limit: 100 },

  // Strict: 10 requests per minute (for sensitive operations)
  STRICT: { ttl: 60000, limit: 10 },

  // Relaxed: 200 requests per minute (for read-heavy endpoints)
  RELAXED: { ttl: 60000, limit: 200 },
};

/**
 * Apply strict rate limiting for login endpoints
 * 5 attempts per minute to prevent brute force attacks
 */
export const ThrottleLogin = () =>
  applyDecorators(
    Throttle({ default: THROTTLE_CONFIG.LOGIN }),
    SetMetadata('throttle:name', 'login'),
  );

/**
 * Apply very strict rate limiting for registration
 * 3 attempts per hour to prevent spam account creation
 */
export const ThrottleRegister = () =>
  applyDecorators(
    Throttle({ default: THROTTLE_CONFIG.REGISTER }),
    SetMetadata('throttle:name', 'register'),
  );

/**
 * Apply rate limiting for password reset requests
 * 3 attempts per 15 minutes
 */
export const ThrottlePasswordReset = () =>
  applyDecorators(
    Throttle({ default: THROTTLE_CONFIG.PASSWORD_RESET }),
    SetMetadata('throttle:name', 'password-reset'),
  );

/**
 * Apply rate limiting for token refresh
 * 20 attempts per minute (more relaxed than login)
 */
export const ThrottleRefresh = () =>
  applyDecorators(
    Throttle({ default: THROTTLE_CONFIG.REFRESH }),
    SetMetadata('throttle:name', 'refresh'),
  );

/**
 * Apply strict rate limiting for sensitive operations
 * 10 requests per minute
 */
export const ThrottleStrict = () =>
  applyDecorators(
    Throttle({ default: THROTTLE_CONFIG.STRICT }),
    SetMetadata('throttle:name', 'strict'),
  );

/**
 * Apply relaxed rate limiting for read-heavy endpoints
 * 200 requests per minute
 */
export const ThrottleRelaxed = () =>
  applyDecorators(
    Throttle({ default: THROTTLE_CONFIG.RELAXED }),
    SetMetadata('throttle:name', 'relaxed'),
  );

/**
 * Custom rate limit decorator with configurable TTL and limit
 * @param ttl - Time window in milliseconds
 * @param limit - Maximum number of requests in the time window
 * @param name - Optional name for identification
 */
export const ThrottleCustom = (ttl: number, limit: number, name?: string) =>
  applyDecorators(
    Throttle({ default: { ttl, limit } }),
    SetMetadata('throttle:name', name || 'custom'),
  );

/**
 * Skip rate limiting for specific endpoints
 * Use sparingly - only for health checks, metrics, etc.
 */
export { SkipThrottle };
