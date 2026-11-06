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

export const ADMIN_USER_ROLE_FILTERS = [
  'all',
  'user',
  'owner',
  'admin',
] as const;
export type AdminUserRoleFilter = (typeof ADMIN_USER_ROLE_FILTERS)[number];

export const ADMIN_USER_STATUS_FILTERS = [
  'all',
  'active',
  'suspended',
  'inactive',
  'pending_verification',
] as const;
export type AdminUserStatusFilter = (typeof ADMIN_USER_STATUS_FILTERS)[number];

export class AdminUsersQueryDto {
  @ApiPropertyOptional({
    description: 'Search by full name, email, or phone number',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    enum: ADMIN_USER_ROLE_FILTERS,
    default: 'all',
  })
  @IsOptional()
  @IsIn(ADMIN_USER_ROLE_FILTERS)
  role?: AdminUserRoleFilter = 'all';

  @ApiPropertyOptional({
    enum: ADMIN_USER_STATUS_FILTERS,
    default: 'all',
  })
  @IsOptional()
  @IsIn(ADMIN_USER_STATUS_FILTERS)
  status?: AdminUserStatusFilter = 'all';

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
