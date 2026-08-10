import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { UpdatePostDto } from './dto/req/update-post.dto';
import { User as UserDecorator } from '@decorators/user.decorator';
import { UserEntity } from '@database/entities/user.entity';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { ApiErrorsResponse, ApiGetErrorsResponse } from '@decorators';
import { CreatePostDto } from './dto/req/create-post.dto';
import { PostItemDto, PaginatedPostsDto } from './dto/res/post-res.dto';
import { Serialize } from '@interceptors';
import { CursorPaginationQueryDto } from '@shared/dtos/pagination.dto';

@ApiBearerAuth()
@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'Post has been successfully created.',
  })
  @ApiErrorsResponse()
  create(
    @Body() createPostDto: CreatePostDto,
    @UserDecorator('id') userId: number,
  ) {
    return this.postsService.create(createPostDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts (cursor paginated)' })
  @ApiResponse({
    status: 200,
    description: 'Returns a cursor-paginated list of posts.',
    type: PaginatedPostsDto,
  })
  @ApiGetErrorsResponse()
  @Serialize(PaginatedPostsDto)
  findAll(
    @Query() query: CursorPaginationQueryDto,
  ): Promise<PaginatedPostsDto> {
    return this.postsService.findAll(query) as any;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Returns the post with the specified ID.',
    type: PostItemDto,
  })
  @ApiGetErrorsResponse()
  @Serialize(PostItemDto)
  findOne(@Param('id', ParseIntPipe) id: number): Promise<PostItemDto> {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Post has been successfully updated.',
  })
  @ApiErrorsResponse()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @UserDecorator() user: UserEntity,
  ) {
    return this.postsService.update(id, updatePostDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'Post ID', example: '1' })
  @ApiResponse({
    status: 200,
    description: 'Post has been successfully deleted.',
  })
  @ApiGetErrorsResponse()
  remove(
    @Param('id', ParseIntPipe) id: number,
    @UserDecorator() user: UserEntity,
  ) {
    return this.postsService.remove(id, user.id);
  }
}
