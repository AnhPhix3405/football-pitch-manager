/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldServiceEntity } from '~/entities/field-service.entity';
import { FieldServiceRepository } from '~/repositories/field-service.repository';
import { OwnerFieldServiceService } from './owner-field-service.service';

describe('OwnerFieldServiceService', () => {
  let service: OwnerFieldServiceService;
  let serviceRepository: jest.Mocked<FieldServiceRepository>;

  beforeEach(() => {
    serviceRepository = {
      findByFieldId: jest.fn(),
      findByFieldAndName: jest.fn(),
      findByIdAndFieldId: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<FieldServiceRepository>;

    service = new OwnerFieldServiceService(serviceRepository);
  });

  describe('createService', () => {
    it('creates service successfully when name is unique in field', async () => {
      serviceRepository.findByFieldAndName.mockResolvedValue(null);
      const mockCreated = {
        id: 'srv-1',
        fieldId: 'field-1',
        name: 'Thuê bóng',
        price: '50000.00',
        unit: 'quả',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as FieldServiceEntity;

      serviceRepository.create.mockReturnValue(mockCreated);
      serviceRepository.save.mockResolvedValue(mockCreated);

      const result = await service.createService('field-1', {
        name: 'Thuê bóng',
        price: 50000,
        unit: 'quả',
      });

      expect(result.id).toBe('srv-1');
      expect(result.name).toBe('Thuê bóng');
      expect(serviceRepository.save).toHaveBeenCalled();
    });

    it('throws 409 Conflict when service name already exists in field', async () => {
      serviceRepository.findByFieldAndName.mockResolvedValue({
        id: 'srv-existing',
      } as FieldServiceEntity);

      try {
        await service.createService('field-1', {
          name: 'Thuê bóng',
          price: 50000,
        });
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.CONFLICT);
        expect(error.getResponse()).toMatchObject({
          code: 'SERVICE_NAME_ALREADY_EXISTS',
        });
      }
    });
  });

  describe('deleteService', () => {
    it('throws 404 NotFound when service does not exist in field', async () => {
      serviceRepository.findByIdAndFieldId.mockResolvedValue(null);

      try {
        await service.deleteService('field-1', 'invalid-srv');
        fail('Should have thrown ApplicationException');
      } catch (error: any) {
        expect(error).toBeInstanceOf(ApplicationException);
        expect(error.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(error.getResponse()).toMatchObject({
          code: 'SERVICE_NOT_FOUND',
        });
      }
    });
  });
});
