import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FieldResponseDto } from '~/components/field/dto/field-response.dto';
import {
  RequesterSummaryDto,
  ReviewerSummaryDto,
} from './admin-owner-approval-detail-response.dto';

export class AdminFieldApprovalDetailResponseDto {
  @ApiProperty({
    description: 'ID yêu cầu phê duyệt',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  id!: string;

  @ApiProperty({
    description: 'Loại yêu cầu: field_create hoặc field_update',
    enum: ['field_create', 'field_update'],
    example: 'field_create',
  })
  type!: string;

  @ApiProperty({
    description: 'ID của cụm sân mục tiêu (targetId)',
    example: 'e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412',
  })
  targetId!: string;

  @ApiProperty({ description: 'Trạng thái yêu cầu', example: 'pending' })
  status!: string;

  @ApiPropertyOptional({
    description: 'Ghi chú / Lý do từ chối / Nội dung thay đổi đề xuất (JSON)',
    example: 'Hồ sơ cụm sân hợp lệ',
    nullable: true,
  })
  note!: string | null;

  @ApiProperty({
    description: 'Thời điểm tạo yêu cầu',
    example: '2026-01-01T10:00:00.000Z',
  })
  createdAt!: Date;

  @ApiPropertyOptional({
    description: 'Thời điểm duyệt/từ chối',
    example: null,
    nullable: true,
  })
  reviewedAt!: Date | null;

  @ApiProperty({
    description: 'Thông tin người gửi yêu cầu',
    type: () => RequesterSummaryDto,
  })
  requester!: RequesterSummaryDto;

  @ApiPropertyOptional({
    description: 'Thông tin cụm sân hiện tại trong database',
    type: () => FieldResponseDto,
    nullable: true,
  })
  targetField?: FieldResponseDto | null;

  @ApiPropertyOptional({
    description: 'Các trường thông tin đề xuất thay đổi (đối với field_update)',
    example: { name: 'Sân bóng Tân Bình Mới', requireDeposit: false },
    nullable: true,
  })
  proposedChanges?: Record<string, unknown> | null;

  @ApiPropertyOptional({
    description: 'Thông tin Admin duyệt',
    type: () => ReviewerSummaryDto,
    nullable: true,
  })
  reviewer?: ReviewerSummaryDto | null;
}
