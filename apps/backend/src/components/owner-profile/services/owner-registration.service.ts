import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { UserRepository } from '~/repositories/user.repository';
import { OwnerProfileResponseDto } from '../dto/owner-profile-response.dto';
import {
  OwnerRegistrationResponseDto,
  OwnerRegistrationStatusResponseDto,
} from '../dto/owner-registration-response.dto';
import { RegisterOwnerDto } from '../dto/register-owner.dto';

@Injectable()
export class OwnerRegistrationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly ownerProfileRepository: OwnerProfileRepository,
    private readonly approvalRequestRepository: ApprovalRequestRepository,
    private readonly dataSource: DataSource,
  ) {}

  async registerOwner(
    userId: string,
    dto: RegisterOwnerDto,
  ): Promise<OwnerRegistrationResponseDto> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new ApplicationException({
        code: 'USER_NOT_FOUND',
        messageKey: 'error.userNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (user.role === 'owner' || user.role === 'admin') {
      throw new ApplicationException({
        code: 'ALREADY_OWNER',
        messageKey: 'error.alreadyOwner',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const pendingRequest =
      await this.approvalRequestRepository.findPendingByRequesterAndType(
        userId,
        'owner_register',
      );

    if (pendingRequest) {
      throw new ApplicationException({
        code: 'REGISTRATION_REQUEST_PENDING',
        messageKey: 'error.registrationRequestPending',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    const savedRequest = await this.dataSource.transaction(async (manager) => {
      const ownerProfileRepo = manager.getRepository(OwnerProfileEntity);
      const approvalRequestRepo = manager.getRepository(ApprovalRequestEntity);

      let profile = await ownerProfileRepo.findOne({ where: { userId } });

      if (!profile) {
        profile = ownerProfileRepo.create({
          id: randomUUID(),
          userId,
          businessName: dto.businessName,
          businessLicense: dto.businessLicense,
          bankAccount: dto.bankAccount,
          verifiedAt: null,
        });
      } else {
        profile.businessName = dto.businessName;
        profile.businessLicense = dto.businessLicense;
        profile.bankAccount = dto.bankAccount;
      }

      const savedProfile = await ownerProfileRepo.save(profile);

      const approvalRequest = approvalRequestRepo.create({
        id: randomUUID(),
        type: 'owner_register',
        targetId: savedProfile.id,
        requestedBy: userId,
        status: 'pending',
        note: dto.note ?? null,
        reviewedBy: null,
        reviewedAt: null,
      });

      return approvalRequestRepo.save(approvalRequest);
    });

    return OwnerRegistrationResponseDto.fromEntity(savedRequest);
  }

  async getRegistrationStatus(
    userId: string,
  ): Promise<OwnerRegistrationStatusResponseDto> {
    const [user, profile, latestRequest] = await Promise.all([
      this.userRepository.findById(userId),
      this.ownerProfileRepository.findByUserId(userId),
      this.approvalRequestRepository.findLatestByRequesterAndType(
        userId,
        'owner_register',
      ),
    ]);

    if (!user) {
      throw new ApplicationException({
        code: 'USER_NOT_FOUND',
        messageKey: 'error.userNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return {
      hasPendingRequest: latestRequest?.status === 'pending',
      currentRole: user.role,
      latestRequest: latestRequest
        ? OwnerRegistrationResponseDto.fromEntity(latestRequest)
        : null,
      profile: profile ? OwnerProfileResponseDto.fromEntity(profile) : null,
    };
  }
}
