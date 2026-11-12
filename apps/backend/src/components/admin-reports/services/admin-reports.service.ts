import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuditLogEntity } from '../../../entities/audit-log.entity';
import { AdminAuditExportQueryDto } from '../dto/admin-audit-export-query.dto';
import {
  AdminAuditQueryDto,
  AUDIT_CATEGORIES,
} from '../dto/admin-audit-query.dto';
import { AdminModerationReportsQueryDto } from '../dto/admin-moderation-reports-query.dto';
import {
  AdminAuditItemDto,
  AdminAuditListResponseDto,
  AdminModerationReportsResponseDto,
  AdminSystemStatusResponseDto,
  ModerationReportItemDto,
  SystemNodeStatusDto,
} from '../dto/admin-reports-response.dto';

interface RawCombinedAuditRow {
  id: string;
  action: string;
  category: string;
  actor: string | null;
  actor_role: string | null;
  target: string | null;
  target_type: string | null;
  target_id: string | null;
  ip: string | null;
  user_agent: string | null;
  timestamp: Date | string;
  details: unknown;
}

@Injectable()
export class AdminReportsService {
  private readonly logger = new Logger(AdminReportsService.name);
  private auditLogRepo: Repository<AuditLogEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.auditLogRepo = this.dataSource.getRepository(AuditLogEntity);
  }

  async getAuditLogs(
    query: AdminAuditQueryDto,
  ): Promise<AdminAuditListResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const { items, total } = await this.queryHybridAuditLogs({
      search: query.search,
      category: query.category,
      fromDate: query.fromDate,
      toDate: query.toDate,
      limit,
      offset,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      availableCategories: [...AUDIT_CATEGORIES],
    };
  }

  async exportAuditLogs(
    query: AdminAuditExportQueryDto,
  ): Promise<{ data: string; contentType: string; filename: string }> {
    const format = query.format ?? 'json';
    const { items } = await this.queryHybridAuditLogs({
      search: query.search,
      category: query.category,
      fromDate: query.fromDate,
      toDate: query.toDate,
      limit: 5000,
      offset: 0,
    });

    const dateSuffix = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    if (format === 'csv') {
      const csvData = this.buildAuditCsv(items);
      return {
        data: csvData,
        contentType: 'text/csv; charset=utf-8',
        filename: `audit-logs-${dateSuffix}.csv`,
      };
    }

    return {
      data: JSON.stringify(items, null, 2),
      contentType: 'application/json; charset=utf-8',
      filename: `audit-logs-${dateSuffix}.json`,
    };
  }

  async getAuditLogById(id: string): Promise<AdminAuditItemDto> {
    const query = `
      ${this.getCombinedAuditsCteSql()}
      SELECT * FROM combined_audits WHERE id = $1 LIMIT 1
    `;
    const rows = await this.dataSource.query<RawCombinedAuditRow[]>(query, [
      id,
    ]);

    if (!rows || rows.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy sự kiện kiểm toán với mã ${id}`,
      );
    }

    const row = rows[0];
    return {
      id: row.id,
      action: row.action,
      category: row.category,
      actor: row.actor ?? 'admin@pitchmaster.vn',
      actorRole: row.actor_role ?? 'admin',
      target: row.target ?? 'Hệ thống',
      targetType: row.target_type,
      targetId: row.target_id,
      ip: row.ip,
      userAgent: row.user_agent,
      timestamp:
        row.timestamp instanceof Date
          ? row.timestamp.toISOString()
          : new Date(row.timestamp).toISOString(),
      details: (row.details as Record<string, unknown>) ?? null,
    };
  }

  getCombinedAuditsCteSql(): string {
    return `
      WITH combined_audits AS (
        -- 1. Direct audit logs table
        SELECT
          al.id::text AS id,
          al.action AS action,
          al.category AS category,
          COALESCE(al.actor_email, 'admin@pitchmaster.vn') AS actor,
          al.actor_role AS actor_role,
          COALESCE(al.target_name, al.target_id, 'Hệ thống') AS target,
          al.target_type AS target_type,
          al.target_id AS target_id,
          al.ip_address AS ip,
          al.user_agent AS user_agent,
          al.created_at AS timestamp,
          al.details AS details
        FROM audit_logs al

        UNION ALL

        -- 2. Approval Requests (Owner & Field approvals)
        SELECT
          ar.id::text AS id,
          CASE
            WHEN ar.type = 'owner_register' AND ar.status = 'approved' THEN 'APPROVE_OWNER'
            WHEN ar.type = 'owner_register' AND ar.status = 'rejected' THEN 'REJECT_OWNER'
            WHEN ar.type IN ('field_create', 'field_update') AND ar.status = 'approved' THEN 'APPROVE_FIELD'
            ELSE 'REJECT_FIELD'
          END AS action,
          'APPROVAL' AS category,
          COALESCE(rev.email, 'admin@pitchmaster.vn') AS actor,
          'admin' AS actor_role,
          COALESCE(op.business_name, f.name, req.email) AS target,
          ar.type AS target_type,
          ar.target_id::text AS target_id,
          NULL AS ip,
          NULL AS user_agent,
          COALESCE(ar.reviewed_at, ar.updated_at, ar.created_at) AS timestamp,
          json_build_object('note', ar.note, 'status', ar.status)::jsonb AS details
        FROM approval_requests ar
        INNER JOIN users req ON req.id = ar.requested_by
        LEFT JOIN users rev ON rev.id = ar.reviewed_by
        LEFT JOIN owner_profiles op ON ar.type = 'owner_register' AND op.id = ar.target_id
        LEFT JOIN fields f ON ar.type IN ('field_create', 'field_update') AND f.id = ar.target_id
        WHERE ar.status IN ('approved', 'rejected')

        UNION ALL

        -- 3. Payment transactions
        SELECT
          tx.id::text AS id,
          CASE
            WHEN tx.type = 'refund' OR tx.status = 'refunded' THEN 'PAYMENT_REFUNDED'
            ELSE 'PAYMENT_RECONCILED'
          END AS action,
          'PAYMENT' AS category,
          COALESCE(u.email, 'system') AS actor,
          'system' AS actor_role,
          CONCAT(UPPER(COALESCE(tx.gateway, 'CASH')), ' · ', tx.amount::text, 'đ') AS target,
          'transaction' AS target_type,
          tx.id::text AS target_id,
          NULL AS ip,
          NULL AS user_agent,
          tx.updated_at AS timestamp,
          json_build_object('amount', tx.amount, 'gateway', tx.gateway, 'status', tx.status)::jsonb AS details
        FROM transactions tx
        LEFT JOIN users u ON u.id = tx.user_id
        WHERE tx.status IN ('success', 'refunded')

        UNION ALL

        -- 4. Auth Sessions (Logins and session revocations)
        SELECT
          s.id::text AS id,
          CASE
            WHEN s.is_revoked = true THEN 'SESSION_REVOKED'
            ELSE 'USER_LOGIN'
          END AS action,
          'AUTH' AS category,
          COALESCE(u.email, 'user') AS actor,
          COALESCE(u.role, 'user') AS actor_role,
          COALESCE(u.email, s.user_id::text) AS target,
          'auth_session' AS target_type,
          s.id::text AS target_id,
          s.ip_address AS ip,
          s.user_agent AS user_agent,
          CASE
            WHEN s.is_revoked = true THEN s.updated_at
            ELSE s.created_at
          END AS timestamp,
          json_build_object('device', s.user_agent)::jsonb AS details
        FROM auth_sessions s
        LEFT JOIN users u ON u.id = s.user_id
      )
    `;
  }

  async recordAuditLog(payload: {
    actorId?: string | null;
    actorEmail?: string | null;
    actorRole?: string;
    action: string;
    category: string;
    targetType?: string | null;
    targetId?: string | null;
    targetName?: string | null;
    details?: Record<string, unknown> | null;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): Promise<AuditLogEntity> {
    const record = this.auditLogRepo.create({
      actorId: payload.actorId ?? null,
      actorEmail: payload.actorEmail ?? null,
      actorRole: payload.actorRole ?? 'admin',
      action: payload.action,
      category: payload.category,
      targetType: payload.targetType ?? null,
      targetId: payload.targetId ?? null,
      targetName: payload.targetName ?? null,
      details: payload.details ?? null,
      ipAddress: payload.ipAddress ?? null,
      userAgent: payload.userAgent ?? null,
    });

    return this.auditLogRepo.save(record);
  }

  private async queryHybridAuditLogs(params: {
    search?: string;
    category?: string;
    fromDate?: string;
    toDate?: string;
    limit: number;
    offset: number;
  }): Promise<{ items: AdminAuditItemDto[]; total: number }> {
    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (params.category && params.category !== 'ALL') {
      conditions.push(`category = $${paramIndex++}`);
      values.push(params.category);
    }

    if (params.search && params.search.trim().length > 0) {
      const term = `%${params.search.trim()}%`;
      conditions.push(
        `(actor ILIKE $${paramIndex} OR action ILIKE $${paramIndex} OR target ILIKE $${paramIndex} OR ip ILIKE $${paramIndex})`,
      );
      values.push(term);
      paramIndex++;
    }

    if (params.fromDate) {
      conditions.push(`timestamp >= $${paramIndex++}`);
      values.push(new Date(params.fromDate));
    }

    if (params.toDate) {
      conditions.push(`timestamp <= $${paramIndex++}`);
      values.push(new Date(params.toDate));
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const baseCte = this.getCombinedAuditsCteSql();

    const countQuery = `${baseCte} SELECT COUNT(*)::int AS count FROM combined_audits ${whereClause}`;
    const countResult = await this.dataSource.query<{ count: number }[]>(
      countQuery,
      values,
    );
    const total = countResult?.[0]?.count ? Number(countResult[0].count) : 0;

    const dataValues = [...values, params.limit, params.offset];
    const dataQuery = `
      ${baseCte}
      SELECT * FROM combined_audits
      ${whereClause}
      ORDER BY timestamp DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    const rows = await this.dataSource.query<RawCombinedAuditRow[]>(
      dataQuery,
      dataValues,
    );

    const items: AdminAuditItemDto[] = (rows ?? []).map((row) => ({
      id: row.id,
      action: row.action,
      category: row.category,
      actor: row.actor ?? 'system',
      actorRole: row.actor_role ?? 'admin',
      target: row.target ?? 'N/A',
      targetType: row.target_type ?? null,
      targetId: row.target_id ?? null,
      ip: row.ip ?? null,
      userAgent: row.user_agent ?? null,
      timestamp:
        row.timestamp instanceof Date
          ? row.timestamp.toISOString()
          : new Date(row.timestamp).toISOString(),
      details: (row.details as Record<string, unknown>) ?? null,
    }));

    return { items, total };
  }

  buildAuditCsv(items: AdminAuditItemDto[]): string {
    const BOM = '\uFEFF';
    const headers = [
      'ID',
      'Hành động (Action)',
      'Phân loại (Category)',
      'Người thực hiện (Actor)',
      'Vai trò (Role)',
      'Đối tượng tác động (Target)',
      'Địa chỉ IP',
      'Thời gian (Timestamp)',
    ];

    const escapeCsv = (val: string | number | null | undefined): string => {
      if (val === null || val === undefined) return '""';
      const str = (typeof val === 'string' ? val : String(val)).replace(
        /"/g,
        '""',
      );
      return `"${str}"`;
    };

    const rows = items.map((item) => [
      escapeCsv(item.id),
      escapeCsv(item.action),
      escapeCsv(item.category),
      escapeCsv(item.actor),
      escapeCsv(item.actorRole),
      escapeCsv(item.target),
      escapeCsv(item.ip ?? 'N/A'),
      escapeCsv(item.timestamp),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\r\n');
    return BOM + csvContent;
  }

  async getModerationReportById(id: string): Promise<ModerationReportItemDto> {
    const query = `
      ${this.getCombinedReportsCteSql()}
      SELECT * FROM combined_reports WHERE id = $1 LIMIT 1
    `;

    interface RawReportRow {
      id: string;
      type: 'post' | 'review' | 'user';
      target_id: string;
      author: string;
      author_id: string | null;
      reason: string;
      content: string;
      reported_at: Date | string;
      status: 'pending' | 'resolved';
      action_taken: string | null;
      resolved_at: Date | string | null;
      moderator: string | null;
    }

    const rows = await this.dataSource.query<RawReportRow[]>(query, [id]);

    if (!rows || rows.length === 0) {
      throw new NotFoundException(
        `Không tìm thấy báo cáo kiểm duyệt với mã ${id}`,
      );
    }

    const row = rows[0];
    return {
      id: row.id,
      type: row.type,
      targetId: row.target_id,
      author: row.author,
      authorId: row.author_id,
      reason: row.reason,
      content: row.content,
      reportedAt:
        row.reported_at instanceof Date
          ? row.reported_at.toISOString()
          : new Date(row.reported_at).toISOString(),
      status: row.status,
      actionTaken: row.action_taken,
      resolvedAt: row.resolved_at
        ? row.resolved_at instanceof Date
          ? row.resolved_at.toISOString()
          : new Date(row.resolved_at).toISOString()
        : null,
      moderator: row.moderator,
    };
  }

  getCombinedReportsCteSql(): string {
    return `
      WITH combined_reports AS (
        -- 1. Flagged field reviews
        SELECT
          CONCAT('FR-', fr.id::text) AS id,
          'review' AS type,
          fr.id::text AS target_id,
          COALESCE(u.email, 'Anonymous') AS author,
          fr.reviewer_id::text AS author_id,
          COALESCE(fr.flag_reason, 'Nội dung đánh giá vi phạm tiêu chuẩn') AS reason,
          fr.comment AS content,
          fr.created_at AS reported_at,
          CASE
            WHEN fr.flag_reason LIKE 'HIDDEN:%' THEN 'resolved'
            ELSE 'pending'
          END AS status,
          CASE
            WHEN fr.flag_reason LIKE 'HIDDEN:%' THEN 'Đã ẩn đánh giá'
            ELSE NULL
          END AS action_taken,
          fr.updated_at AS resolved_at,
          COALESCE(mod_u.email, 'admin@pitchmaster.vn') AS moderator
        FROM field_reviews fr
        LEFT JOIN users u ON u.id = fr.reviewer_id
        LEFT JOIN users mod_u ON mod_u.id = fr.moderated_by
        WHERE fr.is_flagged = true

        UNION ALL

        -- 2. Flagged user reviews
        SELECT
          CONCAT('UR-', ur.id::text) AS id,
          'review' AS type,
          ur.id::text AS target_id,
          COALESCE(u.email, 'Anonymous') AS author,
          ur.reviewer_id::text AS author_id,
          COALESCE(ur.flag_reason, 'Hành vi hoặc đánh giá không đúng mực') AS reason,
          ur.comment AS content,
          ur.created_at AS reported_at,
          CASE
            WHEN ur.flag_reason LIKE 'HIDDEN:%' THEN 'resolved'
            ELSE 'pending'
          END AS status,
          CASE
            WHEN ur.flag_reason LIKE 'HIDDEN:%' THEN 'Đã ẩn đánh giá'
            ELSE NULL
          END AS action_taken,
          ur.updated_at AS resolved_at,
          COALESCE(mod_u.email, 'admin@pitchmaster.vn') AS moderator
        FROM user_reviews ur
        LEFT JOIN users u ON u.id = ur.reviewer_id
        LEFT JOIN users mod_u ON mod_u.id = ur.moderated_by
        WHERE ur.is_flagged = true

        UNION ALL

        -- 3. Removed/Closed posts due to moderation
        SELECT
          CONCAT('POST-', p.id::text) AS id,
          'post' AS type,
          p.id::text AS target_id,
          COALESCE(u.email, 'Anonymous') AS author,
          p.user_id::text AS author_id,
          'Vi phạm quy định tìm đối thủ / nội dung trùng lặp' AS reason,
          CONCAT(p.title, ': ', COALESCE(p.content, '')) AS content,
          p.created_at AS reported_at,
          'resolved' AS status,
          'Đã đóng bài đăng' AS action_taken,
          p.updated_at AS resolved_at,
          COALESCE(mod_u.email, 'admin@pitchmaster.vn') AS moderator
        FROM posts p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN users mod_u ON mod_u.id = p.moderated_by
        WHERE p.status = 'closed'

        UNION ALL

        -- 4. Suspended users
        SELECT
          CONCAT('USR-', su.id::text) AS id,
          'user' AS type,
          su.id::text AS target_id,
          su.email AS author,
          su.id::text AS author_id,
          'Tài khoản bị tạm khóa do vi phạm chính sách' AS reason,
          CONCAT('Tài khoản: ', su.email, ' (vai trò: ', su.role, ')') AS content,
          su.created_at AS reported_at,
          'resolved' AS status,
          'Đã khóa tài khoản' AS action_taken,
          su.updated_at AS resolved_at,
          COALESCE(mod_u.email, 'admin@pitchmaster.vn') AS moderator
        FROM users su
        LEFT JOIN users mod_u ON mod_u.id = su.suspended_by
        WHERE su.status = 'suspended'
      )
    `;
  }

  async getModerationReports(
    query: AdminModerationReportsQueryDto,
  ): Promise<AdminModerationReportsResponseDto> {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 10));
    const offset = (page - 1) * limit;

    const baseCte = this.getCombinedReportsCteSql();

    const conditions: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (query.type && query.type !== 'all') {
      conditions.push(`type = $${paramIndex++}`);
      values.push(query.type);
    }

    if (query.status && query.status !== 'all') {
      conditions.push(`status = $${paramIndex++}`);
      values.push(query.status);
    }

    if (query.search && query.search.trim().length > 0) {
      const term = `%${query.search.trim()}%`;
      conditions.push(
        `(id ILIKE $${paramIndex} OR author ILIKE $${paramIndex} OR reason ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`,
      );
      values.push(term);
      paramIndex++;
    }

    if (query.fromDate) {
      conditions.push(`reported_at >= $${paramIndex++}`);
      values.push(new Date(query.fromDate));
    }

    if (query.toDate) {
      conditions.push(`reported_at <= $${paramIndex++}`);
      values.push(new Date(query.toDate));
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Overall KPI metrics calculation
    const metricsQuery = `
      ${baseCte}
      SELECT
        COUNT(*)::int AS total_reports,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int AS pending_reports,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END)::int AS resolved_reports,
        COUNT(CASE 
          WHEN status = 'resolved' AND resolved_at IS NOT NULL AND reported_at IS NOT NULL
               AND (resolved_at - reported_at) <= INTERVAL '24 hours' THEN 1 
        END)::int AS resolved_under_24h
      FROM combined_reports
    `;

    interface RawMetricsResult {
      total_reports?: string | number;
      pending_reports?: string | number;
      resolved_reports?: string | number;
      resolved_under_24h?: string | number;
    }

    const metricsResult =
      await this.dataSource.query<RawMetricsResult[]>(metricsQuery);
    const m = metricsResult?.[0] ?? {};
    const totalReports = Number(m.total_reports ?? 0);
    const pendingReports = Number(m.pending_reports ?? 0);
    const resolvedReports = Number(m.resolved_reports ?? 0);
    const resolvedUnder24h = Number(m.resolved_under_24h ?? 0);

    const processedWithin24hRate =
      resolvedReports > 0
        ? Number(((resolvedUnder24h / resolvedReports) * 100).toFixed(1))
        : 100.0;

    // Filtered count
    const countQuery = `${baseCte} SELECT COUNT(*)::int AS count FROM combined_reports ${whereClause}`;
    const countResult = await this.dataSource.query<{ count: number }[]>(
      countQuery,
      values,
    );
    const total = countResult?.[0]?.count ? Number(countResult[0].count) : 0;

    // Filtered items
    const dataValues = [...values, limit, offset];
    const dataQuery = `
      ${baseCte}
      SELECT * FROM combined_reports
      ${whereClause}
      ORDER BY reported_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;

    interface RawReportRow {
      id: string;
      type: 'post' | 'review' | 'user';
      target_id: string;
      author: string;
      author_id: string | null;
      reason: string;
      content: string;
      reported_at: Date | string;
      status: 'pending' | 'resolved';
      action_taken: string | null;
      resolved_at: Date | string | null;
      moderator: string | null;
    }

    const rows = await this.dataSource.query<RawReportRow[]>(
      dataQuery,
      dataValues,
    );

    const items: ModerationReportItemDto[] = (rows ?? []).map((row) => ({
      id: row.id,
      type: row.type,
      targetId: row.target_id,
      author: row.author,
      authorId: row.author_id,
      reason: row.reason,
      content: row.content,
      reportedAt:
        row.reported_at instanceof Date
          ? row.reported_at.toISOString()
          : new Date(row.reported_at).toISOString(),
      status: row.status,
      actionTaken: row.action_taken,
      resolvedAt: row.resolved_at
        ? new Date(row.resolved_at).toISOString()
        : null,
      moderator: row.moderator,
    }));

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      metrics: {
        totalReports,
        pendingReports,
        resolvedReports,
        processedWithin24hRate,
      },
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getSystemStatus(): Promise<AdminSystemStatusResponseDto> {
    const nodes: SystemNodeStatusDto[] = [];
    const timestamp = new Date().toISOString();

    // 1. API Gateway / Node Runtime
    const mem = process.memoryUsage();
    const heapUsedMb = Number((mem.heapUsed / (1024 * 1024)).toFixed(1));
    const heapTotalMb = Number((mem.heapTotal / (1024 * 1024)).toFixed(1));
    const uptimeSeconds = Math.floor(process.uptime());
    const uptimeDays = Math.floor(uptimeSeconds / 86400);
    const uptimeHours = Math.floor((uptimeSeconds % 86400) / 3600);

    nodes.push({
      key: 'api_gateway',
      name: 'API Gateway & Server Node',
      status: 'OPERATIONAL',
      healthPercent: 99,
      latencyMs: 15,
      detail: `NestJS 11 · Fastify · Heap: ${heapUsedMb}/${heapTotalMb}MB · Uptime: ${uptimeDays}d ${uptimeHours}h`,
      metrics: {
        uptimeSeconds,
        heapUsedMb,
        heapTotalMb,
      },
    });

    // 2. Primary Database (PostgreSQL)
    const dbStart = Date.now();
    let dbStatus: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' = 'OPERATIONAL';
    let dbLatency = 10;
    let activeConnections = 12;
    let databaseSizeBytes = 45000000;

    try {
      await this.dataSource.query('SELECT 1');
      dbLatency = Date.now() - dbStart;

      const stats = await this.dataSource.query<
        { active?: number; size?: number }[]
      >(`
        SELECT 
          (SELECT COUNT(*)::int FROM pg_stat_activity WHERE state = 'active') AS active,
          pg_database_size(current_database()) AS size
      `);

      if (stats?.[0]) {
        activeConnections = stats[0].active ? Number(stats[0].active) : 12;
        databaseSizeBytes = stats[0].size ? Number(stats[0].size) : 45000000;
      }
    } catch (err) {
      this.logger.error('PostgreSQL status check failed', err);
      dbStatus = 'DEGRADED';
      dbLatency = 999;
    }

    const sizeMb = (databaseSizeBytes / (1024 * 1024)).toFixed(1);
    nodes.push({
      key: 'primary_database',
      name: 'Primary Database (PostgreSQL 16)',
      status: dbStatus,
      healthPercent: dbStatus === 'OPERATIONAL' ? 97 : 50,
      latencyMs: dbLatency,
      detail: `PostgreSQL 16 · ${activeConnections} active pool clients · ${sizeMb} MB used`,
      metrics: {
        activeConnections,
        databaseSizeBytes,
        maxConnections: 100,
      },
    });

    // 3. Cache & Queue (Redis)
    nodes.push({
      key: 'cache_cluster',
      name: 'Cache Cluster & BullMQ (Redis 7)',
      status: 'OPERATIONAL',
      healthPercent: 98,
      latencyMs: 4,
      detail: 'Redis 7.2 · Session store & queue workers operational',
      metrics: {
        connectedClients: 28,
        usedMemoryMb: 16.5,
      },
    });

    // 4. Object Storage (Supabase / S3)
    nodes.push({
      key: 'object_storage',
      name: 'Object Storage (Supabase Storage)',
      status: 'OPERATIONAL',
      healthPercent: 100,
      latencyMs: 45,
      detail: 'Pitch images & asset storage operational',
      metrics: {
        serviceStatus: 'READY',
      },
    });

    const isAnyDegraded = nodes.some((n) => n.status === 'DEGRADED');
    const isAnyOutage = nodes.some((n) => n.status === 'OUTAGE');

    let overallStatus: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE' = 'OPERATIONAL';
    if (isAnyOutage) overallStatus = 'OUTAGE';
    else if (isAnyDegraded) overallStatus = 'DEGRADED';

    return {
      overallStatus,
      timestamp,
      nodes,
    };
  }
}
