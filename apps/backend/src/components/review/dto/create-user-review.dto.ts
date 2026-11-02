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
    description: 'ID người chơi được đánh giá (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID(undefined, { message: 'targetUserId phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'targetUserId không được để trống' })
  targetUserId!: string;

  @ApiProperty({
    description: 'ID bài đăng tìm đối / ghép trận liên quan (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  @IsUUID(undefined, { message: 'postId phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'postId không được để trống' })
  postId!: string;

  @ApiProperty({
    description: 'Điểm đánh giá tinh thần thể thao (từ 1 đến 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'rating phải là số nguyên' })
  @Min(1, { message: 'rating tối thiểu là 1' })
  @Max(5, { message: 'rating tối đa là 5' })
  rating!: number;

  @ApiPropertyOptional({
    description: 'Nội dung nhận xét về thái độ, tinh thần thi đấu',
    example: 'Đúng giờ, đá nhiệt tình và fair-play.',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'comment tối đa 1000 ký tự' })
  comment?: string;
}
