/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { FieldEntity } from '~/entities/field.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { CreateFieldDto } from '../dto/create-field.dto';
import { UpdateFieldDto } from '../dto/update-field.dto';
import { OwnerFieldService } from './owner-field.service';

describe('OwnerFieldService', () => {
  let service: OwnerFieldService;
  let fieldRepository: jest.Mocked<FieldRepository>;
  let approvalRequestRepository: jest.Mocked<ApprovalRequestRepository>;
  let dataSource: jest.Mocked<DataSource>;
  let mockManager: jest.Mocked<EntityManager>;
  let mockTransactionalFieldRepo: any;
  let mockTransactionalApprovalRepo: any;

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

    approvalRequestRepository = {
      findPendingByTargetIdAndTypes: jest.fn(),
      findFieldApprovals: jest.fn(),
      findFieldApprovalById: jest.fn(),
      createRequest: jest.fn(),
    } as unknown as jest.Mocked<ApprovalRequestRepository>;

    mockTransactionalFieldRepo = {
      create: jest
        .fn()
        .mockImplementation((data) => ({ ...mockFieldEntity, ...data })),
      save: jest.fn().mockImplementation(async (entity) => entity),
    };

    mockTransactionalApprovalRepo = {
      create: jest
        .fn()
        .mockImplementation((data) => ({ id: 'req-1', ...data })),
      save: jest.fn().mockImplementation(async (entity) => entity),
    };

    mockManager = {
      getRepository: jest.fn((entity) => {
        if (entity === FieldEntity) return mockTransactionalFieldRepo;
        if (entity === ApprovalRequestEntity)
          return mockTransactionalApprovalRepo;
        return {};
      }),
    } as unknown as jest.Mocked<EntityManager>;

    dataSource = {
      transaction: jest.fn().mockImplementation(async (callback: any) => {
        return callback(mockManager);
      }),
    } as unknown as jest.Mocked<DataSource>;

    service = new OwnerFieldService(
      fieldRepository,
      approvalRequestRepository,
      dataSource,
    );
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

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockTransactionalFieldRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sân bóng Tân Bình Sport',
          status: 'pending',
          requireDeposit: true,
          depositType: 'fixed',
          depositValue: '100000',
        }),
      );
      expect(mockTransactionalApprovalRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'field_create',
          requestedBy: mockOwnerId,
          status: 'pending',
        }),
      );
      expect(result.id).toBeDefined();
      expect(result.status).toBe('pending');
      expect(result.depositValue).toBe(100000);
    });

    it('creates a field successfully without deposit (clearing deposit fields)', async () => {
      const dto: CreateFieldDto = {
        name: 'Sân bóng Không Cọc',
        address: '120 Hoàng Hoa Thám',
        requireDeposit: false,
      };

      const result = await service.createField(mockOwnerId, dto);

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockTransactionalFieldRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sân bóng Không Cọc',
          requireDeposit: false,
          depositType: null,
          depositValue: null,
        }),
      );
      expect(result.requireDeposit).toBe(false);
      expect(result.depositType).toBeNull();
      expect(result.depositValue).toBeNull();
    });

    it('throws 400 when requireDeposit is true but depositType is missing/invalid', async () => {
      const dto: CreateFieldDto = {
        name: 'Sân bóng',
        address: '123 Đường A',
        requireDeposit: true,
        depositType: 'invalid-type',
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

      const result = await service.getOwnerFieldDetail(
        'field-123',
        mockOwnerId,
      );

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
    it('updates pending field directly without approval request', async () => {
      const updateDto: UpdateFieldDto = {
        name: 'Sân bóng Tân Bình Mới',
        requireDeposit: false,
      };

      fieldRepository.findByIdAndOwnerId.mockResolvedValue({
        ...mockFieldEntity,
        status: 'pending',
      });
      fieldRepository.save.mockImplementation(async (entity: any) => entity);

      const result = await service.updateField(
        'field-123',
        mockOwnerId,
        updateDto,
      );

      expect(result.name).toBe('Sân bóng Tân Bình Mới');
      expect(result.requireDeposit).toBe(false);
      expect(result.depositType).toBeNull();
      expect(result.depositValue).toBeNull();
      expect(dataSource.transaction).not.toHaveBeenCalled();
    });

    it('creates field_update approval request without modifying active field directly', async () => {
      const updateDto: UpdateFieldDto = {
        name: 'Sân bóng Tân Bình Tên Mới',
        requireDeposit: true,
        depositType: 'fixed',
        depositValue: 200000,
      };

      fieldRepository.findByIdAndOwnerId.mockResolvedValue({
        ...mockFieldEntity,
        status: 'active',
      });
      approvalRequestRepository.findPendingByTargetIdAndTypes.mockResolvedValue(
        null,
      );

      const result = await service.updateField(
        'field-123',
        mockOwnerId,
        updateDto,
      );

      expect(
        approvalRequestRepository.findPendingByTargetIdAndTypes,
      ).toHaveBeenCalledWith('field-123', ['field_create', 'field_update']);
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockTransactionalApprovalRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'field_update',
          targetId: 'field-123',
          requestedBy: mockOwnerId,
          status: 'pending',
          note: expect.stringContaining('Sân bóng Tân Bình Tên Mới'),
        }),
      );
      // Data in active field is preserved
      expect(result.status).toBe('active');
    });

    it('throws 400 FIELD_APPROVAL_REQUEST_PENDING if an active field already has a pending approval request', async () => {
      fieldRepository.findByIdAndOwnerId.mockResolvedValue({
        ...mockFieldEntity,
        status: 'active',
      });
      approvalRequestRepository.findPendingByTargetIdAndTypes.mockResolvedValue(
        {
          id: 'existing-pending-req',
        } as ApprovalRequestEntity,
      );

      await expect(
        service.updateField('field-123', mockOwnerId, { name: 'Đổi tên tiếp' }),
      ).rejects.toThrow(ApplicationException);
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
      fieldRepository.findByIdAndOwnerId.mockResolvedValue({
        ...mockFieldEntity,
      });
      fieldRepository.save.mockImplementation(async (entity: any) => entity);

      const result = await service.deactivateField('field-123', mockOwnerId);

      expect(result.status).toBe('inactive');
      expect(fieldRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'inactive' }),
      );
    });
  });
});
