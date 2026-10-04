import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequesterSummaryDto {
  @ApiProperty({ description: 'User ID', example: '9175df40-fc7c-4d50-b07e-a35417a2eef2' })
  id!: string;

  @ApiProperty({ description: 'Email của người dùng', example: 'user@example.com' })
  email!: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0901234567', nullable: true })
  phone!: string | null;

  @ApiProperty({ description: 'Vai trò hiện tại', example: 'user' })
  role!: string;

  @ApiProperty({ description: 'Trạng thái tài khoản', example: 'active' })
  status!: string;
}

export class TargetOwnerProfileDto {
  @ApiProperty({ description: 'ID hồ sơ chủ sân', example: 'e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412' })
  id!: string;

  @ApiPropertyOptional({ description: 'Tên pháp nhân/kinh doanh', example: 'Sân bóng Tân Bình', nullable: true })
  businessName!: string | null;

  @ApiPropertyOptional({ description: 'Giấy phép kinh doanh', example: 'GPKD-0312345678', nullable: true })
  businessLicense!: string | null;

  @ApiPropertyOptional({ description: 'Số tài khoản ngân hàng', example: 'VCB - 0071000123456', nullable: true })
  bankAccount!: string | null;

  @ApiPropertyOptional({ description: 'Thời điểm xác minh', example: null, nullable: true })
  verifiedAt!: Date | null;
}

export class ReviewerSummaryDto {
  @ApiProperty({ description: 'Admin User ID', example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id!: string;

  @ApiProperty({ description: 'Email của Admin đã duyệt', example: 'admin@example.com' })
  email!: string;
}

export class AdminOwnerApprovalDetailResponseDto {
  @ApiProperty({ description: 'ID yêu cầu phê duyệt', example: 'd3b07384-d113-40e1-95b6-75399589d6e4' })
  id!: string;

  @ApiProperty({ description: 'Loại yêu cầu', example: 'owner_register' })
  type!: string;

  @ApiProperty({ description: 'Trạng thái yêu cầu', example: 'pending' })
  status!: string;

  @ApiPropertyOptional({ description: 'Ghi chú kèm theo / Lý do từ chối', example: 'Hồ sơ hợp lệ', nullable: true })
  note!: string | null;

  @ApiProperty({ description: 'Thời điểm tạo yêu cầu', example: '2026-01-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiPropertyOptional({ description: 'Thời điểm duyệt', example: null, nullable: true })
  reviewedAt!: Date | null;

  @ApiProperty({ description: 'Thông tin người gửi yêu cầu', type: () => RequesterSummaryDto })
  requester!: RequesterSummaryDto;

  @ApiPropertyOptional({ description: 'Thông tin hồ sơ chủ sân mục tiêu', type: () => TargetOwnerProfileDto, nullable: true })
  ownerProfile?: TargetOwnerProfileDto | null;

  @ApiPropertyOptional({ description: 'Thông tin Admin đã duyệt', type: () => ReviewerSummaryDto, nullable: true })
  reviewer?: ReviewerSummaryDto | null;
}
