import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewUserSummaryDto } from './field-review-response.dto';

export class UserReviewResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  targetUserId!: string;

  @ApiPropertyOptional({ type: () => ReviewUserSummaryDto })
  targetUser?: ReviewUserSummaryDto;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  reviewerId!: string;

  @ApiPropertyOptional({ type: () => ReviewUserSummaryDto })
  reviewer?: ReviewUserSummaryDto;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174004' })
  postId!: string;

  @ApiProperty({ example: 5 })
  rating!: number;

  @ApiPropertyOptional({ example: 'Thi đấu rất nhiệt tình và fair-play' })
  comment!: string | null;

  @ApiProperty({ example: false })
  isFlagged!: boolean;

  @ApiPropertyOptional({ example: null })
  flagReason!: string | null;

  @ApiProperty({ example: '2026-10-31T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-31T10:00:00.000Z' })
  updatedAt!: Date;
}
