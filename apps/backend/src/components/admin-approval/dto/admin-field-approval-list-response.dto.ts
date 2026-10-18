import { ApiProperty } from '@nestjs/swagger';
import { AdminFieldApprovalDetailResponseDto } from './admin-field-approval-detail-response.dto';

export class AdminFieldApprovalListResponseDto {
  @ApiProperty({
    description: 'Danh sách các yêu cầu duyệt sân bóng',
    type: () => [AdminFieldApprovalDetailResponseDto],
  })
  items!: AdminFieldApprovalDetailResponseDto[];

  @ApiProperty({ description: 'Tổng số lượng bản ghi', example: 42 })
  total!: number;

  @ApiProperty({ description: 'Trang hiện tại (1-indexed)', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Số bản ghi trên mỗi trang', example: 10 })
  limit!: number;

  @ApiProperty({ description: 'Tổng số trang', example: 5 })
  totalPages!: number;
}
