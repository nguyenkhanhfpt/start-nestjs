import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Expose, Type as TransformType } from 'class-transformer';

export class PaginationQueryDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number (starts at 1)',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of items per page (max 100)',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }
}

export class PaginationMetaDto {
  @ApiProperty({ example: 100, description: 'Total number of items' })
  @Expose()
  total: number;

  @ApiProperty({ example: 1, description: 'Current page' })
  @Expose()
  page: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  @Expose()
  limit: number;

  @ApiProperty({ example: 10, description: 'Total number of pages' })
  @Expose()
  totalPages: number;

  constructor(total: number, page: number, limit: number) {
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
  }
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMetaDto;
}

// Factory to create typed paginated DTO class, used with @Serialize
export function PaginatedDto<TItem>(ItemDto: new (...args: any[]) => TItem) {
  class PaginatedDtoClass {
    @ApiProperty({ isArray: true, type: () => ItemDto })
    @Expose()
    @TransformType(() => ItemDto)
    items: TItem[];

    @ApiProperty({ type: () => PaginationMetaDto })
    @Expose()
    @TransformType(() => PaginationMetaDto)
    meta: PaginationMetaDto;
  }

  return PaginatedDtoClass;
}
