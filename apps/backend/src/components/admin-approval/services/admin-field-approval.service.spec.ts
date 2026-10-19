/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/require-await */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { DataSource, EntityManager } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { FieldEntity } from '~/entities/field.entity';
import { UserEntity } from '~/entities/user.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { FieldRepository } from '~/repositories/field.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AdminApproveFieldDto } from '../dto/admin-approve-field.dto';
import { AdminFieldApprovalQueryDto } from '../dto/admin-field-approval-query.dto';
import { AdminRejectFieldDto } from '../dto/admin-reject-field.dto';
import { AdminFieldApprovalService } from './admin-field-approval.service';

describe('AdminFieldApprovalService', () => {
  let service: AdminFieldApprovalService;
  let approvalRequestRepository: jest.Mocked<ApprovalRequestRepository>;
  let fieldRepository: jest.Mocked<FieldRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let dataSource: jest.Mocked<DataSource>;

  let mockAdminUser: UserEntity;
  let mockRequesterUser: UserEntity;
  let mockField: FieldEntity;
  let mockPendingCreateRequest: ApprovalRequestEntity;
  let mockPendingUpdateRequest: ApprovalRequestEntity;

  beforeEach(() => {
    mockAdminUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
    } as UserEntity;

    mockRequesterUser = {
      id: 'owner-1',
      email: 'owner@example.com',
      phone: '0901234567',
      role: 'owner',
      status: 'active',
    } as UserEntity;

    mockField = {
      id: 'field-1',
      ownerId: 'owner-1',
      name: 'Sân bóng Tân Bình Sport',
      address: '120 Hoàng Hoa Thám',
      district: 'Tân Bình',
      lat: '10.7981230',
      lng: '106.6543210',
      description: 'Sân cỏ nhân tạo',
      status: 'pending',
      requireDeposit: true,
      depositType: 'fixed',
      depositValue: '100000.00',
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
      updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    } as FieldEntity;

    mockPendingCreateRequest = {
      id: 'req-create-1',
      type: 'field_create',
      targetId: 'field-1',
      requestedBy: 'owner-1',
      requester: mockRequesterUser,
      status: 'pending',
      note: null,
      reviewedBy: null,
      reviewer: null,
      reviewedAt: null,
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    } as ApprovalRequestEntity;

    mockPendingUpdateRequest = {
      id: 'req-update-1',
      type: 'field_update',
      targetId: 'field-1',
      requestedBy: 'owner-1',
      requester: mockRequesterUser,
      status: 'pending',
      note: JSON.stringify({
        proposedChanges: {
          name: 'Sân bóng Tân Bình Đổi Tên',
          requireDeposit: false,
          depositType: null,
          depositValue: null,
        },
      }),
      reviewedBy: null,
      reviewer: null,
      reviewedAt: null,
      createdAt: new Date('2026-01-02T10:00:00.000Z'),
    } as ApprovalRequestEntity;

    approvalRequestRepository = {
      findFieldApprovals: jest.fn(),
      findFieldApprovalById: jest.fn(),
    } as unknown as jest.Mocked<ApprovalRequestRepository>;

    fieldRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
      findByIdAndOwnerId: jest.fn(),
      findActiveById: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<FieldRepository>;

    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    dataSource = {
      transaction: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    service = new AdminFieldApprovalService(
      approvalRequestRepository,
      fieldRepository,
      userRepository,
      dataSource,
    );
  });

  describe('getFieldApprovals', () => {
    it('returns paginated list of field approvals with target fields', async () => {
      const query: AdminFieldApprovalQueryDto = {
        status: 'pending',
        type: 'all',
        page: 1,
        limit: 10,
      };

      approvalRequestRepository.findFieldApprovals.mockResolvedValue({
        items: [mockPendingCreateRequest],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      fieldRepository.findByIds.mockResolvedValue([mockField]);

      const result = await service.getFieldApprovals(query);

      expect(approvalRequestRepository.findFieldApprovals).toHaveBeenCalledWith(
        query,
      );
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('req-create-1');
      expect(result.items[0].type).toBe('field_create');
      expect(result.total).toBe(1);
    });
  });

  describe('getFieldApprovalDetail', () => {
    it('returns single field approval detail with target field', async () => {
      approvalRequestRepository.findFieldApprovalById.mockResolvedValue(
        mockPendingCreateRequest,
      );
      fieldRepository.findById.mockResolvedValue(mockField);

      const result = await service.getFieldApprovalDetail('req-create-1');

      expect(
        approvalRequestRepository.findFieldApprovalById,
      ).toHaveBeenCalledWith('req-create-1');
      expect(result.id).toBe('req-create-1');
      expect(result.targetField?.id).toBe('field-1');
    });

    it('throws 404 APPROVAL_REQUEST_NOT_FOUND when request not found', async () => {
      approvalRequestRepository.findFieldApprovalById.mockResolvedValue(null);

      await expect(service.getFieldApprovalDetail('not-exist')).rejects.toThrow(
        ApplicationException,
      );
    });
  });

  describe('approveFieldRequest', () => {
    it('approves field_create request and activates field in transaction', async () => {
      const approveDto: AdminApproveFieldDto = { note: 'Cụm sân hợp lệ' };
      userRepository.findById.mockResolvedValue(mockAdminUser);

      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockPendingCreateRequest }),
        save: jest.fn().mockImplementation(async (entity) => ({
          ...entity,
          reviewer: mockAdminUser,
        })),
      };

      const mockFieldRepo = {
        findOne: jest
          .fn()
          .mockResolvedValue({ ...mockField, status: 'pending' }),
        save: jest.fn().mockImplementation(async (entity) => entity),
      };

      const mockUserRepo = {
        findOne: jest.fn().mockResolvedValue(mockRequesterUser),
      };

      const mockManager = {
        getRepository: jest.fn((entity) => {
          if (entity === ApprovalRequestEntity) return mockApprovalRepo;
          if (entity === FieldEntity) return mockFieldRepo;
          if (entity === UserEntity) return mockUserRepo;
          return {};
        }),
      } as unknown as EntityManager;

      dataSource.transaction.mockImplementation(async (callback: any) => {
        return callback(mockManager);
      });

      const result = await service.approveFieldRequest(
        'req-create-1',
        'admin-1',
        approveDto,
      );

      expect(dataSource.transaction).toHaveBeenCalled();
      expect(mockApprovalRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
      expect(mockFieldRepo.findOne).toHaveBeenCalledWith(
        expect.objectContaining({ lock: { mode: 'pessimistic_write' } }),
      );
      expect(mockFieldRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' }),
      );
      expect(result.status).toBe('approved');
      expect(result.targetField?.status).toBe('active');
    });

    it('approves field_update request and applies proposed changes to field', async () => {
      const approveDto: AdminApproveFieldDto = { note: 'Duyệt thay đổi' };
      userRepository.findById.mockResolvedValue(mockAdminUser);

      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockPendingUpdateRequest }),
        save: jest.fn().mockImplementation(async (entity) => ({
          ...entity,
          reviewer: mockAdminUser,
        })),
      };

      const mockFieldRepo = {
        findOne: jest
          .fn()
          .mockResolvedValue({ ...mockField, status: 'active' }),
        save: jest.fn().mockImplementation(async (entity) => entity),
      };

      const mockUserRepo = {
        findOne: jest.fn().mockResolvedValue(mockRequesterUser),
      };

      const mockManager = {
        getRepository: jest.fn((entity) => {
          if (entity === ApprovalRequestEntity) return mockApprovalRepo;
          if (entity === FieldEntity) return mockFieldRepo;
          if (entity === UserEntity) return mockUserRepo;
          return {};
        }),
      } as unknown as EntityManager;

      dataSource.transaction.mockImplementation(async (callback: any) => {
        return callback(mockManager);
      });

      const result = await service.approveFieldRequest(
        'req-update-1',
        'admin-1',
        approveDto,
      );

      expect(mockFieldRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Sân bóng Tân Bình Đổi Tên',
          requireDeposit: false,
          status: 'active',
        }),
      );
      expect(result.status).toBe('approved');
    });

    it('throws 400 APPROVAL_REQUEST_ALREADY_PROCESSED if request already processed', async () => {
      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({
          ...mockPendingCreateRequest,
          status: 'approved',
        }),
      };

      const mockManager = {
        getRepository: jest.fn((entity) => {
          if (entity === ApprovalRequestEntity) return mockApprovalRepo;
          return {};
        }),
      } as unknown as EntityManager;

      dataSource.transaction.mockImplementation(async (callback: any) => {
        return callback(mockManager);
      });

      await expect(
        service.approveFieldRequest('req-create-1', 'admin-1', {}),
      ).rejects.toThrow(ApplicationException);
    });

    it('throws 404 FIELD_NOT_FOUND if target field is missing in transaction', async () => {
      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockPendingCreateRequest }),
      };
      const mockFieldRepo = {
        findOne: jest.fn().mockResolvedValue(null),
      };

      const mockManager = {
        getRepository: jest.fn((entity) => {
          if (entity === ApprovalRequestEntity) return mockApprovalRepo;
          if (entity === FieldEntity) return mockFieldRepo;
          return {};
        }),
      } as unknown as EntityManager;

      dataSource.transaction.mockImplementation(async (callback: any) => {
        return callback(mockManager);
      });

      await expect(
        service.approveFieldRequest('req-create-1', 'admin-1', {}),
      ).rejects.toThrow(ApplicationException);
    });
  });

  describe('rejectFieldRequest', () => {
    it('rejects field_create request and sets field status to rejected', async () => {
      const rejectDto: AdminRejectFieldDto = { reason: 'Thiếu giấy phép' };
      userRepository.findById.mockResolvedValue(mockAdminUser);

      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockPendingCreateRequest }),
        save: jest.fn().mockImplementation(async (entity) => ({
          ...entity,
          reviewer: mockAdminUser,
        })),
      };

      const mockFieldRepo = {
        findOne: jest
          .fn()
          .mockResolvedValue({ ...mockField, status: 'pending' }),
        save: jest.fn().mockImplementation(async (entity) => entity),
      };

      const mockUserRepo = {
        findOne: jest.fn().mockResolvedValue(mockRequesterUser),
      };

      const mockManager = {
        getRepository: jest.fn((entity) => {
          if (entity === ApprovalRequestEntity) return mockApprovalRepo;
          if (entity === FieldEntity) return mockFieldRepo;
          if (entity === UserEntity) return mockUserRepo;
          return {};
        }),
      } as unknown as EntityManager;

      dataSource.transaction.mockImplementation(async (callback: any) => {
        return callback(mockManager);
      });

      const result = await service.rejectFieldRequest(
        'req-create-1',
        'admin-1',
        rejectDto,
      );

      expect(mockFieldRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'rejected' }),
      );
      expect(result.status).toBe('rejected');
      expect(result.note).toBe('Thiếu giấy phép');
    });

    it('rejects field_update request without modifying field data or active status', async () => {
      const rejectDto: AdminRejectFieldDto = { reason: 'Tên không phù hợp' };
      userRepository.findById.mockResolvedValue(mockAdminUser);

      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockPendingUpdateRequest }),
        save: jest.fn().mockImplementation(async (entity) => ({
          ...entity,
          reviewer: mockAdminUser,
        })),
      };

      const mockFieldRepo = {
        findOne: jest.fn().mockResolvedValue({
          ...mockField,
          status: 'active',
          name: 'Tên Cũ Giữ Nguyên',
        }),
        save: jest.fn(),
      };

      const mockUserRepo = {
        findOne: jest.fn().mockResolvedValue(mockRequesterUser),
      };

      const mockManager = {
        getRepository: jest.fn((entity) => {
          if (entity === ApprovalRequestEntity) return mockApprovalRepo;
          if (entity === FieldEntity) return mockFieldRepo;
          if (entity === UserEntity) return mockUserRepo;
          return {};
        }),
      } as unknown as EntityManager;

      dataSource.transaction.mockImplementation(async (callback: any) => {
        return callback(mockManager);
      });

      const result = await service.rejectFieldRequest(
        'req-update-1',
        'admin-1',
        rejectDto,
      );

      expect(mockFieldRepo.save).not.toHaveBeenCalled();
      expect(result.status).toBe('rejected');
      expect(result.targetField?.name).toBe('Tên Cũ Giữ Nguyên');
      expect(result.targetField?.status).toBe('active');
    });
  });
});
