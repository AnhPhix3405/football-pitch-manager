import {
  AlertOutlined,
  ApiOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DatabaseOutlined,
  DollarOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Progress, Tag } from 'antd'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { auditLogs, managedUsers, moderationItems } from './admin.data'
import { useAdminApprovals } from './hooks/useAdminApprovals'
import type {
  AdminFieldApprovalItem,
  AdminOwnerApprovalItem,
} from './interface/admin.interface'

export function AdminDashboardPage() {
  const { t } = useTranslation()

  const {
    apiApprovals: ownerApprovals,
    total: totalOwnerPending,
  } = useAdminApprovals('owner', '', 'pending')

  const {
    apiApprovals: fieldApprovals,
    total: totalFieldPending,
  } = useAdminApprovals('field', '', 'pending')

  const pendingModerationCount = useMemo(
    () => moderationItems.filter((item) => item.status === 'pending').length,
    [],
  )

  const priorityQueue = useMemo(() => {
    const list: Array<{ id: string; name: string; type: string; submittedAt: string }> = []

    ownerApprovals.slice(0, 2).forEach((item) => {
      const req = item as AdminOwnerApprovalItem
      list.push({
        id: req.id,
        name: req.ownerProfile?.businessName || req.requester.email,
        type: 'OWNER',
        submittedAt: new Date(req.createdAt).toLocaleDateString('vi-VN'),
      })
    })

    fieldApprovals.slice(0, 2).forEach((item) => {
      const req = item as AdminFieldApprovalItem
      list.push({
        id: req.id,
        name: req.targetField?.name || 'Cụm sân bóng',
        type: 'FIELD',
        submittedAt: new Date(req.createdAt).toLocaleDateString('vi-VN'),
      })
    })

    return list
  }, [ownerApprovals, fieldApprovals])

  const totalQueue = totalOwnerPending + totalFieldPending + pendingModerationCount

  const metrics = [
    {
      label: t('admin.metricUsers', { defaultValue: 'NGƯỜI DÙNG' }),
      value: managedUsers.length.toLocaleString('vi-VN'),
      delta: '+8.2%',
      icon: <TeamOutlined />,
    },
    {
      label: t('admin.metricActiveFields', { defaultValue: 'SÂN HOẠT ĐỘNG' }),
      value: '148',
      delta: '+12 tháng này',
      icon: <ShopOutlined />,
    },
    {
      label: t('admin.metricGmv', { defaultValue: 'GMV THÁNG' }),
      value: '2,48 tỷ',
      delta: '+16.4%',
      icon: <DollarOutlined />,
    },
    {
      label: t('admin.metricQueue', { defaultValue: 'CẦN XỬ LÝ' }),
      value: String(totalQueue),
      delta: `${totalOwnerPending + totalFieldPending} hồ sơ duyệt`,
      icon: <AlertOutlined />,
    },
  ]

  return (
    <section className="admin-page">
      <header className="user-page__head">
        <div>
          <span className="eyebrow">SYSTEM COMMAND CENTER</span>
          <h1>{t('admin.dashboardTitle', { defaultValue: 'Admin Dashboard' })}</h1>
          <p>{t('admin.dashboardSubtitle', { defaultValue: 'Toàn cảnh vận hành mạng lưới PitchMaster.' })}</p>
        </div>
        <Tag color="green">
          <CheckCircleFilled /> ALL SYSTEMS OPERATIONAL
        </Tag>
      </header>

      <div className="admin-metrics">
        {metrics.map((item) => (
          <article key={item.label}>
            <span>{item.icon}</span>
            <small>{item.label}</small>
            <strong>{item.value}</strong>
            <em>{item.delta}</em>
          </article>
        ))}
      </div>

      <div className="admin-command-grid">
        <section className="admin-panel">
          <header>
            <h2>{t('admin.systemActivity', { defaultValue: 'Hoạt động hệ thống' })}</h2>
            <span className="eyebrow">LIVE / 30 DAYS</span>
          </header>
          <div className="activity-chart" aria-label="Biểu đồ hoạt động 30 ngày">
            {[38, 45, 42, 61, 58, 67, 75, 69, 83, 77, 92, 86].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </section>

        <section className="admin-panel health-panel">
          <header>
            <h2>{t('admin.systemHealth', { defaultValue: 'System health' })}</h2>
          </header>
          {[
            { icon: <ApiOutlined />, name: 'API Gateway', value: 99 },
            { icon: <DatabaseOutlined />, name: 'Database Cluster', value: 96 },
            { icon: <ClockCircleOutlined />, name: 'Realtime Service', value: 98 },
          ].map((node) => (
            <div key={node.name}>
              <span>
                {node.icon} {node.name}
              </span>
              <Progress
                percent={node.value}
                size="small"
                strokeColor="#8cfc70"
                trailColor="#263125"
              />
            </div>
          ))}
        </section>

        <section className="admin-panel queue-panel">
          <header>
            <h2>{t('admin.priorityQueue', { defaultValue: 'Hàng đợi ưu tiên' })}</h2>
            <Link to="/admin/approvals/owners">
              {t('admin.openQueue', { defaultValue: 'Mở queue' })} <ArrowRightOutlined />
            </Link>
          </header>

          {priorityQueue.length === 0 ? (
            <div style={{ color: '#888', padding: '16px 0', fontSize: '0.85rem' }}>
              {t('admin.noPendingQueue', { defaultValue: 'Không có hồ sơ nào đang chờ duyệt.' })}
            </div>
          ) : (
            priorityQueue.map((request) => (
              <div key={request.id}>
                <span>
                  <b>{request.name}</b>
                  <small>
                    {request.type} · {request.submittedAt}
                  </small>
                </span>
                <Tag color={request.type === 'OWNER' ? 'blue' : 'cyan'}>
                  {request.type}
                </Tag>
              </div>
            ))
          )}
        </section>

        <section className="admin-panel">
          <header>
            <h2>{t('admin.recentAudit', { defaultValue: 'Audit gần đây' })}</h2>
            <Link to="/admin/reports">
              {t('common.all', { defaultValue: 'Xem tất cả' })} <ArrowRightOutlined />
            </Link>
          </header>
          {auditLogs.map((log) => (
            <div className="audit-line" key={log.id}>
              <i />
              <span>
                <b>{log.action}</b>
                <small>
                  {log.actor} → {log.target}
                </small>
              </span>
              <time>{log.time.split(' ')[1]}</time>
            </div>
          ))}
        </section>
      </div>
    </section>
  )
}
