import { OwnerProfileEntity } from '~/entities/owner-profile.entity';

export interface OwnerUserSummary {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
}

export class OwnerProfileResponseDto {
  id!: string;
  userId!: string;
  businessName!: string | null;
  businessLicense!: string | null;
  bankAccount!: string | null;
  verifiedAt!: Date | null;
  isVerified!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
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
  id!: string;
  businessName!: string | null;
  isVerified!: boolean;
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
