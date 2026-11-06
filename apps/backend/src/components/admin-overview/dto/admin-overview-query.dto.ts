import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class AdminOverviewQueryDto {
  @ApiPropertyOptional({
    description: 'Số ngày lấy dữ liệu biểu đồ hoạt động hệ thống',
    default: 30,
    minimum: 7,
    maximum: 90,
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(7)
  @Max(90)
  days?: number = 30;

  @ApiPropertyOptional({
    description: 'Số lượng tối đa các mục trong hàng đợi ưu tiên',
    default: 5,
    minimum: 1,
    maximum: 20,
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  queueLimit?: number = 5;

  @ApiPropertyOptional({
    description: 'Số lượng tối đa các sự kiện nhật ký audit gần đây',
    default: 10,
    minimum: 1,
    maximum: 50,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  auditLimit?: number = 10;
}
