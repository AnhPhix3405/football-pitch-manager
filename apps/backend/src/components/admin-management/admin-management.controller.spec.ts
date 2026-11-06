import { AdminManagementController } from './admin-management.controller';
import { AdminManagementService } from './admin-management.service';
import { AdminPostsQueryDto } from './dto/admin-posts-query.dto';
import { AdminReviewsQueryDto } from './dto/admin-reviews-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

describe('AdminManagementController', () => {
  let controller: AdminManagementController;
  let getUsersMock: jest.Mock;
  let getUserDetailMock: jest.Mock;
  let updateUserStatusMock: jest.Mock;
  let getPostsMock: jest.Mock;
  let deletePostMock: jest.Mock;
  let getReviewsMock: jest.Mock;

  beforeEach(() => {
    getUsersMock = jest
      .fn()
      .mockResolvedValue({ items: [], meta: {}, summary: {} });
    getUserDetailMock = jest.fn().mockResolvedValue({ id: 'u-1' });
    updateUserStatusMock = jest
      .fn()
      .mockResolvedValue({ id: 'u-1', status: 'suspended' });
    getPostsMock = jest
      .fn()
      .mockResolvedValue({ items: [], meta: {}, summary: {} });
    deletePostMock = jest
      .fn()
      .mockResolvedValue({ id: 'p-1', status: 'closed' });
    getReviewsMock = jest
      .fn()
      .mockResolvedValue({ items: [], meta: {}, summary: {} });

    const mockService = {
      getUsers: getUsersMock,
      getUserDetail: getUserDetailMock,
      updateUserStatus: updateUserStatusMock,
      getPosts: getPostsMock,
      deletePost: deletePostMock,
      getReviews: getReviewsMock,
    } as unknown as AdminManagementService;

    controller = new AdminManagementController(mockService);
  });

  it('delegates getUsers to AdminManagementService.getUsers', async () => {
    const query: AdminUsersQueryDto = { page: 1, limit: 10, role: 'all' };
    await controller.getUsers(query);
    expect(getUsersMock).toHaveBeenCalledWith(query);
  });

  it('delegates getUserDetail to AdminManagementService.getUserDetail', async () => {
    await controller.getUserDetail('u-1');
    expect(getUserDetailMock).toHaveBeenCalledWith('u-1');
  });

  it('delegates updateUserStatus to AdminManagementService.updateUserStatus with currentAdminId', async () => {
    const dto: UpdateUserStatusDto = { status: 'suspended', reason: 'Spam' };
    await controller.updateUserStatus('u-2', dto, 'admin-1');
    expect(updateUserStatusMock).toHaveBeenCalledWith('u-2', dto, 'admin-1');
  });

  it('delegates getPosts to AdminManagementService.getPosts', async () => {
    const query: AdminPostsQueryDto = { page: 1, limit: 10, status: 'open' };
    await controller.getPosts(query);
    expect(getPostsMock).toHaveBeenCalledWith(query);
  });

  it('delegates deletePost to AdminManagementService.deletePost', async () => {
    await controller.deletePost('p-1');
    expect(deletePostMock).toHaveBeenCalledWith('p-1');
  });

  it('delegates getReviews to AdminManagementService.getReviews', async () => {
    const query: AdminReviewsQueryDto = {
      page: 1,
      limit: 10,
      status: 'pending',
    };
    await controller.getReviews(query);
    expect(getReviewsMock).toHaveBeenCalledWith(query);
  });
});
