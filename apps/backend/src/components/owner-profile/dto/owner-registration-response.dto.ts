import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { OwnerProfileResponseDto } from './owner-profile-response.dto';

export class OwnerRegistrationResponseDto {
  @ApiProperty({
    description: 'ID của yêu cầu phê duyệt',
    example: 'd3b07384-d113-40e1-95b6-75399589d6e4',
  })
  id!: string;

  @ApiProperty({
    description: 'Loại yêu cầu phê duyệt',
    example: 'owner_register',
  })
  type!: string;

  @ApiProperty({
    description: 'ID hồ sơ chủ sân được đăng ký (targetId)',
    example: 'e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412',
  })
  targetId!: string;

  @ApiProperty({
    description: 'ID người gửi yêu cầu',
    example: '9175df40-fc7c-4d50-b07e-a35417a2eef2',
  })
  requestedBy!: string;

  @ApiProperty({
    description: 'Trạng thái yêu cầu',
    example: 'pending',
  })
  status!: string;

  @ApiPropertyOptional({
    description: 'Ghi chú kèm theo yêu cầu',
    example: 'Mong admin duyệt sớm',
    nullable: true,
  })
  note!: string | null;

  @ApiProperty({
    description: 'Thời điểm gửi yêu cầu',
    example: '2026-01-01T10:00:00.000Z',
  })
  createdAt!: Date;

  static fromEntity(entity: ApprovalRequestEntity): OwnerRegistrationResponseDto {
    const dto = new OwnerRegistrationResponseDto();
    dto.id = entity.id;
    dto.type = entity.type;
    dto.targetId = entity.targetId;
    dto.requestedBy = entity.requestedBy;
    dto.status = entity.status;
    dto.note = entity.note;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}

export class OwnerRegistrationStatusResponseDto {
  @ApiProperty({
    description: 'Cờ báo người dùng có yêu cầu duyệt đang chờ xử lý hay không',
    example: true,
  })
  hasPendingRequest!: boolean;

  @ApiProperty({
    description: 'Vai trò hiện tại của người dùng',
    example: 'user',
  })
  currentRole!: string;

  @ApiPropertyOptional({
    description: 'Yêu cầu phê duyệt gần nhất',
    type: () => OwnerRegistrationResponseDto,
    nullable: true,
  })
  latestRequest?: OwnerRegistrationResponseDto | null;

  @ApiPropertyOptional({
    description: 'Hồ sơ chủ sân hiện tại',
    type: () => OwnerProfileResponseDto,
    nullable: true,
  })
  profile?: OwnerProfileResponseDto | null;
}
