import { AdminOverviewController } from './admin-overview.controller';
import { AdminOverviewService } from '../services/admin-overview.service';
import { AdminOverviewResponseDto } from '../dto/admin-overview-response.dto';

describe('AdminOverviewController', () => {
  let controller: AdminOverviewController;
  let getOverviewMock: jest.Mock;

  beforeEach(() => {
    getOverviewMock = jest.fn();
    const service = {
      getOverview: getOverviewMock,
      calculateGrowthPercent: jest.fn(),
    } as unknown as AdminOverviewService;

    controller = new AdminOverviewController(service);
  });

  it('delegates getOverview to AdminOverviewService with query parameters', async () => {
    const mockResponse: AdminOverviewResponseDto = {
      metrics: {
        users: {
          total: 10,
          newThisMonth: 2,
          previousMonth: 1,
          growthPercent: 100,
          byRole: { user: 8, owner: 1, admin: 1 },
        },
        fields: { active: 5, total: 6, pending: 1, newThisMonth: 1 },
        gmv: {
          currentMonthGmv: 1000000,
          previousMonthGmv: 500000,
          growthPercent: 100,
          totalPaidRevenue: 800000,
        },
        queue: {
          totalPending: 1,
          pendingOwnerApprovals: 0,
          pendingFieldApprovals: 1,
          flaggedReviews: 0,
        },
      },
      activityTimeline: [],
      systemHealth: {
        status: 'operational',
        uptimeSeconds: 120,
        services: [],
      },
      priorityQueue: [],
      recentAudits: [],
    };

    getOverviewMock.mockResolvedValue(mockResponse);

    const query = { days: 14, queueLimit: 5, auditLimit: 10 };
    const result = await controller.getOverview(query);

    expect(getOverviewMock).toHaveBeenCalledWith(query);
    expect(result).toEqual(mockResponse);
  });
});
