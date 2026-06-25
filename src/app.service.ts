import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { DEFAULT_QUEUE_NAME, JOB_NAME } from '@shared/constants';
import { t } from '@shared/utils';
import { Query } from '@nestjs/graphql';

@Injectable()
export class AppService {
  constructor(@InjectQueue(DEFAULT_QUEUE_NAME) private queue: Queue) {}

  @Query(() => String)
  getHello(): string {
    return t('common.hello');
  }

  // Pushes a SEED_POSTS job onto the queue so the worker creates `count` posts asynchronously.
  async triggerCreatePosts(count: number): Promise<{ jobId: string }> {
    const job = await this.queue.add(JOB_NAME.SEED_POSTS, {
      count,
      userId: 1,
    });
    return { jobId: job.id };
  }
}
