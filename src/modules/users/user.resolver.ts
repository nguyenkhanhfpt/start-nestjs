import { User } from '@models';
import { Resolver } from '@nestjs/graphql';
import { Query, Args, Int } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '@guards';
import { UseGuards } from '@nestjs/common';

@Resolver(() => User)
@UseGuards(AccessTokenGuard)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.usersService.findOne(id);
  }
}
