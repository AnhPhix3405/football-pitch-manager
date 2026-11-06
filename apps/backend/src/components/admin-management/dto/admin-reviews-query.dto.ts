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

export const ADMIN_REVIEW_STATUS_FILTERS = [
  'all',
  'pending',
  'resolved',
] as const;
export type AdminReviewStatusFilter =
  (typeof ADMIN_REVIEW_STATUS_FILTERS)[number];

export const ADMIN_REVIEW_TYPE_FILTERS = ['all', 'field', 'user'] as const;
export type AdminReviewTypeFilter = (typeof ADMIN_REVIEW_TYPE_FILTERS)[number];

export class AdminReviewsQueryDto {
  @ApiPropertyOptional({
    description: 'Search by comment, flag reason, author, or target name',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: ADMIN_REVIEW_STATUS_FILTERS,
    default: 'all',
  })
  @IsOptional()
  @IsIn(ADMIN_REVIEW_STATUS_FILTERS)
  status?: AdminReviewStatusFilter = 'all';

  @ApiPropertyOptional({
    enum: ADMIN_REVIEW_TYPE_FILTERS,
    default: 'all',
  })
  @IsOptional()
  @IsIn(ADMIN_REVIEW_TYPE_FILTERS)
  reviewType?: AdminReviewTypeFilter = 'all';

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
