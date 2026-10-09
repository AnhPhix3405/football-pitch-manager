import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class RegisterOwnerDto {
  @ApiProperty({
    description: 'Tên pháp nhân hoặc thương hiệu kinh doanh của cụm sân',
    example: 'Sân Bóng Đá Tân Bình Sport Complex',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  businessName!: string;

  @ApiProperty({
    description: 'Số giấy phép kinh doanh hoặc CCCD người đại diện',
    example: 'GPKD-0312345678',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  businessLicense!: string;

  @ApiProperty({
    description: 'Thông tin tài khoản ngân hàng nhận doanh thu/đặt cọc',
    example: 'VCB - 0071000123456 - NGUYEN VAN A',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  bankAccount!: string;

  @ApiPropertyOptional({
    description: 'Ghi chú thêm gửi Admin duyệt',
    example: 'Tôi có cụm 4 sân bóng cỏ nhân tạo 7 người tại khu vực Tân Bình, mong admin duyệt sớm.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
