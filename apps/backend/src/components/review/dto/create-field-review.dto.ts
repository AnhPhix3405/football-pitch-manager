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
    description: 'ID của đơn đặt sân đã hoàn thành (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(undefined, { message: 'bookingId phải là UUID hợp lệ' })
  @IsNotEmpty({ message: 'bookingId không được để trống' })
  bookingId!: string;

  @ApiProperty({
    description: 'Số sao đánh giá (từ 1 đến 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt({ message: 'rating phải là số nguyên' })
  @Min(1, { message: 'rating tối thiểu là 1' })
  @Max(5, { message: 'rating tối đa là 5' })
  rating!: number;

  @ApiPropertyOptional({
    description: 'Nội dung nhận xét về sân bóng',
    example: 'Mặt cỏ đẹp, đèn sáng và dịch vụ tốt.',
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'comment tối đa 1000 ký tự' })
  comment?: string;
}
