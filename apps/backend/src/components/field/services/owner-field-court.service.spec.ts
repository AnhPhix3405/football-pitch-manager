/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldCourtEntity } from '~/entities/field-court.entity';
import { FieldCourtRepository } from '~/repositories/field-court.repository';
import { OwnerFieldCourtService } from './owner-field-court.service';

describe('OwnerFieldCourtService', () => {
  let service: OwnerFieldCourtService;
  let courtRepository: jest.Mocked<FieldCourtRepository>;

  beforeEach(() => {
    courtRepository = {
      findByFieldId: jest.fn(),
      findByFieldAndName: jest.fn(),
      findByIdAndFieldId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<FieldCourtRepository>;

    service = new OwnerFieldCourtService(courtRepository);
  });

  describe('createCourt', () => {
    it('creates court successfully when name is unique in field', async () => {
      courtRepository.findByFieldAndName.mockResolvedValue(null);
      const mockCreated = {
        id: 'court-1',
        fieldId: 'field-1',
        name: 'Sân 1',
        type: '5',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as FieldCourtEntity;

      courtRepository.create.mockReturnValue(mockCreated);
      courtRepository.save.mockResolvedValue(mockCreated);

      const result = await service.createCourt('field-1', {
        name: 'Sân 1',
        type: '5',
      });

      expect(result.id).toBe('court-1');
      expect(result.name).toBe('Sân 1');
      expect(courtRepository.save).toHaveBeenCalled();
    });

    it('throws 409 Conflict when court name already exists in field', async () => {
      courtRepository.findByFieldAndName.mockResolvedValue({
        id: 'court-existing',
      } as FieldCourtEntity);

      try {
        await service.createCourt('field-1', { name: 'Sân 1', type: '5' });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toMatchObject({
          code: 'COURT_NAME_ALREADY_EXISTS',
        });
      }
    });
  });

  describe('getCourtDetail', () => {
    it('throws 404 NotFound when court does not exist in field', async () => {
      courtRepository.findByIdAndFieldId.mockResolvedValue(null);

      try {
        await service.getCourtDetail('field-1', 'invalid-court');
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toMatchObject({
          code: 'COURT_NOT_FOUND',
        });
      }
    });
  });
});
