import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiMatchSuggestionResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  postId!: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174001',
    nullable: true,
  })
  recommendedUserId!: string | null;

  @ApiProperty({ example: 88 })
  compatibilityScore!: number;

  @ApiProperty({
    example:
      'Người chơi có điểm tinh thần thể thao cao (4.8/5.0) và lịch sử tham gia trận đấu đầy đủ.',
  })
  reason!: string;

  @ApiProperty({ example: 120 })
  tokensUsed!: number;

  @ApiProperty({ example: 'mock' })
  provider!: string;
}
