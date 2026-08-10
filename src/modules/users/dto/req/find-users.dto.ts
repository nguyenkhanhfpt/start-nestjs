import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '@shared/dtos/pagination.dto';

export class FindUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Fuzzy search users by name',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
