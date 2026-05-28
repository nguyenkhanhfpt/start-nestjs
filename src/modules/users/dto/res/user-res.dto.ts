import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaginatedDto } from '@shared/dtos/pagination.dto';

export class UserItemDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'john@example.com', description: 'Email address' })
  @Expose()
  email: string;

  @ApiProperty({ example: '2024-01-01T00:00:00Z', description: 'Created at' })
  @Expose()
  createdAt: Date;
}

export class PaginatedUsersDto extends PaginatedDto(UserItemDto) {}
