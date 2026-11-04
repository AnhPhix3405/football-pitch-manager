import {
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Button,
  DatePicker,
  Descriptions,
  Drawer,
  Input,
  Modal,
  Segmented,
  Select,
  Spin,
  Table,
  Tag,
  message,
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { ApprovalRequest } from './admin.data'
import {
  mapFieldApprovalToRequest,
  mapOwnerApprovalToRequest,
  useAdminApprovals,
} from './hooks/useAdminApprovals'
import { useAdminFieldApprovalDetail } from './hooks/useAdminFieldApprovalDetail'
import { useAdminOwnerApprovalDetail } from './hooks/useAdminOwnerApprovalDetail'
import type { Dayjs } from 'dayjs'
import type { DateFilterPreset } from './constants/date-filter.constant'
import { getDateRangeFromPreset } from './utils/date-range.util'
import {
  ADMIN_APPROVALS_PAGE_SIZE,
  ADMIN_APPROVALS_PAGE_SIZE_OPTIONS,
} from './constants/pagination.constant'
import type {
  AdminFieldApprovalItem,
  AdminOwnerApprovalItem,
} from './interface/admin.interface'

import type { ApprovalStatusFilter } from './constants/status-filter.constant'

interface AdminApprovalsPageProps {
  forcedType?: 'owner' | 'field'
}

export function AdminApprovalsPage({ forcedType }: AdminApprovalsPageProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [type, setType] = useState<'owner' | 'field'>(forcedType || 'owner')
  const [statusFilter, setStatusFilter] = useState<ApprovalStatusFilter>('pending')
  const [query, setQuery] = useState('')
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all')
  const [customRange, setCustomRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<ApprovalRequest | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [resolved, setResolved] = useState<string[]>([])
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
        label: t('admin.dateFilterCustom', { defaultValue: 'Chọn khoảng thời gian' }),
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
        !resolved.includes(item.id) &&
        (!query ||
          `${item.name} ${item.applicant} ${item.phone || ''}`
            .toLowerCase()
            .includes(query.toLowerCase())),
    )
  }, [mappedApiRequests, query, resolved, type])

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
          messageApi.error(t('admin.loadDetailError', { defaultValue: 'Không thể tải chi tiết hồ sơ phê duyệt' }))
        }
      } else {
        try {
          await fetchFieldDetail(record.id)
        } catch {
          messageApi.error(t('admin.loadFieldDetailError', { defaultValue: 'Không thể tải chi tiết cụm sân' }))
        }
      }
    },
    [fetchFieldDetail, fetchOwnerDetail, messageApi, t],
  )

  const decide = useCallback(
    (request: ApprovalRequest, isApproved: boolean) =>
      Modal.confirm({
        title: isApproved
          ? t('admin.confirmApproveTitle', { defaultValue: `Phê duyệt ${request.name}?`, name: request.name })
          : t('admin.confirmRejectTitle', { defaultValue: `Từ chối ${request.name}?`, name: request.name }),
        content: isApproved
          ? t('admin.confirmApproveContent', { defaultValue: 'Tài khoản hoặc sân sẽ được kích hoạt trên hệ thống.' })
          : t('admin.confirmRejectContent', { defaultValue: 'Người gửi sẽ nhận thông báo và lý do từ chối.' }),
        okText: isApproved
          ? t('admin.approve', { defaultValue: 'Duyệt' })
          : t('admin.reject', { defaultValue: 'Từ chối' }),
        cancelText: t('common.cancel', { defaultValue: 'Hủy' }),
        okButtonProps: { danger: !isApproved },
        onOk: async () => {
          try {
            if (request.type === 'owner') {
              if (isApproved) {
                await approve(request.id, 'Hồ sơ đã được phê duyệt')
              } else {
                await reject(request.id, 'Hồ sơ chưa đạt yêu cầu xác minh')
              }
            } else {
              if (isApproved) {
                await approve(request.id, 'Cụm sân hợp lệ')
              } else {
                await reject(request.id, 'Thông tin cụm sân chưa đạt yêu cầu')
              }
            }
            setResolved((items) => [...items, request.id])
            handleCloseDrawer()
            messageApi.success(
              isApproved
                ? t('admin.approveSuccess', { defaultValue: 'Đã phê duyệt hồ sơ.' })
                : t('admin.rejectSuccess', { defaultValue: 'Đã từ chối hồ sơ.' }),
            )
          } catch (err) {
            messageApi.error(
              err instanceof Error
                ? err.message
                : t('admin.actionFailed', { defaultValue: 'Thao tác không thành công.' }),
            )
          }
        },
      }),
    [approve, handleCloseDrawer, messageApi, reject, t],
  )

  const ownerColumns = useMemo(
    () => [
      {
        title: t('admin.tablePartnerName', { defaultValue: 'TÊN ĐỐI TÁC / DOANH NGHIỆP' }),
        dataIndex: 'name',
        render: (val: string) => <b>{val}</b>,
      },
      {
        title: t('admin.tableRequester', { defaultValue: 'NGƯỜI LIÊN HỆ' }),
        dataIndex: 'applicant',
        render: (val: string, record: ApprovalRequest) => (
          <div>
            <div>{val}</div>
            {record.phone && <small style={{ color: '#888' }}>{record.phone}</small>}
          </div>
        ),
      },
      {
        title: t('admin.tableLegalInfo', { defaultValue: 'GPKD / TÀI KHOẢN' }),
        render: (_: unknown, record: ApprovalRequest) => (
          <div>
            <div>{record.license ? `GPKD: ${record.license}` : t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}</div>
            {record.bankAccount && <small style={{ color: '#888' }}>STK: {record.bankAccount}</small>}
          </div>
        ),
      },
      {
        title: t('admin.tableSubmittedAt', { defaultValue: 'NGÀY NỘP' }),
        dataIndex: 'submittedAt',
      },
      {
        title: t('admin.tableStatus', { defaultValue: 'TRẠNG THÁI' }),
        dataIndex: 'status',
        render: (val: string) => {
          const isPending = val === 'pending'
          const isApproved = val === 'approved' || val === 'active'
          const isRejected = val === 'rejected'
          const label = isPending
            ? t('admin.statusPending', { defaultValue: 'Chờ duyệt' })
            : isApproved
              ? t('admin.statusApproved', { defaultValue: 'Đã duyệt' })
              : isRejected
                ? t('admin.statusRejected', { defaultValue: 'Từ chối' })
                : val?.toUpperCase()
          return (
            <Tag color={isApproved ? 'green' : isRejected ? 'red' : 'gold'}>
              {label}
            </Tag>
          )
        },
      },
      {
        title: t('admin.tableActions', { defaultValue: 'THAO TÁC' }),
        render: (_: unknown, record: ApprovalRequest) => (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
              {t('common.details', { defaultValue: 'Xem' })}
            </Button>
            {record.status === 'pending' && (
              <>
                <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => decide(record, true)}>
                  {t('admin.approve', { defaultValue: 'Duyệt' })}
                </Button>
                <Button size="small" danger icon={<CloseOutlined />} onClick={() => decide(record, false)}>
                  {t('admin.reject', { defaultValue: 'Từ chối' })}
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [decide, handleViewDetail, t],
  )

  const fieldColumns = useMemo(
    () => [
      {
        title: t('admin.tableFieldName', { defaultValue: 'TÊN SÂN BÓNG' }),
        dataIndex: 'name',
        render: (val: string, record: ApprovalRequest) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <b>{val}</b>
            {record.requestType && (
              <Tag color={record.requestType === 'field_create' ? 'cyan' : 'purple'}>
                {record.requestType === 'field_create'
                  ? t('admin.fieldTypeCreate', { defaultValue: 'Tạo mới' })
                  : t('admin.fieldTypeUpdate', { defaultValue: 'Cập nhật' })}
              </Tag>
            )}
          </div>
        ),
      },
      {
        title: t('admin.tableRequester', { defaultValue: 'NGƯỜI YÊU CẦU' }),
        dataIndex: 'applicant',
        render: (val: string, record: ApprovalRequest) => (
          <div>
            <div>{val}</div>
            {record.phone && <small style={{ color: '#888' }}>{record.phone}</small>}
          </div>
        ),
      },
      {
        title: t('admin.tableLocation', { defaultValue: 'KHU VỰC / ĐỊA CHỈ' }),
        dataIndex: 'location',
      },
      {
        title: t('admin.tableSubmittedAt', { defaultValue: 'NGÀY NỘP' }),
        dataIndex: 'submittedAt',
      },
      {
        title: t('admin.tableStatus', { defaultValue: 'TRẠNG THÁI' }),
        dataIndex: 'status',
        render: (val: string) => {
          const isPending = val === 'pending'
          const isApproved = val === 'approved' || val === 'active'
          const isRejected = val === 'rejected'
          const label = isPending
            ? t('admin.statusPending', { defaultValue: 'Chờ duyệt' })
            : isApproved
              ? t('admin.statusApproved', { defaultValue: 'Đã duyệt' })
              : isRejected
                ? t('admin.statusRejected', { defaultValue: 'Từ chối' })
                : val?.toUpperCase()
          return (
            <Tag color={isApproved ? 'green' : isRejected ? 'red' : 'gold'}>
              {label}
            </Tag>
          )
        },
      },
      {
        title: t('admin.tableActions', { defaultValue: 'THAO TÁC' }),
        render: (_: unknown, record: ApprovalRequest) => (
          <div style={{ display: 'flex', gap: 6 }}>
            <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
              {t('common.details', { defaultValue: 'Xem' })}
            </Button>
            {record.status === 'pending' && (
              <>
                <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => decide(record, true)}>
                  {t('admin.approve', { defaultValue: 'Duyệt' })}
                </Button>
                <Button size="small" danger icon={<CloseOutlined />} onClick={() => decide(record, false)}>
                  {t('admin.reject', { defaultValue: 'Từ chối' })}
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [decide, handleViewDetail, t],
  )

  const isDetailLoading = ownerDetailLoading || fieldDetailLoading

  return (
    <section className="admin-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">VERIFICATION QUEUE</span>
          <h1>{t('admin.approvalsTitle', { defaultValue: 'Phê duyệt chủ sân & sân' })}</h1>
          <p>{t('admin.approvalsSubtitle', { defaultValue: 'Kiểm tra hồ sơ, tài liệu và mức độ rủi ro trước khi kích hoạt.' })}</p>
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
          value={type}
          onChange={(val) => {
            const nextType = val as 'owner' | 'field'
            setType(nextType)
            navigate(nextType === 'owner' ? '/admin/approvals/owners' : '/admin/approvals/fields')
          }}
          options={[
            { value: 'owner', label: t('nav.ownerApprovals', { defaultValue: 'Duyệt chủ sân' }) },
            { value: 'field', label: t('nav.fieldApprovals', { defaultValue: 'Duyệt sân bóng' }) },
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
          <Input
            prefix={<SearchOutlined />}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('admin.searchPlaceholder', { defaultValue: 'Tìm hồ sơ...' })}
            style={{ maxWidth: 220 }}
          />
          <Select
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            style={{ width: 150 }}
            options={[
              { value: 'pending', label: t('admin.statusPending', { defaultValue: 'Chờ duyệt' }) },
              { value: 'approved', label: t('admin.statusApproved', { defaultValue: 'Đã duyệt' }) },
              { value: 'rejected', label: t('admin.statusRejected', { defaultValue: 'Từ chối' }) },
              { value: 'all', label: t('admin.statusAll', { defaultValue: 'Tất cả trạng thái' }) },
            ]}
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
            style={{ width: 170 }}
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
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={loading}>
            {t('common.refresh', { defaultValue: 'Làm mới' })}
          </Button>
        </div>
      </div>
      <Table
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
      <Drawer
        title={t('admin.detailTitle', { defaultValue: 'Chi tiết hồ sơ phê duyệt' })}
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        width={560}
      >
        {isDetailLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 240 }}>
            <Spin size="large" />
          </div>
        ) : selectedRecord?.type === 'owner' && ownerDetail ? (
          <div className="approval-detail">
            <Descriptions
              title={t('admin.requestInfo', { defaultValue: 'Thông tin yêu cầu' })}
              column={1}
              bordered
              size="small"
            >
              <Descriptions.Item label={t('admin.requestType', { defaultValue: 'Loại yêu cầu' })}>
                <Tag color="blue">{ownerDetail.type}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.status', { defaultValue: 'Trạng thái' })}>
                <Tag
                  color={
                    ownerDetail.status === 'approved'
                      ? 'green'
                      : ownerDetail.status === 'rejected'
                        ? 'red'
                        : 'gold'
                  }
                >
                  {ownerDetail.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.submittedAt', { defaultValue: 'Thời điểm nộp' })}>
                {new Date(ownerDetail.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              {ownerDetail.reviewedAt && (
                <Descriptions.Item label={t('admin.reviewedAt', { defaultValue: 'Thời điểm duyệt' })}>
                  {new Date(ownerDetail.reviewedAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
              )}
              {ownerDetail.note && (
                <Descriptions.Item label={t('admin.note', { defaultValue: 'Ghi chú' })}>
                  {ownerDetail.note}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Descriptions
              title={t('admin.requesterInfo', { defaultValue: 'Thông tin người gửi' })}
              column={1}
              bordered
              size="small"
              style={{ marginTop: 16 }}
            >
              <Descriptions.Item label={t('admin.email', { defaultValue: 'Email liên hệ' })}>
                {ownerDetail.requester.email}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.phone', { defaultValue: 'Số điện thoại' })}>
                {ownerDetail.requester.phone || t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.userRole', { defaultValue: 'Vai trò tài khoản' })}>
                <Tag>{ownerDetail.requester.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.accountStatus', { defaultValue: 'Trạng thái tài khoản' })}>
                <Tag color={ownerDetail.requester.status === 'active' ? 'green' : 'default'}>
                  {ownerDetail.requester.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {ownerDetail.ownerProfile && (
              <Descriptions
                title={t('admin.ownerProfileInfo', { defaultValue: 'Hồ sơ pháp nhân chủ sân' })}
                column={1}
                bordered
                size="small"
                style={{ marginTop: 16 }}
              >
                <Descriptions.Item label={t('admin.businessName', { defaultValue: 'Tên cơ sở kinh doanh' })}>
                  <b>{ownerDetail.ownerProfile.businessName || t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}</b>
                </Descriptions.Item>
                <Descriptions.Item label={t('admin.businessLicense', { defaultValue: 'Giấy phép kinh doanh' })}>
                  {ownerDetail.ownerProfile.businessLicense || t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}
                </Descriptions.Item>
                <Descriptions.Item label={t('admin.bankAccount', { defaultValue: 'Tài khoản ngân hàng' })}>
                  {ownerDetail.ownerProfile.bankAccount || t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}
                </Descriptions.Item>
                <Descriptions.Item label={t('admin.verifiedAt', { defaultValue: 'Xác minh lúc' })}>
                  {ownerDetail.ownerProfile.verifiedAt
                    ? new Date(ownerDetail.ownerProfile.verifiedAt).toLocaleString('vi-VN')
                    : t('admin.unverified', { defaultValue: 'Chưa xác minh' })}
                </Descriptions.Item>
              </Descriptions>
            )}

            {ownerDetail.reviewer && (
              <Descriptions
                title={t('admin.reviewer', { defaultValue: 'Người kiểm duyệt' })}
                column={1}
                bordered
                size="small"
                style={{ marginTop: 16 }}
              >
                <Descriptions.Item label={t('admin.reviewerEmail', { defaultValue: 'Admin duyệt' })}>
                  {ownerDetail.reviewer.email}
                </Descriptions.Item>
              </Descriptions>
            )}

            {selectedRecord && selectedRecord.status === 'pending' && (
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <Button
                  type="primary"
                  block
                  icon={<CheckOutlined />}
                  onClick={() => decide(selectedRecord, true)}
                >
                  {t('admin.approveAction', { defaultValue: 'Phê duyệt hồ sơ' })}
                </Button>
                <Button
                  danger
                  block
                  icon={<CloseOutlined />}
                  onClick={() => decide(selectedRecord, false)}
                >
                  {t('admin.rejectAction', { defaultValue: 'Từ chối' })}
                </Button>
              </div>
            )}
          </div>
        ) : selectedRecord?.type === 'field' && fieldDetail ? (
          <div className="approval-detail">
            <Descriptions
              title={t('admin.requestInfo', { defaultValue: 'Thông tin yêu cầu' })}
              column={1}
              bordered
              size="small"
            >
              <Descriptions.Item label={t('admin.requestType', { defaultValue: 'Loại yêu cầu' })}>
                <Tag color={fieldDetail.type === 'field_create' ? 'cyan' : 'purple'}>
                  {fieldDetail.type === 'field_create'
                    ? t('admin.fieldTypeCreate', { defaultValue: 'Tạo sân mới' })
                    : t('admin.fieldTypeUpdate', { defaultValue: 'Cập nhật sân' })}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.status', { defaultValue: 'Trạng thái' })}>
                <Tag
                  color={
                    fieldDetail.status === 'approved'
                      ? 'green'
                      : fieldDetail.status === 'rejected'
                        ? 'red'
                        : 'gold'
                  }
                >
                  {fieldDetail.status.toUpperCase()}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.submittedAt', { defaultValue: 'Thời điểm nộp' })}>
                {new Date(fieldDetail.createdAt).toLocaleString('vi-VN')}
              </Descriptions.Item>
              {fieldDetail.reviewedAt && (
                <Descriptions.Item label={t('admin.reviewedAt', { defaultValue: 'Thời điểm duyệt' })}>
                  {new Date(fieldDetail.reviewedAt).toLocaleString('vi-VN')}
                </Descriptions.Item>
              )}
              {fieldDetail.note && (
                <Descriptions.Item label={t('admin.note', { defaultValue: 'Ghi chú' })}>
                  {fieldDetail.note}
                </Descriptions.Item>
              )}
            </Descriptions>

            <Descriptions
              title={t('admin.requesterInfo', { defaultValue: 'Thông tin người yêu cầu' })}
              column={1}
              bordered
              size="small"
              style={{ marginTop: 16 }}
            >
              <Descriptions.Item label={t('admin.email', { defaultValue: 'Email liên hệ' })}>
                {fieldDetail.requester.email}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.phone', { defaultValue: 'Số điện thoại' })}>
                {fieldDetail.requester.phone || t('admin.notUpdated', { defaultValue: 'Chưa cập nhật' })}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.userRole', { defaultValue: 'Vai trò tài khoản' })}>
                <Tag>{fieldDetail.requester.role}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.accountStatus', { defaultValue: 'Trạng thái tài khoản' })}>
                <Tag color={fieldDetail.requester.status === 'active' ? 'green' : 'default'}>
                  {fieldDetail.requester.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {fieldDetail.targetField && (
              <Descriptions
                title={t('admin.fieldInfo', { defaultValue: 'Thông tin cụm sân bóng' })}
                column={1}
                bordered
                size="small"
                style={{ marginTop: 16 }}
              >
                <Descriptions.Item label={t('admin.pitchName', { defaultValue: 'Tên cụm sân' })}>
                  <b>{fieldDetail.targetField.name}</b>
                </Descriptions.Item>
                <Descriptions.Item label={t('admin.pitchAddress', { defaultValue: 'Địa chỉ sân' })}>
                  {fieldDetail.targetField.address}
                </Descriptions.Item>
                {fieldDetail.targetField.district && (
                  <Descriptions.Item label={t('admin.pitchDistrict', { defaultValue: 'Quận / Huyện' })}>
                    {fieldDetail.targetField.district}
                  </Descriptions.Item>
                )}
                {fieldDetail.targetField.description && (
                  <Descriptions.Item label={t('admin.pitchDescription', { defaultValue: 'Mô tả' })}>
                    {fieldDetail.targetField.description}
                  </Descriptions.Item>
                )}
                <Descriptions.Item label={t('admin.pitchDeposit', { defaultValue: 'Yêu cầu đặt cọc' })}>
                  {fieldDetail.targetField.requireDeposit
                    ? `${t('admin.pitchDepositYes', { defaultValue: 'Có cọc' })}${fieldDetail.targetField.depositValue ? ` (${fieldDetail.targetField.depositValue.toLocaleString('vi-VN')} VNĐ)` : ''}`
                    : t('admin.pitchDepositNo', { defaultValue: 'Không cọc' })}
                </Descriptions.Item>
              </Descriptions>
            )}

            {fieldDetail.proposedChanges && Object.keys(fieldDetail.proposedChanges).length > 0 && (
              <Descriptions
                title={t('admin.proposedChanges', { defaultValue: 'Nội dung thay đổi đề xuất' })}
                column={1}
                bordered
                size="small"
                style={{ marginTop: 16 }}
              >
                {Object.entries(fieldDetail.proposedChanges).map(([key, value]) => (
                  <Descriptions.Item key={key} label={key}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            )}

            {fieldDetail.reviewer && (
              <Descriptions
                title={t('admin.reviewer', { defaultValue: 'Người kiểm duyệt' })}
                column={1}
                bordered
                size="small"
                style={{ marginTop: 16 }}
              >
                <Descriptions.Item label={t('admin.reviewerEmail', { defaultValue: 'Admin duyệt' })}>
                  {fieldDetail.reviewer.email}
                </Descriptions.Item>
              </Descriptions>
            )}

            {selectedRecord && selectedRecord.status === 'pending' && (
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <Button
                  type="primary"
                  block
                  icon={<CheckOutlined />}
                  onClick={() => decide(selectedRecord, true)}
                >
                  {t('admin.approveAction', { defaultValue: 'Phê duyệt hồ sơ' })}
                </Button>
                <Button
                  danger
                  block
                  icon={<CloseOutlined />}
                  onClick={() => decide(selectedRecord, false)}
                >
                  {t('admin.rejectAction', { defaultValue: 'Từ chối' })}
                </Button>
              </div>
            )}
          </div>
        ) : selectedRecord ? (
          <div className="approval-detail">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label={t('admin.tablePartnerName', { defaultValue: 'Tên đối tác / Sân' })}>
                {selectedRecord.name}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.email', { defaultValue: 'Email liên hệ' })}>
                {selectedRecord.applicant}
              </Descriptions.Item>
              {selectedRecord.phone && (
                <Descriptions.Item label={t('admin.phone', { defaultValue: 'Số điện thoại' })}>
                  {selectedRecord.phone}
                </Descriptions.Item>
              )}
              <Descriptions.Item label={t('admin.tableLocation', { defaultValue: 'Khu vực / Địa chỉ' })}>
                {selectedRecord.location}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.submittedAt', { defaultValue: 'Ngày nộp' })}>
                {selectedRecord.submittedAt}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.status', { defaultValue: 'Trạng thái' })}>
                {selectedRecord.status}
              </Descriptions.Item>
            </Descriptions>
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button type="primary" block icon={<CheckOutlined />} onClick={() => decide(selectedRecord, true)}>
                {t('admin.approveAction', { defaultValue: 'Phê duyệt hồ sơ' })}
              </Button>
              <Button danger block icon={<CloseOutlined />} onClick={() => decide(selectedRecord, false)}>
                {t('admin.rejectAction', { defaultValue: 'Từ chối' })}
              </Button>
            </div>
          </div>
        ) : null}
      </Drawer>
    </section>
  )
}
