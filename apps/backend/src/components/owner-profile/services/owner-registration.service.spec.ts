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
import { RegisterOwnerDto } from '../dto/register-owner.dto';
import { OwnerRegistrationService } from './owner-registration.service';

describe('OwnerRegistrationService', () => {
  let service: OwnerRegistrationService;
  let userRepository: jest.Mocked<UserRepository>;
  let ownerProfileRepository: jest.Mocked<OwnerProfileRepository>;
  let approvalRequestRepository: jest.Mocked<ApprovalRequestRepository>;
  let dataSource: jest.Mocked<DataSource>;

  const mockUser = {
    id: 'user-1',
    email: 'user@example.com',
    role: 'user',
    status: 'active',
  } as UserEntity;

  const validDto: RegisterOwnerDto = {
    businessName: 'Tan Binh Sport Complex',
    businessLicense: 'GPKD-123456',
    bankAccount: 'VCB-0071000123456',
    note: 'Xin duyet som',
  };

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    ownerProfileRepository = {
      findByUserId: jest.fn(),
    } as unknown as jest.Mocked<OwnerProfileRepository>;

    approvalRequestRepository = {
      findPendingByRequesterAndType: jest.fn(),
      findLatestByRequesterAndType: jest.fn(),
    } as unknown as jest.Mocked<ApprovalRequestRepository>;

    dataSource = {
      transaction: jest.fn(),
    } as unknown as jest.Mocked<DataSource>;

    service = new OwnerRegistrationService(
      userRepository,
      ownerProfileRepository,
      approvalRequestRepository,
      dataSource,
    );
  });

  describe('registerOwner', () => {
    it('throws 404 USER_NOT_FOUND when user does not exist', async () => {
      userRepository.findById.mockResolvedValue(null);

      try {
        await service.registerOwner('non-existent', validDto);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'USER_NOT_FOUND',
          }),
        );
      }
    });

    it('throws 400 ALREADY_OWNER when user already has role owner', async () => {
      userRepository.findById.mockResolvedValue({
        ...mockUser,
        role: 'owner',
      } as UserEntity);

      try {
        await service.registerOwner('user-1', validDto);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'ALREADY_OWNER',
          }),
        );
      }
    });

    it('throws 400 ALREADY_OWNER when user has role admin', async () => {
      userRepository.findById.mockResolvedValue({
        ...mockUser,
        role: 'admin',
      } as UserEntity);

      try {
        await service.registerOwner('user-1', validDto);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'ALREADY_OWNER',
          }),
        );
      }
    });

    it('throws 400 REGISTRATION_REQUEST_PENDING when user already has pending request', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      approvalRequestRepository.findPendingByRequesterAndType.mockResolvedValue({
        id: 'request-1',
        status: 'pending',
      } as ApprovalRequestEntity);

      try {
        await service.registerOwner('user-1', validDto);
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.BAD_REQUEST);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'REGISTRATION_REQUEST_PENDING',
          }),
        );
      }
    });

    it('successfully creates profile and approval request in transaction when valid', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      approvalRequestRepository.findPendingByRequesterAndType.mockResolvedValue(
        null,
      );

      const mockSavedProfile = {
        id: 'profile-1',
        userId: 'user-1',
        businessName: validDto.businessName,
        businessLicense: validDto.businessLicense,
        bankAccount: validDto.bankAccount,
      } as OwnerProfileEntity;

      const mockSavedRequest = {
        id: 'request-123',
        type: 'owner_register',
        targetId: 'profile-1',
        requestedBy: 'user-1',
        status: 'pending',
        note: validDto.note,
        createdAt: new Date(),
      } as ApprovalRequestEntity;

      const mockManager = {
        getRepository: jest.fn((entity) => {
          if (entity === OwnerProfileEntity) {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockReturnValue(mockSavedProfile),
              save: jest.fn().mockResolvedValue(mockSavedProfile),
            };
          }
          if (entity === ApprovalRequestEntity) {
            return {
              create: jest.fn().mockReturnValue(mockSavedRequest),
              save: jest.fn().mockResolvedValue(mockSavedRequest),
            };
          }
          return {};
        }),
      } as unknown as EntityManager;

      dataSource.transaction.mockImplementation(async (callback: any) => {
        return callback(mockManager);
      });

      const result = await service.registerOwner('user-1', validDto);

      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(
        approvalRequestRepository.findPendingByRequesterAndType,
      ).toHaveBeenCalledWith('user-1', 'owner_register');
      expect(dataSource.transaction).toHaveBeenCalled();
      expect(result.id).toBe('request-123');
      expect(result.type).toBe('owner_register');
      expect(result.targetId).toBe('profile-1');
      expect(result.status).toBe('pending');
      expect(result.note).toBe('Xin duyet som');
    });
  });

  describe('getRegistrationStatus', () => {
    it('throws 404 USER_NOT_FOUND when user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);
      ownerProfileRepository.findByUserId.mockResolvedValue(null);
      approvalRequestRepository.findLatestByRequesterAndType.mockResolvedValue(
        null,
      );

      try {
        await service.getRegistrationStatus('non-existent');
        throw new Error('Should have failed');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('returns status with hasPendingRequest: false and latestRequest: null when no request exists', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      ownerProfileRepository.findByUserId.mockResolvedValue(null);
      approvalRequestRepository.findLatestByRequesterAndType.mockResolvedValue(
        null,
      );

      const result = await service.getRegistrationStatus('user-1');

      expect(result.hasPendingRequest).toBe(false);
      expect(result.currentRole).toBe('user');
      expect(result.latestRequest).toBeNull();
      expect(result.profile).toBeNull();
    });

    it('returns status with hasPendingRequest: true when request is pending', async () => {
      userRepository.findById.mockResolvedValue(mockUser);
      ownerProfileRepository.findByUserId.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        businessName: 'Tan Binh Sport',
        businessLicense: 'GPKD-123',
        bankAccount: 'VCB-001',
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as OwnerProfileEntity);
      approvalRequestRepository.findLatestByRequesterAndType.mockResolvedValue({
        id: 'req-1',
        type: 'owner_register',
        targetId: 'profile-1',
        requestedBy: 'user-1',
        status: 'pending',
        note: 'Dang cho duyet',
        createdAt: new Date(),
      } as ApprovalRequestEntity);

      const result = await service.getRegistrationStatus('user-1');

      expect(result.hasPendingRequest).toBe(true);
      expect(result.currentRole).toBe('user');
      expect(result.latestRequest?.id).toBe('req-1');
      expect(result.latestRequest?.status).toBe('pending');
      expect(result.profile?.businessName).toBe('Tan Binh Sport');
    });
  });
});
