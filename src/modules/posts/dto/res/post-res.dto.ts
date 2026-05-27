import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginatedDto } from '@shared/dtos/pagination.dto';

export class UserItemDto {
  @ApiProperty({
    description: 'ID of the user',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
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
  @ApiProperty({
    description: 'ID of the post',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Title of the post',
    example: 'My First Post',
  })
  @Expose()
  title: string;

  @ApiProperty({
    description: 'Content of the post',
    example: 'This is the content of my first post.',
  })
  @Expose()
  content: string;

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
}

export class PaginatedPostsDto extends PaginatedDto(PostItemDto) {}
