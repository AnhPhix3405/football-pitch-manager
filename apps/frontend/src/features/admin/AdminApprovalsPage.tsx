import {
  BankOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  CloseOutlined,
  CopyOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Input,
  Modal,
  Segmented,
  Select,
  Spin,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd'
import type { Dayjs } from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { ApprovalRequest } from './admin.data'
import './AdminApprovalsPage.css'
import {
  FIELD_REJECTION_REASONS,
  OWNER_REJECTION_REASONS,
} from './constants/admin-approval-reasons.constant'
import type { DateFilterPreset } from './constants/date-filter.constant'
import {
  ADMIN_APPROVALS_PAGE_SIZE,
  ADMIN_APPROVALS_PAGE_SIZE_OPTIONS,
} from './constants/pagination.constant'
import type { ApprovalStatusFilter } from './constants/status-filter.constant'
import {
  mapFieldApprovalToRequest,
  mapOwnerApprovalToRequest,
  useAdminApprovals,
} from './hooks/useAdminApprovals'
import { useAdminFieldApprovalDetail } from './hooks/useAdminFieldApprovalDetail'
import { useAdminOwnerApprovalDetail } from './hooks/useAdminOwnerApprovalDetail'
import type {
  AdminFieldApprovalItem,
  AdminOwnerApprovalItem,
} from './interface/admin.interface'
import { getDateRangeFromPreset } from './utils/date-range.util'

interface AdminApprovalsPageProps {
  forcedType?: 'owner' | 'field'
}

export function AdminApprovalsPage({ forcedType }: AdminApprovalsPageProps) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const isEn = i18n.language.startsWith('en')

  const [type, setType] = useState<'owner' | 'field'>(forcedType || 'owner')
  const [statusFilter, setStatusFilter] = useState<ApprovalStatusFilter>('pending')
  const [query, setQuery] = useState('')
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all')
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<ApprovalRequest | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [resolved, setResolved] = useState<string[]>([])
  const [rejectModalRecord, setRejectModalRecord] = useState<ApprovalRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmittingReject, setIsSubmittingReject] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const {
    detail: ownerDetail,
    loading: ownerDetailLoading,
    fetchDetail: fetchOwnerDetail,
    resetDetail: resetOwnerDetail,
  } = useAdminOwnerApprovalDetail()

  const {
    detail: fieldDetail,
    loading: fieldDetailLoading,
    fetchDetail: fetchFieldDetail,
    resetDetail: resetFieldDetail,
  } = useAdminFieldApprovalDetail()

  useEffect(() => {
    if (forcedType && forcedType !== type) {
      setType(forcedType)
    }
  }, [forcedType, type])

  const { fromDate, toDate } = useMemo(
    () => getDateRangeFromPreset(datePreset, customRange),
    [datePreset, customRange],
  )

  const datePresetOptions = useMemo(
    () => [
      {
        value: 'all',
        label: t('admin.dateFilterAll', { defaultValue: 'Tất cả thời gian' }),
      },
      {
        value: 'today',
        label: t('admin.dateFilterToday', { defaultValue: 'Hôm nay' }),
      },
      {
        value: 'this_week',
        label: t('admin.dateFilterThisWeek', { defaultValue: 'Tuần này' }),
      },
      {
        value: 'this_month',
        label: t('admin.dateFilterThisMonth', { defaultValue: 'Tháng này' }),
      },
      {
        value: 'custom',
        label: t('admin.dateFilterCustom', { defaultValue: 'Tùy chọn khoảng ngày' }),
      },
    ],
    [t],
  )

  const {
    apiApprovals,
    loading,
    page,
    setPage,
    total,
    refetch,
    approve,
    reject,
  } = useAdminApprovals(type, query, statusFilter, fromDate, toDate)

  const mappedApiRequests: ApprovalRequest[] = useMemo(() => {
    if (apiApprovals.length === 0) return []
    if (type === 'owner') {
      return (apiApprovals as AdminOwnerApprovalItem[]).map(mapOwnerApprovalToRequest)
    }
    return (apiApprovals as AdminFieldApprovalItem[]).map(mapFieldApprovalToRequest)
  }, [apiApprovals, type])

  const visible = useMemo(() => {
    return mappedApiRequests.filter(
      (item) =>
        item.type === type &&
        (statusFilter !== 'pending' || !resolved.includes(item.id)) &&
        (!query ||
          `${item.name} ${item.applicant} ${item.phone || ''} ${item.license || ''}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    )
  }, [mappedApiRequests, query, resolved, statusFilter, type])

  // KPI calculations
  const kpiStats = useMemo(() => {
    const pending = mappedApiRequests.filter(
      (i) => i.status === 'pending' && !resolved.includes(i.id),
    ).length
    const approved = mappedApiRequests.filter(
      (i) => i.status === 'approved' || i.status === 'active' || (i.status === 'pending' && resolved.includes(i.id)),
    ).length
    const rejected = mappedApiRequests.filter((i) => i.status === 'rejected').length
    const totalCount = total || mappedApiRequests.length

    return { pending, approved, rejected, total: totalCount }
  }, [mappedApiRequests, resolved, total])

  const handleCopyText = useCallback(
    (text?: string | null) => {
      if (!text) return
      void navigator.clipboard.writeText(text)
      messageApi.success(t('admin.copySuccess', { defaultValue: 'Đã sao chép vào bộ nhớ tạm' }))
    },
    [messageApi, t],
  )

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false)
    setSelectedRecord(null)
    resetOwnerDetail()
    resetFieldDetail()
  }, [resetFieldDetail, resetOwnerDetail])

  const handleViewDetail = useCallback(
    async (record: ApprovalRequest) => {
      setSelectedRecord(record)
      setIsDrawerOpen(true)
      if (record.type === 'owner') {
        try {
          await fetchOwnerDetail(record.id)
        } catch {
          messageApi.error(t('admin.loadDetailError', { defaultValue: 'Không thể tải chi tiết hồ sơ' }))
        }
      } else {
        try {
          await fetchFieldDetail(record.id)
        } catch {
          messageApi.error(t('admin.loadFieldDetailError', { defaultValue: 'Không thể tải chi tiết sân' }))
        }
      }
    },
    [fetchFieldDetail, fetchOwnerDetail, messageApi, t],
  )

  const handleConfirmApprove = useCallback(
    (request: ApprovalRequest) =>
      Modal.confirm({
        title: t('admin.confirmApproveTitle', {
          defaultValue: `Phê duyệt ${request.name}?`,
          name: request.name,
        }),
        content: t('admin.confirmApproveContent', {
          defaultValue: 'Hồ sơ đối tác sẽ được kích hoạt chính thức trên toàn hệ thống.',
        }),
        okText: t('admin.approve', { defaultValue: 'Xác nhận duyệt' }),
        cancelText: t('common.cancel', { defaultValue: 'Hủy' }),
        okButtonProps: { style: { backgroundColor: '#22c55e', borderColor: '#22c55e' } },
        onOk: async () => {
          try {
            if (request.type === 'owner') {
              await approve(
                request.id,
                t('admin.defaultApproveOwnerNote', { defaultValue: 'Hồ sơ đối tác hợp lệ và đã được phê duyệt' }),
              )
            } else {
              await approve(
                request.id,
                t('admin.defaultApproveFieldNote', { defaultValue: 'Cụm sân hợp lệ và đã kích hoạt' }),
              )
            }
            setResolved((items) => [...items, request.id])
            handleCloseDrawer()
            messageApi.success(t('admin.approveSuccess', { defaultValue: 'Đã phê duyệt hồ sơ thành công.' }))
          } catch (err) {
            messageApi.error(
              err instanceof Error
                ? err.message
                : t('admin.actionFailed', { defaultValue: 'Thao tác không thành công.' }),
            )
          }
        },
      }),
    [approve, handleCloseDrawer, messageApi, t],
  )

  const handleOpenRejectModal = useCallback((record: ApprovalRequest) => {
    setRejectModalRecord(record)
    setRejectionReason('')
  }, [])

  const handleConfirmReject = useCallback(async () => {
    if (!rejectModalRecord) return
    const reason =
      rejectionReason.trim() ||
      (rejectModalRecord.type === 'owner'
        ? t('admin.defaultRejectOwnerReason', { defaultValue: 'Hồ sơ chưa đạt yêu cầu xác minh pháp lý' })
        : t('admin.defaultRejectFieldReason', { defaultValue: 'Thông tin cụm sân chưa đạt tiêu chuẩn' }))

    try {
      setIsSubmittingReject(true)
      await reject(rejectModalRecord.id, reason)
      setResolved((items) => [...items, rejectModalRecord.id])
      setRejectModalRecord(null)
      setRejectionReason('')
      handleCloseDrawer()
      messageApi.success(t('admin.rejectSuccess', { defaultValue: 'Đã từ chối hồ sơ.' }))
    } catch (err) {
      messageApi.error(
        err instanceof Error
          ? err.message
          : t('admin.actionFailed', { defaultValue: 'Thao tác không thành công.' }),
      )
    } finally {
      setIsSubmittingReject(false)
    }
  }, [handleCloseDrawer, messageApi, reject, rejectModalRecord, rejectionReason, t])

  const renderStatusAlert = (
    status: string,
    reviewedAt?: string | null,
    reviewerEmail?: string | null,
    note?: string | null,
  ) => {
    const isApproved = status === 'approved' || status === 'active'
    const isRejected = status === 'rejected'

    if (isApproved) {
      return (
        <Alert
          type="success"
          showIcon
          className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 text-white"
          message={<span className="font-semibold text-green-400">{t('admin.alertApprovedTitle', { defaultValue: 'Hồ sơ đã được phê duyệt' })}</span>}
          description={
            <div className="mt-1 space-y-1 text-xs text-green-200/80">
              {reviewedAt && (
                <div>
                  <strong>{t('admin.reviewedAt', { defaultValue: 'Thời điểm duyệt' })}:</strong>{' '}
                  {reviewedAt.includes('T') ? new Date(reviewedAt).toLocaleString('vi-VN') : reviewedAt}
                </div>
              )}
              {reviewerEmail && (
                <div>
                  <strong>{t('admin.reviewer', { defaultValue: 'Người kiểm duyệt' })}:</strong> {reviewerEmail}
                </div>
              )}
              {note && (
                <div>
                  <strong>{t('admin.note', { defaultValue: 'Ghi chú' })}:</strong> {note}
                </div>
              )}
            </div>
          }
        />
      )
    }

    if (isRejected) {
      return (
        <Alert
          type="error"
          showIcon
          className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-white"
          message={<span className="font-semibold text-red-400">{t('admin.alertRejectedTitle', { defaultValue: 'Hồ sơ đã bị từ chối' })}</span>}
          description={
            <div className="mt-1 space-y-1 text-xs text-red-200/80">
              {reviewedAt && (
                <div>
                  <strong>{t('admin.rejectedAt', { defaultValue: 'Thời điểm từ chối' })}:</strong>{' '}
                  {reviewedAt.includes('T') ? new Date(reviewedAt).toLocaleString('vi-VN') : reviewedAt}
                </div>
              )}
              {reviewerEmail && (
                <div>
                  <strong>{t('admin.reviewer', { defaultValue: 'Người kiểm duyệt' })}:</strong> {reviewerEmail}
                </div>
              )}
              {note && (
                <div>
                  <strong>{t('admin.rejectReason', { defaultValue: 'Lý do từ chối' })}:</strong> {note}
                </div>
              )}
            </div>
          }
        />
      )
    }

    return (
      <Alert
        type="warning"
        showIcon
        className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 text-white"
        message={<span className="font-semibold text-amber-400">{t('admin.alertPendingTitle', { defaultValue: 'Hồ sơ đang chờ thẩm định' })}</span>}
        description={
          <span className="text-xs text-amber-200/80">
            {t('admin.alertPendingDesc', {
              defaultValue: 'Kiểm tra kỹ thông tin pháp nhân kinh doanh và tài khoản thụ hưởng trước khi phê duyệt.',
            })}
          </span>
        }
      />
    )
  }

  const ownerColumns = useMemo(
    () => [
      {
        title: t('admin.tablePartnerName', { defaultValue: 'ĐỐI TÁC / DOANH NGHIỆP' }),
        dataIndex: 'name',
        render: (val: string, record: ApprovalRequest) => (
          <div className="approval-partner-cell">
            <div className="approval-partner-avatar">
              <ShopOutlined />
            </div>
            <div className="approval-partner-info">
              <span className="approval-partner-name">{val}</span>
              {record.license ? (
                <span className="approval-license-chip">
                  <SafetyCertificateOutlined /> GPKD: {record.license}
                </span>
              ) : (
                <span className="text-xs text-slate-500 italic">
                  {t('admin.notUpdated', { defaultValue: 'Chưa cập nhật GPKD' })}
                </span>
              )}
            </div>
          </div>
        ),
      },
      {
        title: t('admin.tableRequester', { defaultValue: 'NGƯỜI LIÊN HỆ' }),
        dataIndex: 'applicant',
        render: (val: string, record: ApprovalRequest) => (
          <div className="approval-contact-cell">
            <span className="approval-contact-name">{val}</span>
            {record.phone && (
              <span className="approval-contact-sub flex items-center gap-1">
                {record.phone}
                <Tooltip title={t('common.copy', { defaultValue: 'Sao chép' })}>
                  <CopyOutlined
                    className="cursor-pointer text-slate-400 hover:text-green-400"
                    onClick={() => handleCopyText(record.phone)}
                  />
                </Tooltip>
              </span>
            )}
          </div>
        ),
      },
      {
        title: t('admin.tableLegalInfo', { defaultValue: 'TÀI KHOẢN ĐỐI SOÁT' }),
        render: (_: unknown, record: ApprovalRequest) => (
          <div>
            {record.bankAccount ? (
              <div className="approval-bank-badge">
                <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <BankOutlined /> {t('admin.bankAccount', { defaultValue: 'Ngân hàng' })}
                </span>
                <span className="text-white font-mono">{record.bankAccount}</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic">
                {t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}
              </span>
            )}
          </div>
        ),
      },
      {
        title: t('admin.tableSubmittedAt', { defaultValue: 'NGÀY NỘP' }),
        dataIndex: 'submittedAt',
        render: (val: string) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <ClockCircleOutlined className="text-slate-500" />
            <span>{val}</span>
          </div>
        ),
      },
      {
        title: t('admin.tableStatus', { defaultValue: 'TRẠNG THÁI' }),
        dataIndex: 'status',
        render: (val: string, record: ApprovalRequest) => {
          const isPending = val === 'pending'
          const isApproved = val === 'approved' || val === 'active'
          const isRejected = val === 'rejected'

          const tagClass = isPending
            ? 'approval-status-tag--pending'
            : isApproved
              ? 'approval-status-tag--approved'
              : 'approval-status-tag--rejected'

          const label = isPending
            ? t('admin.statusPending', { defaultValue: 'Chờ duyệt' })
            : isApproved
              ? t('admin.statusApproved', { defaultValue: 'Đã duyệt' })
              : isRejected
                ? t('admin.statusRejected', { defaultValue: 'Từ chối' })
                : val?.toUpperCase()

          return (
            <div>
              <span className={`approval-status-tag ${tagClass}`}>
                {isPending && <span className="dot" />}
                {label}
              </span>
              {record.note && (
                <div
                  className="mt-1 max-w-[150px] truncate text-[11px] text-slate-400"
                  title={record.note}
                >
                  {record.note}
                </div>
              )}
            </div>
          )
        },
      },
      {
        title: t('admin.tableActions', { defaultValue: 'THAO TÁC' }),
        render: (_: unknown, record: ApprovalRequest) => (
          <div className="flex items-center gap-1.5">
            <Tooltip title={t('common.details', { defaultValue: 'Xem hồ sơ' })}>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:border-green-400 hover:text-green-400"
              />
            </Tooltip>
            {record.status === 'pending' && (
              <>
                <Tooltip title={t('admin.approve', { defaultValue: 'Duyệt nhanh' })}>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleConfirmApprove(record)}
                    className="bg-green-600 hover:bg-green-500 border-none"
                  />
                </Tooltip>
                <Tooltip title={t('admin.reject', { defaultValue: 'Từ chối' })}>
                  <Button
                    size="small"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleOpenRejectModal(record)}
                  />
                </Tooltip>
              </>
            )}
          </div>
        ),
      },
    ],
    [handleConfirmApprove, handleCopyText, handleOpenRejectModal, handleViewDetail, t],
  )

  const fieldColumns = useMemo(
    () => [
      {
        title: t('admin.tableFieldName', { defaultValue: 'TÊN CỤM SÂN BÓNG' }),
        dataIndex: 'name',
        render: (val: string, record: ApprovalRequest) => (
          <div className="approval-partner-cell">
            <div className="approval-partner-avatar">
              <ShopOutlined />
            </div>
            <div className="approval-partner-info">
              <div className="flex items-center gap-2">
                <span className="approval-partner-name">{val}</span>
                {record.requestType && (
                  <Tag color={record.requestType === 'field_create' ? 'cyan' : 'purple'}>
                    {record.requestType === 'field_create'
                      ? t('admin.fieldTypeCreate', { defaultValue: 'Tạo mới' })
                      : t('admin.fieldTypeUpdate', { defaultValue: 'Cập nhật' })}
                  </Tag>
                )}
              </div>
              <span className="text-xs text-slate-400 truncate max-w-xs">{record.location}</span>
            </div>
          </div>
        ),
      },
      {
        title: t('admin.tableRequester', { defaultValue: 'CHỦ SÂN / NGƯỜI NỘP' }),
        dataIndex: 'applicant',
        render: (val: string, record: ApprovalRequest) => (
          <div className="approval-contact-cell">
            <span className="approval-contact-name">{val}</span>
            {record.phone && (
              <span className="approval-contact-sub flex items-center gap-1">
                {record.phone}
                <Tooltip title={t('common.copy', { defaultValue: 'Sao chép' })}>
                  <CopyOutlined
                    className="cursor-pointer text-slate-400 hover:text-green-400"
                    onClick={() => handleCopyText(record.phone)}
                  />
                </Tooltip>
              </span>
            )}
          </div>
        ),
      },
      {
        title: t('admin.tableLocation', { defaultValue: 'KHU VỰC ĐỊA BÀN' }),
        dataIndex: 'location',
        render: (val: string) => (
          <span className="text-xs text-slate-300 font-medium">{val || 'Chưa cập nhật'}</span>
        ),
      },
      {
        title: t('admin.tableSubmittedAt', { defaultValue: 'NGÀY NỘP' }),
        dataIndex: 'submittedAt',
        render: (val: string) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <ClockCircleOutlined className="text-slate-500" />
            <span>{val}</span>
          </div>
        ),
      },
      {
        title: t('admin.tableStatus', { defaultValue: 'TRẠNG THÁI' }),
        dataIndex: 'status',
        render: (val: string, record: ApprovalRequest) => {
          const isPending = val === 'pending'
          const isApproved = val === 'approved' || val === 'active'
          const isRejected = val === 'rejected'

          const tagClass = isPending
            ? 'approval-status-tag--pending'
            : isApproved
              ? 'approval-status-tag--approved'
              : 'approval-status-tag--rejected'

          const label = isPending
            ? t('admin.statusPending', { defaultValue: 'Chờ duyệt' })
            : isApproved
              ? t('admin.statusApproved', { defaultValue: 'Đã duyệt' })
              : isRejected
                ? t('admin.statusRejected', { defaultValue: 'Từ chối' })
                : val?.toUpperCase()

          return (
            <div>
              <span className={`approval-status-tag ${tagClass}`}>
                {isPending && <span className="dot" />}
                {label}
              </span>
              {record.note && (
                <div
                  className="mt-1 max-w-[150px] truncate text-[11px] text-slate-400"
                  title={record.note}
                >
                  {record.note}
                </div>
              )}
            </div>
          )
        },
      },
      {
        title: t('admin.tableActions', { defaultValue: 'THAO TÁC' }),
        render: (_: unknown, record: ApprovalRequest) => (
          <div className="flex items-center gap-1.5">
            <Tooltip title={t('common.details', { defaultValue: 'Xem hồ sơ' })}>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
                className="border-slate-700 bg-slate-800/80 text-slate-200 hover:border-green-400 hover:text-green-400"
              />
            </Tooltip>
            {record.status === 'pending' && (
              <>
                <Tooltip title={t('admin.approve', { defaultValue: 'Duyệt nhanh' })}>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleConfirmApprove(record)}
                    className="bg-green-600 hover:bg-green-500 border-none"
                  />
                </Tooltip>
                <Tooltip title={t('admin.reject', { defaultValue: 'Từ chối' })}>
                  <Button
                    size="small"
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleOpenRejectModal(record)}
                  />
                </Tooltip>
              </>
            )}
          </div>
        ),
      },
    ],
    [handleConfirmApprove, handleCopyText, handleOpenRejectModal, handleViewDetail, t],
  )

  const isDetailLoading = ownerDetailLoading || fieldDetailLoading

  const quickRejectionOptions = type === 'owner' ? OWNER_REJECTION_REASONS : FIELD_REJECTION_REASONS

  return (
    <section className="admin-approvals-page">
      {contextHolder}

      {/* Header */}
      <header className="admin-approvals-header">
        <div>
          <span className="admin-approvals-eyebrow">
            <span className="admin-approvals-eyebrow__dot" />
            VERIFICATION TERMINAL
          </span>
          <h1 className="admin-approvals-title">
            {type === 'owner'
              ? t('admin.approvalsTitle', { defaultValue: 'Phê duyệt đối tác chủ sân' })
              : t('nav.fieldApprovals', { defaultValue: 'Phê duyệt cụm sân bóng' })}
          </h1>
          <p className="admin-approvals-subtitle">
            {t('admin.approvalsSubtitle', {
              defaultValue: 'Thẩm định hồ sơ pháp nhân, đối soát ngân hàng và kiểm soát rủi ro trước khi mở vận hành.',
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => refetch()}
            loading={loading}
            className="border-slate-700 bg-slate-800 text-slate-200 hover:border-green-400 hover:text-green-400"
          >
            {t('common.refresh', { defaultValue: 'Làm mới dữ liệu' })}
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <div className="admin-approvals-kpi-grid">
        <div className="admin-approvals-kpi-card admin-approvals-kpi-card--pending">
          <div className="admin-approvals-kpi-label">
            <span>{t('admin.kpiPending', { defaultValue: 'CHỜ DUYỆT' })}</span>
            <ClockCircleOutlined className="text-amber-400" />
          </div>
          <div className="admin-approvals-kpi-value text-amber-400">{kpiStats.pending}</div>
          <div className="admin-approvals-kpi-sub">Hồ sơ ưu tiên cần thẩm định</div>
        </div>

        <div className="admin-approvals-kpi-card admin-approvals-kpi-card--approved">
          <div className="admin-approvals-kpi-label">
            <span>{t('admin.kpiApproved', { defaultValue: 'ĐÃ PHÊ DUYỆT' })}</span>
            <CheckCircleOutlined className="text-green-400" />
          </div>
          <div className="admin-approvals-kpi-value text-green-400">{kpiStats.approved}</div>
          <div className="admin-approvals-kpi-sub">Đối tác đã kích hoạt hệ thống</div>
        </div>

        <div className="admin-approvals-kpi-card admin-approvals-kpi-card--rejected">
          <div className="admin-approvals-kpi-label">
            <span>{t('admin.kpiRejected', { defaultValue: 'ĐÃ TỪ CHỐI' })}</span>
            <CloseCircleOutlined className="text-red-400" />
          </div>
          <div className="admin-approvals-kpi-value text-red-400">{kpiStats.rejected}</div>
          <div className="admin-approvals-kpi-sub">Hồ sơ không đạt tiêu chuẩn</div>
        </div>

        <div className="admin-approvals-kpi-card admin-approvals-kpi-card--total">
          <div className="admin-approvals-kpi-label">
            <span>{t('admin.kpiTotal', { defaultValue: 'TỔNG TIẾP NHẬN' })}</span>
            <FileTextOutlined className="text-slate-400" />
          </div>
          <div className="admin-approvals-kpi-value text-slate-100">{kpiStats.total}</div>
          <div className="admin-approvals-kpi-sub">Tổng số yêu cầu toàn hệ thống</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="admin-approvals-toolbar">
        <div className="admin-approvals-toolbar__left">
          <Segmented
            value={type}
            onChange={(val) => {
              const nextType = val as 'owner' | 'field'
              setType(nextType)
              navigate(nextType === 'owner' ? '/admin/approvals/owners' : '/admin/approvals/fields')
            }}
            options={[
              {
                value: 'owner',
                label: (
                  <span className="flex items-center gap-1.5 px-2">
                    <UserOutlined />
                    {t('nav.ownerApprovals', { defaultValue: 'Duyệt chủ sân' })}
                  </span>
                ),
              },
              {
                value: 'field',
                label: (
                  <span className="flex items-center gap-1.5 px-2">
                    <ShopOutlined />
                    {t('nav.fieldApprovals', { defaultValue: 'Duyệt sân bóng' })}
                  </span>
                ),
              },
            ]}
          />

          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            className="w-36"
            options={[
              { value: 'pending', label: t('admin.statusPending', { defaultValue: 'Chờ duyệt' }) },
              { value: 'approved', label: t('admin.statusApproved', { defaultValue: 'Đã duyệt' }) },
              { value: 'rejected', label: t('admin.statusRejected', { defaultValue: 'Từ chối' }) },
              { value: 'all', label: t('admin.statusAll', { defaultValue: 'Tất cả trạng thái' }) },
            ]}
          />
        </div>

        <div className="admin-approvals-toolbar__right">
          <Input
            prefix={<SearchOutlined className="text-slate-500" />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('admin.searchPlaceholder', { defaultValue: 'Tìm theo tên, GPKD, SĐT...' })}
            className="max-w-[240px] bg-slate-900/90 text-white"
            allowClear
          />

          <Select
            value={datePreset}
            onChange={(val) => {
              setDatePreset(val)
              if (val !== 'custom') {
                setCustomRange(null)
              }
            }}
            options={datePresetOptions}
            className="w-44"
          />

          {datePreset === 'custom' && (
            <DatePicker.RangePicker
              value={customRange}
              onChange={(dates) =>
                setCustomRange(dates as [Dayjs | null, Dayjs | null] | null)
              }
              format="YYYY-MM-DD"
              placeholder={[
                t('admin.startDatePlaceholder', { defaultValue: 'Từ ngày' }),
                t('admin.endDatePlaceholder', { defaultValue: 'Đến ngày' }),
              ]}
            />
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-approvals-table-wrap">
        <Table
          className="admin-approvals-table"
          loading={loading}
          rowKey="id"
          dataSource={visible}
          columns={type === 'owner' ? ownerColumns : fieldColumns}
          pagination={{
            current: page,
            pageSize: ADMIN_APPROVALS_PAGE_SIZE,
            total,
            showSizeChanger: false,
            pageSizeOptions: ADMIN_APPROVALS_PAGE_SIZE_OPTIONS,
            onChange: (nextPage) => setPage(nextPage),
          }}
        />
      </div>

      {/* Drawer: Inspection Terminal */}
      <Drawer
        title={
          <div className="flex items-center gap-2">
            <SafetyCertificateOutlined className="text-green-400" />
            <span className="text-white font-bold">
              {t('admin.detailTitle', { defaultValue: 'Thẩm định hồ sơ phê duyệt' })}
            </span>
          </div>
        }
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        width={620}
        styles={{
          header: { background: '#111a14', borderBottom: '1px solid rgba(255,255,255,0.08)' },
          body: { background: '#0d1410', padding: 20 },
        }}
      >
        {isDetailLoading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <Spin size="large" />
          </div>
        ) : selectedRecord?.type === 'owner' && ownerDetail ? (
          <div className="admin-audit-pane">
            {renderStatusAlert(
              ownerDetail.status,
              ownerDetail.reviewedAt,
              ownerDetail.reviewer?.email,
              ownerDetail.note,
            )}

            {/* Business Entity Section */}
            <div className="admin-audit-section">
              <h4 className="admin-audit-section-title">
                <ShopOutlined /> {t('admin.ownerProfileInfo', { defaultValue: 'Hồ sơ pháp nhân kinh doanh' })}
              </h4>
              <div className="admin-audit-grid">
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">{t('admin.businessName', { defaultValue: 'Tên cơ sở kinh doanh' })}</span>
                  <span className="admin-audit-field-value text-green-300">
                    {ownerDetail.ownerProfile?.businessName || selectedRecord.name}
                  </span>
                </div>
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">{t('admin.businessLicense', { defaultValue: 'Giấy phép kinh doanh / MST' })}</span>
                  <span className="admin-audit-field-value admin-audit-field-value--mono text-amber-300">
                    {ownerDetail.ownerProfile?.businessLicense || selectedRecord.license || t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial / Payout Info */}
            <div className="admin-audit-section">
              <h4 className="admin-audit-section-title">
                <BankOutlined /> {t('admin.bankAccount', { defaultValue: 'Tài khoản ngân hàng đối soát' })}
              </h4>
              <div className="admin-audit-grid">
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">Số tài khoản</span>
                  <span className="admin-audit-field-value admin-audit-field-value--mono text-white">
                    {ownerDetail.ownerProfile?.bankAccount || selectedRecord.bankAccount || t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}
                  </span>
                </div>
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">Xác minh lúc</span>
                  <span className="admin-audit-field-value text-xs text-slate-300">
                    {ownerDetail.ownerProfile?.verifiedAt
                      ? new Date(ownerDetail.ownerProfile.verifiedAt).toLocaleString('vi-VN')
                      : t('admin.unverified', { defaultValue: 'Chưa xác minh' })}
                  </span>
                </div>
              </div>
            </div>

            {/* Applicant Profile */}
            <div className="admin-audit-section">
              <h4 className="admin-audit-section-title">
                <UserOutlined /> {t('admin.requesterInfo', { defaultValue: 'Thông tin người gửi yêu cầu' })}
              </h4>
              <div className="admin-audit-grid">
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">Email tài khoản</span>
                  <span className="admin-audit-field-value">{ownerDetail.requester.email}</span>
                </div>
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">Số điện thoại</span>
                  <span className="admin-audit-field-value">{ownerDetail.requester.phone || t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}</span>
                </div>
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">Vai trò</span>
                  <span className="admin-audit-field-value">
                    <Tag>{ownerDetail.requester.role}</Tag>
                  </span>
                </div>
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">Trạng thái tài khoản</span>
                  <span className="admin-audit-field-value">
                    <Tag color={ownerDetail.requester.status === 'active' ? 'green' : 'default'}>
                      {ownerDetail.requester.status.toUpperCase()}
                    </Tag>
                  </span>
                </div>
              </div>
            </div>

            {/* Reviewer Note if available */}
            {ownerDetail.reviewer && (
              <div className="admin-audit-section">
                <h4 className="admin-audit-section-title">
                  <SafetyCertificateOutlined /> {t('admin.reviewer', { defaultValue: 'Lịch sử kiểm duyệt' })}
                </h4>
                <div className="text-xs text-slate-300 space-y-1">
                  <div>Admin duyệt: <strong>{ownerDetail.reviewer.email}</strong></div>
                  {ownerDetail.reviewedAt && (
                    <div>Thời điểm: {new Date(ownerDetail.reviewedAt).toLocaleString('vi-VN')}</div>
                  )}
                  {ownerDetail.note && <div>Ghi chú: {ownerDetail.note}</div>}
                </div>
              </div>
            )}

            {/* Sticky Actions */}
            {ownerDetail.status === 'pending' && selectedRecord && (
              <div className="admin-audit-actions">
                <Button
                  type="primary"
                  block
                  icon={<CheckOutlined />}
                  onClick={() => handleConfirmApprove(selectedRecord)}
                  className="bg-green-600 hover:bg-green-500 h-10 font-semibold"
                >
                  {t('admin.approveAction', { defaultValue: 'Phê duyệt kích hoạt' })}
                </Button>
                <Button
                  danger
                  block
                  icon={<CloseOutlined />}
                  onClick={() => handleOpenRejectModal(selectedRecord)}
                  className="h-10 font-semibold"
                >
                  {t('admin.rejectAction', { defaultValue: 'Từ chối hồ sơ' })}
                </Button>
              </div>
            )}
          </div>
        ) : selectedRecord?.type === 'field' && fieldDetail ? (
          <div className="admin-audit-pane">
            {renderStatusAlert(
              fieldDetail.status,
              fieldDetail.reviewedAt,
              fieldDetail.reviewer?.email,
              fieldDetail.note,
            )}

            {/* Field Information */}
            {fieldDetail.targetField && (
              <div className="admin-audit-section">
                <h4 className="admin-audit-section-title">
                  <ShopOutlined /> {t('admin.fieldInfo', { defaultValue: 'Thông tin cụm sân bóng' })}
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Tên cụm sân:</span>
                    <span className="font-semibold text-white">{fieldDetail.targetField.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Địa chỉ:</span>
                    <span className="text-slate-300">{fieldDetail.targetField.address}</span>
                  </div>
                  {fieldDetail.targetField.description && (
                    <div>
                      <span className="text-xs text-slate-400 block">Mô tả:</span>
                      <span className="text-slate-400 text-xs">{fieldDetail.targetField.description}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Requester Info */}
            <div className="admin-audit-section">
              <h4 className="admin-audit-section-title">
                <UserOutlined /> {t('admin.requesterInfo', { defaultValue: 'Thông tin người gửi yêu cầu' })}
              </h4>
              <div className="admin-audit-grid">
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">Email</span>
                  <span className="admin-audit-field-value">{fieldDetail.requester.email}</span>
                </div>
                <div className="admin-audit-field">
                  <span className="admin-audit-field-label">Số điện thoại</span>
                  <span className="admin-audit-field-value">{fieldDetail.requester.phone || t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}</span>
                </div>
              </div>
            </div>

            {/* Proposed Changes if any */}
            {fieldDetail.proposedChanges && Object.keys(fieldDetail.proposedChanges).length > 0 && (
              <div className="admin-audit-section">
                <h4 className="admin-audit-section-title">
                  <FileTextOutlined /> {t('admin.proposedChanges', { defaultValue: 'Nội dung thay đổi đề xuất' })}
                </h4>
                <pre className="text-xs bg-black/40 p-3 rounded-lg overflow-x-auto text-green-300">
                  {JSON.stringify(fieldDetail.proposedChanges, null, 2)}
                </pre>
              </div>
            )}

            {/* Sticky Actions */}
            {fieldDetail.status === 'pending' && selectedRecord && (
              <div className="admin-audit-actions">
                <Button
                  type="primary"
                  block
                  icon={<CheckOutlined />}
                  onClick={() => handleConfirmApprove(selectedRecord)}
                  className="bg-green-600 hover:bg-green-500 h-10 font-semibold"
                >
                  {t('admin.approveAction', { defaultValue: 'Phê duyệt kích hoạt sân' })}
                </Button>
                <Button
                  danger
                  block
                  icon={<CloseOutlined />}
                  onClick={() => handleOpenRejectModal(selectedRecord)}
                  className="h-10 font-semibold"
                >
                  {t('admin.rejectAction', { defaultValue: 'Từ chối sân' })}
                </Button>
              </div>
            )}
          </div>
        ) : null}
      </Drawer>

      {/* Reject Modal with Quick Selection Tags */}
      <Modal
        title={
          <span className="text-red-400 font-bold flex items-center gap-2">
            <CloseCircleOutlined />
            {t('admin.rejectModalTitle', { defaultValue: 'Từ chối yêu cầu phê duyệt' })}
          </span>
        }
        open={Boolean(rejectModalRecord)}
        onCancel={() => {
          if (!isSubmittingReject) {
            setRejectModalRecord(null)
            setRejectionReason('')
          }
        }}
        onOk={handleConfirmReject}
        confirmLoading={isSubmittingReject}
        okText={t('admin.rejectAction', { defaultValue: 'Xác nhận từ chối' })}
        cancelText={t('common.cancel', { defaultValue: 'Hủy' })}
        okButtonProps={{ danger: true }}
      >
        <p className="mb-2 text-xs text-slate-400">
          {t('admin.rejectModalPrompt', {
            defaultValue: 'Vui lòng cung cấp lý do từ chối hồ sơ cho đối tác/người yêu cầu:',
          })}
        </p>

        {rejectModalRecord && (
          <div className="mb-3 rounded-lg bg-slate-900/80 p-3 border border-slate-800">
            <b className="text-white block">{rejectModalRecord.name}</b>
            <div className="text-xs text-slate-400">{rejectModalRecord.applicant}</div>
          </div>
        )}

        <div className="mb-2 text-xs font-semibold text-slate-400">
          {t('admin.quickReasons', { defaultValue: 'Lý do phổ biến (nhấp để chọn nhanh):' })}
        </div>
        <div className="admin-reject-tags">
          {quickRejectionOptions.map((item) => (
            <button
              key={item.key}
              type="button"
              className="admin-reject-tag-btn"
              onClick={() => setRejectionReason(isEn ? item.textEn : item.textVi)}
            >
              {isEn ? item.labelEn : item.labelVi}
            </button>
          ))}
        </div>

        <Input.TextArea
          rows={4}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder={t('admin.rejectReasonPlaceholder', {
            defaultValue: 'Nhập lý do từ chối cụ thể (ví dụ: Thiếu giấy phép kinh doanh, Ảnh chụp mờ...)',
          })}
          maxLength={500}
          showCount
          className="mt-2"
        />
      </Modal>
    </section>
  )
}
