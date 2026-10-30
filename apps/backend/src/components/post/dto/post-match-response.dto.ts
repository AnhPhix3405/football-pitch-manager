import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostAuthorDto } from './post-response.dto';

export class PostMatchResponseDto {
  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174003' })
  id!: string;

  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174001' })
  postId!: string;

  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174004' })
  applicantId!: string;

  @ApiPropertyOptional({ type: () => PostAuthorDto })
  applicant?: PostAuthorDto;

  @ApiProperty({ example: 'pending' })
  status!: string;

  @ApiPropertyOptional({ example: '223e4567-e89b-12d3-a456-426614174005' })
  conversationId!: string | null;

  @ApiProperty({ example: '2026-10-30T10:10:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-30T10:10:00.000Z' })
  updatedAt!: Date;
}
