import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaginatedDto } from '@shared/dtos/pagination.dto';

export class UserPointItemDto {
  @ApiProperty({ example: 1, description: 'ID of the user point record' })
  @Expose()
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the owning user' })
  @Expose()
  userId: number;

  @ApiProperty({ example: 150, description: 'Current point balance' })
  @Expose()
  balance: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Created at',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Last updated at',
  })
  @Expose()
  updatedAt: Date;
}

export class PaginatedUserPointsDto extends PaginatedDto(UserPointItemDto) {}
