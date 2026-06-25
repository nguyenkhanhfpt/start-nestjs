import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from '@config/app.config';
import { QueueModule } from '@modules/queue/queue.module';
import { CreatePostsCommand } from './create-posts.command';
import { SeedUsersCommand } from './seed-users.command';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Only app config needed — queue Redis settings live here; no DB required
      load: [appConfig],
    }),
    QueueModule,
  ],
  providers: [CreatePostsCommand, SeedUsersCommand],
})
export class CommandModule {}
