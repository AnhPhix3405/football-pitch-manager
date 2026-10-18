import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminApproveFieldDto {
  @ApiPropertyOptional({
    description: 'Ghi chú phê duyệt của quản trị viên',
    example: 'Hồ sơ cụm sân bóng đầy đủ và hợp lệ. Đã phê duyệt.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
