import {
  AlertOutlined,
  CheckCircleFilled,
  CloudServerOutlined,
  DownloadOutlined,
  FileSearchOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Input,
  Progress,
  Segmented,
  Select,
  Table,
  Tag,
  message,
} from 'antd'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { auditLogs, moderationItems } from './admin.data'
import type {
  AuditLogItem,
  ModerationReportItem,
  ReportTabType,
  SystemNodeStatus,
} from './interface/report.interface'

const SYSTEM_NODES: SystemNodeStatus[] = [
  { name: 'API Gateway', percent: 99, detail: '42 ms avg latency', status: 'OPERATIONAL' },
  { name: 'Primary Database', percent: 96, detail: '18% storage used (PostgreSQL 16)', status: 'OPERATIONAL' },
  { name: 'Socket Cluster', percent: 98, detail: '1,842 active connections (Redis 7)', status: 'OPERATIONAL' },
  { name: 'Object Storage', percent: 100, detail: 'Supabase Storage Operational', status: 'OPERATIONAL' },
]

export function AdminReportsPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ReportTabType>('reports')
  const [search, setSearch] = useState('')
  const [reportStatus, setReportStatus] = useState<'all' | 'pending' | 'resolved'>('all')

  const filteredReports = useMemo(() => {
    return moderationItems.filter((item) => {
      const matchSearch =
        !search ||
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.author.toLowerCase().includes(search.toLowerCase()) ||
        item.reason.toLowerCase().includes(search.toLowerCase()) ||
        item.content.toLowerCase().includes(search.toLowerCase())

      const matchStatus = reportStatus === 'all' || item.status === reportStatus
      return matchSearch && matchStatus
    })
  }, [search, reportStatus])

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter((item) => {
      if (!search) return true
      const term = search.toLowerCase()
      return (
        item.id.toLowerCase().includes(term) ||
        item.actor.toLowerCase().includes(term) ||
        item.action.toLowerCase().includes(term) ||
        item.target.toLowerCase().includes(term) ||
        item.ip.toLowerCase().includes(term)
      )
    })
  }, [search])

  const handleExport = () => {
    try {
      let exportData: unknown
      let fileName = ''

      if (tab === 'reports') {
        exportData = filteredReports
        fileName = `moderation-reports-${Date.now()}.json`
      } else if (tab === 'audit') {
        exportData = filteredAuditLogs
        fileName = `audit-logs-${Date.now()}.json`
      } else {
        exportData = SYSTEM_NODES
        fileName = `system-status-${Date.now()}.json`
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)

      message.success(t('admin.exportSuccess', { defaultValue: 'Đã xuất dữ liệu báo cáo thành công.' }))
    } catch {
      message.error(t('admin.exportFailed', { defaultValue: 'Xuất dữ liệu báo cáo thất bại.' }))
    }
  }

  const reportColumns = useMemo(
    () => [
      {
        title: t('admin.reportId', { defaultValue: 'MÃ' }),
        dataIndex: 'id',
        key: 'id',
        render: (val: string) => <b>{val}</b>,
      },
      {
        title: t('admin.reportType', { defaultValue: 'LOẠI' }),
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => (
          <Tag color={type === 'post' ? 'blue' : 'purple'}>
            {type === 'post'
              ? t('admin.typePost', { defaultValue: 'Bài đăng' })
              : t('admin.typeReview', { defaultValue: 'Đánh giá' })}
          </Tag>
        ),
      },
      {
        title: t('admin.reportReason', { defaultValue: 'LÝ DO' }),
        dataIndex: 'reason',
        key: 'reason',
      },
      {
        title: t('admin.reportAuthor', { defaultValue: 'TÁC GIẢ' }),
        dataIndex: 'author',
        key: 'author',
      },
      {
        title: t('admin.reportContent', { defaultValue: 'NỘI DUNG VI PHẠM' }),
        dataIndex: 'content',
        key: 'content',
        ellipsis: true,
      },
      {
        title: t('admin.reportTime', { defaultValue: 'THỜI GIAN' }),
        dataIndex: 'reportedAt',
        key: 'reportedAt',
      },
      {
        title: t('admin.tableStatus', { defaultValue: 'TRẠNG THÁI' }),
        key: 'status',
        render: (_: unknown, item: ModerationReportItem) => (
          <Tag color={item.status === 'pending' ? 'gold' : 'green'}>
            {item.status === 'pending'
              ? t('admin.statusPending', { defaultValue: 'Chờ xử lý' })
              : t('admin.statusResolved', { defaultValue: 'Đã xử lý' })}
          </Tag>
        ),
      },
    ],
    [t],
  )

  const auditColumns = useMemo(
    () => [
      {
        title: t('admin.auditEventId', { defaultValue: 'EVENT ID' }),
        dataIndex: 'id',
        key: 'id',
        render: (val: string) => <b>{val}</b>,
      },
      {
        title: t('admin.auditActor', { defaultValue: 'ACTOR' }),
        dataIndex: 'actor',
        key: 'actor',
      },
      {
        title: t('admin.auditAction', { defaultValue: 'ACTION' }),
        key: 'action',
        render: (_: unknown, item: AuditLogItem) => <code>{item.action}</code>,
      },
      {
        title: t('admin.auditTarget', { defaultValue: 'TARGET' }),
        dataIndex: 'target',
        key: 'target',
      },
      {
        title: t('admin.auditTime', { defaultValue: 'TIME' }),
        dataIndex: 'time',
        key: 'time',
      },
      {
        title: t('admin.auditIp', { defaultValue: 'IP' }),
        dataIndex: 'ip',
        key: 'ip',
      },
    ],
    [t],
  )

  const pendingCount = moderationItems.filter((item) => item.status === 'pending').length

  return (
    <section className="admin-page">
      <header className="user-page__head">
        <div>
          <span className="eyebrow">OBSERVABILITY & COMPLIANCE</span>
          <h1>{t('admin.reportsTitle', { defaultValue: 'Báo cáo & Giám sát' })}</h1>
          <p>{t('admin.reportsSubtitle', { defaultValue: 'Phân tích kiểm duyệt, audit trail và tình trạng hạ tầng hệ thống.' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            {t('admin.exportReport', { defaultValue: 'Xuất báo cáo' })}
          </Button>
        </div>
      </header>

      <div
        className="admin-toolbar"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Segmented
          value={tab}
          onChange={(val) => {
            setTab(val as ReportTabType)
            setSearch('')
          }}
          options={[
            { value: 'reports', label: t('admin.tabReports', { defaultValue: 'Báo cáo kiểm duyệt' }) },
            { value: 'audit', label: t('admin.tabAudit', { defaultValue: 'Audit log' }) },
            { value: 'system', label: t('admin.tabSystem', { defaultValue: 'System status' }) },
          ]}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          {tab !== 'system' && (
            <Input
              prefix={<SearchOutlined />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                tab === 'reports'
                  ? t('admin.searchReportsPlaceholder', { defaultValue: 'Tìm mã, tác giả, lý do...' })
                  : t('admin.searchAuditPlaceholder', { defaultValue: 'Tìm event, actor, action...' })
              }
              style={{ maxWidth: 240 }}
            />
          )}

          {tab === 'reports' && (
            <Select
              value={reportStatus}
              onChange={(val) => setReportStatus(val)}
              style={{ width: 140 }}
              options={[
                { value: 'all', label: t('admin.statusAll', { defaultValue: 'Tất cả trạng thái' }) },
                { value: 'pending', label: t('admin.statusPending', { defaultValue: 'Chờ xử lý' }) },
                { value: 'resolved', label: t('admin.statusResolved', { defaultValue: 'Đã xử lý' }) },
              ]}
            />
          )}

          {tab !== 'system' && <DatePicker.RangePicker />}
        </div>
      </div>

      {tab === 'reports' && (
        <>
          <div className="report-metrics">
            <article>
              <AlertOutlined />
              <strong>{moderationItems.length}</strong>
              <span>{t('admin.metricTotalReports', { defaultValue: 'Tổng báo cáo' })}</span>
            </article>
            <article>
              <FileSearchOutlined />
              <strong>{pendingCount}</strong>
              <span>{t('admin.metricPendingReports', { defaultValue: 'Đang chờ xử lý' })}</span>
            </article>
            <article>
              <CheckCircleFilled />
              <strong>94%</strong>
              <span>{t('admin.metricProcessedIn24h', { defaultValue: 'Xử lý dưới 24 giờ' })}</span>
            </article>
          </div>
          <Table
            rowKey="id"
            dataSource={filteredReports}
            columns={reportColumns}
            pagination={{ pageSize: 10 }}
          />
        </>
      )}

      {tab === 'audit' && (
        <Table
          rowKey="id"
          dataSource={filteredAuditLogs}
          columns={auditColumns}
          scroll={{ x: 800 }}
          pagination={{ pageSize: 10 }}
        />
      )}

      {tab === 'system' && (
        <div className="system-grid">
          {SYSTEM_NODES.map((node) => (
            <article key={node.name}>
              <CloudServerOutlined />
              <div>
                <h2>{node.name}</h2>
                <p>{node.detail}</p>
                <Progress
                  percent={node.percent}
                  strokeColor="#8cfc70"
                  trailColor="#263125"
                />
              </div>
              <Tag color="green">
                <CheckCircleFilled /> {node.status}
              </Tag>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
