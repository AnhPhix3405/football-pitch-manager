jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldEntity } from '~/entities/field.entity';
import { FieldRepository } from '~/repositories/field.repository';
import { FieldService } from './field.service';

describe('FieldService', () => {
  let service: FieldService;
  let fieldRepository: jest.Mocked<FieldRepository>;

  const mockActiveField: FieldEntity = {
    id: 'field-1',
    ownerId: 'owner-1',
    name: 'Sân bóng Chảo Lửa',
    address: '30 Phan Thúc Duyện',
    district: 'Tân Bình',
    lat: '10.8000000',
    lng: '106.6600000',
    description: 'Sân 7 người',
    status: 'active',
    requireDeposit: false,
    depositType: null,
    depositValue: null,
    createdAt: new Date('2026-10-04T10:00:00Z'),
    updatedAt: new Date('2026-10-04T10:00:00Z'),
    owner: {} as any,
  };

  beforeEach(() => {
    fieldRepository = {
      findActiveFieldsWithPagination: jest.fn(),
      findActiveById: jest.fn(),
    } as unknown as jest.Mocked<FieldRepository>;

    service = new FieldService(fieldRepository);
  });

  describe('getPublicFields', () => {
    it('returns paginated active fields', async () => {
      fieldRepository.findActiveFieldsWithPagination.mockResolvedValue({
        items: [mockActiveField],
        total: 1,
      });

      const result = await service.getPublicFields({
        page: 1,
        limit: 10,
        district: 'Tân Bình',
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].name).toBe('Sân bóng Chảo Lửa');
      expect(result.items[0].status).toBe('active');
    });
  });

  describe('getPublicFieldDetail', () => {
    it('returns active field detail by ID', async () => {
      fieldRepository.findActiveById.mockResolvedValue(mockActiveField);

      const result = await service.getPublicFieldDetail('field-1');

      expect(result.id).toBe('field-1');
      expect(result.name).toBe('Sân bóng Chảo Lửa');
    });

    it('throws 404 FIELD_NOT_FOUND when field is not active or not found', async () => {
      fieldRepository.findActiveById.mockResolvedValue(null);

      try {
        await service.getPublicFieldDetail('field-non-existent');
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
