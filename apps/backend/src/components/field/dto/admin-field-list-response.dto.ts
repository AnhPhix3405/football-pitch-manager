import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminFieldOwnerSummaryDto {
  @ApiProperty({ description: 'ID người dùng chủ sân', example: '9175df40-fc7c-4d50-b07e-a35417a2eef2' })
  id: string;

  @ApiProperty({ description: 'Họ tên chủ sân', example: 'Nguyễn Văn A' })
  fullName: string;

  @ApiProperty({ description: 'Email liên hệ', example: 'owner@example.com' })
  email: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0901234567', nullable: true })
  phoneNumber: string | null;
}

export class AdminFieldCourtsSummaryDto {
  @ApiProperty({ description: 'Tổng số sân con', example: 5 })
  total: number;

  @ApiProperty({ description: 'Số lượng sân 5 người', example: 3 })
  type5: number;

  @ApiProperty({ description: 'Số lượng sân 7 người', example: 2 })
  type7: number;

  @ApiProperty({ description: 'Số lượng sân 11 người', example: 0 })
  type11: number;

  @ApiProperty({ description: 'Số lượng sân con đang hoạt động', example: 4 })
  activeCount: number;
}

export class AdminFieldRatingSummaryDto {
  @ApiProperty({ description: 'Điểm đánh giá trung bình (1-5)', example: 4.8 })
  averageRating: number;

  @ApiProperty({ description: 'Tổng số lượt đánh giá', example: 35 })
  totalReviews: number;

  @ApiProperty({ description: 'Điểm xếp hạng Bayesian uy tín', example: 4.65 })
  bayesianRating: number;
}

export class AdminFieldItemDto {
  @ApiProperty({ description: 'ID cụm sân', example: 'd3b07384-d113-40e1-95b6-75399589d6e4' })
  id: string;

  @ApiProperty({ description: 'Tên cụm sân', example: 'Sân bóng Tân Bình Sport Complex' })
  name: string;

  @ApiProperty({ description: 'Địa chỉ cụm sân', example: '120 Hoàng Hoa Thám, Phường 12' })
  address: string;

  @ApiPropertyOptional({ description: 'Quận/Huyện', example: 'Tân Bình', nullable: true })
  district: string | null;

  @ApiPropertyOptional({ description: 'Vĩ độ GPS', example: 10.798123, nullable: true })
  lat: number | null;

  @ApiPropertyOptional({ description: 'Kinh độ GPS', example: 106.654321, nullable: true })
  lng: number | null;

  @ApiProperty({
    description: 'Trạng thái hoạt động cụm sân',
    enum: ['active', 'inactive', 'pending', 'rejected'],
    example: 'active',
  })
  status: 'active' | 'inactive' | 'pending' | 'rejected';

  @ApiProperty({ description: 'Có yêu cầu đặt cọc hay không', example: true })
  requireDeposit: boolean;

  @ApiProperty({
    description: 'Thông tin đặt cọc định dạng sẵn cho giao diện hiển thị',
    example: '100.000 ₫ (Cố định)',
  })
  depositFormatted: string;

  @ApiProperty({ description: 'Thông tin tóm tắt chủ sân', type: () => AdminFieldOwnerSummaryDto })
  owner: AdminFieldOwnerSummaryDto;

  @ApiProperty({ description: 'Thống kê quy mô sân con', type: () => AdminFieldCourtsSummaryDto })
  courtsSummary: AdminFieldCourtsSummaryDto;

  @ApiProperty({ description: 'Đánh giá uy tín cụm sân', type: () => AdminFieldRatingSummaryDto })
  ratingSummary: AdminFieldRatingSummaryDto;

  @ApiProperty({ description: 'Thời điểm tạo cụm sân', example: '2026-10-04T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'Thời điểm cập nhật mới nhất', example: '2026-10-04T12:00:00.000Z' })
  updatedAt: string;
}

export class AdminFieldListResponseDto {
  @ApiProperty({ description: 'Danh sách sân bóng quản trị', type: () => [AdminFieldItemDto] })
  items: AdminFieldItemDto[];

  @ApiProperty({ description: 'Tổng số cụm sân thỏa điều kiện', example: 42 })
  total: number;

  @ApiProperty({ description: 'Trang hiện tại', example: 1 })
  page: number;

  @ApiProperty({ description: 'Số lượng mục trên trang', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Tổng số trang', example: 5 })
  totalPages: number;
}
