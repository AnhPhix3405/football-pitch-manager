import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateUserReviewDto {
  @ApiProperty({
    description: 'Mã bài đăng tìm đối liên quan đến trận đấu đã diễn ra',
    example: 'd0c9f1a2-5b3e-4d5a-8b1c-9e2f3a4b5c6d',
  })
  @IsUUID('4', { message: 'postId phải là UUID v4 hợp lệ' })
  @IsNotEmpty({ message: 'postId không được để trống' })
  postId!: string;

  @ApiProperty({
    description: 'Điểm đánh giá tinh thần thể thao (từ 1 đến 5 sao)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'rating phải là số nguyên' })
  @Min(1, { message: 'rating tối thiểu là 1 sao' })
  @Max(5, { message: 'rating tối đa là 5 sao' })
  rating!: number;

  @ApiPropertyOptional({
    description: 'Nhận xét về lối chơi, tinh thần thi đấu, thái độ fair-play',
    example: 'Đội bạn đá rất đẹp, tinh thần giao lưu hữu nghị, đúng giờ.',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Nhận xét không được vượt quá 1000 ký tự' })
  comment?: string;
}
