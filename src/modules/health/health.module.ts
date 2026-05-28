import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';
import { RedisModule } from '@modules/redis/redis.module';

@Module({
  imports: [
    TerminusModule.forRoot({
      // Graceful error logging — set to false to use your own logger
      errorLogStyle: 'pretty',
    }),
    RedisModule, // provides CACHE_MANAGER for RedisHealthIndicator
  ],
  controllers: [HealthController],
  providers: [RedisHealthIndicator],
})
export class HealthModule {}
