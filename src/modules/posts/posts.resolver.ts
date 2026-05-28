import { Post } from '@models';
import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { PaginationQueryDto } from '@shared/dtos/pagination.dto';

// AccessTokenGuard is already applied globally via APP_GUARD in AppModule —
// no need to re-declare it here (doing so would cause a DI scope error
// because TokenBlacklistService is not exported into PostsModule).
@Resolver(() => Post)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @Query(() => [Post], { name: 'posts' })
  async findAll() {
    const query = new PaginationQueryDto();
    const result = await this.postsService.findAll(query);
    return result.items;
  }

  @Query(() => Post, { name: 'post' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.postsService.findOne(id);
  }
}
