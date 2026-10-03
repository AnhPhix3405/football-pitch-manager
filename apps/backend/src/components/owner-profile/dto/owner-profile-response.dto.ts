import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';

export class OwnerUserSummary {
  @ApiProperty({ description: 'ID người dùng', example: '9175df40-fc7c-4d50-b07e-a35417a2eef2' })
  id!: string;

  @ApiProperty({ description: 'Email đăng nhập', example: 'owner@example.com' })
  email!: string;

  @ApiPropertyOptional({ description: 'Số điện thoại', example: '0901234567', nullable: true })
  phone!: string | null;

  @ApiProperty({ description: 'Vai trò trong hệ thống', example: 'owner' })
  role!: string;

  @ApiProperty({ description: 'Trạng thái tài khoản', example: 'active' })
  status!: string;
}

export class OwnerProfileResponseDto {
  @ApiProperty({ description: 'ID hồ sơ chủ sân', example: 'e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412' })
  id!: string;

  @ApiProperty({ description: 'ID tài khoản người dùng', example: '9175df40-fc7c-4d50-b07e-a35417a2eef2' })
  userId!: string;

  @ApiPropertyOptional({ description: 'Tên pháp nhân/kinh doanh', example: 'Sân Bóng Đá Tân Bình Sport Complex', nullable: true })
  businessName!: string | null;

  @ApiPropertyOptional({ description: 'Số giấy phép kinh doanh', example: 'GPKD-0312345678', nullable: true })
  businessLicense!: string | null;

  @ApiPropertyOptional({ description: 'Thông tin tài khoản ngân hàng', example: 'VCB - 0071000123456 - NGUYEN VAN A', nullable: true })
  bankAccount!: string | null;

  @ApiPropertyOptional({ description: 'Thời điểm xác thực hồ sơ', example: '2026-01-01T12:00:00.000Z', nullable: true })
  verifiedAt!: Date | null;

  @ApiProperty({ description: 'Trạng thái đã xác thực hay chưa', example: false })
  isVerified!: boolean;

  @ApiProperty({ description: 'Thời điểm tạo hồ sơ', example: '2026-01-01T10:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ description: 'Thời điểm cập nhật hồ sơ gần nhất', example: '2026-01-01T10:30:00.000Z' })
  updatedAt!: Date;

  @ApiPropertyOptional({ description: 'Thông tin tài khoản người dùng liên kết', type: () => OwnerUserSummary })
  user?: OwnerUserSummary;

  static fromEntity(entity: OwnerProfileEntity): OwnerProfileResponseDto {
    const dto = new OwnerProfileResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.businessName = entity.businessName;
    dto.businessLicense = entity.businessLicense;
    dto.bankAccount = entity.bankAccount;
    dto.verifiedAt = entity.verifiedAt;
    dto.isVerified = Boolean(entity.verifiedAt);
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;

    if (entity.user) {
      dto.user = {
        id: entity.user.id,
        email: entity.user.email,
        phone: entity.user.phone,
        role: entity.user.role,
        status: entity.user.status,
      };
    }

    return dto;
  }
}

export class PublicOwnerProfileResponseDto {
  @ApiProperty({ description: 'ID hồ sơ chủ sân', example: 'e0a9d1fc-3d23-45f8-b3d2-a7d9f78bc412' })
  id!: string;

  @ApiPropertyOptional({ description: 'Tên pháp nhân/kinh doanh', example: 'Sân Bóng Đá Tân Bình Sport Complex', nullable: true })
  businessName!: string | null;

  @ApiProperty({ description: 'Trạng thái đã xác thực hay chưa', example: false })
  isVerified!: boolean;

  @ApiPropertyOptional({ description: 'Thời điểm xác thực hồ sơ', example: '2026-01-01T12:00:00.000Z', nullable: true })
  verifiedAt!: Date | null;

  static fromEntity(entity: OwnerProfileEntity): PublicOwnerProfileResponseDto {
    const dto = new PublicOwnerProfileResponseDto();
    dto.id = entity.id;
    dto.businessName = entity.businessName;
    dto.isVerified = Boolean(entity.verifiedAt);
    dto.verifiedAt = entity.verifiedAt;
    return dto;
  }
}
