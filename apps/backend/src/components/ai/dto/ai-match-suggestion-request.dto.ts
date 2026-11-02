import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AiMatchSuggestionRequestDto {
  @ApiProperty({
    description: 'ID của bài đăng tìm đối / ghép trận (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(undefined, { message: 'postId phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'postId không được để trống' })
  postId!: string;
}
