import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export const ADMIN_MUTABLE_USER_STATUSES = ['active', 'suspended'] as const;
export type AdminMutableUserStatus =
  (typeof ADMIN_MUTABLE_USER_STATUSES)[number];

export class UpdateUserStatusDto {
  @ApiProperty({
    enum: ADMIN_MUTABLE_USER_STATUSES,
    example: 'suspended',
  })
  @IsIn(ADMIN_MUTABLE_USER_STATUSES)
  status!: AdminMutableUserStatus;

  @ApiPropertyOptional({
    description: 'Optional moderation reason when locking/unlocking user',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
