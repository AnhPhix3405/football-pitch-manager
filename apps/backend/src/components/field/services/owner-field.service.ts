import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldEntity } from '~/entities/field.entity';
import { FieldRepository } from '~/repositories/field.repository';
import { CreateFieldDto } from '../dto/create-field.dto';
import { FieldListResponseDto } from '../dto/field-list-response.dto';
import { FieldResponseDto } from '../dto/field-response.dto';
import { OwnerFieldQueryDto } from '../dto/owner-field-query.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';

@Injectable()
export class OwnerFieldService {
  constructor(private readonly fieldRepository: FieldRepository) {}

  async createField(
    ownerId: string,
    dto: CreateFieldDto,
  ): Promise<FieldResponseDto> {
    const sanitizedDeposit = this.validateAndSanitizeDeposit(
      dto.requireDeposit ?? false,
      dto.depositType,
      dto.depositValue,
    );

    const createdField = await this.fieldRepository.createField(ownerId, {
      name: dto.name.trim(),
      address: dto.address.trim(),
      district: dto.district?.trim() ?? null,
      lat: dto.lat ?? null,
      lng: dto.lng ?? null,
      description: dto.description?.trim() ?? null,
      requireDeposit: dto.requireDeposit ?? false,
      depositType: sanitizedDeposit.depositType,
      depositValue: sanitizedDeposit.depositValue,
    });

    return this.mapToResponseDto(createdField);
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

    if (depositValue === undefined || depositValue === null || depositValue < 0) {
      throw new ApplicationException({
        code: 'INVALID_DEPOSIT_CONFIG',
        messageKey: 'error.invalidDepositConfig',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    if (depositType === 'percentage' && (depositValue <= 0 || depositValue > 100)) {
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
      depositValue: field.depositValue !== null ? Number(field.depositValue) : null,
      createdAt: field.createdAt,
      updatedAt: field.updatedAt,
    };
  }
}
