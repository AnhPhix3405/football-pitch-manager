/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldPricingEntity } from '~/entities/field-pricing.entity';
import { FieldPricingRepository } from '~/repositories/field-pricing.repository';
import { OwnerFieldPricingService } from './owner-field-pricing.service';

describe('OwnerFieldPricingService', () => {
  let service: OwnerFieldPricingService;
  let pricingRepository: jest.Mocked<FieldPricingRepository>;

  beforeEach(() => {
    pricingRepository = {
      findOverlappingSlots: jest.fn(),
      findByField: jest.fn(),
      findByIdAndFieldId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<FieldPricingRepository>;

    service = new OwnerFieldPricingService(pricingRepository);
  });

  describe('createPricing', () => {
    it('throws INVALID_TIME_RANGE when startTime >= endTime', async () => {
      try {
        await service.createPricing('f-1', {
          courtType: '5',
          dayType: 'weekday',
          startTime: '10:00',
          endTime: '08:00',
          price: 200000,
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

    it('throws PRICING_SLOT_OVERLAP when overlapping pricing slot exists', async () => {
      pricingRepository.findOverlappingSlots.mockResolvedValue([
        { id: 'p-existing' } as FieldPricingEntity,
      ]);

      try {
        await service.createPricing('f-1', {
          courtType: '5',
          dayType: 'weekday',
          startTime: '08:00',
          endTime: '12:00',
          price: 200000,
        });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toMatchObject({
          code: 'PRICING_SLOT_OVERLAP',
        });
      }
    });

    it('creates and returns pricing rule when valid', async () => {
      pricingRepository.findOverlappingSlots.mockResolvedValue([]);
      const mockCreated = {
        id: 'p-new',
        fieldId: 'f-1',
        courtType: '5',
        dayType: 'weekday',
        startTime: '06:00',
        endTime: '17:00',
        price: '200000',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as FieldPricingEntity;
      pricingRepository.create.mockReturnValue(mockCreated);
      pricingRepository.save.mockResolvedValue(mockCreated);

      const result = await service.createPricing('f-1', {
        courtType: '5',
        dayType: 'weekday',
        startTime: '06:00',
        endTime: '17:00',
        price: 200000,
      });

      expect(pricingRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fieldId: 'f-1',
          courtType: '5',
          dayType: 'weekday',
          startTime: '06:00',
          endTime: '17:00',
          price: '200000',
        }),
      );
      expect(pricingRepository.save).toHaveBeenCalledWith(mockCreated);
      expect(result.id).toBe('p-new');
      expect(result.price).toBe(200000);
    });
  });

  describe('updatePricing', () => {
    it('throws PRICING_NOT_FOUND when record does not exist', async () => {
      pricingRepository.findByIdAndFieldId.mockResolvedValue(null);

      try {
        await service.updatePricing('f-1', 'p-none', { price: 250000 });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toMatchObject({
          code: 'PRICING_NOT_FOUND',
        });
      }
    });

    it('throws PRICING_SLOT_OVERLAP when update causes overlap', async () => {
      const existing = {
        id: 'p-1',
        fieldId: 'f-1',
        courtType: '5',
        dayType: 'weekday',
        startTime: '06:00',
        endTime: '12:00',
        price: '200000',
      } as FieldPricingEntity;
      pricingRepository.findByIdAndFieldId.mockResolvedValue(existing);
      pricingRepository.findOverlappingSlots.mockResolvedValue([
        { id: 'p-other' } as FieldPricingEntity,
      ]);

      try {
        await service.updatePricing('f-1', 'p-1', { endTime: '18:00' });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toMatchObject({
          code: 'PRICING_SLOT_OVERLAP',
        });
      }
    });
  });

  describe('deletePricing', () => {
    it('deletes pricing when found', async () => {
      const existing = {
        id: 'p-1',
      } as FieldPricingEntity;
      pricingRepository.findByIdAndFieldId.mockResolvedValue(existing);
      pricingRepository.delete.mockResolvedValue(existing);

      const result = await service.deletePricing('f-1', 'p-1');
      expect(result).toEqual({ success: true });
      expect(pricingRepository.delete).toHaveBeenCalledWith(existing);
    });
  });
});
