import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscriptionPlanResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'Gói Hội Viên Vàng' })
  name!: string;

  @ApiProperty({ example: '199000.00' })
  price!: string;

  @ApiProperty({ example: 30 })
  durationDays!: number;

  @ApiPropertyOptional({ example: { aiQuotaDaily: 50 } })
  benefit!: Record<string, unknown> | null;

  @ApiProperty({ example: true })
  isActive!: boolean;

  @ApiProperty({ example: '2026-10-31T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-31T10:00:00.000Z' })
  updatedAt!: Date;
}
