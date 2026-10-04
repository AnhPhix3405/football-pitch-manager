import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AdminApproveOwnerDto {
  @ApiPropertyOptional({
    description: 'Ghi chú phê duyệt của quản trị viên',
    example: 'Hồ sơ đầy đủ tính pháp lý và hợp lệ. Đã phê duyệt.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
