import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PostAuthorDto } from './post-response.dto';

export class PostCommentResponseDto {
  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174002' })
  id!: string;

  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174001' })
  postId!: string;

  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiPropertyOptional({ type: () => PostAuthorDto })
  user?: PostAuthorDto;

  @ApiProperty({ example: 'Đội mình có 3 người, giao lưu được không bạn?' })
  content!: string;

  @ApiProperty({ example: '2026-10-30T10:05:00.000Z' })
  createdAt!: Date;
}
