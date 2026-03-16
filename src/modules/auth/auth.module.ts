import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AccessTokenStrategy } from '@modules/auth/strategies/access-token.strategy';
import { RefreshTokenStrategy } from '@modules/auth/strategies/refresh-token.strategy';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '@database/entities/user.entity';
import { IsExistEmailValidator } from '@shared/validators';
import { UsersModule } from '@modules/users/users.module';
import { UsersService } from '@modules/users/users.service';
import { PostEntity } from '@database/entities/post.entity';
import { TokenBlacklistService } from './services/token-blacklist.service';
import { RedisModule } from '@modules/redis/redis.module';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserEntity, PostEntity]),
    UsersModule,
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    IsExistEmailValidator,
    UsersService,
    TokenBlacklistService,
  ],
  exports: [TokenBlacklistService],
})
export class AuthModule {}
