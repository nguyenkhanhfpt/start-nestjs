import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { CursorPaginatedDto } from '@shared/dtos/pagination.dto';

export class UserItemDto {
  @ApiProperty({ description: 'ID of the user', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Name of the user', example: 'John Doe' })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'abc@gmail.com',
  })
  @Expose()
  email: string;
}

export class PostItemDto {
  @ApiProperty({ description: 'ID of the post', example: 1 })
  @Expose()
  id: number;

  @ApiProperty({ description: 'Title of the post', example: 'My First Post' })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Content of the post',
    example: 'This is the content of my first post.',
  })
  @Expose()
  content: string;

  @ApiProperty({ description: 'Thumbnail filename', example: 'default.jpg' })
  @Expose()
  thumbnail: string;

  @ApiProperty({ description: 'Number of likes', example: 0 })
  @Expose()
  likeCount: number;

  @ApiProperty({ description: 'Number of comments', example: 0 })
  @Expose()
  commentCount: number;

  @ApiProperty({
    description: 'ID of the user who created the post',
    example: 1,
  })
  @Expose()
  userId: number;

  @ApiProperty({
    description: 'User who created the post',
    type: () => UserItemDto,
  })
  @Expose()
  @Type(() => UserItemDto)
  user: UserItemDto;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  @Expose()
  createdAt: Date;
}

// List view omits `content` (large text column) — it is not selected by findAll
export class PostListItemDto extends OmitType(PostItemDto, [
  'content',
] as const) {}

export class PaginatedPostsDto extends CursorPaginatedDto(PostListItemDto) {}
