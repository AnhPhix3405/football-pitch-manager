import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import {
  OwnerProfileResponseDto,
  PublicOwnerProfileResponseDto,
} from '../dto/owner-profile-response.dto';
import { UpdateOwnerProfileDto } from '../dto/update-owner-profile.dto';

@Injectable()
export class OwnerProfileService {
  constructor(
    private readonly ownerProfileRepository: OwnerProfileRepository,
  ) {}

  async getProfileByUserId(userId: string): Promise<OwnerProfileResponseDto> {
    const profile = await this.ownerProfileRepository.findByUserId(userId);

    if (!profile) {
      throw new ApplicationException({
        code: 'OWNER_PROFILE_NOT_FOUND',
        messageKey: 'error.ownerProfileNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return OwnerProfileResponseDto.fromEntity(profile);
  }

  async updateProfile(
    userId: string,
    dto: UpdateOwnerProfileDto,
  ): Promise<OwnerProfileResponseDto> {
    const profile = await this.ownerProfileRepository.upsertByUserId(userId, {
      businessName: dto.businessName,
      businessLicense: dto.businessLicense,
      bankAccount: dto.bankAccount,
    });

    return OwnerProfileResponseDto.fromEntity(profile);
  }

  async getPublicProfileById(id: string): Promise<PublicOwnerProfileResponseDto> {
    const profile = await this.ownerProfileRepository.findById(id);

    if (!profile) {
      throw new ApplicationException({
        code: 'OWNER_PROFILE_NOT_FOUND',
        messageKey: 'error.ownerProfileNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return PublicOwnerProfileResponseDto.fromEntity(profile);
  }
}
