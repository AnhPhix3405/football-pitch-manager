import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional({
    description: 'ID người dùng muốn nhắn tin trực tiếp',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  targetUserId?: string;

  @ApiPropertyOptional({
    description: 'ID sân bóng muốn nhắn tin hỏi thông tin',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  relatedFieldId?: string;

  @ApiPropertyOptional({
    description: 'ID bài đăng tìm đối muốn liên hệ',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsOptional()
  @IsUUID()
  relatedPostId?: string;

  @ApiPropertyOptional({
    description: 'Loại hội thoại (direct, field, post)',
    example: 'direct',
  })
  @IsOptional()
  @IsString()
  type?: string;
}
