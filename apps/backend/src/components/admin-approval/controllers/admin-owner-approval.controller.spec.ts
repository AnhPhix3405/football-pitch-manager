jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { HttpStatus } from '@nestjs/common';
import { AdminApproveOwnerDto } from '../dto/admin-approve-owner.dto';
import { AdminOwnerApprovalDetailResponseDto } from '../dto/admin-owner-approval-detail-response.dto';
import { AdminOwnerApprovalListResponseDto } from '../dto/admin-owner-approval-list-response.dto';
import { AdminOwnerApprovalQueryDto } from '../dto/admin-owner-approval-query.dto';
import { AdminRejectOwnerDto } from '../dto/admin-reject-owner.dto';
import { AdminOwnerApprovalController } from './admin-owner-approval.controller';
import { AdminOwnerApprovalService } from '../services/admin-owner-approval.service';

describe('AdminOwnerApprovalController', () => {
  let controller: AdminOwnerApprovalController;
  let service: jest.Mocked<AdminOwnerApprovalService>;

  const mockDetailResponse: AdminOwnerApprovalDetailResponseDto = {
    id: 'req-1',
    type: 'owner_register',
    status: 'pending',
    note: 'Xin duyet som',
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    reviewedAt: null,
    requester: {
      id: 'user-1',
      email: 'applicant@example.com',
      phone: '0901234567',
      role: 'user',
      status: 'active',
    },
    ownerProfile: {
      id: 'profile-1',
      businessName: 'Tan Binh Sport Complex',
      businessLicense: 'GPKD-123456',
      bankAccount: 'VCB-0071000123456',
      verifiedAt: null,
    },
    reviewer: null,
  };

  const mockListResponse: AdminOwnerApprovalListResponseDto = {
    items: [mockDetailResponse],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    service = {
      getOwnerApprovals: jest.fn(),
      getOwnerApprovalDetail: jest.fn(),
      approveOwnerRegistration: jest.fn(),
      rejectOwnerRegistration: jest.fn(),
    } as unknown as jest.Mocked<AdminOwnerApprovalService>;

    controller = new AdminOwnerApprovalController(service);
  });

  describe('getApprovals', () => {
    it('delegates query to service.getOwnerApprovals', async () => {
      const query: AdminOwnerApprovalQueryDto = {
        status: 'pending',
        page: 1,
        limit: 10,
      };
      service.getOwnerApprovals.mockResolvedValue(mockListResponse);

      const result = await controller.getApprovals(query);

      expect(service.getOwnerApprovals).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockListResponse);
    });
  });

  describe('getApprovalDetail', () => {
    it('delegates request id to service.getOwnerApprovalDetail', async () => {
      service.getOwnerApprovalDetail.mockResolvedValue(mockDetailResponse);

      const result = await controller.getApprovalDetail('req-1');

      expect(service.getOwnerApprovalDetail).toHaveBeenCalledWith('req-1');
      expect(result).toEqual(mockDetailResponse);
    });
  });

  describe('approve', () => {
    it('delegates id, adminUserId, and dto to service.approveOwnerRegistration', async () => {
      const dto: AdminApproveOwnerDto = { note: 'Da phe duyet' };
      const approvedResponse = {
        ...mockDetailResponse,
        status: 'approved',
        note: 'Da phe duyet',
      };
      service.approveOwnerRegistration.mockResolvedValue(approvedResponse);

      const result = await controller.approve('req-1', 'admin-1', dto);

      expect(service.approveOwnerRegistration).toHaveBeenCalledWith(
        'req-1',
        'admin-1',
        dto,
      );
      expect(result).toEqual(approvedResponse);
    });
  });

  describe('reject', () => {
    it('delegates id, adminUserId, and dto to service.rejectOwnerRegistration', async () => {
      const dto: AdminRejectOwnerDto = { reason: 'Giay to khong hop le' };
      const rejectedResponse = {
        ...mockDetailResponse,
        status: 'rejected',
        note: 'Giay to khong hop le',
      };
      service.rejectOwnerRegistration.mockResolvedValue(rejectedResponse);

      const result = await controller.reject('req-1', 'admin-1', dto);

      expect(service.rejectOwnerRegistration).toHaveBeenCalledWith(
        'req-1',
        'admin-1',
        dto,
      );
      expect(result).toEqual(rejectedResponse);
    });
  });
});
