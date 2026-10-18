import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { FieldEntity } from '~/entities/field.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { CreateFieldDto } from '../dto/create-field.dto';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';
import { OwnerFieldQueryDto } from '../dto/owner-field-query.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';

@Injectable()
export class OwnerFieldService {
  constructor(
    private readonly fieldRepository: FieldRepository,
    private readonly approvalRequestRepository: ApprovalRequestRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createField(
    ownerId: string,
    dto: CreateFieldDto,
  ): Promise<FieldResponseDto> {
    const sanitizedDeposit = this.validateAndSanitizeDeposit(
      dto.requireDeposit ?? false,
      dto.depositType,
      dto.depositValue,
    );

    return this.dataSource.transaction(async (manager) => {
      const fieldRepo = manager.getRepository(FieldEntity);
      const approvalRepo = manager.getRepository(ApprovalRequestEntity);

      const field = fieldRepo.create({
        id: randomUUID(),
        ownerId,
        name: dto.name.trim(),
        address: dto.address.trim(),
        district: dto.district?.trim() ?? null,
        lat: dto.lat !== undefined && dto.lat !== null ? String(dto.lat) : null,
        lng: dto.lng !== undefined && dto.lng !== null ? String(dto.lng) : null,
        description: dto.description?.trim() ?? null,
        status: 'pending',
        requireDeposit: dto.requireDeposit ?? false,
        depositType: sanitizedDeposit.depositType,
        depositValue:
          sanitizedDeposit.depositValue !== null
            ? String(sanitizedDeposit.depositValue)
            : null,
      });

      const savedField = await fieldRepo.save(field);

      const approvalRequest = approvalRepo.create({
        id: randomUUID(),
        type: 'field_create',
        targetId: savedField.id,
        requestedBy: ownerId,
        status: 'pending',
        note: null,
        reviewedBy: null,
        reviewedAt: null,
      });

      await approvalRepo.save(approvalRequest);

      return this.mapToResponseDto(savedField);
    });
  }

  async getOwnerFields(
    ownerId: string,
    query: OwnerFieldQueryDto,
  ): Promise<FieldListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));

    const { items, total } =
      await this.fieldRepository.findByOwnerIdWithPagination(ownerId, {
        page,
        limit,
        search: query.search,
        status: query.status,
      });

    return {
      items: items.map((item) => this.mapToResponseDto(item)),
      total,
      page,
      limit,
      totalPages: total > 0 ? Math.ceil(total / limit) : 0,
    };
  }

  async getOwnerFieldDetail(
    id: string,
    ownerId: string,
  ): Promise<FieldResponseDto> {
    const field = await this.fieldRepository.findByIdAndOwnerId(id, ownerId);

    if (!field) {
      throw new ApplicationException({
        code: 'FIELD_NOT_FOUND',
        messageKey: 'error.fieldNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return this.mapToResponseDto(field);
  }

  async updateField(
    id: string,
    ownerId: string,
    dto: UpdateFieldDto,
  ): Promise<FieldResponseDto> {
    const existing = await this.fieldRepository.findByIdAndOwnerId(id, ownerId);

    if (!existing) {
      throw new ApplicationException({
        code: 'FIELD_NOT_FOUND',
        messageKey: 'error.fieldNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    const hasCoreFieldChanges =
      dto.name !== undefined ||
      dto.address !== undefined ||
      dto.district !== undefined ||
      dto.lat !== undefined ||
      dto.lng !== undefined ||
      dto.requireDeposit !== undefined ||
      dto.depositType !== undefined ||
      dto.depositValue !== undefined;

    if (existing.status === 'active' && hasCoreFieldChanges) {
      const pendingRequest =
        await this.approvalRequestRepository.findPendingByTargetIdAndTypes(id, [
          'field_create',
          'field_update',
        ]);

      if (pendingRequest) {
        throw new ApplicationException({
          code: 'FIELD_APPROVAL_REQUEST_PENDING',
          messageKey: 'error.fieldApprovalRequestPending',
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const effectiveRequireDeposit =
        dto.requireDeposit !== undefined
          ? dto.requireDeposit
          : existing.requireDeposit;

      const effectiveDepositType =
        dto.depositType !== undefined ? dto.depositType : existing.depositType;

      const effectiveDepositValue =
        dto.depositValue !== undefined
          ? dto.depositValue
          : existing.depositValue !== null
            ? Number(existing.depositValue)
            : undefined;

      const sanitizedDeposit = this.validateAndSanitizeDeposit(
        effectiveRequireDeposit,
        effectiveDepositType ?? undefined,
        effectiveDepositValue,
      );

      const proposedChanges: Record<string, any> = {};
      if (dto.name !== undefined) proposedChanges.name = dto.name.trim();
      if (dto.address !== undefined)
        proposedChanges.address = dto.address.trim();
      if (dto.district !== undefined)
        proposedChanges.district = dto.district?.trim() ?? null;
      if (dto.lat !== undefined)
        proposedChanges.lat = dto.lat !== null ? String(dto.lat) : null;
      if (dto.lng !== undefined)
        proposedChanges.lng = dto.lng !== null ? String(dto.lng) : null;
      if (dto.description !== undefined)
        proposedChanges.description = dto.description?.trim() ?? null;
      if (
        dto.requireDeposit !== undefined ||
        dto.depositType !== undefined ||
        dto.depositValue !== undefined
      ) {
        proposedChanges.requireDeposit = effectiveRequireDeposit;
        proposedChanges.depositType = sanitizedDeposit.depositType;
        proposedChanges.depositValue =
          sanitizedDeposit.depositValue !== null
            ? String(sanitizedDeposit.depositValue)
            : null;
      }

      await this.dataSource.transaction(async (manager) => {
        const approvalRepo = manager.getRepository(ApprovalRequestEntity);
        const approvalRequest = approvalRepo.create({
          id: randomUUID(),
          type: 'field_update',
          targetId: existing.id,
          requestedBy: ownerId,
          status: 'pending',
          note: JSON.stringify({ proposedChanges }),
          reviewedBy: null,
          reviewedAt: null,
        });

        await approvalRepo.save(approvalRequest);
      });

      return this.mapToResponseDto(existing);
    }

    if (dto.name !== undefined) {
      existing.name = dto.name.trim();
    }
    if (dto.address !== undefined) {
      existing.address = dto.address.trim();
    }
    if (dto.district !== undefined) {
      existing.district = dto.district?.trim() ?? null;
    }
    if (dto.lat !== undefined) {
      existing.lat = dto.lat !== null ? String(dto.lat) : null;
    }
    if (dto.lng !== undefined) {
      existing.lng = dto.lng !== null ? String(dto.lng) : null;
    }
    if (dto.description !== undefined) {
      existing.description = dto.description?.trim() ?? null;
    }

    const effectiveRequireDeposit =
      dto.requireDeposit !== undefined
        ? dto.requireDeposit
        : existing.requireDeposit;

    const effectiveDepositType =
      dto.depositType !== undefined ? dto.depositType : existing.depositType;

    const effectiveDepositValue =
      dto.depositValue !== undefined
        ? dto.depositValue
        : existing.depositValue !== null
          ? Number(existing.depositValue)
          : undefined;

    const sanitizedDeposit = this.validateAndSanitizeDeposit(
      effectiveRequireDeposit,
      effectiveDepositType ?? undefined,
      effectiveDepositValue,
    );

    existing.requireDeposit = effectiveRequireDeposit;
    existing.depositType = sanitizedDeposit.depositType;
    existing.depositValue =
      sanitizedDeposit.depositValue !== null
        ? String(sanitizedDeposit.depositValue)
        : null;

    const saved = await this.fieldRepository.save(existing);
    return this.mapToResponseDto(saved);
  }

  async deactivateField(
    id: string,
    ownerId: string,
  ): Promise<FieldResponseDto> {
    const existing = await this.fieldRepository.findByIdAndOwnerId(id, ownerId);

    if (!existing) {
      throw new ApplicationException({
        code: 'FIELD_NOT_FOUND',
        messageKey: 'error.fieldNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    existing.status = 'inactive';
    const saved = await this.fieldRepository.save(existing);
    return this.mapToResponseDto(saved);
  }

  private validateAndSanitizeDeposit(
    requireDeposit: boolean,
    depositType?: string,
    depositValue?: number,
  ): { depositType: string | null; depositValue: number | null } {
    if (!requireDeposit) {
      return { depositType: null, depositValue: null };
    }

    if (!depositType || !['fixed', 'percentage'].includes(depositType)) {
      throw new ApplicationException({
        code: 'INVALID_DEPOSIT_CONFIG',
        messageKey: 'error.invalidDepositConfig',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (
      depositValue === undefined ||
      depositValue === null ||
      depositValue < 0
    ) {
      throw new ApplicationException({
        code: 'INVALID_DEPOSIT_CONFIG',
        messageKey: 'error.invalidDepositConfig',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (
      depositType === 'percentage' &&
      (depositValue <= 0 || depositValue > 100)
    ) {
      throw new ApplicationException({
        code: 'INVALID_DEPOSIT_CONFIG',
        messageKey: 'error.invalidDepositConfig',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return {
      depositType,
      depositValue,
    };
  }

  private mapToResponseDto(field: FieldEntity): FieldResponseDto {
    return {
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
}
