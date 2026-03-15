import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DEFAULT_QUEUE_NAME } from '@shared/constants';
import { Logger } from '@nestjs/common';

@Processor(DEFAULT_QUEUE_NAME)
export class QueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueProcessor.name);

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} [${job.name}]`, job.data);

    return true;
  }
}
