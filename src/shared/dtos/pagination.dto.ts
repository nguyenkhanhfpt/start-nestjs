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

export class CursorPaginationQueryDto {
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

  @ApiPropertyOptional({
    example: 18923456,
    description: 'Cursor (id of the last item from the previous page)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  cursor?: number;
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

export class CursorPaginationMetaDto {
  @ApiProperty({
    example: 23000000,
    description: 'Estimated total number of items',
  })
  @Expose()
  totalEstimate: number;

  @ApiProperty({ example: 10, description: 'Items per page' })
  @Expose()
  limit: number;

  @ApiProperty({
    example: 18923456,
    description: 'Cursor for the next page (null when there is no next page)',
    nullable: true,
  })
  @Expose()
  nextCursor: number | null;

  @ApiProperty({ example: true, description: 'Whether a next page exists' })
  @Expose()
  hasNextPage: boolean;

  constructor(
    totalEstimate: number,
    limit: number,
    nextCursor: number | null,
    hasNextPage: boolean,
  ) {
    this.totalEstimate = totalEstimate;
    this.limit = limit;
    this.nextCursor = nextCursor;
    this.hasNextPage = hasNextPage;
  }
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMetaDto;
}

export interface CursorPaginatedResult<T> {
  items: T[];
  meta: CursorPaginationMetaDto;
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

// Factory to create typed cursor-paginated DTO class, used with @Serialize
export function CursorPaginatedDto<TItem>(
  ItemDto: new (...args: any[]) => TItem,
) {
  class CursorPaginatedDtoClass {
    @ApiProperty({ isArray: true, type: () => ItemDto })
    @Expose()
    @TransformType(() => ItemDto)
    items: TItem[];

    @ApiProperty({ type: () => CursorPaginationMetaDto })
    @Expose()
    @TransformType(() => CursorPaginationMetaDto)
    meta: CursorPaginationMetaDto;
  }

  return CursorPaginatedDtoClass;
}
