/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldOpeningHourEntity } from '~/entities/field-opening-hour.entity';
import { FieldPricingEntity } from '~/entities/field-pricing.entity';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { FieldPricingRepository } from '~/repositories/field-pricing.repository';
import { FieldPricingCalculatorService } from './field-pricing-calculator.service';

describe('FieldPricingCalculatorService', () => {
  let service: FieldPricingCalculatorService;
  let pricingRepository: jest.Mocked<FieldPricingRepository>;
  let openingHourRepository: jest.Mocked<FieldOpeningHourRepository>;

  beforeEach(() => {
    pricingRepository = {
      findByField: jest.fn(),
    } as unknown as jest.Mocked<FieldPricingRepository>;

    openingHourRepository = {
      findByFieldAndDay: jest.fn(),
    } as unknown as jest.Mocked<FieldOpeningHourRepository>;

    service = new FieldPricingCalculatorService(
      pricingRepository,
      openingHourRepository,
    );
  });

  describe('determineDayType', () => {
    it('returns weekday for Monday to Friday', () => {
      // 2026-10-26 is Monday
      expect(service.determineDayType('2026-10-26')).toBe('weekday');
      // 2026-10-23 is Friday
      expect(service.determineDayType('2026-10-23')).toBe('weekday');
    });

    it('returns weekend for Saturday and Sunday', () => {
      // 2026-10-24 is Saturday
      expect(service.determineDayType('2026-10-24')).toBe('weekend');
      // 2026-10-25 is Sunday
      expect(service.determineDayType('2026-10-25')).toBe('weekend');
    });
  });

  describe('calculateQuote', () => {
    it('throws OUTSIDE_OPENING_HOURS when field is closed or requested time is outside opening hours', async () => {
      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: true,
      } as FieldOpeningHourEntity);

      try {
        await service.calculateQuote('f-1', {
          courtType: '5',
          date: '2026-10-26',
          startTime: '08:00',
          endTime: '10:00',
        });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toMatchObject({
          code: 'OUTSIDE_OPENING_HOURS',
        });
      }
    });

    it('throws PRICE_CONFIGURATION_MISSING when a sub-range has no pricing rule', async () => {
      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: false,
        openTime: '06:00',
        closeTime: '22:00',
      } as FieldOpeningHourEntity);

      pricingRepository.findByField.mockResolvedValue([
        {
          startTime: '06:00',
          endTime: '12:00',
          price: '200000',
        } as FieldPricingEntity,
      ]);

      try {
        await service.calculateQuote('f-1', {
          courtType: '5',
          date: '2026-10-26',
          startTime: '10:00',
          endTime: '14:00',
        });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toMatchObject({
          code: 'PRICE_CONFIGURATION_MISSING',
        });
      }
    });

    it('calculates single window pricing correctly', async () => {
      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: false,
        openTime: '06:00',
        closeTime: '22:00',
      } as FieldOpeningHourEntity);

      pricingRepository.findByField.mockResolvedValue([
        {
          startTime: '06:00',
          endTime: '17:00',
          price: '200000',
        } as FieldPricingEntity,
      ]);

      const quote = await service.calculateQuote('f-1', {
        courtType: '5',
        date: '2026-10-26',
        startTime: '14:00',
        endTime: '16:00',
      });

      expect(quote.totalPrice).toBe(400000);
      expect(quote.totalDurationMinutes).toBe(120);
      expect(quote.breakdown).toHaveLength(1);
      expect(quote.breakdown[0]).toEqual({
        startTime: '14:00',
        endTime: '16:00',
        durationMinutes: 120,
        hourlyRate: 200000,
        subtotal: 400000,
      });
    });

    it('calculates multi-tier spanning pricing accurately', async () => {
      openingHourRepository.findByFieldAndDay.mockResolvedValue({
        isClosed: false,
        openTime: '06:00',
        closeTime: '23:00',
      } as FieldOpeningHourEntity);

      pricingRepository.findByField.mockResolvedValue([
        {
          startTime: '06:00',
          endTime: '17:00',
          price: '200000',
        } as FieldPricingEntity,
        {
          startTime: '17:00',
          endTime: '22:00',
          price: '300000',
        } as FieldPricingEntity,
      ]);

      const quote = await service.calculateQuote('f-1', {
        courtType: '5',
        date: '2026-10-26',
        startTime: '16:00',
        endTime: '18:00',
      });

      expect(quote.totalPrice).toBe(500000); // 1h @ 200k + 1h @ 300k
      expect(quote.totalDurationMinutes).toBe(120);
      expect(quote.breakdown).toHaveLength(2);
      expect(quote.breakdown[0]).toEqual({
        startTime: '16:00',
        endTime: '17:00',
        durationMinutes: 60,
        hourlyRate: 200000,
        subtotal: 200000,
      });
      expect(quote.breakdown[1]).toEqual({
        startTime: '17:00',
        endTime: '18:00',
        durationMinutes: 60,
        hourlyRate: 300000,
        subtotal: 300000,
      });
    });
  });
});
