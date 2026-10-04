jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { ApprovalRequestEntity } from '~/entities/approval-request.entity';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { UserEntity } from '~/entities/user.entity';
import { ApprovalRequestRepository } from '~/repositories/approval-request.repository';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { UserRepository } from '~/repositories/user.repository';
import { AdminApproveOwnerDto } from '../dto/admin-approve-owner.dto';
import { AdminOwnerApprovalQueryDto } from '../dto/admin-owner-approval-query.dto';
import { AdminRejectOwnerDto } from '../dto/admin-reject-owner.dto';
import { AdminOwnerApprovalService } from './admin-owner-approval.service';

describe('AdminOwnerApprovalService', () => {
  let service: AdminOwnerApprovalService;
  let approvalRequestRepository: jest.Mocked<ApprovalRequestRepository>;
  let ownerProfileRepository: jest.Mocked<OwnerProfileRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let dataSource: jest.Mocked<DataSource>;

  let mockAdminUser: UserEntity;
  let mockRequesterUser: UserEntity;
  let mockProfile: OwnerProfileEntity;
  let mockPendingRequest: ApprovalRequestEntity;

  beforeEach(() => {
    mockAdminUser = {
      id: 'admin-1',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
    } as UserEntity;

    mockRequesterUser = {
      id: 'user-1',
      email: 'applicant@example.com',
      phone: '0901234567',
      role: 'user',
      status: 'active',
    } as UserEntity;

    mockProfile = {
      id: 'profile-1',
      userId: 'user-1',
      businessName: 'Tan Binh Sport Complex',
      businessLicense: 'GPKD-123456',
      bankAccount: 'VCB-0071000123456',
      verifiedAt: null,
    } as OwnerProfileEntity;

    mockPendingRequest = {
      id: 'req-1',
      type: 'owner_register',
      targetId: 'profile-1',
      requestedBy: 'user-1',
      requester: mockRequesterUser,
      status: 'pending',
      note: 'Xin duyet som',
      reviewedBy: null,
      reviewer: null,
      reviewedAt: null,
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
    } as ApprovalRequestEntity;

    approvalRequestRepository = {
      findOwnerRegistrations: jest.fn(),
      findOwnerRegistrationById: jest.fn(),
    } as unknown as jest.Mocked<ApprovalRequestRepository>;

    ownerProfileRepository = {
      findById: jest.fn(),
      findByIds: jest.fn(),
    } as unknown as jest.Mocked<OwnerProfileRepository>;

    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    dataSource = {
      transaction: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    service = new AdminOwnerApprovalService(
      approvalRequestRepository,
      ownerProfileRepository,
      userRepository,
      dataSource,
    );
  });

  describe('getOwnerApprovals', () => {
    it('returns paginated list of owner approval requests with bulk fetched target owner profiles', async () => {
      const query: AdminOwnerApprovalQueryDto = {
        status: 'pending',
        page: 1,
        limit: 10,
      };

      approvalRequestRepository.findOwnerRegistrations.mockResolvedValue({
        items: [mockPendingRequest],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      ownerProfileRepository.findByIds.mockResolvedValue([mockProfile]);

      const result = await service.getOwnerApprovals(query);

      expect(approvalRequestRepository.findOwnerRegistrations).toHaveBeenCalledWith(query);
      expect(ownerProfileRepository.findByIds).toHaveBeenCalledWith(['profile-1']);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].id).toBe('req-1');
      expect(result.items[0].requester.email).toBe('applicant@example.com');
      expect(result.items[0].ownerProfile?.businessName).toBe('Tan Binh Sport Complex');
    });
  });

  describe('getOwnerApprovalDetail', () => {
    it('throws 404 APPROVAL_REQUEST_NOT_FOUND when request does not exist', async () => {
      approvalRequestRepository.findOwnerRegistrationById.mockResolvedValue(null);

      try {
        await service.getOwnerApprovalDetail('non-existent');
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'APPROVAL_REQUEST_NOT_FOUND',
          }),
        );
      }
    });

    it('returns detailed approval request with profile and reviewer info', async () => {
      approvalRequestRepository.findOwnerRegistrationById.mockResolvedValue(mockPendingRequest);
      ownerProfileRepository.findById.mockResolvedValue(mockProfile);

      const result = await service.getOwnerApprovalDetail('req-1');

      expect(result.id).toBe('req-1');
      expect(result.status).toBe('pending');
      expect(result.requester.id).toBe('user-1');
      expect(result.ownerProfile?.id).toBe('profile-1');
      expect(result.reviewer).toBeNull();
    });
  });

  describe('approveOwnerRegistration', () => {
    const approveDto: AdminApproveOwnerDto = {
      note: 'Ho so hop le. Da phe duyet.',
    };

    it('throws 404 APPROVAL_REQUEST_NOT_FOUND when request does not exist inside transaction', async () => {
      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue(null),
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

      try {
        await service.approveOwnerRegistration('non-existent', 'admin-1', approveDto);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'APPROVAL_REQUEST_NOT_FOUND',
          }),
        );
      }
    });

    it('throws 400 APPROVAL_REQUEST_ALREADY_PROCESSED when locked request is not pending', async () => {
      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({
          ...mockPendingRequest,
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

      try {
        await service.approveOwnerRegistration('req-1', 'admin-1', approveDto);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'APPROVAL_REQUEST_ALREADY_PROCESSED',
          }),
        );
      }
    });

    it('successfully approves request, updates profile and promotes user to owner in transaction with lock', async () => {
      userRepository.findById.mockResolvedValue(mockAdminUser);

      const updatedRequest = {
        ...mockPendingRequest,
        status: 'approved',
        reviewedBy: 'admin-1',
        reviewer: mockAdminUser,
        note: approveDto.note,
        reviewedAt: new Date(),
      } as ApprovalRequestEntity;

      const updatedProfile = {
        ...mockProfile,
        verifiedAt: new Date(),
      } as OwnerProfileEntity;

      const mockOwnerRepo = {
        findOne: jest.fn().mockResolvedValue(mockProfile),
        save: jest.fn().mockResolvedValue(updatedProfile),
      };

      const mockUserRepo = {
        findOne: jest.fn().mockResolvedValue(mockRequesterUser),
        save: jest.fn().mockResolvedValue({ ...mockRequesterUser, role: 'owner' }),
      };

      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockPendingRequest }),
        save: jest.fn().mockResolvedValue(updatedRequest),
      };

      const mockManager = {
        getRepository: jest.fn((entity) => {
          if (entity === OwnerProfileEntity) return mockOwnerRepo;
          if (entity === UserEntity) return mockUserRepo;
          if (entity === ApprovalRequestEntity) return mockApprovalRepo;
          return {};
        }),
      } as unknown as EntityManager;

      dataSource.transaction.mockImplementation(async (callback: any) => {
        return callback(mockManager);
      });

      const result = await service.approveOwnerRegistration('req-1', 'admin-1', approveDto);

      expect(mockApprovalRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'req-1', type: 'owner_register' },
        lock: { mode: 'pessimistic_write' },
      });
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result.status).toBe('approved');
      expect(result.note).toBe('Ho so hop le. Da phe duyet.');
      expect(result.reviewer?.email).toBe('admin@example.com');
    });
  });

  describe('rejectOwnerRegistration', () => {
    const rejectDto: AdminRejectOwnerDto = {
      reason: 'Giay phep kinh doanh khong hop le',
    };

    it('throws 404 APPROVAL_REQUEST_NOT_FOUND when request does not exist inside transaction', async () => {
      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue(null),
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

      try {
        await service.rejectOwnerRegistration('non-existent', 'admin-1', rejectDto);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('throws 400 APPROVAL_REQUEST_ALREADY_PROCESSED when request is already rejected inside transaction', async () => {
      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({
          ...mockPendingRequest,
          status: 'rejected',
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

      try {
        await service.rejectOwnerRegistration('req-1', 'admin-1', rejectDto);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'APPROVAL_REQUEST_ALREADY_PROCESSED',
          }),
        );
      }
    });

    it('successfully rejects request in transaction without changing user role', async () => {
      userRepository.findById.mockResolvedValue(mockAdminUser);

      const updatedRequest = {
        ...mockPendingRequest,
        status: 'rejected',
        reviewedBy: 'admin-1',
        reviewer: mockAdminUser,
        note: rejectDto.reason,
        reviewedAt: new Date(),
      } as ApprovalRequestEntity;

      const mockApprovalRepo = {
        findOne: jest.fn().mockResolvedValue({ ...mockPendingRequest }),
        save: jest.fn().mockResolvedValue(updatedRequest),
      };

      const mockOwnerRepo = {
        findOne: jest.fn().mockResolvedValue(mockProfile),
      };

      const mockManager = {
        getRepository: jest.fn((entity) => {
          if (entity === ApprovalRequestEntity) return mockApprovalRepo;
          if (entity === OwnerProfileEntity) return mockOwnerRepo;
          return {};
        }),
      } as unknown as EntityManager;

      dataSource.transaction.mockImplementation(async (callback: any) => {
        return callback(mockManager);
      });

      const result = await service.rejectOwnerRegistration('req-1', 'admin-1', rejectDto);

      expect(mockApprovalRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'req-1', type: 'owner_register' },
        lock: { mode: 'pessimistic_write' },
      });
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result.status).toBe('rejected');
      expect(result.note).toBe('Giay phep kinh doanh khong hop le');
      expect(result.reviewer?.email).toBe('admin@example.com');
    });
  });
});
