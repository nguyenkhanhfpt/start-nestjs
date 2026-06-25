import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DEFAULT_QUEUE_NAME, JOB_NAME } from '@shared/constants';

@Injectable()
export class SeedUsersCommand {
  private readonly logger = new Logger(SeedUsersCommand.name);

  constructor(@InjectQueue(DEFAULT_QUEUE_NAME) private readonly queue: Queue) {}

  /**
   * Enqueue a SEED_USERS job; the worker handles all DB writes.
   * This keeps the command process lean — no DB connection needed here.
   */
  async run(count: number): Promise<void> {
    if (count <= 0) {
      this.logger.error('count must be a positive integer');
      process.exit(1);
    }

    this.logger.log(`Enqueuing job: seed ${count} users`);

    const job = await this.queue.add(JOB_NAME.SEED_USERS, { count });

    this.logger.log(`Job enqueued successfully (jobId=${job.id})`);
  }
}
