import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaginatedDto } from '@shared/dtos/pagination.dto';

export class GetUserPostsResDto {
  @ApiProperty({ example: 1, description: 'Post ID' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'My First Post', description: 'Post Title' })
  @Expose()
  title: string;

  @ApiProperty({
    example: 'This is the content of my first post.',
    description: 'Post Content',
  })
  @Expose()
  content: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Post Creation Date',
  })
  @Expose()
  createdAt: string;
}

export class PaginatedUserPostsDto extends PaginatedDto(GetUserPostsResDto) {}
