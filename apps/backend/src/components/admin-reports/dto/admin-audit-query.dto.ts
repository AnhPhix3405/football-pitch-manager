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

export const AUDIT_CATEGORIES = [
  'ALL',
  'AUTH',
  'APPROVAL',
  'MODERATION',
  'USER_STATUS',
  'PAYMENT',
  'SYSTEM',
] as const;

export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

export class AdminAuditQueryDto {
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

  @ApiPropertyOptional({
    description: 'Tìm theo actor, action, target hoặc IP',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: AUDIT_CATEGORIES, default: 'ALL' })
  @IsOptional()
  @IsIn(AUDIT_CATEGORIES)
  category?: AuditCategory = 'ALL';

  @ApiPropertyOptional({ description: 'Từ thời điểm (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Đến thời điểm (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
