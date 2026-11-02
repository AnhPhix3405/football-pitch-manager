import { ApiProperty } from '@nestjs/swagger';

export class AiUsageResponseDto {
  @ApiProperty({ example: 2 })
  dailyRequestsUsed!: number;

  @ApiProperty({ example: 50 })
  dailyQuota!: number;

  @ApiProperty({ example: 48 })
  remainingRequests!: number;

  @ApiProperty({ example: 350 })
  totalTokensUsed!: number;
}
