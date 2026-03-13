import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';
import { DEFAULT_QUEUE_NAME } from '@shared/constants';
import { Logger } from '@nestjs/common';

@QueueEventsListener(DEFAULT_QUEUE_NAME)
export class QueueListener extends QueueEventsHost {
  private readonly logger = new Logger(QueueListener.name);

  @OnQueueEvent('active')
  onActive(job: { jobId: string; prev?: string }) {
    this.logger.log(`Processing job ${job.jobId}...`);
  }

  @OnQueueEvent('completed')
  onCompleted(job: { jobId: string; returnvalue: any }) {
    this.logger.log(`Job ${job.jobId} completed!`);
  }

  @OnQueueEvent('failed')
  onFailed(job: { jobId: string; failedReason: string }) {
    this.logger.error(`Job ${job.jobId} failed: ${job.failedReason}`);
  }
}
