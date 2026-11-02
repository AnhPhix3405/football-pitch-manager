import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewUserSummaryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'nguyenvana' })
  username!: string;

  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  fullName?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string | null;
}

export class FieldReviewResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  fieldId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174003' })
  reviewerId!: string;

  @ApiPropertyOptional({ type: () => ReviewUserSummaryDto })
  reviewer?: ReviewUserSummaryDto;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174004' })
  bookingId!: string;

  @ApiProperty({ example: 5 })
  rating!: number;

  @ApiPropertyOptional({ example: 'Mặt sân cỏ rất đẹp, phục vụ tốt' })
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
