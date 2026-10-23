/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldOpeningHourEntity } from '~/entities/field-opening-hour.entity';
import { FieldOpeningHourRepository } from '~/repositories/field-opening-hour.repository';
import { OwnerFieldOpeningHourService } from './owner-field-opening-hour.service';

describe('OwnerFieldOpeningHourService', () => {
  let service: OwnerFieldOpeningHourService;
  let repo: jest.Mocked<FieldOpeningHourRepository>;

  beforeEach(() => {
    repo = {
      findByFieldId: jest.fn(),
      upsertWeeklyHours: jest.fn(),
    } as unknown as jest.Mocked<FieldOpeningHourRepository>;

    service = new OwnerFieldOpeningHourService(repo);
  });

  describe('upsertOpeningHours', () => {
    it('saves valid opening hours successfully', async () => {
      const mockResult = [
        {
          id: 'h-1',
          fieldId: 'field-1',
          dayOfWeek: 1,
          openTime: '06:00:00',
          closeTime: '22:00:00',
          isClosed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ] as FieldOpeningHourEntity[];

      repo.upsertWeeklyHours.mockResolvedValue(mockResult);

      const result = await service.upsertOpeningHours('field-1', {
        hours: [
          {
            dayOfWeek: 1,
            openTime: '06:00',
            closeTime: '22:00',
            isClosed: false,
          },
        ],
      });

      expect(result).toHaveLength(1);
      expect(repo.upsertWeeklyHours).toHaveBeenCalled();
    });

    it('throws 400 BadRequest when openTime >= closeTime', async () => {
      try {
        await service.upsertOpeningHours('field-1', {
          hours: [
            {
              dayOfWeek: 1,
              openTime: '22:00',
              closeTime: '06:00',
              isClosed: false,
            },
          ],
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

    it('throws 400 BadRequest when isClosed is false but time is missing', async () => {
      try {
        await service.upsertOpeningHours('field-1', {
          hours: [
            {
              dayOfWeek: 1,
              isClosed: false,
            },
          ],
        });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(error.getResponse()).toMatchObject({
          code: 'INVALID_OPENING_HOURS',
        });
      }
    });
  });
});
