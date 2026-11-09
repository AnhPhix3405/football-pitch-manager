import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAdminFieldStatusDto {
  @ApiProperty({
    description: 'Trạng thái mới cho cụm sân bóng',
    enum: ['active', 'inactive'],
    example: 'inactive',
  })
  @IsNotEmpty()
  @IsIn(['active', 'inactive'])
  status: 'active' | 'inactive';

  @ApiPropertyOptional({
    description: 'Lý do thay đổi trạng thái (đặc biệt khi khóa/tạm ngưng sân)',
    example: 'Vi phạm điều khoản dịch vụ hoặc đang xử lý tranh chấp khiếu nại',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
