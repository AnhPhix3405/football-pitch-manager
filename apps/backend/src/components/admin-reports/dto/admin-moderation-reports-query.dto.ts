import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export const MODERATION_TYPES = ['all', 'post', 'review', 'user'] as const;
export type ModerationTypeFilter = (typeof MODERATION_TYPES)[number];

export const MODERATION_STATUSES = ['all', 'pending', 'resolved'] as const;
export type ModerationStatusFilter = (typeof MODERATION_STATUSES)[number];

export class AdminModerationReportsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: MODERATION_TYPES, default: 'all' })
  @IsOptional()
  @IsIn(MODERATION_TYPES)
  type?: ModerationTypeFilter = 'all';

  @ApiPropertyOptional({ enum: MODERATION_STATUSES, default: 'all' })
  @IsOptional()
  @IsIn(MODERATION_STATUSES)
  status?: ModerationStatusFilter = 'all';

  @ApiPropertyOptional({
    description: 'Tìm theo mã báo cáo, tác giả, lý do vi phạm',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Từ thời điểm (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Đến thời điểm (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
