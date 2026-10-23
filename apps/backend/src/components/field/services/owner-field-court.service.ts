import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import {
  FieldCourtRepository,
  FindCourtsFilter,
} from '~/repositories/field-court.repository';
import { CreateFieldCourtDto } from '../dto/create-field-court.dto';
import { FieldCourtResponseDto } from '../dto/field-court-response.dto';
import { UpdateFieldCourtDto } from '../dto/update-field-court.dto';

@Injectable()
export class OwnerFieldCourtService {
  constructor(private readonly courtRepository: FieldCourtRepository) {}

  async createCourt(
    fieldId: string,
    dto: CreateFieldCourtDto,
  ): Promise<FieldCourtResponseDto> {
    const trimmedName = dto.name.trim();

    // Check unique court name in field
    const existing = await this.courtRepository.findByFieldAndName(
      fieldId,
      trimmedName,
    );
    if (existing) {
      throw new ApplicationException({
        code: 'COURT_NAME_ALREADY_EXISTS',
        messageKey: 'error.courtNameAlreadyExists',
        status: HttpStatus.CONFLICT,
      });
    }

    const court = this.courtRepository.create({
      id: randomUUID(),
      fieldId,
      name: trimmedName,
      type: dto.type,
      status: dto.status ?? 'active',
    });

    const saved = await this.courtRepository.save(court);
    return this.mapToResponse(saved);
  }

  async getCourts(
    fieldId: string,
    filter?: FindCourtsFilter,
  ): Promise<FieldCourtResponseDto[]> {
    const courts = await this.courtRepository.findByFieldId(fieldId, filter);
    return courts.map((court) => this.mapToResponse(court));
  }

  async getCourtDetail(
    fieldId: string,
    courtId: string,
  ): Promise<FieldCourtResponseDto> {
    const court = await this.courtRepository.findByIdAndFieldId(
      courtId,
      fieldId,
    );
    if (!court) {
      throw new ApplicationException({
        code: 'COURT_NOT_FOUND',
        messageKey: 'error.courtNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    return this.mapToResponse(court);
  }

  async updateCourt(
    fieldId: string,
    courtId: string,
    dto: UpdateFieldCourtDto,
  ): Promise<FieldCourtResponseDto> {
    const court = await this.courtRepository.findByIdAndFieldId(
      courtId,
      fieldId,
    );
    if (!court) {
      throw new ApplicationException({
        code: 'COURT_NOT_FOUND',
        messageKey: 'error.courtNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    if (dto.name !== undefined) {
      const trimmedName = dto.name.trim();
      if (trimmedName !== court.name) {
        const existing = await this.courtRepository.findByFieldAndName(
          fieldId,
          trimmedName,
        );
        if (existing && existing.id !== courtId) {
          throw new ApplicationException({
            code: 'COURT_NAME_ALREADY_EXISTS',
            messageKey: 'error.courtNameAlreadyExists',
            status: HttpStatus.CONFLICT,
          });
        }
        court.name = trimmedName;
      }
    }

    if (dto.type !== undefined) {
      court.type = dto.type;
    }

    if (dto.status !== undefined) {
      court.status = dto.status;
    }

    const saved = await this.courtRepository.save(court);
    return this.mapToResponse(saved);
  }

  async deleteCourt(
    fieldId: string,
    courtId: string,
  ): Promise<FieldCourtResponseDto> {
    const court = await this.courtRepository.findByIdAndFieldId(
      courtId,
      fieldId,
    );
    if (!court) {
      throw new ApplicationException({
        code: 'COURT_NOT_FOUND',
        messageKey: 'error.courtNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    court.status = 'inactive';
    const saved = await this.courtRepository.save(court);
    return this.mapToResponse(saved);
  }

  private mapToResponse(court: FieldCourtEntity): FieldCourtResponseDto {
    return {
      id: court.id,
      fieldId: court.fieldId,
      name: court.name,
      type: court.type,
      status: court.status,
      createdAt: court.createdAt,
      updatedAt: court.updatedAt,
    };
  }
}
