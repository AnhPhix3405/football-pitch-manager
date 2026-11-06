import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AdminOverviewService } from './admin-overview.service';

describe('AdminOverviewService', () => {
  let service: AdminOverviewService;
  let mockQuery: jest.Mock;

  beforeEach(async () => {
    mockQuery = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminOverviewService,
        {
          provide: DataSource,
          useValue: {
            query: mockQuery,
          },
        },
      ],
    }).compile();

    service = module.get<AdminOverviewService>(AdminOverviewService);
  });

  describe('calculateGrowthPercent (Review Focus #1)', () => {
    it('returns 100 when previous is 0 and current > 0, and 0 when both are 0', () => {
      expect(service.calculateGrowthPercent(15, 0)).toBe(100);
      expect(service.calculateGrowthPercent(0, 0)).toBe(0);
      expect(service.calculateGrowthPercent(120, 100)).toBe(20);
      expect(service.calculateGrowthPercent(80, 100)).toBe(-20);
    });
  });

  describe('getOverview (Review Focus #2, #3, #4)', () => {
    it('returns a gapless chronological activityTimeline and aggregates metrics, health, queue, and audits', async () => {
      mockQuery.mockImplementation((sql: string) => {
        if (sql.includes('SELECT 1')) {
          return Promise.resolve([{ '?column?': 1 }]);
        }
        if (sql.includes('FROM users') && sql.includes('total_users')) {
          return Promise.resolve([
            {
              total_users: '125',
              new_this_month: '15',
              previous_month: '10',
              role_user: '115',
              role_owner: '8',
              role_admin: '2',
            },
          ]);
        }
        if (sql.includes('FROM fields') && sql.includes('active_fields')) {
          return Promise.resolve([
            {
              active_fields: '20',
              total_fields: '25',
              pending_fields: '3',
              new_this_month: '4',
            },
          ]);
        }
        if (sql.includes('current_month_gmv')) {
          return Promise.resolve([
            {
              current_month_gmv: '5000000',
              previous_month_gmv: '4000000',
            },
          ]);
        }
        if (sql.includes('total_paid_revenue')) {
          return Promise.resolve([{ total_paid_revenue: '3500000' }]);
        }
        if (sql.includes('pending_owner_approvals')) {
          return Promise.resolve([
            {
              pending_owner_approvals: '2',
              pending_field_approvals: '3',
              flagged_reviews: '1',
            },
          ]);
        }
        if (sql.includes('GROUP BY booking_day')) {
          return Promise.resolve([]);
        }
        if (sql.includes('GROUP BY user_day')) {
          return Promise.resolve([]);
        }
        if (sql.includes('OWNER_APPROVAL')) {
          return Promise.resolve([
            {
              id: 'req-1',
              category: 'OWNER_APPROVAL',
              sub_type: 'owner_register',
              title: 'Sân Bóng Tân Bình',
              requester_email: 'owner@test.com',
              status: 'pending',
              created_at: new Date('2026-11-05T10:00:00.000Z'),
            },
          ]);
        }
        if (sql.includes('APPROVE_OWNER')) {
          return Promise.resolve([
            {
              id: 'aud-1',
              action: 'APPROVE_FIELD',
              actor: 'admin@pitchmaster.vn',
              target: 'Sân Chánh Hưng',
              timestamp: new Date('2026-11-06T09:00:00.000Z'),
            },
          ]);
        }
        return Promise.resolve([]);
      });

      const result = await service.getOverview({
        days: 7,
        queueLimit: 5,
        auditLimit: 10,
      });

      expect(result.metrics.users.total).toBe(125);
      expect(result.metrics.users.growthPercent).toBe(50);
      expect(result.metrics.fields.active).toBe(20);
      expect(result.metrics.gmv.currentMonthGmv).toBe(5000000);
      expect(result.metrics.gmv.growthPercent).toBe(25);
      expect(result.metrics.queue.totalPending).toBe(6);
      expect(result.activityTimeline).toHaveLength(7);
      expect(
        result.activityTimeline.every(
          (p) =>
            /^\d{4}-\d{2}-\d{2}$/.test(p.date) &&
            p.bookingsCount === 0 &&
            p.gmv === 0 &&
            p.newUsersCount === 0,
        ),
      ).toBe(true);
      expect(result.systemHealth.status).toBe('operational');
      expect(result.systemHealth.services).toHaveLength(3);
      expect(result.priorityQueue).toHaveLength(1);
      expect(result.recentAudits).toHaveLength(1);
    });

    it('marks systemHealth as degraded if database ping fails (Review Focus #4)', async () => {
      mockQuery.mockImplementation((sql: string) => {
        if (sql.includes('SELECT 1')) {
          return Promise.reject(new Error('DB timeout'));
        }
        return Promise.resolve([{}]);
      });

      const result = await service.getOverview({
        days: 7,
        queueLimit: 5,
        auditLimit: 10,
      });

      expect(result.systemHealth.status).toBe('degraded');
      const dbService = result.systemHealth.services.find(
        (s) => s.name === 'Database Cluster',
      );
      expect(dbService?.status).toBe('down');
    });
  });
});
