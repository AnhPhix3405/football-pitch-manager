import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PostAuthorDto {
  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'nguyenvana' })
  username!: string;

  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  fullName?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatarUrl?: string | null;
}

export class PostResponseDto {
  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174001' })
  id!: string;

  @ApiProperty({ example: '223e4567-e89b-12d3-a456-426614174000' })
  userId!: string;

  @ApiPropertyOptional({ type: () => PostAuthorDto })
  user?: PostAuthorDto;

  @ApiProperty({ example: 'Tìm 2 người đá sân 7 tối nay' })
  title!: string;

  @ApiPropertyOptional({ example: 'Cần kèo giao lưu vui vẻ, sân cỏ nhân tạo' })
  content!: string | null;

  @ApiPropertyOptional({ example: '10.7768890' })
  lat!: string | null;

  @ApiPropertyOptional({ example: '106.7008060' })
  lng!: string | null;

  @ApiProperty({ example: '2026-10-31' })
  playDate!: string;

  @ApiProperty({ example: '18:00:00' })
  startTime!: string;

  @ApiPropertyOptional({ example: '19:30:00' })
  endTime!: string | null;

  @ApiPropertyOptional({ example: 'intermediate' })
  skillLevelRequired!: string | null;

  @ApiProperty({ example: 14 })
  maxPlayers!: number;

  @ApiProperty({ example: 2 })
  currentPlayers!: number;

  @ApiProperty({ example: 'open' })
  status!: string;

  @ApiProperty({ example: '2026-10-30T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-10-30T10:00:00.000Z' })
  updatedAt!: Date;
}
