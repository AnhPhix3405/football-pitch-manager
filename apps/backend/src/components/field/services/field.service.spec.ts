/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

  const validFieldId = 'd3b07384-d113-40e1-95b6-75399589d6e4';
  const mockActiveField: FieldEntity = {
    id: validFieldId,
    ownerId: 'b7c12345-d113-40e1-95b6-75399589d6e4',
    name: 'Sân bóng Chảo Lửa',
    address: '30 Phan Thúc Duyện',
    district: 'Tân Bình',
    lat: '10.8000000',
    lng: '106.6600000',
    description: 'Sân 7 người',
    status: 'active',
    requireDeposit: true,
    depositType: 'fixed',
    depositValue: '100000.00',
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
    it('returns paginated active fields and forwards all query options', async () => {
      fieldRepository.findActiveFieldsWithPagination.mockResolvedValue({
        items: [mockActiveField],
        total: 1,
      });

      const result = await service.getPublicFields({
        page: 2,
        limit: 15,
        search: 'Chảo Lửa',
        district: 'Tân Bình',
        requireDeposit: true,
        sortBy: 'name',
        sortOrder: 'ASC',
      });

      expect(
        fieldRepository.findActiveFieldsWithPagination,
      ).toHaveBeenCalledWith({
        page: 2,
        limit: 15,
        search: 'Chảo Lửa',
        district: 'Tân Bình',
        requireDeposit: true,
        sortBy: 'name',
        sortOrder: 'ASC',
      });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
      expect(result.totalPages).toBe(1);
      expect(result.items[0].name).toBe('Sân bóng Chảo Lửa');
      expect(result.items[0].status).toBe('active');
      expect(result.items[0].requireDeposit).toBe(true);
      expect(result.items[0].depositValue).toBe(100000);
    });

    it('handles total 0 returning totalPages 0', async () => {
      fieldRepository.findActiveFieldsWithPagination.mockResolvedValue({
        items: [],
        total: 0,
      });

      const result = await service.getPublicFields({});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('getPublicFieldDetail', () => {
    it('returns active field detail by valid UUID', async () => {
      fieldRepository.findActiveById.mockResolvedValue(mockActiveField);

      const result = await service.getPublicFieldDetail(validFieldId);

      expect(fieldRepository.findActiveById).toHaveBeenCalledWith(validFieldId);
      expect(result.id).toBe(validFieldId);
      expect(result.name).toBe('Sân bóng Chảo Lửa');
    });

    it('throws 400 INVALID_FIELD_ID when field ID is not a valid UUID', async () => {
      try {
        await service.getPublicFieldDetail('invalid-uuid-format');
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect((appError.getResponse() as any).code).toBe('INVALID_FIELD_ID');
      }

      expect(fieldRepository.findActiveById).not.toHaveBeenCalled();
    });

    it('throws 404 FIELD_NOT_FOUND when valid UUID is not active or not found', async () => {
      const nonExistentUuid = '00000000-0000-0000-0000-000000000000';
      fieldRepository.findActiveById.mockResolvedValue(null);

      try {
        await service.getPublicFieldDetail(nonExistentUuid);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect((appError.getResponse() as any).code).toBe('FIELD_NOT_FOUND');
      }

      expect(fieldRepository.findActiveById).toHaveBeenCalledWith(
        nonExistentUuid,
      );
    });
  });
});
