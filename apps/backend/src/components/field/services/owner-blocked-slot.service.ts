import { randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldBlockedSlotEntity } from '~/entities/field-blocked-slot.entity';
import {
  BlockedSlotFilter,
  FieldBlockedSlotRepository,
} from '~/repositories/field-blocked-slot.repository';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { CreateBlockedSlotDto } from '../dto/create-blocked-slot.dto';
import { BlockedSlotResponseDto } from '../dto/blocked-slot-response.dto';

@Injectable()
export class OwnerBlockedSlotService {
  constructor(
    private readonly slotRepository: FieldBlockedSlotRepository,
    private readonly courtRepository: FieldCourtRepository,
  ) {}

  async createBlockedSlot(
    fieldId: string,
    courtId: string,
    dto: CreateBlockedSlotDto,
  ): Promise<BlockedSlotResponseDto> {
    // 1. Verify court exists and belongs to field
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

    // 2. Validate time range
    if (dto.startTime >= dto.endTime) {
      throw new ApplicationException({
        code: 'INVALID_TIME_RANGE',
        messageKey: 'error.invalidTimeRange',
        status: HttpStatus.BAD_REQUEST,
      });
    }

    // 3. Check overlap collision
    const overlapping = await this.slotRepository.findOverlappingSlots(
      courtId,
      dto.blockedDate,
      dto.startTime,
      dto.endTime,
    );

    if (overlapping.length > 0) {
      throw new ApplicationException({
        code: 'BLOCKED_SLOT_OVERLAP',
        messageKey: 'error.blockedSlotOverlap',
        status: HttpStatus.CONFLICT,
      });
    }

    // 4. Save blocked slot
    const slot = this.slotRepository.create({
      id: randomUUID(),
      fieldCourtId: courtId,
      blockedDate: dto.blockedDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason?.trim() ?? null,
    });

    const saved = await this.slotRepository.save(slot);
    return this.mapToResponse(saved);
  }

  async getBlockedSlots(
    fieldId: string,
    courtId: string,
    filter?: BlockedSlotFilter,
  ): Promise<BlockedSlotResponseDto[]> {
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

    const slots = await this.slotRepository.findByCourtId(courtId, filter);
    return slots.map((s) => this.mapToResponse(s));
  }

  async deleteBlockedSlot(
    fieldId: string,
    courtId: string,
    slotId: string,
  ): Promise<BlockedSlotResponseDto> {
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

    const slot = await this.slotRepository.findByIdAndCourtId(slotId, courtId);
    if (!slot) {
      throw new ApplicationException({
        code: 'BLOCKED_SLOT_NOT_FOUND',
        messageKey: 'error.blockedSlotNotFound',
        status: HttpStatus.NOT_FOUND,
      });
    }

    await this.slotRepository.delete(slot);
    return this.mapToResponse(slot);
  }

  private mapToResponse(slot: FieldBlockedSlotEntity): BlockedSlotResponseDto {
    return {
      id: slot.id,
      fieldCourtId: slot.fieldCourtId,
      blockedDate: slot.blockedDate,
      startTime: slot.startTime,
      endTime: slot.endTime,
      reason: slot.reason,
      createdAt: slot.createdAt,
      updatedAt: slot.updatedAt,
    };
  }
}
