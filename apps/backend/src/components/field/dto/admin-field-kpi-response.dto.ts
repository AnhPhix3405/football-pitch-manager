import { ApiProperty } from '@nestjs/swagger';

export class AdminFieldKpiResponseDto {
  @ApiProperty({ description: 'Tổng số cụm sân trong hệ thống', example: 50 })
  totalFields: number;

  @ApiProperty({ description: 'Số cụm sân đang hoạt động', example: 38 })
  activeFields: number;

  @ApiProperty({ description: 'Số cụm sân bị tạm ngưng/khóa', example: 4 })
  inactiveFields: number;

  @ApiProperty({ description: 'Số cụm sân đang chờ phê duyệt', example: 6 })
  pendingFields: number;

  @ApiProperty({ description: 'Số cụm sân bị từ chối duyệt', example: 2 })
  rejectedFields: number;

  @ApiProperty({ description: 'Tổng số sân con trên toàn hệ thống', example: 145 })
  totalCourts: number;

  @ApiProperty({ description: 'Số lượng cụm sân có yêu cầu đặt cọc', example: 32 })
  depositRequiredCount: number;
}
