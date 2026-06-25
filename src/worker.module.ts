import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import databaseConfig from '@config/database.config';
import appConfig from '@config/app.config';
import { QueueModule } from '@modules/queue/queue.module';
import { QueueProcessor } from '@modules/queue/processors/queue.processor';
import { QueueListener } from '@modules/queue/listeners/queue.listener';
import { PostEntity } from '@database/entities/post.entity';
import { UserEntity } from '@database/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, appConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get('database'),
    }),
    TypeOrmModule.forFeature([PostEntity, UserEntity]),
    QueueModule,
  ],
  providers: [QueueProcessor, QueueListener],
})
export class WorkerModule {}
