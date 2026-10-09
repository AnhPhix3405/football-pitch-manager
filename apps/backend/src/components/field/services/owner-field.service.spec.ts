jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { FieldEntity } from '~/entities/field.entity';
import { FieldRepository } from '~/repositories/field.repository';
import { CreateFieldDto } from '../dto/create-field.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';
import { OwnerFieldService } from './owner-field.service';

describe('OwnerFieldService', () => {
  let service: OwnerFieldService;
  let fieldRepository: jest.Mocked<FieldRepository>;

  const mockOwnerId = 'owner-123';
  const mockFieldEntity: FieldEntity = {
    id: 'field-123',
    ownerId: mockOwnerId,
    name: 'Sân bóng Tân Bình Sport',
    address: '120 Hoàng Hoa Thám',
    district: 'Tân Bình',
    lat: '10.7981230',
    lng: '106.6543210',
    description: 'Sân cỏ nhân tạo cao cấp',
    status: 'pending',
    requireDeposit: true,
    depositType: 'fixed',
    depositValue: '100000.00',
    createdAt: new Date('2026-10-04T10:00:00Z'),
    updatedAt: new Date('2026-10-04T10:00:00Z'),
    owner: {} as any,
  };

  beforeEach(() => {
    fieldRepository = {
      createField: jest.fn(),
      findByOwnerIdWithPagination: jest.fn(),
      findByIdAndOwnerId: jest.fn(),
      findActiveFieldsWithPagination: jest.fn(),
      findActiveById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<FieldRepository>;

    service = new OwnerFieldService(fieldRepository);
  });

  describe('createField', () => {
    it('creates a field successfully with fixed deposit', async () => {
      const dto: CreateFieldDto = {
        name: 'Sân bóng Tân Bình Sport',
        address: '120 Hoàng Hoa Thám',
        district: 'Tân Bình',
        lat: 10.798123,
        lng: 106.654321,
        description: 'Sân cỏ nhân tạo cao cấp',
        requireDeposit: true,
        depositType: 'fixed',
        depositValue: 100000,
      };

      fieldRepository.createField.mockResolvedValue(mockFieldEntity);

      const result = await service.createField(mockOwnerId, dto);

      expect(fieldRepository.createField).toHaveBeenCalledWith(mockOwnerId, {
        name: 'Sân bóng Tân Bình Sport',
        address: '120 Hoàng Hoa Thám',
        district: 'Tân Bình',
        lat: 10.798123,
        lng: 106.654321,
        description: 'Sân cỏ nhân tạo cao cấp',
        requireDeposit: true,
        depositType: 'fixed',
        depositValue: 100000,
      });
      expect(result.id).toBe('field-123');
      expect(result.status).toBe('pending');
      expect(result.depositValue).toBe(100000);
    });

    it('creates a field successfully without deposit (clearing deposit fields)', async () => {
      const dto: CreateFieldDto = {
        name: 'Sân bóng Không Cọc',
        address: '120 Hoàng Hoa Thám',
        requireDeposit: false,
      };

      const entityWithoutDeposit = {
        ...mockFieldEntity,
        requireDeposit: false,
        depositType: null,
        depositValue: null,
      };

      fieldRepository.createField.mockResolvedValue(entityWithoutDeposit);

      const result = await service.createField(mockOwnerId, dto);

      expect(fieldRepository.createField).toHaveBeenCalledWith(mockOwnerId, {
        name: 'Sân bóng Không Cọc',
        address: '120 Hoàng Hoa Thám',
        district: null,
        lat: null,
        lng: null,
        description: null,
        requireDeposit: false,
        depositType: null,
        depositValue: null,
      });
      expect(result.requireDeposit).toBe(false);
      expect(result.depositType).toBeNull();
      expect(result.depositValue).toBeNull();
    });

    it('throws 400 when requireDeposit is true but depositType is missing/invalid', async () => {
      const dto: CreateFieldDto = {
        name: 'Sân bóng',
        address: '123 Đường A',
        requireDeposit: true,
        depositType: 'invalid-type' as any,
        depositValue: 50,
      };

      await expect(service.createField(mockOwnerId, dto)).rejects.toThrow(
        ApplicationException,
      );
    });

    it('throws 400 when percentage deposit is greater than 100 or <= 0', async () => {
      const dto: CreateFieldDto = {
        name: 'Sân bóng',
        address: '123 Đường A',
        requireDeposit: true,
        depositType: 'percentage',
        depositValue: 150,
      };

      await expect(service.createField(mockOwnerId, dto)).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('getOwnerFields', () => {
    it('returns paginated list of fields for owner', async () => {
      fieldRepository.findByOwnerIdWithPagination.mockResolvedValue({
        items: [mockFieldEntity],
        total: 1,
      });

      const result = await service.getOwnerFields(mockOwnerId, {
        page: 1,
        limit: 10,
        search: 'Tân Bình',
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.items[0].name).toBe('Sân bóng Tân Bình Sport');
    });
  });

  describe('getOwnerFieldDetail', () => {
    it('returns field detail when field exists and belongs to owner', async () => {
      fieldRepository.findByIdAndOwnerId.mockResolvedValue(mockFieldEntity);

      const result = await service.getOwnerFieldDetail('field-123', mockOwnerId);

      expect(result.id).toBe('field-123');
      expect(result.ownerId).toBe(mockOwnerId);
    });

    it('throws 404 FIELD_NOT_FOUND when field does not exist or not owned by caller', async () => {
      fieldRepository.findByIdAndOwnerId.mockResolvedValue(null);

      try {
        await service.getOwnerFieldDetail('field-999', mockOwnerId);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('updateField', () => {
    it('updates field information and deposit configuration', async () => {
      const updateDto: UpdateFieldDto = {
        name: 'Sân bóng Tân Bình Mới',
        requireDeposit: false,
      };

      fieldRepository.findByIdAndOwnerId.mockResolvedValue({ ...mockFieldEntity });
      fieldRepository.save.mockImplementation(async (entity: any) => entity);

      const result = await service.updateField('field-123', mockOwnerId, updateDto);

      expect(result.name).toBe('Sân bóng Tân Bình Mới');
      expect(result.requireDeposit).toBe(false);
      expect(result.depositType).toBeNull();
      expect(result.depositValue).toBeNull();
    });

    it('throws 404 when updating non-existent field', async () => {
      fieldRepository.findByIdAndOwnerId.mockResolvedValue(null);

      await expect(
        service.updateField('field-999', mockOwnerId, { name: 'Mới' }),
      ).rejects.toThrow(ApplicationException);
    });
  });

  describe('deactivateField', () => {
    it('sets field status to inactive', async () => {
      fieldRepository.findByIdAndOwnerId.mockResolvedValue({ ...mockFieldEntity });
      fieldRepository.save.mockImplementation(async (entity: any) => entity);

      const result = await service.deactivateField('field-123', mockOwnerId);

      expect(result.status).toBe('inactive');
      expect(fieldRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'inactive' }),
      );
    });
  });
});
