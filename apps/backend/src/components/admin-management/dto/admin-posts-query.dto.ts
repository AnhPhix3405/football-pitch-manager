import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export const ADMIN_POST_STATUS_FILTERS = [
  'all',
  'open',
  'matched',
  'closed',
] as const;
export type AdminPostStatusFilter = (typeof ADMIN_POST_STATUS_FILTERS)[number];

export class AdminPostsQueryDto {
  @ApiPropertyOptional({
    description: 'Search by post title, content, or author name/email',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: ADMIN_POST_STATUS_FILTERS,
    default: 'all',
  })
  @IsOptional()
  @IsIn(ADMIN_POST_STATUS_FILTERS)
  status?: AdminPostStatusFilter = 'all';

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
