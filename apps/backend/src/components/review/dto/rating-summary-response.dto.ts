import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FieldRatingSummaryResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  fieldId!: string;

  @ApiProperty({ example: '4.80' })
  avgRating!: string;

  @ApiProperty({ example: 25 })
  totalReviews!: number;

  @ApiProperty({ example: '4.583' })
  bayesianScore!: string;

  @ApiProperty({ example: '2026-10-31T10:00:00.000Z' })
  updatedAt!: Date;
}

export class UserRatingSummaryResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiProperty({ example: '4.90' })
  avgRating!: string;

  @ApiProperty({ example: 10 })
  totalReviews!: number;

  @ApiPropertyOptional({ example: '4.65' })
  sportsmanshipScore!: string;

  @ApiProperty({ example: '2026-10-31T10:00:00.000Z' })
  updatedAt!: Date;
}
