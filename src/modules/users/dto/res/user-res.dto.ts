import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaginatedDto } from '@shared/dtos/pagination.dto';

export class UserItemDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'john_doe', description: 'Username' })
  @Expose()
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @Expose()
  email: string;

  @ApiProperty({ example: 'default.jpg', description: 'Avatar filename' })
  @Expose()
  avatar: string;

  @ApiPropertyOptional({
    example: 'Software engineer',
    description: 'Short bio',
  })
  @Expose()
  bio: string;

  @ApiPropertyOptional({ example: '+84912345678', description: 'Phone number' })
  @Expose()
  phone: string;

  @ApiProperty({ example: true, description: 'Account active status' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  @Expose()
  createdAt: Date;
}

export class PaginatedUsersDto extends PaginatedDto(UserItemDto) {}
