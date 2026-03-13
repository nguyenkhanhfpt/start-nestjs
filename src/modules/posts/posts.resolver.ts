import { Post } from '@models';
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { AccessTokenGuard } from '@guards';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Post)
@UseGuards(AccessTokenGuard)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post], { name: 'posts' })
  findAll() {
    return this.postsService.findAll();
  }

  @Query(() => Post, { name: 'post' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.findOne(id);
  }
}
