/* eslint-disable @typescript-eslint/unbound-method */
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

import { AdminApproveFieldDto } from '../dto/admin-approve-field.dto';
import { AdminFieldApprovalDetailResponseDto } from '../dto/admin-field-approval-detail-response.dto';
import { AdminFieldApprovalListResponseDto } from '../dto/admin-field-approval-list-response.dto';
import { AdminFieldApprovalQueryDto } from '../dto/admin-field-approval-query.dto';
import { AdminRejectFieldDto } from '../dto/admin-reject-field.dto';
import { AdminFieldApprovalController } from './admin-field-approval.controller';
import { AdminFieldApprovalService } from '../services/admin-field-approval.service';

describe('AdminFieldApprovalController', () => {
  let controller: AdminFieldApprovalController;
  let service: jest.Mocked<AdminFieldApprovalService>;

  const mockDetailResponse: AdminFieldApprovalDetailResponseDto = {
    id: 'req-1',
    type: 'field_create',
    targetId: 'field-1',
    status: 'pending',
    note: null,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    reviewedAt: null,
    requester: {
      id: 'owner-1',
      email: 'owner@example.com',
      phone: '0901234567',
      role: 'owner',
      status: 'active',
    },
    targetField: {
      id: 'field-1',
      ownerId: 'owner-1',
      name: 'Sân bóng Tân Bình Sport',
      address: '120 Hoàng Hoa Thám',
      district: 'Tân Bình',
      lat: 10.798123,
      lng: 106.654321,
      description: 'Sân cỏ nhân tạo',
      status: 'pending',
      requireDeposit: true,
      depositType: 'fixed',
      depositValue: 100000,
      createdAt: new Date('2026-01-01T10:00:00.000Z'),
      updatedAt: new Date('2026-01-01T10:00:00.000Z'),
    },
    proposedChanges: null,
    reviewer: null,
  };

  const mockListResponse: AdminFieldApprovalListResponseDto = {
    items: [mockDetailResponse],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    service = {
      getFieldApprovals: jest.fn(),
      getFieldApprovalDetail: jest.fn(),
      approveFieldRequest: jest.fn(),
      rejectFieldRequest: jest.fn(),
    } as unknown as jest.Mocked<AdminFieldApprovalService>;

    controller = new AdminFieldApprovalController(service);
  });

  describe('getApprovals', () => {
    it('delegates query to service.getFieldApprovals', async () => {
      const query: AdminFieldApprovalQueryDto = {
        status: 'pending',
        type: 'all',
        page: 1,
        limit: 10,
      };
      service.getFieldApprovals.mockResolvedValue(mockListResponse);

      const result = await controller.getApprovals(query);

      expect(service.getFieldApprovals).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockListResponse);
    });
  });

  describe('getApprovalDetail', () => {
    it('delegates request id to service.getFieldApprovalDetail', async () => {
      service.getFieldApprovalDetail.mockResolvedValue(mockDetailResponse);

      const result = await controller.getApprovalDetail('req-1');

      expect(service.getFieldApprovalDetail).toHaveBeenCalledWith('req-1');
      expect(result).toEqual(mockDetailResponse);
    });
  });

  describe('approve', () => {
    it('delegates id, adminUserId, and dto to service.approveFieldRequest', async () => {
      const dto: AdminApproveFieldDto = { note: 'Cụm sân hợp lệ' };
      const approvedResponse = {
        ...mockDetailResponse,
        status: 'approved',
        note: 'Cụm sân hợp lệ',
      };
      service.approveFieldRequest.mockResolvedValue(approvedResponse);

      const result = await controller.approve('req-1', 'admin-1', dto);

      expect(service.approveFieldRequest).toHaveBeenCalledWith(
        'req-1',
        'admin-1',
        dto,
      );
      expect(result).toEqual(approvedResponse);
    });
  });

  describe('reject', () => {
    it('delegates id, adminUserId, and dto to service.rejectFieldRequest', async () => {
      const dto: AdminRejectFieldDto = { reason: 'Thiếu giấy tờ pháp lý' };
      const rejectedResponse = {
        ...mockDetailResponse,
        status: 'rejected',
        note: 'Thiếu giấy tờ pháp lý',
      };
      service.rejectFieldRequest.mockResolvedValue(rejectedResponse);

      const result = await controller.reject('req-1', 'admin-1', dto);

      expect(service.rejectFieldRequest).toHaveBeenCalledWith(
        'req-1',
        'admin-1',
        dto,
      );
      expect(result).toEqual(rejectedResponse);
    });
  });
});
