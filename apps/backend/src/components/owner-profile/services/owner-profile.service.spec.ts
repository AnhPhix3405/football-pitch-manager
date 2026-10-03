jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { ApplicationException } from '~/common/exceptions/application.exception';
import { OwnerProfileEntity } from '~/entities/owner-profile.entity';
import { OwnerProfileRepository } from '~/repositories/owner-profile.repository';
import { OwnerProfileService } from './owner-profile.service';

describe('OwnerProfileService', () => {
  let service: OwnerProfileService;
  let repository: jest.Mocked<OwnerProfileRepository>;

  beforeEach(() => {
    repository = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      upsertByUserId: jest.fn(),
    } as unknown as jest.Mocked<OwnerProfileRepository>;

    service = new OwnerProfileService(repository);
  });

  describe('getProfileByUserId', () => {
    it('should return owner profile DTO when profile exists and is verified', async () => {
      const mockEntity = {
        id: 'owner-profile-1',
        userId: 'user-1',
        businessName: 'My Field Inc',
        businessLicense: 'LIC-123456',
        bankAccount: '9876543210',
        verifiedAt: new Date('2026-01-01'),
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        user: {
          id: 'user-1',
          email: 'owner@example.com',
          phone: '0901234567',
          role: 'owner',
          status: 'active',
        },
      } as unknown as OwnerProfileEntity;

      repository.findByUserId.mockResolvedValue(mockEntity);

      const result = await service.getProfileByUserId('user-1');

      expect(repository.findByUserId).toHaveBeenCalledWith('user-1');
      expect(result.id).toBe('owner-profile-1');
      expect(result.businessName).toBe('My Field Inc');
      expect(result.isVerified).toBe(true);
      expect(result.user?.email).toBe('owner@example.com');
      expect(result.user?.role).toBe('owner');
    });

    it('should return isVerified as false when verifiedAt is null', async () => {
      const mockEntity = {
        id: 'owner-profile-2',
        userId: 'user-2',
        businessName: null,
        businessLicense: null,
        bankAccount: null,
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as OwnerProfileEntity;

      repository.findByUserId.mockResolvedValue(mockEntity);

      const result = await service.getProfileByUserId('user-2');

      expect(result.isVerified).toBe(false);
      expect(result.verifiedAt).toBeNull();
    });

    it('should throw ApplicationException 404 when profile not found', async () => {
      repository.findByUserId.mockResolvedValue(null);

      await expect(service.getProfileByUserId('non-existent')).rejects.toThrow(
        ApplicationException,
      );

      try {
        await service.getProfileByUserId('non-existent');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'OWNER_PROFILE_NOT_FOUND',
            messageKey: 'error.ownerProfileNotFound',
          }),
        );
      }
    });
  });

  describe('updateProfile', () => {
    it('should call repository.upsertByUserId and return updated DTO', async () => {
      const mockUpdated = {
        id: 'owner-profile-1',
        userId: 'user-1',
        businessName: 'Updated Business',
        businessLicense: 'LIC-999',
        bankAccount: '111222333',
        verifiedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as OwnerProfileEntity;

      repository.upsertByUserId.mockResolvedValue(mockUpdated);

      const dto = {
        businessName: 'Updated Business',
        businessLicense: 'LIC-999',
        bankAccount: '111222333',
      };

      const result = await service.updateProfile('user-1', dto);

      expect(repository.upsertByUserId).toHaveBeenCalledWith('user-1', dto);
      expect(result.businessName).toBe('Updated Business');
      expect(result.businessLicense).toBe('LIC-999');
      expect(result.bankAccount).toBe('111222333');
    });
  });

  describe('getPublicProfileById', () => {
    it('should return public profile when found', async () => {
      const mockEntity = {
        id: 'owner-profile-1',
        businessName: 'Public Stadium',
        verifiedAt: new Date('2026-01-01'),
      } as unknown as OwnerProfileEntity;

      repository.findById.mockResolvedValue(mockEntity);

      const result = await service.getPublicProfileById('owner-profile-1');

      expect(repository.findById).toHaveBeenCalledWith('owner-profile-1');
      expect(result.id).toBe('owner-profile-1');
      expect(result.businessName).toBe('Public Stadium');
      expect(result.isVerified).toBe(true);
    });

    it('should throw 404 ApplicationException when public profile not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getPublicProfileById('invalid-id')).rejects.toThrow(
        ApplicationException,
      );

      try {
        await service.getPublicProfileById('invalid-id');
      } catch (error) {
        expect(error).toBeInstanceOf(ApplicationException);
        const appError = error as ApplicationException;
        expect(appError.getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect(appError.getResponse()).toEqual(
          expect.objectContaining({
            code: 'OWNER_PROFILE_NOT_FOUND',
            messageKey: 'error.ownerProfileNotFound',
          }),
        );
      }
    });
  });
});
