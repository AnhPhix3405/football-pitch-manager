import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Nội dung bình luận',
    example: 'Đội mình xin ghép trận này nhé, có sẵn bóng thi đấu.',
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung bình luận không được để trống' })
  @MaxLength(1000, { message: 'Bình luận tối đa 1000 ký tự' })
  content!: string;
}
