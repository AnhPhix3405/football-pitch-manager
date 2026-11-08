import { AdminReportsController } from './admin-reports.controller';
import { AdminReportsService } from '../services/admin-reports.service';
import { FastifyReply } from 'fastify';

describe('AdminReportsController', () => {
  let controller: AdminReportsController;
  let service: jest.Mocked<Partial<AdminReportsService>>;

  beforeEach(() => {
    service = {
      getAuditLogs: jest.fn().mockResolvedValue({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        availableCategories: ['ALL'],
      }),
      exportAuditLogs: jest.fn().mockResolvedValue({
        data: 'id,action\n1,TEST',
        contentType: 'text/csv; charset=utf-8',
        filename: 'audit-logs-20261108.csv',
      }),
      getModerationReports: jest.fn().mockResolvedValue({
        metrics: {
          totalReports: 0,
          pendingReports: 0,
          resolvedReports: 0,
          processedWithin24hRate: 100,
        },
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      }),
      getSystemStatus: jest.fn().mockResolvedValue({
        overallStatus: 'OPERATIONAL',
        timestamp: '2026-11-08T00:00:00Z',
        nodes: [],
      }),
      getAuditLogById: jest.fn().mockResolvedValue({
        id: 'audit-123',
        action: 'TEST_ACTION',
        category: 'SYSTEM',
        actor: 'admin@pitchmaster.vn',
        actorRole: 'admin',
        target: 'Test target',
        targetType: 'test',
        targetId: '123',
        ip: '127.0.0.1',
        userAgent: 'test-agent',
        timestamp: '2026-11-08T00:00:00Z',
        details: null,
      }),
      getModerationReportById: jest.fn().mockResolvedValue({
        id: 'FR-123',
        type: 'review',
        targetId: '123',
        author: 'User A',
        authorId: 'u-1',
        reason: 'Spam',
        content: 'Bad comment',
        reportedAt: '2026-11-08T00:00:00Z',
        status: 'pending',
        actionTaken: null,
        resolvedAt: null,
        moderator: null,
      }),
    };

    controller = new AdminReportsController(service as AdminReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getAuditLogs on service', async () => {
    const query = { page: 1, limit: 10 };
    const res = await controller.getAuditLogs(query);
    expect(service.getAuditLogs).toHaveBeenCalledWith(query);
    expect(res.total).toBe(0);
  });

  it('should call exportAuditLogs on service and set headers', async () => {
    const headerMock = jest.fn();
    const replyMock = {
      header: headerMock,
    } as unknown as FastifyReply;

    const query = { format: 'csv' as const };
    const res = await controller.exportAuditLogs(query, replyMock);

    expect(service.exportAuditLogs).toHaveBeenCalledWith(query);
    expect(headerMock).toHaveBeenCalledWith(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    expect(headerMock).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="audit-logs-20261108.csv"',
    );
    expect(res).toBe('id,action\n1,TEST');
  });

  it('should call getModerationReports on service', async () => {
    const query = { type: 'review' as const };
    const res = await controller.getModerationReports(query);
    expect(service.getModerationReports).toHaveBeenCalledWith(query);
    expect(res.metrics.processedWithin24hRate).toBe(100);
  });

  it('should call getSystemStatus on service', async () => {
    const res = await controller.getSystemStatus();
    expect(service.getSystemStatus).toHaveBeenCalled();
    expect(res.overallStatus).toBe('OPERATIONAL');
  });

  it('should call getAuditLogById on service', async () => {
    const res = await controller.getAuditLogById('audit-123');
    expect(service.getAuditLogById).toHaveBeenCalledWith('audit-123');
    expect(res.id).toBe('audit-123');
  });

  it('should call getModerationReportById on service', async () => {
    const res = await controller.getModerationReportById('FR-123');
    expect(service.getModerationReportById).toHaveBeenCalledWith('FR-123');
    expect(res.id).toBe('FR-123');
  });
});
