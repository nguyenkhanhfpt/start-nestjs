import { User } from '@models';
import { Resolver } from '@nestjs/graphql';
import { Query, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { PaginationQueryDto } from '@shared/dtos/pagination.dto';

// AccessTokenGuard is already applied globally via APP_GUARD in AppModule —
// no need to re-declare it here (doing so would cause a DI scope error
// because TokenBlacklistService is not exported into UsersModule).
@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  async findAll() {
    const query = new PaginationQueryDto();
    const result = await this.usersService.findAll(query);
    return result.items;
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }
}
