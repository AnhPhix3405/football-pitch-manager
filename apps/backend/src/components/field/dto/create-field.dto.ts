import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateFieldDto {
  @ApiProperty({
    description: 'Tên cụm sân',
    example: 'Sân bóng Tân Bình Sport Complex',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Tên cụm sân không được để trống' })
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Địa chỉ cụm sân',
    example: '120 Hoàng Hoa Thám, Phường 12',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ cụm sân không được để trống' })
  @MaxLength(255)
  address!: string;

  @ApiPropertyOptional({
    description: 'Quận/Huyện',
    example: 'Tân Bình',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  district?: string;

  @ApiPropertyOptional({
    description: 'Vĩ độ toạ độ (Latitude)',
    example: 10.798123,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number;

  @ApiPropertyOptional({
    description: 'Kinh độ toạ độ (Longitude)',
    example: 106.654321,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number;

  @ApiPropertyOptional({
    description: 'Mô tả chi tiết cụm sân',
    example: 'Cụm sân cỏ nhân tạo tiêu chuẩn FIFA 5 và 7 người...',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Yêu cầu đặt cọc trước khi đặt sân',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requireDeposit?: boolean;

  @ApiPropertyOptional({
    description: 'Loại đặt cọc: fixed (tiền cố định) hoặc percentage (phần trăm)',
    enum: ['fixed', 'percentage'],
    example: 'fixed',
  })
  @ValidateIf((o) => o.requireDeposit === true)
  @IsNotEmpty({ message: 'depositType is required when requireDeposit is true' })
  @IsIn(['fixed', 'percentage'], {
    message: 'depositType must be either fixed or percentage',
  })
  depositType?: string;

  @ApiPropertyOptional({
    description: 'Giá trị tiền cọc (VND khi fixed hoặc % khi percentage)',
    example: 100000,
  })
  @ValidateIf((o) => o.requireDeposit === true)
  @IsNotEmpty({ message: 'depositValue is required when requireDeposit is true' })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'depositValue must be greater than or equal to 0' })
  depositValue?: number;
}
