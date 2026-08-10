import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { UserPointHistoryEntity } from '@database/entities/user-point-history.entity';
import { PointTransactionType } from '@shared/enums/point-transaction-type.enum';

export class AdjustUserPointDto {
  public static readonly resource = UserPointHistoryEntity.name;

  @ApiProperty({
    enum: PointTransactionType,
    description: 'Type of the point transaction',
    example: PointTransactionType.INCREASE,
  })
  @IsNotEmpty()
  @IsEnum(PointTransactionType)
  type: PointTransactionType;

  @ApiProperty({
    description: 'Amount of points to increase/decrease (positive integer)',
    example: 100,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  amount: number;

  @ApiPropertyOptional({
    description: 'Optional reason/note for this adjustment',
    example: 'Compensation for support ticket #123',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
