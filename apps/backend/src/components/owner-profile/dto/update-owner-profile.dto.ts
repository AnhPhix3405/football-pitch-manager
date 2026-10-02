import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateOwnerProfileDto {
  @ApiPropertyOptional({
    description: 'Tên pháp nhân/kinh doanh của chủ sân',
    example: 'Sân Bóng Đá Tân Bình Sport Complex',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  businessName?: string;

  @ApiPropertyOptional({
    description: 'Số giấy phép kinh doanh/đăng ký hộ kinh doanh',
    example: 'GPKD-0312345678',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  businessLicense?: string;

  @ApiPropertyOptional({
    description: 'Thông tin tài khoản ngân hàng nhận tiền đặt cọc/thanh toán',
    example: 'VCB - 0071000123456 - NGUYEN VAN A',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankAccount?: string;
}
