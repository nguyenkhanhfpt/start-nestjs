import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import * as redisStore from 'cache-manager-ioredis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const driver = configService.get<string>('app.cacheDriver');

        if (driver === 'redis') {
          return {
            store: redisStore,
            host: configService.get('app.redis.host'),
            port: configService.get('app.redis.port'),
            ttl: configService.get('app.redis.ttl'),
            password: configService.get('app.redis.password'),
          };
        }

        return {
          ttl: configService.get('app.redis.ttl') ?? 3600,
        };
      },
    }),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
