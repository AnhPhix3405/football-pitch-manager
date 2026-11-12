import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetSubscriptionPlansQueryDto {
  @ApiPropertyOptional({
    description: 'Tìm kiếm gói dịch vụ theo tên',
    example: 'Vàng',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Lọc theo trạng thái hoạt động: ALL, ACTIVE, INACTIVE',
    enum: ['ALL', 'ACTIVE', 'INACTIVE'],
    example: 'ALL',
  })
  @IsOptional()
  @IsEnum(['ALL', 'ACTIVE', 'INACTIVE'])
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({
    description:
      'Lấy toàn bộ gói (tương thích ngược: true tương đương status=ALL)',
    example: 'true',
  })
  @IsOptional()
  @IsString()
  all?: string;
}
