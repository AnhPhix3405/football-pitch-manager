import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AdminApproveOwnerDto } from '../dto/admin-approve-owner.dto';
import {
  AdminOwnerApprovalDetailResponseDto,
  RequesterSummaryDto,
  ReviewerSummaryDto,
  TargetOwnerProfileDto,
} from '../dto/admin-owner-approval-detail-response.dto';
import { AdminOwnerApprovalListResponseDto } from '../dto/admin-owner-approval-list-response.dto';
import { AdminOwnerApprovalQueryDto } from '../dto/admin-owner-approval-query.dto';
import { AdminRejectOwnerDto } from '../dto/admin-reject-owner.dto';

@Injectable()
export class AdminOwnerApprovalService {
  constructor(
    private readonly approvalRequestRepository: ApprovalRequestRepository,
    private readonly ownerProfileRepository: OwnerProfileRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getOwnerApprovals(
    query: AdminOwnerApprovalQueryDto,
  ): Promise<AdminOwnerApprovalListResponseDto> {
    const paginated =
      await this.approvalRequestRepository.findOwnerRegistrations(query);

    const targetIds = [
      ...new Set(paginated.items.map((item) => item.targetId).filter(Boolean)),
    ];

    const ownerProfiles =
      await this.ownerProfileRepository.findByIds(targetIds);
    const profileMap = new Map<string, OwnerProfileEntity>(
      ownerProfiles.map((p) => [p.id, p]),
    );

    const items: AdminOwnerApprovalDetailResponseDto[] = paginated.items.map(
      (request) => {
        const profile = profileMap.get(request.targetId) ?? null;
        return this.mapToDetailDto(request, profile);
      },
    );

    return {
      items,
      total: paginated.total,
      page: paginated.page,
      limit: paginated.limit,
      totalPages: paginated.totalPages,
    };
  }

  async getOwnerApprovalDetail(
    requestId: string,
  ): Promise<AdminOwnerApprovalDetailResponseDto> {
    const request =
      await this.approvalRequestRepository.findOwnerRegistrationById(requestId);
    if (!request) {
      throw new ApplicationException({
        code: 'APPROVAL_REQUEST_NOT_FOUND',
        messageKey: 'error.approvalRequestNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const ownerProfile = await this.ownerProfileRepository.findById(
      request.targetId,
    );
    return this.mapToDetailDto(request, ownerProfile);
  }

  async approveOwnerRegistration(
    requestId: string,
    adminUserId: string,
    dto: AdminApproveOwnerDto,
  ): Promise<AdminOwnerApprovalDetailResponseDto> {
    const adminUser = await this.userRepository.findById(adminUserId);

    return this.dataSource.transaction(async (manager) => {
      const approvalRepo = manager.getRepository(ApprovalRequestEntity);
      const ownerRepo = manager.getRepository(OwnerProfileEntity);
      const userRepo = manager.getRepository(UserEntity);

      const request = await approvalRepo.findOne({
        where: { id: requestId, type: 'owner_register' },
        lock: { mode: 'pessimistic_write' },
      });

      if (!request) {
        throw new ApplicationException({
          code: 'APPROVAL_REQUEST_NOT_FOUND',
          messageKey: 'error.approvalRequestNotFound',
          status: HttpStatus.NOT_FOUND,
        });
      }

      if (request.status !== 'pending') {
        throw new ApplicationException({
          code: 'APPROVAL_REQUEST_ALREADY_PROCESSED',
          messageKey: 'error.approvalRequestAlreadyProcessed',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const profile = await ownerRepo.findOne({
        where: { id: request.targetId },
      });
      if (profile) {
        profile.verifiedAt = new Date();
        await ownerRepo.save(profile);
      }

      const user = await userRepo.findOne({
        where: { id: request.requestedBy },
      });
      if (user) {
        user.role = 'owner';
        await userRepo.save(user);
      }

      request.status = 'approved';
      request.reviewedBy = adminUserId;
      request.reviewedAt = new Date();
      if (dto.note !== undefined) {
        request.note = dto.note;
      }
      const savedRequest = await approvalRepo.save(request);
      savedRequest.reviewer = adminUser;
      if (user) {
        savedRequest.requester = user;
      }

      return this.mapToDetailDto(savedRequest, profile);
    });
  }

  async rejectOwnerRegistration(
    requestId: string,
    adminUserId: string,
    dto: AdminRejectOwnerDto,
  ): Promise<AdminOwnerApprovalDetailResponseDto> {
    const adminUser = await this.userRepository.findById(adminUserId);

    return this.dataSource.transaction(async (manager) => {
      const approvalRepo = manager.getRepository(ApprovalRequestEntity);
      const ownerRepo = manager.getRepository(OwnerProfileEntity);
      const userRepo = manager.getRepository(UserEntity);

      const request = await approvalRepo.findOne({
        where: { id: requestId, type: 'owner_register' },
        lock: { mode: 'pessimistic_write' },
      });

      if (!request) {
        throw new ApplicationException({
          code: 'APPROVAL_REQUEST_NOT_FOUND',
          messageKey: 'error.approvalRequestNotFound',
          status: HttpStatus.NOT_FOUND,
        });
      }

      if (request.status !== 'pending') {
        throw new ApplicationException({
          code: 'APPROVAL_REQUEST_ALREADY_PROCESSED',
          messageKey: 'error.approvalRequestAlreadyProcessed',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const profile = await ownerRepo.findOne({
        where: { id: request.targetId },
      });

      const user = await userRepo.findOne({
        where: { id: request.requestedBy },
      });

      request.status = 'rejected';
      request.reviewedBy = adminUserId;
      request.reviewedAt = new Date();
      request.note = dto.reason;

      const savedRequest = await approvalRepo.save(request);
      savedRequest.reviewer = adminUser;
      if (user) {
        savedRequest.requester = user;
      }

      return this.mapToDetailDto(savedRequest, profile);
    });
  }

  private mapToDetailDto(
    request: ApprovalRequestEntity,
    ownerProfile: OwnerProfileEntity | null,
  ): AdminOwnerApprovalDetailResponseDto {
    const requesterDto: RequesterSummaryDto = {
      id: request.requester?.id ?? request.requestedBy,
      email: request.requester?.email ?? '',
      phone: request.requester?.phone ?? null,
      role: request.requester?.role ?? 'user',
      status: request.requester?.status ?? 'active',
    };

    let targetProfileDto: TargetOwnerProfileDto | null = null;
    if (ownerProfile) {
      targetProfileDto = {
        id: ownerProfile.id,
        businessName: ownerProfile.businessName,
        businessLicense: ownerProfile.businessLicense,
        bankAccount: ownerProfile.bankAccount,
        verifiedAt: ownerProfile.verifiedAt,
      };
    }

    let reviewerDto: ReviewerSummaryDto | null = null;
    if (request.reviewedBy) {
      reviewerDto = {
        id: request.reviewedBy,
        email: request.reviewer?.email ?? '',
      };
    }

    return {
      id: request.id,
      type: request.type,
      status: request.status,
      note: request.note,
      createdAt: request.createdAt,
      reviewedAt: request.reviewedAt,
      requester: requesterDto,
      ownerProfile: targetProfileDto,
      reviewer: reviewerDto,
    };
  }
}
