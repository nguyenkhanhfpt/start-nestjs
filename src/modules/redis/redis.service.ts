import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private get client() {
    return (
      this.cacheManager.store as any
    ).getClient() as import('ioredis').Redis;
  }

  /**
   * Get a value from the cache
   * @param key - The key to get
   * @returns The value or undefined if it doesn't exist
   */
  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get(key);
  }

  /**
   * Set a value in the cache
   * @param key - The key to set
   * @param value - The value to set
   * @param ttl - The time to live in seconds
   * @returns void
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const options = ttl ? { ttl } : {};
    return await this.cacheManager.set(key, value, options as any);
  }

  /**
   * Delete a value from the cache
   * @param key - The key to delete
   * @returns void
   */
  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  /**
   * Wrap a function in the cache
   * @param key - The key to wrap
   * @param fn - The function to wrap
   * @param ttl - The time to live in seconds
   * @returns The value
   */
  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    return await this.cacheManager.wrap(key, fn, ttl);
  }

  /**
   * Get a value from the cache; if it does not exist, set it and return the provided value
   * @param key - The cache key
   * @param value - The value to store when the key is missing
   * @param ttl - Time to live in seconds (optional)
   * @returns The cached value if it exists, otherwise the provided value after storing it
   */
  async getOrSet<T>(key: string, value: T, ttl?: number): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== undefined && cached !== null) {
      return cached;
    }

    await this.set(key, value, ttl);

    return value;
  }

  /**
   * Scan all non-expired keys in Redis matching the given pattern
   * Uses SCAN instead of KEYS to avoid blocking the Redis server on large datasets
   * @param pattern - Glob-style pattern to filter keys (default: '*' for all keys)
   * @returns Array of matching key names
   */
  async getAllKeys(pattern = '*'): Promise<string[]> {
    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, batch] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      keys.push(...batch);
      cursor = nextCursor;
    } while (cursor !== '0');

    return keys;
  }
}
