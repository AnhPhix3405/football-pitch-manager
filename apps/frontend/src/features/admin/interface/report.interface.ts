export type ReportTabType = 'reports' | 'audit' | 'system'

export interface AuditLogItem {
  id: string
  actor: string
  action: string
  target: string
  time: string
  ip: string
}

export interface ModerationReportItem {
  id: string
  type: 'post' | 'review'
  author: string
  content: string
  reportedAt: string
  reason: string
  status: 'pending' | 'resolved'
}

export interface SystemNodeStatus {
  name: string
  percent: number
  detail: string
  status: 'OPERATIONAL' | 'DEGRADED' | 'OUTAGE'
}

