import { AdminReportsService } from './admin-reports.service';
import { DataSource, Repository } from 'typeorm';
import { AuditLogEntity } from '../../../entities/audit-log.entity';

describe('AdminReportsService', () => {
  let service: AdminReportsService;
  let dataSource: jest.Mocked<Partial<DataSource>>;
  let auditLogRepo: jest.Mocked<Partial<Repository<AuditLogEntity>>>;

  beforeEach(() => {
    auditLogRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };
    dataSource = {
      query: jest.fn(),
      getRepository: jest.fn().mockReturnValue(auditLogRepo),
    };
    service = new AdminReportsService(dataSource as DataSource);
  });

  describe('getAuditLogs', () => {
    it('returns paginated audit logs and available categories', async () => {
      (dataSource.query as jest.Mock)
        .mockResolvedValueOnce([{ count: 2 }]) // count query
        .mockResolvedValueOnce([
          {
            id: 'log-1',
            action: 'SUSPEND_USER',
            category: 'USER_STATUS',
            actor: 'admin@pitchmaster.vn',
            actor_role: 'admin',
            target: 'USR-123',
            target_type: 'user',
            target_id: '123',
            ip: '127.0.0.1',
            user_agent: 'Jest',
            timestamp: new Date('2026-11-08T10:00:00Z'),
            details: { reason: 'spam' },
          },
        ]);

      const result = await service.getAuditLogs({
        page: 1,
        limit: 10,
        category: 'ALL',
      });

      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].action).toBe('SUSPEND_USER');
      expect(result.availableCategories).toContain('USER_STATUS');
    });

    it('filters by category, search term, and date range', async () => {
      (dataSource.query as jest.Mock)
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([]);

      await service.getAuditLogs({
        search: 'test',
        category: 'APPROVAL',
        fromDate: '2026-11-01T00:00:00Z',
        toDate: '2026-11-08T00:00:00Z',
      });

      expect(dataSource.query).toHaveBeenCalledTimes(2);
      const queryCalls = (dataSource.query as jest.Mock).mock
        .calls as unknown[][];
      const firstCallArgs = queryCalls[0] as [string, unknown[]];
      const queryCall = firstCallArgs[0];
      expect(queryCall).toContain('category = $1');
      expect(queryCall).toContain('timestamp >= $');
      expect(queryCall).toContain('timestamp <= $');
    });
  });

  describe('exportAuditLogs', () => {
    it('exports audit logs as CSV with UTF-8 BOM and escaped headers', async () => {
      (dataSource.query as jest.Mock)
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([
          {
            id: 'log-1',
            action: 'APPROVE_FIELD',
            category: 'APPROVAL',
            actor: 'admin@pitchmaster.vn',
            actor_role: 'admin',
            target: 'San "Bong" Da',
            target_type: 'field',
            target_id: 'f-1',
            ip: '10.0.0.1',
            user_agent: 'Chrome',
            timestamp: new Date('2026-11-08T12:00:00Z'),
            details: null,
          },
        ]);

      const result = await service.exportAuditLogs({ format: 'csv' });

      expect(result.contentType).toContain('text/csv');
      expect(result.data.startsWith('\uFEFF')).toBe(true);
      expect(result.data).toContain('San ""Bong"" Da');
      expect(result.filename).toMatch(/audit-logs-\d+\.csv/);
    });

    it('exports audit logs as formatted JSON', async () => {
      (dataSource.query as jest.Mock)
        .mockResolvedValueOnce([{ count: 1 }])
        .mockResolvedValueOnce([
          {
            id: 'log-1',
            action: 'USER_LOGIN',
            category: 'AUTH',
            actor: 'user@example.com',
            actor_role: 'user',
            target: 'user@example.com',
            target_type: 'auth_session',
            target_id: 's-1',
            ip: '10.0.0.2',
            user_agent: 'Firefox',
            timestamp: new Date('2026-11-08T12:00:00Z'),
            details: null,
          },
        ]);

      const result = await service.exportAuditLogs({ format: 'json' });

      expect(result.contentType).toContain('application/json');
      const parsed = JSON.parse(result.data) as Array<{ action: string }>;
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0]?.action).toBe('USER_LOGIN');
    });
  });

  describe('recordAuditLog', () => {
    it('creates and saves direct audit log', async () => {
      const mockEntity = { id: 'new-id' } as AuditLogEntity;
      (auditLogRepo.create as jest.Mock).mockReturnValue(mockEntity);
      (auditLogRepo.save as jest.Mock).mockResolvedValue(mockEntity);

      const result = await service.recordAuditLog({
        action: 'DELETE_POST',
        category: 'MODERATION',
        actorEmail: 'admin@pitchmaster.vn',
      });

      expect(auditLogRepo.create).toHaveBeenCalled();
      expect(auditLogRepo.save).toHaveBeenCalledWith(mockEntity);
      expect(result.id).toBe('new-id');
    });
  });

  describe('getModerationReports', () => {
    it('computes moderation KPIs correctly with safe rate calculation', async () => {
      (dataSource.query as jest.Mock)
        .mockResolvedValueOnce([
          {
            total_reports: 10,
            pending_reports: 2,
            resolved_reports: 8,
            resolved_under_24h: 7,
          },
        ]) // metrics query
        .mockResolvedValueOnce([{ count: 10 }]) // count query
        .mockResolvedValueOnce([
          {
            id: 'FR-1',
            type: 'review',
            target_id: 'r-1',
            author: 'John',
            author_id: 'u-1',
            reason: 'Offensive language',
            content: 'bad word',
            reported_at: new Date('2026-11-08T09:00:00Z'),
            status: 'pending',
            action_taken: null,
            resolved_at: null,
            moderator: null,
          },
        ]); // data query

      const result = await service.getModerationReports({ page: 1, limit: 10 });

      expect(result.metrics.totalReports).toBe(10);
      expect(result.metrics.pendingReports).toBe(2);
      expect(result.metrics.resolvedReports).toBe(8);
      expect(result.metrics.processedWithin24hRate).toBe(87.5);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].type).toBe('review');
    });

    it('returns 100% processed rate if there are 0 resolved reports', async () => {
      (dataSource.query as jest.Mock)
        .mockResolvedValueOnce([
          {
            total_reports: 0,
            pending_reports: 0,
            resolved_reports: 0,
            resolved_under_24h: 0,
          },
        ])
        .mockResolvedValueOnce([{ count: 0 }])
        .mockResolvedValueOnce([]);

      const result = await service.getModerationReports({});
      expect(result.metrics.processedWithin24hRate).toBe(100.0);
    });
  });

  describe('getSystemStatus', () => {
    it('returns operational status when database query succeeds', async () => {
      (dataSource.query as jest.Mock)
        .mockResolvedValueOnce([]) // SELECT 1
        .mockResolvedValueOnce([{ active: 15, size: 52000000 }]);

      const result = await service.getSystemStatus();

      expect(result.overallStatus).toBe('OPERATIONAL');
      expect(result.nodes).toHaveLength(4);
      const dbNode = result.nodes.find((n) => n.key === 'primary_database');
      expect(dbNode?.status).toBe('OPERATIONAL');
      expect(dbNode?.metrics?.activeConnections).toBe(15);
    });

    it('handles database error gracefully by setting DEGRADED', async () => {
      (dataSource.query as jest.Mock).mockRejectedValueOnce(
        new Error('DB Timeout'),
      );

      const result = await service.getSystemStatus();

      expect(result.overallStatus).toBe('DEGRADED');
      const dbNode = result.nodes.find((n) => n.key === 'primary_database');
      expect(dbNode?.status).toBe('DEGRADED');
      expect(dbNode?.latencyMs).toBe(999);
    });
  });

  describe('getAuditLogById', () => {
    it('returns an audit log item when found', async () => {
      (dataSource.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'audit-001',
          action: 'USER_LOGIN',
          category: 'AUTH',
          actor: 'user@example.com',
          actor_role: 'user',
          target: 'user@example.com',
          target_type: 'auth_session',
          target_id: 'sess-1',
          ip: '127.0.0.1',
          user_agent: 'Mozilla',
          timestamp: new Date('2026-11-08T10:00:00Z'),
          details: { device: 'Chrome' },
        },
      ]);

      const result = await service.getAuditLogById('audit-001');
      expect(result.id).toBe('audit-001');
      expect(result.action).toBe('USER_LOGIN');
      expect(result.actor).toBe('user@example.com');
    });

    it('throws NotFoundException when audit log not found', async () => {
      (dataSource.query as jest.Mock).mockResolvedValueOnce([]);

      await expect(service.getAuditLogById('non-existent')).rejects.toThrow(
        'Không tìm thấy sự kiện kiểm toán với mã non-existent',
      );
    });
  });

  describe('getModerationReportById', () => {
    it('returns a moderation report item when found', async () => {
      (dataSource.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 'FR-001',
          type: 'review',
          target_id: 'rev-1',
          author: 'reviewer@example.com',
          author_id: 'u-1',
          reason: 'Inappropriate language',
          content: 'Nội dung thô tục',
          reported_at: new Date('2026-11-08T09:00:00Z'),
          status: 'pending',
          action_taken: null,
          resolved_at: null,
          moderator: null,
        },
      ]);

      const result = await service.getModerationReportById('FR-001');
      expect(result.id).toBe('FR-001');
      expect(result.type).toBe('review');
      expect(result.reason).toBe('Inappropriate language');
    });

    it('throws NotFoundException when report not found', async () => {
      (dataSource.query as jest.Mock).mockResolvedValueOnce([]);

      await expect(
        service.getModerationReportById('non-existent'),
      ).rejects.toThrow(
        'Không tìm thấy báo cáo kiểm duyệt với mã non-existent',
      );
    });
  });
});
