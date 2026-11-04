import {
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  StopOutlined,
  UndoOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Descriptions,
  Input,
  Modal,
  Segmented,
  Select,
  Table,
  Tag,
  message,
} from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { managedUsers, moderationItems } from './admin.data'
import type {
  ManagedUserItem,
  ManagedUserRole,
  ManagedUserStatus,
  ManagementTab,
  ModerationContentItem,
} from './interface/management.interface'

export function AdminManagementPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<ManagementTab>('users')
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [moderationStatus, setModerationStatus] = useState<string>('all')

  const [users, setUsers] = useState<ManagedUserItem[]>(managedUsers as ManagedUserItem[])
  const [items, setItems] = useState<ModerationContentItem[]>(moderationItems as ModerationContentItem[])
  const [selectedUser, setSelectedUser] = useState<ManagedUserItem | null>(null)
  const [selectedContent, setSelectedContent] = useState<ModerationContentItem | null>(null)
  const [messageApi, contextHolder] = message.useMessage()

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchQuery =
        !query ||
        `${u.name} ${u.email} ${u.id}`.toLowerCase().includes(query.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchQuery && matchRole && matchStatus
    })
  }, [users, query, roleFilter, statusFilter])

  const filteredContent = useMemo(() => {
    const targetType = tab === 'posts' ? 'post' : 'review'
    return items.filter((item) => {
      if (item.type !== targetType) return false
      const matchQuery =
        !query ||
        `${item.id} ${item.author} ${item.reason} ${item.content}`
          .toLowerCase()
          .includes(query.toLowerCase())
      const matchStatus =
        moderationStatus === 'all' || item.status === moderationStatus
      return matchQuery && matchStatus
    })
  }, [items, tab, query, moderationStatus])

  const toggleUserStatus = useCallback(
    (user: ManagedUserItem) => {
      const isSuspended = user.status === 'suspended'
      const nextStatus: ManagedUserStatus = isSuspended ? 'active' : 'suspended'

      Modal.confirm({
        title: isSuspended
          ? t('admin.confirmActivateUserTitle', { defaultValue: `Khôi phục tài khoản ${user.name}?` })
          : t('admin.confirmSuspendUserTitle', { defaultValue: `Tạm khóa tài khoản ${user.name}?` }),
        content: isSuspended
          ? t('admin.confirmActivateUserContent', {
              defaultValue: 'Tài khoản sẽ được mở quyền đăng nhập và sử dụng hệ thống bình thường.',
            })
          : t('admin.confirmSuspendUserContent', {
              defaultValue: 'Tài khoản sẽ bị vô hiệu hóa phiên đăng nhập cho đến khi được mở lại.',
            }),
        okText: isSuspended
          ? t('admin.activateAction', { defaultValue: 'Khôi phục' })
          : t('admin.suspendAction', { defaultValue: 'Khóa tài khoản' }),
        okButtonProps: { danger: !isSuspended },
        cancelText: t('common.cancel', { defaultValue: 'Hủy' }),
        onOk: () => {
          setUsers((prev) =>
            prev.map((item) =>
              item.id === user.id ? { ...item, status: nextStatus } : item,
            ),
          )
          messageApi.success(
            isSuspended
              ? t('admin.activateSuccess', { defaultValue: 'Đã khôi phục tài khoản thành công.' })
              : t('admin.suspendSuccess', { defaultValue: 'Đã tạm khóa tài khoản thành công.' }),
          )
        },
      })
    },
    [messageApi, t],
  )

  const handleModerateContent = useCallback(
    (contentItem: ModerationContentItem) => {
      Modal.confirm({
        title: t('admin.confirmRemoveContentTitle', { defaultValue: 'Gỡ bỏ nội dung này?' }),
        content: t('admin.confirmRemoveContentBody', {
          defaultValue: 'Nội dung sẽ bị ẩn khỏi hệ thống và trạng thái báo cáo chuyển thành Đã xử lý.',
        }),
        okText: t('admin.removeContent', { defaultValue: 'Gỡ nội dung' }),
        okButtonProps: { danger: true },
        cancelText: t('common.cancel', { defaultValue: 'Hủy' }),
        onOk: () => {
          setItems((prev) =>
            prev.map((item) =>
              item.id === contentItem.id ? { ...item, status: 'resolved' } : item,
            ),
          )
          messageApi.success(t('admin.removeContentSuccess', { defaultValue: 'Đã xử lý gỡ nội dung vi phạm.' }))
        },
      })
    },
    [messageApi, t],
  )

  const userColumns = useMemo(
    () => [
      {
        title: t('admin.tableUser', { defaultValue: 'NGƯỜI DÙNG' }),
        key: 'user',
        render: (_: unknown, item: ManagedUserItem) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#1a2219',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8cfc70',
              }}
            >
              <UserOutlined />
            </div>
            <div>
              <b>{item.name}</b>
              <div className="table-sub">
                {item.email} · {item.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        title: t('admin.tableRole', { defaultValue: 'VAI TRÒ' }),
        dataIndex: 'role',
        key: 'role',
        render: (role: ManagedUserRole) => {
          const colorMap = { user: 'blue', owner: 'gold', admin: 'red' }
          return <Tag color={colorMap[role] || 'default'}>{role?.toUpperCase()}</Tag>
        },
      },
      {
        title: t('admin.tableJoinedAt', { defaultValue: 'THAM GIA' }),
        dataIndex: 'joinedAt',
        key: 'joinedAt',
      },
      {
        title: t('admin.tableReports', { defaultValue: 'BÁO CÁO' }),
        dataIndex: 'reports',
        key: 'reports',
        render: (reports: number) => (
          <span className={reports > 0 ? 'warning-text' : ''}>
            {reports > 0 ? <Tag color="error">{reports} báo cáo</Tag> : <Tag color="default">0</Tag>}
          </span>
        ),
      },
      {
        title: t('admin.tableStatus', { defaultValue: 'TRẠNG THÁI' }),
        dataIndex: 'status',
        key: 'status',
        render: (status: ManagedUserStatus) => (
          <Tag color={status === 'active' ? 'green' : 'red'}>
            {status === 'active'
              ? t('admin.statusActive', { defaultValue: 'Hoạt động' })
              : t('admin.statusSuspended', { defaultValue: 'Tạm khóa' })}
          </Tag>
        ),
      },
      {
        title: t('admin.tableActions', { defaultValue: 'THAO TÁC' }),
        key: 'actions',
        render: (_: unknown, item: ManagedUserItem) => (
          <div className="table-actions" style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setSelectedUser(item)}
            >
              {t('common.details', { defaultValue: 'Xem' })}
            </Button>
            <Button
              size="small"
              danger={item.status !== 'suspended'}
              icon={item.status === 'suspended' ? <UndoOutlined /> : <StopOutlined />}
              onClick={() => toggleUserStatus(item)}
            >
              {item.status === 'suspended'
                ? t('admin.activate', { defaultValue: 'Mở khóa' })
                : t('admin.suspend', { defaultValue: 'Khóa' })}
            </Button>
          </div>
        ),
      },
    ],
    [t, toggleUserStatus],
  )

  return (
    <section className="admin-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">PLATFORM GOVERNANCE</span>
          <h1>{t('admin.managementTitle', { defaultValue: 'Quản lý & Kiểm duyệt' })}</h1>
          <p>
            {t('admin.managementSubtitle', {
              defaultValue: 'Điều hành người dùng, bài đăng và đánh giá trên toàn hệ thống.',
            })}
          </p>
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
            setTab(val as ManagementTab)
            setQuery('')
          }}
          options={[
            { value: 'users', label: t('admin.tabUsers', { defaultValue: 'Người dùng' }) },
            { value: 'posts', label: t('admin.tabPosts', { defaultValue: 'Bài đăng' }) },
            { value: 'reviews', label: t('admin.tabReviews', { defaultValue: 'Đánh giá' }) },
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              tab === 'users'
                ? t('admin.searchUsersPlaceholder', { defaultValue: 'Tìm tên, email, ID...' })
                : t('admin.searchContentPlaceholder', { defaultValue: 'Tìm mã, tác giả, nội dung...' })
            }
            style={{ maxWidth: 220 }}
          />

          {tab === 'users' ? (
            <>
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: 130 }}
                options={[
                  { value: 'all', label: t('admin.roleAll', { defaultValue: 'Tất cả vai trò' }) },
                  { value: 'user', label: 'Cầu thủ (User)' },
                  { value: 'owner', label: 'Chủ sân (Owner)' },
                ]}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: 140 }}
                options={[
                  { value: 'all', label: t('admin.statusAll', { defaultValue: 'Tất cả trạng thái' }) },
                  { value: 'active', label: t('admin.statusActive', { defaultValue: 'Hoạt động' }) },
                  { value: 'suspended', label: t('admin.statusSuspended', { defaultValue: 'Tạm khóa' }) },
                ]}
              />
            </>
          ) : (
            <Select
              value={moderationStatus}
              onChange={setModerationStatus}
              style={{ width: 140 }}
              options={[
                { value: 'all', label: t('admin.statusAll', { defaultValue: 'Tất cả trạng thái' }) },
                { value: 'pending', label: t('admin.statusPending', { defaultValue: 'Chờ xử lý' }) },
                { value: 'resolved', label: t('admin.statusResolved', { defaultValue: 'Đã xử lý' }) },
              ]}
            />
          )}
        </div>
      </div>

      {tab === 'users' ? (
        <Table
          rowKey="id"
          dataSource={filteredUsers}
          columns={userColumns}
          scroll={{ x: 900 }}
          pagination={{ pageSize: 10 }}
        />
      ) : (
        <div className="moderation-list">
          {filteredContent.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
              {t('common.noData', { defaultValue: 'Không có nội dung vi phạm cần kiểm duyệt.' })}
            </div>
          ) : (
            filteredContent.map((item) => (
              <article key={item.id}>
                <header>
                  <Tag color={item.type === 'post' ? 'blue' : 'purple'}>
                    {item.type.toUpperCase()}
                  </Tag>
                  <Tag color={item.status === 'pending' ? 'gold' : 'green'}>
                    {item.status === 'pending'
                      ? t('admin.statusPending', { defaultValue: 'Chờ xử lý' })
                      : t('admin.statusResolved', { defaultValue: 'Đã xử lý' })}
                  </Tag>
                  <time>{item.reportedAt}</time>
                </header>
                <h2>{item.reason}</h2>
                <p>{item.content}</p>
                <footer>
                  <span>
                    {t('admin.postedBy', { defaultValue: 'Đăng bởi' })} <b>{item.author}</b>
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      icon={<EyeOutlined />}
                      onClick={() => setSelectedContent(item)}
                    >
                      {t('admin.viewContext', { defaultValue: 'Xem ngữ cảnh' })}
                    </Button>
                    {item.status === 'pending' && (
                      <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleModerateContent(item)}
                      >
                        {t('admin.removeContent', { defaultValue: 'Gỡ nội dung' })}
                      </Button>
                    )}
                  </div>
                </footer>
              </article>
            ))
          )}
        </div>
      )}

      {/* Modal chi tiết Người dùng */}
      <Modal
        open={Boolean(selectedUser)}
        title={t('admin.userDetailTitle', { defaultValue: 'Chi tiết hồ sơ người dùng' })}
        onCancel={() => setSelectedUser(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedUser(null)}>
            {t('common.close', { defaultValue: 'Đóng' })}
          </Button>,
          selectedUser && (
            <Button
              key="toggle"
              danger={selectedUser.status !== 'suspended'}
              onClick={() => {
                const u = selectedUser
                setSelectedUser(null)
                toggleUserStatus(u)
              }}
            >
              {selectedUser.status === 'suspended'
                ? t('admin.activate', { defaultValue: 'Mở khóa tài khoản' })
                : t('admin.suspend', { defaultValue: 'Tạm khóa tài khoản' })}
            </Button>
          ),
        ]}
      >
        {selectedUser && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 12 }}>
            <Descriptions.Item label={t('admin.userId', { defaultValue: 'Mã tài khoản' })}>
              <b>{selectedUser.id}</b>
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.fullName', { defaultValue: 'Họ và tên' })}>
              {selectedUser.name}
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.email', { defaultValue: 'Email đăng nhập' })}>
              {selectedUser.email}
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.role', { defaultValue: 'Vai trò' })}>
              <Tag>{selectedUser.role.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.joinedAt', { defaultValue: 'Ngày tham gia' })}>
              {selectedUser.joinedAt}
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.reportCount', { defaultValue: 'Lượt bị tố cáo' })}>
              {selectedUser.reports}
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.accountStatus', { defaultValue: 'Trạng thái' })}>
              <Tag color={selectedUser.status === 'active' ? 'green' : 'red'}>
                {selectedUser.status === 'active'
                  ? t('admin.statusActive', { defaultValue: 'Hoạt động bình thường' })
                  : t('admin.statusSuspended', { defaultValue: 'Đang bị tạm khóa' })}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal chi tiết Nội dung vi phạm */}
      <Modal
        open={Boolean(selectedContent)}
        title={t('admin.contentDetailTitle', { defaultValue: 'Ngữ cảnh nội dung bị báo cáo' })}
        onCancel={() => setSelectedContent(null)}
        footer={[
          <Button key="close" onClick={() => setSelectedContent(null)}>
            {t('common.close', { defaultValue: 'Đóng' })}
          </Button>,
          selectedContent && selectedContent.status === 'pending' && (
            <Button
              key="remove"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                const c = selectedContent
                setSelectedContent(null)
                handleModerateContent(c)
              }}
            >
              {t('admin.removeContent', { defaultValue: 'Gỡ nội dung vi phạm' })}
            </Button>
          ),
        ]}
      >
        {selectedContent && (
          <Descriptions column={1} bordered size="small" style={{ marginTop: 12 }}>
            <Descriptions.Item label={t('admin.reportId', { defaultValue: 'Mã báo cáo' })}>
              <b>{selectedContent.id}</b>
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.reportType', { defaultValue: 'Loại nội dung' })}>
              <Tag color={selectedContent.type === 'post' ? 'blue' : 'purple'}>
                {selectedContent.type.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.author', { defaultValue: 'Tác giả' })}>
              {selectedContent.author}
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.reportedAt', { defaultValue: 'Thời gian tố cáo' })}>
              {selectedContent.reportedAt}
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.violationReason', { defaultValue: 'Lý do vi phạm' })}>
              <b style={{ color: '#ff4d4f' }}>{selectedContent.reason}</b>
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.contentDetail', { defaultValue: 'Nội dung chi tiết' })}>
              <div style={{ background: '#141414', padding: 8, borderRadius: 4 }}>
                {selectedContent.content}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.tableStatus', { defaultValue: 'Trạng thái xử lý' })}>
              <Tag color={selectedContent.status === 'pending' ? 'gold' : 'green'}>
                {selectedContent.status === 'pending'
                  ? t('admin.statusPending', { defaultValue: 'Chờ xử lý' })
                  : t('admin.statusResolved', { defaultValue: 'Đã giải quyết' })}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </section>
  )
}
