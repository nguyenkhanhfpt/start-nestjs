import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DEFAULT_QUEUE_NAME, JOB_NAME } from '@shared/constants';

@Injectable()
export class CreatePostsCommand {
  private readonly logger = new Logger(CreatePostsCommand.name);

  constructor(@InjectQueue(DEFAULT_QUEUE_NAME) private readonly queue: Queue) {}

  // Validates `count`, then enqueues a SEED_POSTS job and logs the assigned job ID.
  // Exits the process immediately if `count` is invalid — this runs as a CLI command, not an HTTP request.
  async run(count: number): Promise<void> {
    if (count <= 0) {
      this.logger.error('count must be a positive integer');
      process.exit(1);
    }

    this.logger.log(`Enqueuing job: create ${count} posts for userId=1`);

    const job = await this.queue.add(JOB_NAME.SEED_POSTS, {
      count,
      userId: 1,
    });

    this.logger.log(`Job enqueued successfully (jobId=${job.id})`);
  }
}
