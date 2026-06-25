import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { DEFAULT_QUEUE_NAME, JOB_NAME } from '@shared/constants';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '@database/entities/post.entity';
import { UserEntity } from '@database/entities/user.entity';
import { hashPassword } from '@shared/utils';

const POST_CHUNK_SIZE = 500;
const USER_CHUNK_SIZE = 300;

@Processor(DEFAULT_QUEUE_NAME)
export class QueueProcessor extends WorkerHost {
  private readonly logger = new Logger(QueueProcessor.name);

  constructor(
    @InjectRepository(PostEntity)
    private readonly postRepository: Repository<PostEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super();
  }

  // Entry point for all BullMQ jobs — dispatches to the correct handler based on job name.
  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} [${job.name}]`, job.data);

    switch (job.name) {
      case JOB_NAME.SEED_POSTS:
        return this.handleCreatePosts(job.data);
      case JOB_NAME.SEED_USERS:
        return this.handleSeedUsers(job.data);
      default:
        return true;
    }
  }

  // Inserts posts in batches of POST_CHUNK_SIZE to avoid loading too many records into memory at once.
  private async handleCreatePosts(data: {
    count: number;
    userId: number;
  }): Promise<void> {
    const { count, userId } = data;
    this.logger.log(`Creating ${count} posts for user ${userId}`);

    for (let offset = 0; offset < count; offset += POST_CHUNK_SIZE) {
      const batchSize = Math.min(POST_CHUNK_SIZE, count - offset);
      const posts = Array.from({ length: batchSize }, (_, i) =>
        this.postRepository.create({
          title: `Auto Post ${offset + i + 1}`,
          content: `This is the auto-generated content for post ${offset + i + 1}.`,
          userId,
        }),
      );
      await this.postRepository.save(posts);
      this.logger.log(`Inserted ${offset + batchSize}/${count} posts`);
    }

    this.logger.log(`Done: created ${count} posts for user ${userId}`);
  }

  // Inserts users in batches of USER_CHUNK_SIZE. Password is hashed once and reused across all rows
  // to avoid running bcrypt (an intentionally slow algorithm) for every single record.
  // runId is a timestamp prefix that makes emails and usernames unique across multiple seed runs.
  private async handleSeedUsers(data: { count: number }): Promise<void> {
    const { count } = data;
    this.logger.log(`Seeding ${count} users`);

    const hashedPassword = await hashPassword('Aa@123456');
    const runId = Date.now();

    for (let offset = 0; offset < count; offset += USER_CHUNK_SIZE) {
      const batchSize = Math.min(USER_CHUNK_SIZE, count - offset);
      const users = Array.from({ length: batchSize }, (_, i) => {
        const index = offset + i + 1;
        return this.userRepository.create({
          name: `Seed User ${index}`,
          username: `seed_${runId}_${index}`,
          email: `seed-${runId}-${index}@example.com`,
          bio: `Bio for user ${runId}-${index}`,
          phone: `${runId}`,
          password: hashedPassword,
        });
      });
      await this.userRepository.save(users);
      this.logger.log(`Inserted ${offset + batchSize}/${count} users`);
    }

    this.logger.log(`Done: seeded ${count} users`);
  }
}
