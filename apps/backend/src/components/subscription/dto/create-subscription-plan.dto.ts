import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    description: 'Tên gói thành viên / dịch vụ',
    example: 'Gói Hội Viên Vàng (30 ngày)',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'name không được để trống' })
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    description: 'Giá gói đăng ký (VND)',
    example: 199000,
    minimum: 0,
  })
  @IsNumber({}, { message: 'price phải là số' })
  @Min(0, { message: 'price không được âm' })
  price!: number;

  @ApiProperty({
    description: 'Thời hạn gói (tính theo số ngày)',
    example: 30,
    minimum: 1,
  })
  @IsInt({ message: 'durationDays phải là số nguyên' })
  @Min(1, { message: 'durationDays tối thiểu là 1 ngày' })
  durationDays!: number;

  @ApiPropertyOptional({
    description: 'Chi tiết quyền lợi gói dịch vụ (JSON)',
    example: { aiQuotaDaily: 50, featuredField: true },
  })
  @IsOptional()
  benefit?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Trạng thái hoạt động của gói',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
