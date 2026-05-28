import { Controller, Get, Version, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';
import { Public } from '@decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  /**
   * Liveness probe — is the process alive?
   * K8s / Docker will restart the container if this returns non-2xx.
   */
  @Get('liveness')
  @Version(VERSION_NEUTRAL)
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Returns 200 if the process is alive.',
  })
  @ApiResponse({ status: 200, description: 'App is alive' })
  @ApiResponse({ status: 503, description: 'App is not alive' })
  liveness() {
    return this.health.check([
      // Heap must stay below 300 MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }

  /**
   * Readiness probe — is the process ready to serve traffic?
   * K8s will stop routing requests to this pod if this returns non-2xx.
   */
  @Get('readiness')
  @Version(VERSION_NEUTRAL)
  @Public()
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness probe',
    description:
      'Returns 200 if the app can serve traffic (DB + Redis reachable).',
  })
  @ApiResponse({ status: 200, description: 'App is ready' })
  @ApiResponse({
    status: 503,
    description: 'App is not ready (dependency down)',
  })
  readiness() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
