import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @ApiPropertyOptional({
    description: 'Trạng thái bài đăng: open (đang mở), matched (đã ghép), closed (đã đóng)',
    example: 'open',
    enum: ['open', 'matched', 'closed'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['open', 'matched', 'closed'], { message: 'Trạng thái không hợp lệ' })
  status?: string;
}
