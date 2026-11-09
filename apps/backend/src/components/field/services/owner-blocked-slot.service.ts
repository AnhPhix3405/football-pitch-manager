import { DataSource } from 'typeorm';
import { BookingEntity } from '~/entities/booking.entity';
import { FieldCourtEntity } from '~/entities/field-court.entity';
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
    private readonly db: DataSource,
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

    return this.db.transaction(async (manager) => {
      await manager.findOneOrFail(FieldCourtEntity, {
        where: { id: courtId, fieldId },
        lock: { mode: 'pessimistic_write' },
      });
      const params = {
        courtId,
        date: dto.blockedDate,
        start: dto.startTime,
        end: dto.endTime,
      };
      const conflictingBooking = await manager
        .getRepository(BookingEntity)
        .createQueryBuilder('b')
        .where('b.fieldCourtId = :courtId AND b.bookingDate = :date', params)
        .andWhere('b.startTime < :end AND b.endTime > :start', params)
        .andWhere(
          "(b.status IN ('confirmed', 'completed') OR (b.status = 'pending' AND (b.paymentHoldUntil > now() OR b.paidAmount > 0)))",
        )
        .getExists();
      const conflictingBlock = await manager
        .getRepository(FieldBlockedSlotEntity)
        .createQueryBuilder('s')
        .where('s.fieldCourtId = :courtId AND s.blockedDate = :date', params)
        .andWhere('s.startTime < :end AND s.endTime > :start', params)
        .getExists();
      if (conflictingBooking || conflictingBlock) {
        throw new ApplicationException({
          code: 'BLOCKED_SLOT_OVERLAP',
          messageKey: 'error.blockedSlotOverlap',
          status: HttpStatus.CONFLICT,
        });
      }
      const slot = manager.create(FieldBlockedSlotEntity, {
        id: randomUUID(),
        fieldCourtId: courtId,
        blockedDate: dto.blockedDate,
        startTime: dto.startTime,
        endTime: dto.endTime,
        reason: dto.reason?.trim() ?? null,
      });
      return this.mapToResponse(
        await manager.save(FieldBlockedSlotEntity, slot),
      );
    });
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
