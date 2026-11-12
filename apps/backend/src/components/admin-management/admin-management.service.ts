import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  AdminDeletePostResponseDto,
  AdminPostItemDto,
  AdminPostsListResponseDto,
  AdminReviewItemDto,
  AdminReviewsListResponseDto,
  AdminUserDetailResponseDto,
  AdminUserItemDto,
  AdminUsersListResponseDto,
} from './dto/admin-management-response.dto';
import { AdminPostsQueryDto } from './dto/admin-posts-query.dto';
import { AdminReviewsQueryDto } from './dto/admin-reviews-query.dto';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';

interface UserSummaryRow {
  total_users: string | number;
  active_users: string | number;
  suspended_users: string | number;
  flagged_users: string | number;
}

interface TotalCountRow {
  total: string | number;
}

interface UserListRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: 'user' | 'owner' | 'admin';
  status: string;
  reports_count: string | number;
  created_at: Date | string;
}

interface UserDetailRow extends UserListRow {
  bio: string | null;
  skill_level: string | null;
  preferred_positions: string[] | null;
  reliability_score: string | number | null;
  bookings_count: string | number;
  fields_count: string | number;
  posts_count: string | number;
  updated_at: Date | string;
}

interface PostSummaryRow {
  total_posts: string | number;
  open_posts: string | number;
  matched_posts: string | number;
  closed_posts: string | number;
}

interface PostListRow {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string | null;
  author_email: string;
  field_id: string | null;
  field_name: string | null;
  play_date: Date | string;
  start_time: string;
  end_time: string;
  skill_level_required: string | null;
  max_players: string | number | null;
  current_players: string | number;
  comments_count: string | number;
  status: 'open' | 'matched' | 'closed';
  created_at: Date | string;
}

interface DeletedPostRow {
  id: string;
  status: 'closed';
  deleted_at: Date | string;
}

interface ReviewSummaryRow {
  total_flagged: string | number;
  pending_count: string | number;
  resolved_count: string | number;
}

interface ReviewListRow {
  id: string;
  review_type: 'field' | 'user';
  rating: string | number;
  comment: string | null;
  author_id: string;
  author_name: string | null;
  author_email: string;
  target_id: string;
  target_name: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  moderation_status: 'pending' | 'resolved';
  created_at: Date | string;
}

const USER_REPORTS_COUNT_SQL = `(
  (SELECT COUNT(*) FROM user_reviews ur WHERE ur.target_user_id = u.id AND ur.is_flagged = true) +
  (SELECT COUNT(*) FROM user_reviews ur2 WHERE ur2.reviewer_id = u.id AND ur2.is_flagged = true) +
  (SELECT COUNT(*) FROM field_reviews fr WHERE fr.reviewer_id = u.id AND fr.is_flagged = true)
)`;

@Injectable()
export class AdminManagementService {
  constructor(private readonly dataSource: DataSource) {}

  async getUsers(
    query: AdminUsersQueryDto,
  ): Promise<AdminUsersListResponseDto> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 10)));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['1 = 1'];
    const params: unknown[] = [];

    if (query.role && query.role !== 'all') {
      params.push(query.role);
      conditions.push(`u.role = $${params.length}`);
    }

    if (query.status && query.status !== 'all') {
      params.push(query.status);
      conditions.push(`u.status = $${params.length}`);
    }

    if (query.search && query.search.trim()) {
      params.push(`%${query.search.trim()}%`);
      const idx = params.length;
      conditions.push(
        `(COALESCE(up.full_name, '') ILIKE $${idx} OR u.email ILIKE $${idx} OR COALESCE(u.phone, '') ILIKE $${idx})`,
      );
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const summaryRows: UserSummaryRow[] = await this.dataSource.query(`
      SELECT
        COUNT(*)::int AS total_users,
        COUNT(*) FILTER (WHERE u.status = 'active')::int AS active_users,
        COUNT(*) FILTER (WHERE u.status = 'suspended')::int AS suspended_users,
        COUNT(*) FILTER (WHERE ${USER_REPORTS_COUNT_SQL} > 0)::int AS flagged_users
      FROM users u
    `);

    const countRows: TotalCountRow[] = await this.dataSource.query(
      `
      SELECT COUNT(*)::int AS total
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      ${whereClause}
      `,
      params,
    );

    const listParams = [...params, limit, offset];
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;

    const rows: UserListRow[] = await this.dataSource.query(
      `
      SELECT
        u.id,
        up.full_name,
        u.email,
        u.phone,
        up.avatar_url,
        u.role,
        u.status,
        ${USER_REPORTS_COUNT_SQL}::int AS reports_count,
        u.created_at
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      ${whereClause}
      ORDER BY u.created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      listParams,
    );

    const total = Number(countRows[0]?.total ?? 0);
    const summaryRow = summaryRows[0];

    return {
      items: rows.map((row) => this.mapUserRow(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        totalUsers: Number(summaryRow?.total_users ?? 0),
        activeUsers: Number(summaryRow?.active_users ?? 0),
        suspendedUsers: Number(summaryRow?.suspended_users ?? 0),
        flaggedUsers: Number(summaryRow?.flagged_users ?? 0),
      },
    };
  }

  async getUserDetail(userId: string): Promise<AdminUserDetailResponseDto> {
    const rows: UserDetailRow[] = await this.dataSource.query(
      `
      SELECT
        u.id,
        up.full_name,
        u.email,
        u.phone,
        up.avatar_url,
        up.bio,
        up.skill_level,
        NULL::jsonb AS preferred_positions,
        COALESCE(
          (SELECT ROUND(AVG(ur.rating) * 20, 1) FROM user_reviews ur WHERE ur.target_user_id = u.id),
          100
        ) AS reliability_score,
        u.role,
        u.status,
        ${USER_REPORTS_COUNT_SQL}::int AS reports_count,
        (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id)::int AS bookings_count,
        (SELECT COUNT(*) FROM fields f WHERE f.owner_id = u.id)::int AS fields_count,
        (SELECT COUNT(*) FROM posts p WHERE p.user_id = u.id AND p.deleted_at IS NULL)::int AS posts_count,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id = $1
      LIMIT 1
      `,
      [userId],
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Không tìm thấy người dùng',
      });
    }

    const base = this.mapUserRow(row);
    return {
      ...base,
      bio: row.bio ?? null,
      skillLevel: row.skill_level ?? null,
      preferredPositions: Array.isArray(row.preferred_positions)
        ? row.preferred_positions
        : [],
      reliabilityScore: Number(row.reliability_score ?? 100),
      stats: {
        bookingsCount: Number(row.bookings_count ?? 0),
        fieldsCount: Number(row.fields_count ?? 0),
        postsCount: Number(row.posts_count ?? 0),
      },
      updatedAt: this.toIsoString(row.updated_at),
    };
  }

  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    currentAdminId: string,
  ): Promise<AdminUserItemDto> {
    if (userId === currentAdminId && dto.status === 'suspended') {
      throw new BadRequestException({
        code: 'ADMIN_CANNOT_SUSPEND_SELF',
        message: 'Quản trị viên không thể tự khóa tài khoản của chính mình',
      });
    }

    return this.dataSource.transaction(async (manager) => {
      const existingRows: Array<{ id: string; role: string; status: string }> =
        await manager.query(
          `SELECT id, role, status FROM users WHERE id = $1 LIMIT 1`,
          [userId],
        );

      if (!existingRows[0]) {
        throw new NotFoundException({
          code: 'USER_NOT_FOUND',
          message: 'Không tìm thấy người dùng',
        });
      }

      await manager.query(
        `UPDATE users SET status = $1, updated_at = NOW(), suspended_by = $3 WHERE id = $2`,
        [
          dto.status,
          userId,
          dto.status === 'suspended' ? currentAdminId : null,
        ],
      );

      if (dto.status === 'suspended') {
        await manager.query(
          `UPDATE auth_sessions SET is_revoked = true, updated_at = NOW() WHERE user_id = $1 AND is_revoked = false`,
          [userId],
        );
      }

      const updatedRows: UserListRow[] = await manager.query(
        `
        SELECT
          u.id,
          up.full_name,
          u.email,
          u.phone,
          up.avatar_url,
          u.role,
          u.status,
          ${USER_REPORTS_COUNT_SQL}::int AS reports_count,
          u.created_at
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.id = $1
        LIMIT 1
        `,
        [userId],
      );

      return this.mapUserRow(updatedRows[0]);
    });
  }

  async getPosts(
    query: AdminPostsQueryDto,
  ): Promise<AdminPostsListResponseDto> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 10)));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['p.deleted_at IS NULL'];
    const params: unknown[] = [];

    if (query.status && query.status !== 'all') {
      params.push(query.status);
      conditions.push(`p.status = $${params.length}`);
    }

    if (query.search && query.search.trim()) {
      params.push(`%${query.search.trim()}%`);
      const idx = params.length;
      conditions.push(
        `(p.title ILIKE $${idx} OR p.content ILIKE $${idx} OR COALESCE(up.full_name, '') ILIKE $${idx} OR u.email ILIKE $${idx})`,
      );
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const summaryRows: PostSummaryRow[] = await this.dataSource.query(`
      SELECT
        COUNT(*)::int AS total_posts,
        COUNT(*) FILTER (WHERE p.status = 'open')::int AS open_posts,
        COUNT(*) FILTER (WHERE p.status = 'matched')::int AS matched_posts,
        COUNT(*) FILTER (WHERE p.status = 'closed')::int AS closed_posts
      FROM posts p
      WHERE p.deleted_at IS NULL
    `);

    const countRows: TotalCountRow[] = await this.dataSource.query(
      `
      SELECT COUNT(*)::int AS total
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      ${whereClause}
      `,
      params,
    );

    const listParams = [...params, limit, offset];
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;

    const rows: PostListRow[] = await this.dataSource.query(
      `
      SELECT
        p.id,
        p.title,
        COALESCE(p.content, '') AS content,
        p.user_id AS author_id,
        up.full_name AS author_name,
        u.email AS author_email,
        NULL::uuid AS field_id,
        NULL::varchar AS field_name,
        p.play_date,
        p.start_time,
        COALESCE(p.end_time::text, '') AS end_time,
        p.skill_level_required,
        p.max_players,
        p.current_players,
        (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id)::int AS comments_count,
        p.status,
        p.created_at
      FROM posts p
      INNER JOIN users u ON u.id = p.user_id
      LEFT JOIN user_profiles up ON up.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      listParams,
    );

    const total = Number(countRows[0]?.total ?? 0);
    const summaryRow = summaryRows[0];

    return {
      items: rows.map((row) => this.mapPostRow(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        totalPosts: Number(summaryRow?.total_posts ?? 0),
        openPosts: Number(summaryRow?.open_posts ?? 0),
        matchedPosts: Number(summaryRow?.matched_posts ?? 0),
        closedPosts: Number(summaryRow?.closed_posts ?? 0),
      },
    };
  }

  async deletePost(
    postId: string,
    currentAdminId?: string,
  ): Promise<AdminDeletePostResponseDto> {
    const rows: DeletedPostRow[] = await this.dataSource.query(
      `
      UPDATE posts
      SET status = 'closed', deleted_at = NOW(), updated_at = NOW(), moderated_by = $2
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING id, status, deleted_at
      `,
      [postId, currentAdminId ?? null],
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundException({
        code: 'POST_NOT_FOUND',
        message: 'Không tìm thấy bài đăng hoặc bài đăng đã bị gỡ',
      });
    }

    return {
      id: row.id,
      status: 'closed',
      deletedAt: this.toIsoString(row.deleted_at),
    };
  }

  async getReviews(
    query: AdminReviewsQueryDto,
  ): Promise<AdminReviewsListResponseDto> {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(50, Math.max(1, Number(query.limit ?? 10)));
    const offset = (page - 1) * limit;

    const unifiedReviewCte = `
      WITH unified_reviews AS (
        SELECT
          fr.id,
          'field'::varchar AS review_type,
          fr.rating,
          fr.comment,
          fr.reviewer_id AS author_id,
          up.full_name AS author_name,
          u.email AS author_email,
          fr.field_id AS target_id,
          COALESCE(f.name, 'N/A') AS target_name,
          fr.is_flagged,
          fr.flag_reason,
          CASE
            WHEN fr.flag_reason LIKE 'HIDDEN:%' THEN 'resolved'
            ELSE 'pending'
          END AS moderation_status,
          fr.created_at
        FROM field_reviews fr
        INNER JOIN users u ON u.id = fr.reviewer_id
        LEFT JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN fields f ON f.id = fr.field_id
        WHERE fr.is_flagged = true

        UNION ALL

        SELECT
          ur.id,
          'user'::varchar AS review_type,
          ur.rating,
          ur.comment,
          ur.reviewer_id AS author_id,
          up.full_name AS author_name,
          u.email AS author_email,
          ur.target_user_id AS target_id,
          COALESCE(tup.full_name, split_part(tu.email, '@', 1), 'N/A') AS target_name,
          ur.is_flagged,
          ur.flag_reason,
          CASE
            WHEN ur.flag_reason LIKE 'HIDDEN:%' THEN 'resolved'
            ELSE 'pending'
          END AS moderation_status,
          ur.created_at
        FROM user_reviews ur
        INNER JOIN users u ON u.id = ur.reviewer_id
        LEFT JOIN user_profiles up ON up.user_id = u.id
        LEFT JOIN users tu ON tu.id = ur.target_user_id
        LEFT JOIN user_profiles tup ON tup.user_id = tu.id
        WHERE ur.is_flagged = true
      )
    `;

    const conditions: string[] = ['1 = 1'];
    const params: unknown[] = [];

    if (query.status && query.status !== 'all') {
      params.push(query.status);
      conditions.push(`r.moderation_status = $${params.length}`);
    }

    if (query.reviewType && query.reviewType !== 'all') {
      params.push(query.reviewType);
      conditions.push(`r.review_type = $${params.length}`);
    }

    if (query.search && query.search.trim()) {
      params.push(`%${query.search.trim()}%`);
      const idx = params.length;
      conditions.push(
        `(COALESCE(r.comment, '') ILIKE $${idx} OR COALESCE(r.flag_reason, '') ILIKE $${idx} OR COALESCE(r.author_name, '') ILIKE $${idx} OR r.author_email ILIKE $${idx} OR COALESCE(r.target_name, '') ILIKE $${idx})`,
      );
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    const summaryRows: ReviewSummaryRow[] = await this.dataSource.query(`
      ${unifiedReviewCte}
      SELECT
        COUNT(*)::int AS total_flagged,
        COUNT(*) FILTER (WHERE moderation_status = 'pending')::int AS pending_count,
        COUNT(*) FILTER (WHERE moderation_status = 'resolved')::int AS resolved_count
      FROM unified_reviews
    `);

    const countRows: TotalCountRow[] = await this.dataSource.query(
      `
      ${unifiedReviewCte}
      SELECT COUNT(*)::int AS total
      FROM unified_reviews r
      ${whereClause}
      `,
      params,
    );

    const listParams = [...params, limit, offset];
    const limitIdx = params.length + 1;
    const offsetIdx = params.length + 2;

    const rows: ReviewListRow[] = await this.dataSource.query(
      `
      ${unifiedReviewCte}
      SELECT *
      FROM unified_reviews r
      ${whereClause}
      ORDER BY
        CASE WHEN r.moderation_status = 'pending' THEN 0 ELSE 1 END ASC,
        r.created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
      `,
      listParams,
    );

    const total = Number(countRows[0]?.total ?? 0);
    const summaryRow = summaryRows[0];

    return {
      items: rows.map((row) => this.mapReviewRow(row)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary: {
        totalFlagged: Number(summaryRow?.total_flagged ?? 0),
        pendingCount: Number(summaryRow?.pending_count ?? 0),
        resolvedCount: Number(summaryRow?.resolved_count ?? 0),
      },
    };
  }

  private mapUserRow(row: UserListRow): AdminUserItemDto {
    const fallbackName = row.email ? row.email.split('@')[0] : 'Người dùng';
    return {
      id: row.id,
      fullName: row.full_name?.trim() ? row.full_name.trim() : fallbackName,
      email: row.email,
      phone: row.phone ?? null,
      avatarUrl: row.avatar_url ?? null,
      role: row.role,
      status: row.status,
      reportsCount: Number(row.reports_count ?? 0),
      createdAt: this.toIsoString(row.created_at),
    };
  }

  private mapPostRow(row: PostListRow): AdminPostItemDto {
    const fallbackName = row.author_email
      ? row.author_email.split('@')[0]
      : 'Người dùng';
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      authorId: row.author_id,
      authorName: row.author_name?.trim()
        ? row.author_name.trim()
        : fallbackName,
      authorEmail: row.author_email,
      fieldId: row.field_id ?? null,
      fieldName: row.field_name ?? null,
      playDate:
        row.play_date instanceof Date
          ? row.play_date.toISOString().slice(0, 10)
          : String(row.play_date),
      startTime: String(row.start_time),
      endTime: String(row.end_time),
      skillLevelRequired: row.skill_level_required ?? null,
      maxPlayers: row.max_players !== null ? Number(row.max_players) : null,
      currentPlayers: Number(row.current_players ?? 0),
      commentsCount: Number(row.comments_count ?? 0),
      status: row.status,
      createdAt: this.toIsoString(row.created_at),
    };
  }

  private mapReviewRow(row: ReviewListRow): AdminReviewItemDto {
    const fallbackName = row.author_email
      ? row.author_email.split('@')[0]
      : 'Người dùng';
    return {
      id: row.id,
      reviewType: row.review_type,
      rating: Number(row.rating ?? 0),
      comment: row.comment ?? '',
      authorId: row.author_id,
      authorName: row.author_name?.trim()
        ? row.author_name.trim()
        : fallbackName,
      authorEmail: row.author_email,
      targetId: row.target_id,
      targetName: row.target_name?.trim() ? row.target_name.trim() : 'N/A',
      isFlagged: Boolean(row.is_flagged),
      flagReason: row.flag_reason ?? null,
      moderationStatus: row.moderation_status,
      createdAt: this.toIsoString(row.created_at),
    };
  }

  private toIsoString(val: Date | string): string {
    if (val instanceof Date) {
      return val.toISOString();
    }
    const parsed = new Date(val);
    return Number.isNaN(parsed.getTime()) ? String(val) : parsed.toISOString();
  }
}
