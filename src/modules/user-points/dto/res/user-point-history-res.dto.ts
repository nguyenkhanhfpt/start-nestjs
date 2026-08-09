import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { PaginatedDto } from '@shared/dtos/pagination.dto';
import { PointTransactionType } from '@shared/enums/point-transaction-type.enum';

export class UserPointHistoryItemDto {
  @ApiProperty({ example: 1, description: 'ID of the history record' })
  @Expose()
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the owning user' })
  @Expose()
  userId: number;

  @ApiProperty({
    enum: PointTransactionType,
    example: PointTransactionType.INCREASE,
    description: 'Type of the point transaction',
  })
  @Expose()
  type: PointTransactionType;

  @ApiProperty({
    example: 100,
    description: 'Amount of points affected by this transaction',
  })
  @Expose()
  amount: number;

  @ApiProperty({
    example: 250,
    description: 'Resulting balance right after this transaction',
  })
  @Expose()
  balanceAfter: number;

  @ApiProperty({
    example: 'Compensation for support ticket #123',
    description: 'Optional reason/note for this transaction',
    nullable: true,
  })
  @Expose()
  note: string;

  @ApiProperty({
    example: 2,
    description: 'ID of the admin who performed this transaction',
    nullable: true,
  })
  @Expose()
  performedBy: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Created at',
  })
  @Expose()
  createdAt: Date;
}

export class PaginatedUserPointHistoriesDto extends PaginatedDto(
  UserPointHistoryItemDto,
) {}
