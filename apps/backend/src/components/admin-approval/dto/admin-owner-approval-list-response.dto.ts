import { ApiProperty } from '@nestjs/swagger';
import { AdminOwnerApprovalDetailResponseDto } from './admin-owner-approval-detail-response.dto';

export class AdminOwnerApprovalListResponseDto {
  @ApiProperty({
    description: 'Danh sách các yêu cầu đăng ký chủ sân',
    type: () => [AdminOwnerApprovalDetailResponseDto],
  })
  items!: AdminOwnerApprovalDetailResponseDto[];

  @ApiProperty({ description: 'Tổng số bản ghi thỏa điều kiện lọc', example: 25 })
  total!: number;

  @ApiProperty({ description: 'Trang hiện tại', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Số lượng bản ghi trên một trang', example: 10 })
  limit!: number;

  @ApiProperty({ description: 'Tổng số trang', example: 3 })
  totalPages!: number;
}
