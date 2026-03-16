import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@modules/redis/redis.service';
import { JwtService } from '@nestjs/jwt';

/**
 * Token Blacklist Service
 * Manages blacklisted tokens to implement proper logout functionality
 * Tokens are stored in Redis with TTL equal to token expiration time
 */
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);
  private readonly BLACKLIST_PREFIX = 'blacklist:';

  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Add a token to the blacklist
   * @param token - JWT token to blacklist
   * @returns Promise<void>
   */
  async blacklistToken(token: string): Promise<void> {
    try {
      // Decode token to get expiration time
      const decoded = this.jwtService.decode(token) as {
        exp: number;
      };

      if (!decoded || !decoded.exp) {
        this.logger.warn('Invalid token format for blacklisting');
        return;
      }

      // Calculate TTL: token expiration timestamp - current time (in seconds)
      const now = Math.floor(Date.now() / 1000);
      const ttl = decoded.exp - now;

      // Only add to blacklist if token hasn't already expired
      if (ttl > 0) {
        const key = `${this.BLACKLIST_PREFIX}${token}`;
        await this.redisService.set(key, true, ttl);
        this.logger.log(`Token blacklisted with TTL of ${ttl} seconds`);
      }
    } catch (error) {
      this.logger.error(`Error blacklisting token: ${error.message}`);
      // Don't throw error - logout should succeed even if blacklist fails
    }
  }

  /**
   * Check if a token is blacklisted
   * @param token - JWT token to check
   * @returns Promise<boolean> - true if blacklisted, false otherwise
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    try {
      const key = `${this.BLACKLIST_PREFIX}${token}`;
      const result = await this.redisService.get(key);

      return result === true;
    } catch (error) {
      this.logger.error(`Error checking token blacklist: ${error.message}`);
      // On Redis error, allow token (fail open) to avoid lockout
      return false;
    }
  }

  /**
   * Blacklist all tokens for a user (logout all devices)
   * Note: This is a simple implementation. For production, consider:
   * - Store user ID in token
   * - Implement pattern-based deletion
   * @param userId - User ID
   * @returns Promise<void>
   */
  async blacklistUserTokens(userId: number): Promise<void> {
    try {
      // In a production system, you would:
      // 1. Find all tokens for this user from a token registry
      // 2. Blacklist all of them
      // For now, this is a placeholder
      this.logger.log(`Logout all devices for user ${userId}`);
    } catch (error) {
      this.logger.error(`Error blacklisting user tokens: ${error.message}`);
    }
  }

  /**
   * Clear a specific token from blacklist (useful for testing)
   * @param token - JWT token to remove from blacklist
   * @returns Promise<void>
   */
  async removeFromBlacklist(token: string): Promise<void> {
    try {
      const key = `${this.BLACKLIST_PREFIX}${token}`;
      await this.redisService.del(key);
      this.logger.log('Token removed from blacklist');
    } catch (error) {
      this.logger.error(
        `Error removing token from blacklist: ${error.message}`,
      );
    }
  }
}
