import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubscriptionPlanResponseDto } from './subscription-plan-response.dto';

export class SubscriptionResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  ownerId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  planId!: string;

  @ApiPropertyOptional({ type: () => SubscriptionPlanResponseDto })
  plan?: SubscriptionPlanResponseDto;

  @ApiProperty({ example: 'active' })
  status!: string;

  @ApiPropertyOptional({ example: '2026-10-31' })
  startDate!: string | null;

  @ApiPropertyOptional({ example: '2026-11-30' })
  endDate!: string | null;

  @ApiProperty({ example: '2026-10-31T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-31T10:00:00.000Z' })
  updatedAt!: Date;
}
