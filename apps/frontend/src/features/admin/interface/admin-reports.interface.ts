export type ReportTabType = 'reports' | 'audit' | 'system';

export interface AdminAuditItem {
  id: string;
  action: string;
  category: string;
  actor: string;
  actorRole: string;
  target: string;
  targetType: string | null;
  targetId: string | null;
  ip: string | null;
  userAgent: string | null;
  timestamp: string;
  details: Record<string, unknown> | null;
}

export interface AdminAuditQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AdminAuditListResponse {
  items: AdminAuditItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  availableCategories: string[];
}

export interface ModerationMetrics {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  processedWithin24hRate: number;
}

export interface AdminModerationReportItem {
  id: string;
  type: 'post' | 'review' | 'user';
  targetId: string;
  author: string;
  authorId: string | null;
  reason: string;
  content: string;
  reportedAt: string;
  status: 'pending' | 'resolved';
  actionTaken: string | null;
  resolvedAt: string | null;
  moderator: string | null;
}

export interface AdminModerationReportsQueryParams {
  page?: number;
  limit?: number;
  type?: 'all' | 'post' | 'review' | 'user';
  status?: 'all' | 'pending' | 'resolved';
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AdminModerationReportsResponse {
  metrics: ModerationMetrics;
  items: AdminModerationReportItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AdminSystemNodeMetrics {
  uptimeSeconds?: number;
  heapUsedMb?: number;
  heapTotalMb?: number;
  activeConnections?: number;
  databaseSizeBytes?: number;
  maxConnections?: number;
  connectedClients?: number;
  usedMemoryMb?: number;
  serviceStatus?: string;
}

export interface AdminSystemNodeStatus {
  key: string;
  name: string;
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  healthPercent: number;
  latencyMs: number;
  detail: string;
  metrics?: AdminSystemNodeMetrics;
}

export interface AdminSystemStatusResponse {
  overallStatus: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE';
  timestamp: string;
  nodes: AdminSystemNodeStatus[];
}
