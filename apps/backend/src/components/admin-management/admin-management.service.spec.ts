import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminManagementService } from './admin-management.service';

describe('AdminManagementService', () => {
  let service: AdminManagementService;
  let queryMock: jest.Mock;
  let transactionMock: jest.Mock;

  beforeEach(() => {
    queryMock = jest.fn();
    transactionMock = jest.fn();

    const mockDataSource = {
      query: queryMock,
      transaction: transactionMock,
    } as unknown as DataSource;

    service = new AdminManagementService(mockDataSource);
  });

  it('getUsers returns paginated items, meta, and summary with email prefix fallback for null fullName', async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          total_users: '12',
          active_users: '10',
          suspended_users: '2',
          flagged_users: '1',
        },
      ])
      .mockResolvedValueOnce([{ total: '12' }])
      .mockResolvedValueOnce([
        {
          id: 'u-1',
          full_name: null,
          email: 'quan.nguyen@gmail.com',
          phone: '0901234567',
          avatar_url: null,
          role: 'user',
          status: 'active',
          reports_count: '2',
          created_at: new Date('2026-08-12T08:30:00.000Z'),
        },
      ]);

    const result = await service.getUsers({ page: 1, limit: 10 });

    expect(result.summary).toEqual({
      totalUsers: 12,
      activeUsers: 10,
      suspendedUsers: 2,
      flaggedUsers: 1,
    });
    expect(result.meta).toEqual({
      page: 1,
      limit: 10,
      total: 12,
      totalPages: 2,
    });
    expect(result.items).toEqual([
      {
        id: 'u-1',
        fullName: 'quan.nguyen',
        email: 'quan.nguyen@gmail.com',
        phone: '0901234567',
        avatarUrl: null,
        role: 'user',
        status: 'active',
        reportsCount: 2,
        createdAt: '2026-08-12T08:30:00.000Z',
      },
    ]);
  });

  it('getUserDetail returns user profile with stats and throws NotFoundException when user does not exist', async () => {
    queryMock.mockResolvedValueOnce([]);

    await expect(service.getUserDetail('missing-id')).rejects.toThrow(
      NotFoundException,
    );

    queryMock.mockResolvedValueOnce([
      {
        id: 'u-1',
        full_name: 'Nguyễn Minh Quân',
        email: 'quan.nguyen@gmail.com',
        phone: '0901234567',
        avatar_url: null,
        bio: 'Đội trưởng FC Bình Thạnh',
        skill_level: 'intermediate',
        preferred_positions: ['CM', 'CB'],
        reliability_score: '98.5',
        role: 'user',
        status: 'active',
        reports_count: '1',
        bookings_count: '14',
        fields_count: '0',
        posts_count: '3',
        created_at: new Date('2026-08-12T08:30:00.000Z'),
        updated_at: new Date('2026-10-01T10:00:00.000Z'),
      },
    ]);

    const detail = await service.getUserDetail('u-1');
    expect(detail.fullName).toBe('Nguyễn Minh Quân');
    expect(detail.reliabilityScore).toBe(98.5);
    expect(detail.stats).toEqual({
      bookingsCount: 14,
      fieldsCount: 0,
      postsCount: 3,
    });
  });

  it('updateUserStatus throws BadRequestException when admin attempts to suspend their own account', async () => {
    await expect(
      service.updateUserStatus(
        'admin-1',
        { status: 'suspended', reason: 'Self lock test' },
        'admin-1',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('updateUserStatus suspends user and revokes active auth_sessions inside a transaction', async () => {
    const managerQueryMock = jest
      .fn()
      .mockResolvedValueOnce([{ id: 'u-2', role: 'user', status: 'active' }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'u-2',
          full_name: 'Trần Văn B',
          email: 'b.tran@gmail.com',
          phone: '0912345678',
          avatar_url: null,
          role: 'user',
          status: 'suspended',
          reports_count: '1',
          created_at: new Date('2026-09-01T00:00:00.000Z'),
        },
      ]);

    transactionMock.mockImplementation(
      async (cb: (manager: { query: jest.Mock }) => Promise<unknown>) =>
        cb({ query: managerQueryMock }),
    );

    const updated = await service.updateUserStatus(
      'u-2',
      { status: 'suspended', reason: 'Spamming posts' },
      'admin-1',
    );

    expect(updated.status).toBe('suspended');
    expect(managerQueryMock).toHaveBeenCalledTimes(4);
    const revokeCallArgs = managerQueryMock.mock.calls[2] as [string];
    expect(String(revokeCallArgs[0])).toContain(
      'UPDATE auth_sessions SET is_revoked = true',
    );
  });

  it('getPosts returns paginated community posts with summary counts', async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          total_posts: '5',
          open_posts: '3',
          matched_posts: '1',
          closed_posts: '1',
        },
      ])
      .mockResolvedValueOnce([{ total: '5' }])
      .mockResolvedValueOnce([
        {
          id: 'p-1',
          title: 'Tìm đối giao hữu sân 7',
          content: 'Đội văn phòng đá vui vẻ',
          author_id: 'u-1',
          author_name: 'Lê Hoàng Nam',
          author_email: 'nam.le@gmail.com',
          field_id: 'f-1',
          field_name: 'Sân Chảo Lửa',
          play_date: '2026-11-10',
          start_time: '19:00:00',
          end_time: '20:30:00',
          skill_level_required: 'intermediate',
          max_players: 14,
          current_players: 7,
          comments_count: '4',
          status: 'open',
          created_at: new Date('2026-11-05T14:20:00.000Z'),
        },
      ]);

    const result = await service.getPosts({ page: 1, limit: 10 });
    expect(result.summary).toEqual({
      totalPosts: 5,
      openPosts: 3,
      matchedPosts: 1,
      closedPosts: 1,
    });
    expect(result.items[0].title).toBe('Tìm đối giao hữu sân 7');
    expect(result.items[0].commentsCount).toBe(4);
  });

  it('deletePost closes and soft-deletes a post or throws NotFoundException if missing', async () => {
    queryMock.mockResolvedValueOnce([]);
    await expect(service.deletePost('missing-post')).rejects.toThrow(
      NotFoundException,
    );

    queryMock.mockResolvedValueOnce([
      {
        id: 'p-1',
        status: 'closed',
        deleted_at: new Date('2026-11-06T10:30:00.000Z'),
      },
    ]);

    const deleted = await service.deletePost('p-1');
    expect(deleted).toEqual({
      id: 'p-1',
      status: 'closed',
      deletedAt: '2026-11-06T10:30:00.000Z',
    });
  });

  it('getReviews returns unified field and user flagged reviews with pending and resolved moderationStatus', async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          total_flagged: '2',
          pending_count: '1',
          resolved_count: '1',
        },
      ])
      .mockResolvedValueOnce([{ total: '2' }])
      .mockResolvedValueOnce([
        {
          id: 'r-1',
          review_type: 'field',
          rating: 1,
          comment: 'Ngôn từ không phù hợp',
          author_id: 'u-3',
          author_name: 'Phạm Gia Huy',
          author_email: 'huy.pham@gmail.com',
          target_id: 'f-1',
          target_name: 'Sân K34',
          is_flagged: true,
          flag_reason: 'Ngôn từ xúc phạm',
          moderation_status: 'pending',
          created_at: new Date('2026-11-04T09:15:00.000Z'),
        },
        {
          id: 'r-2',
          review_type: 'user',
          rating: 2,
          comment: 'Đã ẩn',
          author_id: 'u-4',
          author_name: 'Vũ Anh',
          author_email: 'anh.vu@gmail.com',
          target_id: 'u-5',
          target_name: 'Đỗ Minh',
          is_flagged: true,
          flag_reason: 'HIDDEN: Vi phạm tiêu chuẩn cộng đồng',
          moderation_status: 'resolved',
          created_at: new Date('2026-11-03T09:15:00.000Z'),
        },
      ]);

    const result = await service.getReviews({ page: 1, limit: 10 });
    expect(result.summary).toEqual({
      totalFlagged: 2,
      pendingCount: 1,
      resolvedCount: 1,
    });
    expect(result.items[0].moderationStatus).toBe('pending');
    expect(result.items[1].moderationStatus).toBe('resolved');
  });
});
