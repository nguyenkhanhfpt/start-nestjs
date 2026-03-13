import { PostEntity } from '@database/entities/post.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePostDto {
  public static readonly resource = PostEntity.name;

  @ApiProperty({
    description: 'Title of the post',
    example: 'My First Post',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Content of the post',
    example: 'This is the content of my first post.',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(10000)
  content: string;
}
