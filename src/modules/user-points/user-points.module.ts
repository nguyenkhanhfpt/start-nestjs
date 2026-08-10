import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPointEntity } from '@database/entities/user-point.entity';
import { UserPointHistoryEntity } from '@database/entities/user-point-history.entity';
import { UserPointsService } from './user-points.service';
import { UserPointsController } from './user-points.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserPointEntity, UserPointHistoryEntity]),
  ],
  controllers: [UserPointsController],
  providers: [UserPointsService],
})
export class UserPointsModule {}
