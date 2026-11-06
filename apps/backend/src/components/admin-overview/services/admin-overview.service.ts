import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminOverviewQueryDto } from '../dto/admin-overview-query.dto';
import {
  AdminActivityPointDto,
  AdminAuditItemDto,
  AdminOverviewMetricsDto,
  AdminOverviewResponseDto,
  AdminPriorityQueueItemDto,
  AdminSystemHealthDto,
} from '../dto/admin-overview-response.dto';

interface RawUsersMetricRow {
  total_users?: string | number;
  new_this_month?: string | number;
  previous_month?: string | number;
  role_user?: string | number;
  role_owner?: string | number;
  role_admin?: string | number;
}

interface RawFieldsMetricRow {
  active_fields?: string | number;
  total_fields?: string | number;
  pending_fields?: string | number;
  new_this_month?: string | number;
}

interface RawGmvMetricRow {
  current_month_gmv?: string | number;
  previous_month_gmv?: string | number;
}

interface RawRevenueMetricRow {
  total_paid_revenue?: string | number;
}

interface RawQueueMetricRow {
  pending_owner_approvals?: string | number;
  pending_field_approvals?: string | number;
  flagged_reviews?: string | number;
}

interface RawBookingTimelineRow {
  booking_day: string;
  bookings_count: string | number;
  gmv: string | number;
}

interface RawUserTimelineRow {
  user_day: string;
  new_users_count: string | number;
}

interface RawPriorityQueueRow {
  id: string;
  category: 'OWNER_APPROVAL' | 'FIELD_APPROVAL' | 'REVIEW_REPORT';
  sub_type: string;
  title: string | null;
  requester_email: string | null;
  status: string;
  created_at: Date | string;
}

interface RawAuditRow {
  id: string;
  action: string;
  actor: string | null;
  target: string | null;
  timestamp: Date | string;
}

@Injectable()
export class AdminOverviewService {
  constructor(private readonly dataSource: DataSource) {}

  calculateGrowthPercent(current: number, previous: number): number {
    if (previous <= 0) {
      return current > 0 ? 100 : 0;
    }
    return Number((((current - previous) / previous) * 100).toFixed(2));
  }

  async getOverview(
    query: AdminOverviewQueryDto,
  ): Promise<AdminOverviewResponseDto> {
    const days = query.days ?? 30;
    const queueLimit = query.queueLimit ?? 5;
    const auditLimit = query.auditLimit ?? 10;

    const [
      metrics,
      activityTimeline,
      systemHealth,
      priorityQueue,
      recentAudits,
    ] = await Promise.all([
      this.fetchMetrics(),
      this.fetchActivityTimeline(days),
      this.checkSystemHealth(),
      this.fetchPriorityQueue(queueLimit),
      this.fetchRecentAudits(auditLimit),
    ]);

    return {
      metrics,
      activityTimeline,
      systemHealth,
      priorityQueue,
      recentAudits,
    };
  }

  private async fetchMetrics(): Promise<AdminOverviewMetricsDto> {
    const [usersRows, fieldsRows, gmvRows, revenueRows, queueRows] =
      await Promise.all([
        this.dataSource.query<RawUsersMetricRow[]>(`
          SELECT
            COUNT(*)::int AS total_users,
            COUNT(*) FILTER (
              WHERE created_at >= date_trunc('month', CURRENT_DATE)
            )::int AS new_this_month,
            COUNT(*) FILTER (
              WHERE created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                AND created_at < date_trunc('month', CURRENT_DATE)
            )::int AS previous_month,
            COUNT(*) FILTER (WHERE role = 'user')::int AS role_user,
            COUNT(*) FILTER (WHERE role = 'owner')::int AS role_owner,
            COUNT(*) FILTER (WHERE role = 'admin')::int AS role_admin
          FROM users
        `),
        this.dataSource.query<RawFieldsMetricRow[]>(`
          SELECT
            COUNT(*) FILTER (WHERE status = 'active')::int AS active_fields,
            COUNT(*)::int AS total_fields,
            COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_fields,
            COUNT(*) FILTER (
              WHERE created_at >= date_trunc('month', CURRENT_DATE)
            )::int AS new_this_month
          FROM fields
        `),
        this.dataSource.query<RawGmvMetricRow[]>(`
          SELECT
            COALESCE(SUM(total_price) FILTER (
              WHERE status IN ('confirmed', 'completed')
                AND created_at >= date_trunc('month', CURRENT_DATE)
            ), 0) AS current_month_gmv,
            COALESCE(SUM(total_price) FILTER (
              WHERE status IN ('confirmed', 'completed')
                AND created_at >= date_trunc('month', CURRENT_DATE - INTERVAL '1 month')
                AND created_at < date_trunc('month', CURRENT_DATE)
            ), 0) AS previous_month_gmv
          FROM bookings
        `),
        this.dataSource.query<RawRevenueMetricRow[]>(`
          SELECT
            COALESCE(SUM(amount), 0) AS total_paid_revenue
          FROM transactions
          WHERE status = 'success'
            AND type IN ('booking_deposit', 'subscription')
        `),
        this.dataSource.query<RawQueueMetricRow[]>(`
          SELECT
            (
              SELECT COUNT(*)::int
              FROM approval_requests
              WHERE status = 'pending' AND type = 'owner_register'
            ) AS pending_owner_approvals,
            (
              SELECT COUNT(*)::int
              FROM approval_requests
              WHERE status = 'pending' AND type IN ('field_create', 'field_update')
            ) AS pending_field_approvals,
            (
              (
                SELECT COUNT(*)::int
                FROM field_reviews
                WHERE is_flagged = true
                  AND (flag_reason IS NULL OR flag_reason NOT LIKE 'HIDDEN:%')
              ) + (
                SELECT COUNT(*)::int
                FROM user_reviews
                WHERE is_flagged = true
                  AND (flag_reason IS NULL OR flag_reason NOT LIKE 'HIDDEN:%')
              )
            ) AS flagged_reviews
        `),
      ]);

    const userRow = usersRows[0] ?? {};
    const fieldRow = fieldsRows[0] ?? {};
    const gmvRow = gmvRows[0] ?? {};
    const revenueRow = revenueRows[0] ?? {};
    const queueRow = queueRows[0] ?? {};

    const totalUsers = Number(userRow.total_users ?? 0);
    const newUsersThisMonth = Number(userRow.new_this_month ?? 0);
    const prevUsersMonth = Number(userRow.previous_month ?? 0);

    const currentMonthGmv = Number(gmvRow.current_month_gmv ?? 0);
    const previousMonthGmv = Number(gmvRow.previous_month_gmv ?? 0);
    const totalPaidRevenue = Number(revenueRow.total_paid_revenue ?? 0);

    const pendingOwnerApprovals = Number(queueRow.pending_owner_approvals ?? 0);
    const pendingFieldApprovals = Number(queueRow.pending_field_approvals ?? 0);
    const flaggedReviews = Number(queueRow.flagged_reviews ?? 0);

    return {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        previousMonth: prevUsersMonth,
        growthPercent: this.calculateGrowthPercent(
          newUsersThisMonth,
          prevUsersMonth,
        ),
        byRole: {
          user: Number(userRow.role_user ?? 0),
          owner: Number(userRow.role_owner ?? 0),
          admin: Number(userRow.role_admin ?? 0),
        },
      },
      fields: {
        active: Number(fieldRow.active_fields ?? 0),
        total: Number(fieldRow.total_fields ?? 0),
        pending: Number(fieldRow.pending_fields ?? 0),
        newThisMonth: Number(fieldRow.new_this_month ?? 0),
      },
      gmv: {
        currentMonthGmv,
        previousMonthGmv,
        growthPercent: this.calculateGrowthPercent(
          currentMonthGmv,
          previousMonthGmv,
        ),
        totalPaidRevenue,
      },
      queue: {
        totalPending:
          pendingOwnerApprovals + pendingFieldApprovals + flaggedReviews,
        pendingOwnerApprovals,
        pendingFieldApprovals,
        flaggedReviews,
      },
    };
  }

  private async fetchActivityTimeline(
    days: number,
  ): Promise<AdminActivityPointDto[]> {
    const startDate = new Date();
    startDate.setUTCHours(0, 0, 0, 0);
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));
    const startIsoDate = startDate.toISOString().slice(0, 10);

    const [bookingRows, userRows] = await Promise.all([
      this.dataSource.query<RawBookingTimelineRow[]>(
        `
        SELECT
          TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS booking_day,
          COUNT(*)::int AS bookings_count,
          COALESCE(SUM(total_price) FILTER (WHERE status IN ('confirmed', 'completed')), 0) AS gmv
        FROM bookings
        WHERE created_at >= $1::date
        GROUP BY booking_day
        ORDER BY booking_day ASC
        `,
        [startIsoDate],
      ),
      this.dataSource.query<RawUserTimelineRow[]>(
        `
        SELECT
          TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS user_day,
          COUNT(*)::int AS new_users_count
        FROM users
        WHERE created_at >= $1::date
        GROUP BY user_day
        ORDER BY user_day ASC
        `,
        [startIsoDate],
      ),
    ]);

    const bookingMap = new Map<string, { count: number; gmv: number }>();
    for (const row of bookingRows ?? []) {
      if (row?.booking_day) {
        bookingMap.set(row.booking_day, {
          count: Number(row.bookings_count ?? 0),
          gmv: Number(row.gmv ?? 0),
        });
      }
    }

    const userMap = new Map<string, number>();
    for (const row of userRows ?? []) {
      if (row?.user_day) {
        userMap.set(row.user_day, Number(row.new_users_count ?? 0));
      }
    }

    const timeline: AdminActivityPointDto[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setUTCDate(startDate.getUTCDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      const bStats = bookingMap.get(dateStr);
      const uCount = userMap.get(dateStr) ?? 0;

      timeline.push({
        date: dateStr,
        bookingsCount: bStats?.count ?? 0,
        gmv: bStats?.gmv ?? 0,
        newUsersCount: uCount,
      });
    }

    return timeline;
  }

  private async checkSystemHealth(): Promise<AdminSystemHealthDto> {
    const startMs = Date.now();
    let dbStatus: 'up' | 'degraded' | 'down' = 'up';
    let dbScore = 100;
    let dbLatencyMs = 1;

    try {
      await this.dataSource.query('SELECT 1');
      dbLatencyMs = Math.max(1, Date.now() - startMs);
      if (dbLatencyMs > 250) {
        dbStatus = 'degraded';
        dbScore = 88;
      } else if (dbLatencyMs > 50) {
        dbScore = 96;
      } else {
        dbScore = 99;
      }
    } catch {
      dbLatencyMs = Math.max(1, Date.now() - startMs);
      dbStatus = 'down';
      dbScore = 0;
    }

    const overallStatus: 'operational' | 'degraded' =
      dbStatus === 'up' ? 'operational' : 'degraded';

    return {
      status: overallStatus,
      uptimeSeconds: Math.floor(process.uptime()),
      services: [
        {
          name: 'API Gateway',
          status: 'up',
          score: 100,
          latencyMs: 2,
        },
        {
          name: 'Database Cluster',
          status: dbStatus,
          score: dbScore,
          latencyMs: dbLatencyMs,
        },
        {
          name: 'Realtime Service',
          status: 'up',
          score: 99,
          latencyMs: 3,
        },
      ],
    };
  }

  private async fetchPriorityQueue(
    limit: number,
  ): Promise<AdminPriorityQueueItemDto[]> {
    const rows = await this.dataSource.query<RawPriorityQueueRow[]>(
      `
      SELECT * FROM (
        SELECT
          ar.id::text AS id,
          CASE
            WHEN ar.type = 'owner_register' THEN 'OWNER_APPROVAL'
            ELSE 'FIELD_APPROVAL'
          END AS category,
          ar.type AS sub_type,
          COALESCE(op.business_name, f.name, u.email) AS title,
          u.email AS requester_email,
          ar.status AS status,
          ar.created_at AS created_at
        FROM approval_requests ar
        INNER JOIN users u ON u.id = ar.requested_by
        LEFT JOIN owner_profiles op ON ar.type = 'owner_register' AND op.id = ar.target_id
        LEFT JOIN fields f ON ar.type IN ('field_create', 'field_update') AND f.id = ar.target_id
        WHERE ar.status = 'pending'

        UNION ALL

        SELECT
          fr.id::text AS id,
          'REVIEW_REPORT' AS category,
          'field_review' AS sub_type,
          COALESCE(f.name, 'Đánh giá sân bóng') AS title,
          u.email AS requester_email,
          'flagged' AS status,
          fr.created_at AS created_at
        FROM field_reviews fr
        INNER JOIN users u ON u.id = fr.reviewer_id
        LEFT JOIN fields f ON f.id = fr.field_id
        WHERE fr.is_flagged = true
          AND (fr.flag_reason IS NULL OR fr.flag_reason NOT LIKE 'HIDDEN:%')

        UNION ALL

        SELECT
          ur.id::text AS id,
          'REVIEW_REPORT' AS category,
          'user_review' AS sub_type,
          COALESCE(ur.flag_reason, 'Đánh giá người chơi') AS title,
          u.email AS requester_email,
          'flagged' AS status,
          ur.created_at AS created_at
        FROM user_reviews ur
        INNER JOIN users u ON u.id = ur.reviewer_id
        WHERE ur.is_flagged = true
          AND (ur.flag_reason IS NULL OR ur.flag_reason NOT LIKE 'HIDDEN:%')
      ) AS combined_queue
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [limit],
    );

    return (rows ?? [])
      .filter((row) => Boolean(row?.id))
      .map((row) => ({
        id: row.id,
        category: row.category,
        subType: row.sub_type,
        title: row.title ?? 'Yêu cầu hệ thống',
        requesterEmail: row.requester_email ?? 'system@pitchmaster.vn',
        status: row.status,
        createdAt:
          row.created_at instanceof Date
            ? row.created_at
            : new Date(row.created_at),
      }));
  }

  private async fetchRecentAudits(limit: number): Promise<AdminAuditItemDto[]> {
    const rows = await this.dataSource.query<RawAuditRow[]>(
      `
      SELECT * FROM (
        SELECT
          ar.id::text AS id,
          CASE
            WHEN ar.type = 'owner_register' AND ar.status = 'approved' THEN 'APPROVE_OWNER'
            WHEN ar.type = 'owner_register' AND ar.status = 'rejected' THEN 'REJECT_OWNER'
            WHEN ar.type IN ('field_create', 'field_update') AND ar.status = 'approved' THEN 'APPROVE_FIELD'
            ELSE 'REJECT_FIELD'
          END AS action,
          COALESCE(rev.email, 'admin@pitchmaster.vn') AS actor,
          COALESCE(op.business_name, f.name, req.email) AS target,
          COALESCE(ar.reviewed_at, ar.updated_at, ar.created_at) AS timestamp
        FROM approval_requests ar
        INNER JOIN users req ON req.id = ar.requested_by
        LEFT JOIN users rev ON rev.id = ar.reviewed_by
        LEFT JOIN owner_profiles op ON ar.type = 'owner_register' AND op.id = ar.target_id
        LEFT JOIN fields f ON ar.type IN ('field_create', 'field_update') AND f.id = ar.target_id
        WHERE ar.status IN ('approved', 'rejected')

        UNION ALL

        SELECT
          tx.id::text AS id,
          CASE
            WHEN tx.type = 'refund' OR tx.status = 'refunded' THEN 'PAYMENT_REFUNDED'
            ELSE 'PAYMENT_RECONCILED'
          END AS action,
          COALESCE(u.email, 'system') AS actor,
          CONCAT(UPPER(COALESCE(tx.gateway, 'CASH')), ' · ', tx.amount::text, 'đ') AS target,
          tx.updated_at AS timestamp
        FROM transactions tx
        LEFT JOIN users u ON u.id = tx.user_id
        WHERE tx.status IN ('success', 'refunded')
      ) AS combined_audits
      ORDER BY timestamp DESC
      LIMIT $1
      `,
      [limit],
    );

    return (rows ?? [])
      .filter((row) => Boolean(row?.id))
      .map((row) => ({
        id: row.id,
        action: row.action,
        actor: row.actor ?? 'system',
        target: row.target ?? 'N/A',
        timestamp:
          row.timestamp instanceof Date
            ? row.timestamp
            : new Date(row.timestamp),
      }));
  }
}
