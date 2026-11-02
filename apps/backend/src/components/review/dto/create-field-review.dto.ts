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

export class CreateFieldReviewDto {
  @ApiProperty({
    description: 'Mã đơn đặt sân đã hoàn tất',
    example: 'd0c9f1a2-5b3e-4d5a-8b1c-9e2f3a4b5c6d',
  })
  @IsUUID('4', { message: 'bookingId phải là UUID v4 hợp lệ' })
  @IsNotEmpty({ message: 'bookingId không được để trống' })
  bookingId!: string;

  @ApiProperty({
    description: 'Số sao đánh giá (từ 1 đến 5 sao)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'rating phải là số nguyên' })
  @Min(1, { message: 'rating tối thiểu là 1 sao' })
  @Max(5, { message: 'rating tối đa là 5 sao' })
  rating!: number;

  @ApiPropertyOptional({
    description: 'Nhận xét chi tiết về sân bóng',
    example: 'Mặt cỏ rất đẹp, đèn sáng rõ, chủ sân nhiệt tình hỗ trợ.',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Nhận xét không được vượt quá 1000 ký tự' })
  comment?: string;
}
