import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import {
  RequesterSummaryDto,
  ReviewerSummaryDto,
} from '~/components/admin-approval/dto/admin-owner-approval-detail-response.dto';
import { FieldResponseDto } from '~/components/field/dto/field-response.dto';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { FieldEntity } from '~/entities/field.entity';
import { UserEntity } from '~/entities/user.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AdminApproveFieldDto } from '../dto/admin-approve-field.dto';
import { AdminFieldApprovalDetailResponseDto } from '../dto/admin-field-approval-detail-response.dto';
import { AdminFieldApprovalListResponseDto } from '../dto/admin-field-approval-list-response.dto';
import { AdminFieldApprovalQueryDto } from '../dto/admin-field-approval-query.dto';
import { AdminRejectFieldDto } from '../dto/admin-reject-field.dto';

interface ProposedChangesPayload {
  name?: string;
  address?: string;
  district?: string | null;
  lat?: string | null;
  lng?: string | null;
  description?: string | null;
  requireDeposit?: boolean;
  depositType?: string | null;
  depositValue?: string | null;
}

interface NoteWithProposedChanges {
  proposedChanges?: ProposedChangesPayload;
}

@Injectable()
export class AdminFieldApprovalService {
  constructor(
    private readonly approvalRequestRepository: ApprovalRequestRepository,
    private readonly fieldRepository: FieldRepository,
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
  ) {}

  async getFieldApprovals(
    query: AdminFieldApprovalQueryDto,
  ): Promise<AdminFieldApprovalListResponseDto> {
    const paginated =
      await this.approvalRequestRepository.findFieldApprovals(query);

    const targetIds = [
      ...new Set(paginated.items.map((item) => item.targetId).filter(Boolean)),
    ];

    const fields = await this.fieldRepository.findByIds(targetIds);
    const fieldMap = new Map<string, FieldEntity>(fields.map((f) => [f.id, f]));

    const items: AdminFieldApprovalDetailResponseDto[] = paginated.items.map(
      (request) => {
        const field = fieldMap.get(request.targetId) ?? null;
        return this.mapToDetailDto(request, field);
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

  async getFieldApprovalDetail(
    requestId: string,
  ): Promise<AdminFieldApprovalDetailResponseDto> {
    const request =
      await this.approvalRequestRepository.findFieldApprovalById(requestId);

    if (!request) {
      throw new ApplicationException({
        code: 'APPROVAL_REQUEST_NOT_FOUND',
        messageKey: 'error.approvalRequestNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const field = await this.fieldRepository.findById(request.targetId);

    return this.mapToDetailDto(request, field);
  }

  async approveFieldRequest(
    requestId: string,
    adminUserId: string,
    dto: AdminApproveFieldDto,
  ): Promise<AdminFieldApprovalDetailResponseDto> {
    const adminUser = await this.userRepository.findById(adminUserId);

    return this.dataSource.transaction(async (manager) => {
      const approvalRepo = manager.getRepository(ApprovalRequestEntity);
      const fieldRepo = manager.getRepository(FieldEntity);
      const userRepo = manager.getRepository(UserEntity);

      // Lock order: 1. approval_requests, 2. fields
      const request = await approvalRepo.findOne({
        where: { id: requestId, type: In(['field_create', 'field_update']) },
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

      const field = await fieldRepo.findOne({
        where: { id: request.targetId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!field) {
        throw new ApplicationException({
          code: 'FIELD_NOT_FOUND',
          messageKey: 'error.fieldNotFound',
          status: HttpStatus.NOT_FOUND,
        });
      }

      const user = await userRepo.findOne({
        where: { id: request.requestedBy },
      });

      if (request.type === 'field_create') {
        field.status = 'active';
      } else if (request.type === 'field_update') {
        field.status = 'active';
        if (request.note) {
          try {
            const parsed = JSON.parse(request.note) as NoteWithProposedChanges;
            if (parsed.proposedChanges) {
              const changes = parsed.proposedChanges;
              if (changes.name !== undefined) field.name = changes.name;
              if (changes.address !== undefined)
                field.address = changes.address;
              if (changes.district !== undefined)
                field.district = changes.district;
              if (changes.lat !== undefined) field.lat = changes.lat;
              if (changes.lng !== undefined) field.lng = changes.lng;
              if (changes.description !== undefined)
                field.description = changes.description;
              if (changes.requireDeposit !== undefined)
                field.requireDeposit = changes.requireDeposit;
              if (changes.depositType !== undefined)
                field.depositType = changes.depositType;
              if (changes.depositValue !== undefined)
                field.depositValue = changes.depositValue;
            }
          } catch {
            // Ignore malformed JSON note
          }
        }
      }

      const savedField = await fieldRepo.save(field);

      request.status = 'approved';
      request.reviewedBy = adminUserId;
      request.reviewedAt = new Date();
      if (dto.note) {
        request.note = dto.note;
      }

      const savedRequest = await approvalRepo.save(request);
      savedRequest.reviewer = adminUser;
      if (user) {
        savedRequest.requester = user;
      }

      return this.mapToDetailDto(savedRequest, savedField);
    });
  }

  async rejectFieldRequest(
    requestId: string,
    adminUserId: string,
    dto: AdminRejectFieldDto,
  ): Promise<AdminFieldApprovalDetailResponseDto> {
    const adminUser = await this.userRepository.findById(adminUserId);

    return this.dataSource.transaction(async (manager) => {
      const approvalRepo = manager.getRepository(ApprovalRequestEntity);
      const fieldRepo = manager.getRepository(FieldEntity);
      const userRepo = manager.getRepository(UserEntity);

      // Lock order: 1. approval_requests, 2. fields
      const request = await approvalRepo.findOne({
        where: { id: requestId, type: In(['field_create', 'field_update']) },
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

      const field = await fieldRepo.findOne({
        where: { id: request.targetId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!field) {
        throw new ApplicationException({
          code: 'FIELD_NOT_FOUND',
          messageKey: 'error.fieldNotFound',
          status: HttpStatus.NOT_FOUND,
        });
      }

      const user = await userRepo.findOne({
        where: { id: request.requestedBy },
      });

      let updatedField = field;
      if (request.type === 'field_create') {
        field.status = 'rejected';
        updatedField = await fieldRepo.save(field);
      }
      // If field_update: keep current active field intact without overwriting or updating

      request.status = 'rejected';
      request.reviewedBy = adminUserId;
      request.reviewedAt = new Date();
      request.note = dto.reason;

      const savedRequest = await approvalRepo.save(request);
      savedRequest.reviewer = adminUser;
      if (user) {
        savedRequest.requester = user;
      }

      return this.mapToDetailDto(savedRequest, updatedField);
    });
  }

  private mapToDetailDto(
    request: ApprovalRequestEntity,
    field: FieldEntity | null,
  ): AdminFieldApprovalDetailResponseDto {
    const requesterDto: RequesterSummaryDto = {
      id: request.requester?.id ?? request.requestedBy,
      email: request.requester?.email ?? '',
      phone: request.requester?.phone ?? null,
      role: request.requester?.role ?? 'owner',
      status: request.requester?.status ?? 'active',
    };

    const reviewerDto: ReviewerSummaryDto | null = request.reviewedBy
      ? {
          id: request.reviewer?.id ?? request.reviewedBy,
          email: request.reviewer?.email ?? '',
        }
      : null;

    let targetFieldDto: FieldResponseDto | null = null;
    if (field) {
      targetFieldDto = {
        id: field.id,
        ownerId: field.ownerId,
        name: field.name,
        address: field.address,
        district: field.district,
        lat: field.lat !== null ? Number(field.lat) : null,
        lng: field.lng !== null ? Number(field.lng) : null,
        description: field.description,
        status: field.status,
        requireDeposit: field.requireDeposit,
        depositType: field.depositType,
        depositValue:
          field.depositValue !== null ? Number(field.depositValue) : null,
        createdAt: field.createdAt,
        updatedAt: field.updatedAt,
      };
    }

    let proposedChanges: Record<string, unknown> | null = null;
    if (request.type === 'field_update' && request.note) {
      try {
        const parsed = JSON.parse(request.note) as NoteWithProposedChanges;
        if (parsed.proposedChanges) {
          proposedChanges = parsed.proposedChanges as Record<string, unknown>;
        }
      } catch {
        // Not a JSON note
      }
    }

    return {
      id: request.id,
      type: request.type,
      targetId: request.targetId,
      status: request.status,
      note: request.note,
      createdAt: request.createdAt,
      reviewedAt: request.reviewedAt,
      requester: requesterDto,
      targetField: targetFieldDto,
      proposedChanges,
      reviewer: reviewerDto,
    };
  }
}
