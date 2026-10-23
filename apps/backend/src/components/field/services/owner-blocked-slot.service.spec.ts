/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldBlockedSlotEntity } from '~/entities/field-blocked-slot.entity';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldBlockedSlotRepository } from '~/repositories/field-blocked-slot.repository';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { OwnerBlockedSlotService } from './owner-blocked-slot.service';

describe('OwnerBlockedSlotService', () => {
  let service: OwnerBlockedSlotService;
  let slotRepository: jest.Mocked<FieldBlockedSlotRepository>;
  let courtRepository: jest.Mocked<FieldCourtRepository>;

  beforeEach(() => {
    slotRepository = {
      findOverlappingSlots: jest.fn(),
      findByCourtId: jest.fn(),
      findByIdAndCourtId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<FieldBlockedSlotRepository>;

    courtRepository = {
      findByIdAndFieldId: jest.fn(),
    } as unknown as jest.Mocked<FieldCourtRepository>;

    service = new OwnerBlockedSlotService(slotRepository, courtRepository);
  });

  describe('createBlockedSlot', () => {
    it('creates blocked slot successfully when no overlap exists', async () => {
      courtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'court-1',
        fieldId: 'field-1',
      } as FieldCourtEntity);
      slotRepository.findOverlappingSlots.mockResolvedValue([]);

      const mockSlot = {
        id: 'slot-1',
        fieldCourtId: 'court-1',
        blockedDate: '2026-10-25',
        startTime: '08:00',
        endTime: '10:00',
        reason: 'Bảo trì',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as FieldBlockedSlotEntity;

      slotRepository.create.mockReturnValue(mockSlot);
      slotRepository.save.mockResolvedValue(mockSlot);

      const result = await service.createBlockedSlot('field-1', 'court-1', {
        blockedDate: '2026-10-25',
        startTime: '08:00',
        endTime: '10:00',
        reason: 'Bảo trì',
      });

      expect(result.id).toBe('slot-1');
      expect(slotRepository.save).toHaveBeenCalled();
    });

    it('throws 409 Conflict when overlapping slot exists', async () => {
      courtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'court-1',
        fieldId: 'field-1',
      } as FieldCourtEntity);
      slotRepository.findOverlappingSlots.mockResolvedValue([
        { id: 'existing-slot' } as FieldBlockedSlotEntity,
      ]);

      try {
        await service.createBlockedSlot('field-1', 'court-1', {
          blockedDate: '2026-10-25',
          startTime: '08:30',
          endTime: '09:30',
        });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toMatchObject({
          code: 'BLOCKED_SLOT_OVERLAP',
        });
      }
    });

    it('throws 400 BadRequest when startTime >= endTime', async () => {
      courtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'court-1',
        fieldId: 'field-1',
      } as FieldCourtEntity);

      try {
        await service.createBlockedSlot('field-1', 'court-1', {
          blockedDate: '2026-10-25',
          startTime: '10:00',
          endTime: '08:00',
        });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toMatchObject({
          code: 'INVALID_TIME_RANGE',
        });
      }
    });
  });

  describe('deleteBlockedSlot', () => {
    it('throws 404 NotFound when slot does not exist', async () => {
      courtRepository.findByIdAndFieldId.mockResolvedValue({
        id: 'court-1',
        fieldId: 'field-1',
      } as FieldCourtEntity);
      slotRepository.findByIdAndCourtId.mockResolvedValue(null);

      try {
        await service.deleteBlockedSlot('field-1', 'court-1', 'invalid-slot');
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toMatchObject({
          code: 'BLOCKED_SLOT_NOT_FOUND',
        });
      }
    });
  });
});
