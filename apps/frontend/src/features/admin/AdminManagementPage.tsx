import {
  CheckCircleOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarFilled,
  StopOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import { Descriptions, Modal } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminManagement } from '../../hooks/useAdminManagement'
import {
  MANAGEMENT_TABS,
  POST_STATUS_FILTERS,
  REVIEW_STATUS_FILTERS,
  REVIEW_TYPE_FILTERS,
  USER_ROLE_FILTERS,
  USER_STATUS_FILTERS,
} from './constants/admin-management.constant'
import type {
  AdminPostItem,
  AdminPostStatusFilter,
  AdminReviewStatusFilter,
  AdminReviewTypeFilter,
  AdminUserItem,
  AdminUserRoleFilter,
  AdminUserStatusFilter,
} from './interface/admin-management.interface'
import {
  formatAdminDate,
  formatAdminDateTime,
  formatPlaySlot,
  getPostStatusBadgeTone,
  getReviewStatusBadgeTone,
  getUserRoleBadgeTone,
  getUserStatusBadgeTone,
} from './utils/admin-management.util'
import './AdminManagementPage.css'

export function AdminManagementPage() {
  const { t, i18n } = useTranslation()
  const locale = i18n.language?.startsWith('en') ? 'en-US' : 'vi-VN'
  const [moderationNote, setModerationNote] = useState('')

  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    userStatusFilter,
    setUserStatusFilter,
    postStatusFilter,
    setPostStatusFilter,
    reviewStatusFilter,
    setReviewStatusFilter,
    reviewTypeFilter,
    setReviewTypeFilter,
    page,
    setPage,
    resetFilters,
    usersData,
    postsData,
    reviewsData,
    selectedUser,
    selectedUserDetail,
    selectedPost,
    selectedReview,
    isLoading,
    isDetailLoading,
    isSubmitting,
    error,
    feedbackMessage,
    clearFeedback,
    inspectUser,
    closeUserModal,
    openPostModal,
    closePostModal,
    openReviewModal,
    closeReviewModal,
    handleToggleUserStatus,
    handleDeletePost,
    handleModerateReview,
    refetchCurrentTab,
  } = useAdminManagement()

  const confirmToggleUser = (user: AdminUserItem) => {
    const isSuspended = user.status === 'suspended'
    Modal.confirm({
      title: isSuspended
        ? `${t('admin.actionUnlock')}: ${user.fullName}?`
        : `${t('admin.actionLock')}: ${user.fullName}?`,
      content: isSuspended
        ? t('admin.confirmActivateUserContent', {
            defaultValue:
              'Tài khoản sẽ được mở quyền đăng nhập và sử dụng hệ thống bình thường.',
          })
        : t('admin.confirmSuspendUserContent', {
            defaultValue:
              'Tài khoản sẽ bị khóa và thu hồi toàn bộ phiên đăng nhập đang hoạt động.',
          }),
      okText: isSuspended ? t('admin.actionUnlock') : t('admin.actionLock'),
      okButtonProps: { danger: !isSuspended },
      cancelText: t('admin.actionClose'),
      onOk: async () => {
        await handleToggleUserStatus(user)
      },
    })
  }

  const confirmRemovePost = (post: AdminPostItem) => {
    Modal.confirm({
      title: `${t('admin.actionRemovePost')}: "${post.title}"?`,
      content: t('admin.confirmRemoveContentBody', {
        defaultValue:
          'Bài đăng sẽ được đóng và gỡ khỏi danh sách tìm đối cộng đồng.',
      }),
      okText: t('admin.actionRemovePost'),
      okButtonProps: { danger: true },
      cancelText: t('admin.actionClose'),
      onOk: async () => {
        await handleDeletePost(post)
      },
    })
  }

  const renderRoleLabel = (role: string) => {
    if (role === 'admin') return t('admin.roleAdmin')
    if (role === 'owner') return t('admin.roleOwner')
    return t('admin.roleUser')
  }

  const renderUserStatusLabel = (status: string) => {
    if (status === 'suspended') return t('admin.statusSuspended')
    if (status === 'active') return t('admin.statusActive')
    if (status === 'pending_verification')
      return t('admin.statusPendingVerification')
    return t('admin.statusInactive')
  }

  const renderPostStatusLabel = (status: string) => {
    if (status === 'open') return t('admin.postStatusOpen')
    if (status === 'matched') return t('admin.postStatusMatched')
    return t('admin.postStatusClosed')
  }

  const renderReviewStatusLabel = (status: string) => {
    return status === 'resolved'
      ? t('admin.reviewStatusResolved')
      : t('admin.reviewStatusPending')
  }

  const currentMeta =
    activeTab === 'users'
      ? usersData?.meta
      : activeTab === 'posts'
        ? postsData?.meta
        : reviewsData?.meta

  return (
    <section className="admin-mgmt-page">
      <header className="admin-mgmt-header">
        <div>
          <span className="admin-mgmt-eyebrow">{t('admin.mgmtEyebrow')}</span>
          <h1 className="admin-mgmt-title">{t('admin.mgmtTitle')}</h1>
          <p className="admin-mgmt-subtitle">{t('admin.mgmtSubtitle')}</p>
        </div>
        <button
          type="button"
          className="admin-mgmt-btn"
          onClick={refetchCurrentTab}
          disabled={isLoading}
        >
          <ReloadOutlined spin={isLoading} />
          {t('admin.refreshData')}
        </button>
      </header>

      {/* Summary KPI Strip */}
      {activeTab === 'users' && (
        <div className="admin-mgmt-kpi-grid">
          <div className="admin-mgmt-kpi-card">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiTotalUsers')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {usersData?.summary.totalUsers ?? 0}
            </strong>
          </div>
          <div className="admin-mgmt-kpi-card admin-mgmt-kpi-card--accent">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiActiveUsers')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {usersData?.summary.activeUsers ?? 0}
            </strong>
          </div>
          <div className="admin-mgmt-kpi-card admin-mgmt-kpi-card--danger">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiSuspendedUsers')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {usersData?.summary.suspendedUsers ?? 0}
            </strong>
          </div>
          <div className="admin-mgmt-kpi-card admin-mgmt-kpi-card--warning">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiFlaggedUsers')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {usersData?.summary.flaggedUsers ?? 0}
            </strong>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div className="admin-mgmt-kpi-grid">
          <div className="admin-mgmt-kpi-card">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiTotalPosts')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {postsData?.summary.totalPosts ?? 0}
            </strong>
          </div>
          <div className="admin-mgmt-kpi-card admin-mgmt-kpi-card--accent">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiOpenPosts')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {postsData?.summary.openPosts ?? 0}
            </strong>
          </div>
          <div className="admin-mgmt-kpi-card admin-mgmt-kpi-card--warning">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiMatchedPosts')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {postsData?.summary.matchedPosts ?? 0}
            </strong>
          </div>
          <div className="admin-mgmt-kpi-card">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiClosedPosts')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {postsData?.summary.closedPosts ?? 0}
            </strong>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="admin-mgmt-kpi-grid">
          <div className="admin-mgmt-kpi-card">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiTotalFlagged')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {reviewsData?.summary.totalFlagged ?? 0}
            </strong>
          </div>
          <div className="admin-mgmt-kpi-card admin-mgmt-kpi-card--warning">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiPendingReviews')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {reviewsData?.summary.pendingCount ?? 0}
            </strong>
          </div>
          <div className="admin-mgmt-kpi-card admin-mgmt-kpi-card--accent">
            <span className="admin-mgmt-kpi-label">
              {t('admin.kpiResolvedReviews')}
            </span>
            <strong className="admin-mgmt-kpi-value">
              {reviewsData?.summary.resolvedCount ?? 0}
            </strong>
          </div>
        </div>
      )}

      {/* Feedback / Error Banners */}
      {error && (
        <div className="admin-mgmt-banner admin-mgmt-banner--error" role="alert">
          <span>{error}</span>
          <button
            type="button"
            className="admin-mgmt-btn admin-mgmt-btn--danger"
            onClick={refetchCurrentTab}
          >
            {t('admin.retryButton')}
          </button>
        </div>
      )}

      {feedbackMessage && (
        <div
          className="admin-mgmt-banner admin-mgmt-banner--success"
          role="status"
        >
          <span>{feedbackMessage}</span>
          <button
            type="button"
            className="admin-mgmt-btn"
            onClick={clearFeedback}
          >
            {t('admin.actionClose')}
          </button>
        </div>
      )}

      {/* Toolbar: Tabs + Search + Filters */}
      <div className="admin-mgmt-toolbar">
        <div className="admin-mgmt-tabs" role="tablist">
          {MANAGEMENT_TABS.map((tabKey) => {
            const label =
              tabKey === 'users'
                ? t('admin.tabUsers')
                : tabKey === 'posts'
                  ? t('admin.tabPosts')
                  : t('admin.tabReviews')
            return (
              <button
                key={tabKey}
                type="button"
                role="tab"
                aria-selected={activeTab === tabKey}
                className={`admin-mgmt-tab-btn ${
                  activeTab === tabKey ? 'admin-mgmt-tab-btn--active' : ''
                }`}
                onClick={() => setActiveTab(tabKey)}
              >
                {label}
              </button>
            )
          })}
        </div>

        <div className="admin-mgmt-filters">
          <div className="admin-mgmt-search-wrap">
            <SearchOutlined className="admin-mgmt-search-icon" />
            <input
              type="search"
              className="admin-mgmt-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'users'
                  ? t('admin.searchUsersPlaceholder')
                  : activeTab === 'posts'
                    ? t('admin.searchPostsPlaceholder')
                    : t('admin.searchReviewsPlaceholder')
              }
            />
          </div>

          {activeTab === 'users' && (
            <>
              <select
                className="admin-mgmt-select"
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as AdminUserRoleFilter)
                }
                aria-label={t('admin.colRole')}
              >
                {USER_ROLE_FILTERS.map((role) => (
                  <option key={role} value={role}>
                    {role === 'all'
                      ? t('admin.filterAllRoles')
                      : renderRoleLabel(role)}
                  </option>
                ))}
              </select>

              <select
                className="admin-mgmt-select"
                value={userStatusFilter}
                onChange={(e) =>
                  setUserStatusFilter(e.target.value as AdminUserStatusFilter)
                }
                aria-label={t('admin.colStatus')}
              >
                {USER_STATUS_FILTERS.map((st) => (
                  <option key={st} value={st}>
                    {st === 'all'
                      ? t('admin.filterAllStatuses')
                      : renderUserStatusLabel(st)}
                  </option>
                ))}
              </select>
            </>
          )}

          {activeTab === 'posts' && (
            <select
              className="admin-mgmt-select"
              value={postStatusFilter}
              onChange={(e) =>
                setPostStatusFilter(e.target.value as AdminPostStatusFilter)
              }
              aria-label={t('admin.colStatus')}
            >
              {POST_STATUS_FILTERS.map((st) => (
                <option key={st} value={st}>
                  {st === 'all'
                    ? t('admin.filterAllStatuses')
                    : renderPostStatusLabel(st)}
                </option>
              ))}
            </select>
          )}

          {activeTab === 'reviews' && (
            <>
              <select
                className="admin-mgmt-select"
                value={reviewTypeFilter}
                onChange={(e) =>
                  setReviewTypeFilter(e.target.value as AdminReviewTypeFilter)
                }
                aria-label={t('admin.filterAllReviewTypes')}
              >
                {REVIEW_TYPE_FILTERS.map((rt) => (
                  <option key={rt} value={rt}>
                    {rt === 'all'
                      ? t('admin.filterAllReviewTypes')
                      : rt === 'field'
                        ? t('admin.reviewTypeField')
                        : t('admin.reviewTypeUser')}
                  </option>
                ))}
              </select>

              <select
                className="admin-mgmt-select"
                value={reviewStatusFilter}
                onChange={(e) =>
                  setReviewStatusFilter(
                    e.target.value as AdminReviewStatusFilter,
                  )
                }
                aria-label={t('admin.colStatus')}
              >
                {REVIEW_STATUS_FILTERS.map((st) => (
                  <option key={st} value={st}>
                    {st === 'all'
                      ? t('admin.filterAllStatuses')
                      : renderReviewStatusLabel(st)}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Main Data Surface */}
      <div className="admin-mgmt-surface">
        {isLoading ? (
          <div className="admin-mgmt-skeleton-list" aria-busy="true">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="admin-mgmt-skeleton-row" />
            ))}
          </div>
        ) : activeTab === 'users' ? (
          (usersData?.items.length ?? 0) === 0 ? (
            <div className="admin-mgmt-empty">
              <p>{t('admin.emptyUsers')}</p>
              <button
                type="button"
                className="admin-mgmt-btn"
                onClick={resetFilters}
              >
                {t('admin.actionResetFilters')}
              </button>
            </div>
          ) : (
            <div className="admin-mgmt-table-wrap">
              <table className="admin-mgmt-table">
                <thead>
                  <tr>
                    <th>{t('admin.colUser')}</th>
                    <th>{t('admin.colRole')}</th>
                    <th>{t('admin.colReports')}</th>
                    <th>{t('admin.colCreatedAt')}</th>
                    <th>{t('admin.colStatus')}</th>
                    <th>{t('admin.colActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData?.items.map((user) => {
                    const roleTone = getUserRoleBadgeTone(user.role)
                    const statusTone = getUserStatusBadgeTone(user.status)
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="admin-mgmt-user-cell">
                            <div className="admin-mgmt-avatar">
                              {user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="admin-mgmt-primary-text">
                                {user.fullName}
                              </div>
                              <div className="admin-mgmt-sub-text">
                                {user.email}
                                {user.phone ? ` • ${user.phone}` : ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`admin-mgmt-badge admin-mgmt-badge--${roleTone}`}
                          >
                            {renderRoleLabel(user.role)}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`admin-mgmt-badge ${
                              user.reportsCount > 0
                                ? 'admin-mgmt-badge--locked'
                                : 'admin-mgmt-badge--resolved'
                            }`}
                          >
                            {user.reportsCount}
                          </span>
                        </td>
                        <td>{formatAdminDate(user.createdAt, locale)}</td>
                        <td>
                          <span
                            className={`admin-mgmt-badge admin-mgmt-badge--${statusTone}`}
                          >
                            {renderUserStatusLabel(user.status)}
                          </span>
                        </td>
                        <td>
                          <div className="admin-mgmt-actions">
                            <button
                              type="button"
                              className="admin-mgmt-btn"
                              onClick={() => void inspectUser(user)}
                            >
                              <EyeOutlined />
                              {t('admin.actionInspect')}
                            </button>
                            {user.role !== 'admin' && (
                              <button
                                type="button"
                                className={`admin-mgmt-btn ${
                                  user.status === 'suspended'
                                    ? 'admin-mgmt-btn--primary'
                                    : 'admin-mgmt-btn--danger'
                                }`}
                                disabled={isSubmitting}
                                onClick={() => confirmToggleUser(user)}
                              >
                                {user.status === 'suspended' ? (
                                  <>
                                    <UndoOutlined />
                                    {t('admin.actionUnlock')}
                                  </>
                                ) : (
                                  <>
                                    <StopOutlined />
                                    {t('admin.actionLock')}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeTab === 'posts' ? (
          (postsData?.items.length ?? 0) === 0 ? (
            <div className="admin-mgmt-empty">
              <p>{t('admin.emptyPosts')}</p>
              <button
                type="button"
                className="admin-mgmt-btn"
                onClick={resetFilters}
              >
                {t('admin.actionResetFilters')}
              </button>
            </div>
          ) : (
            <div className="admin-mgmt-table-wrap">
              <table className="admin-mgmt-table">
                <thead>
                  <tr>
                    <th>{t('admin.colPostTitle')}</th>
                    <th>{t('admin.colAuthor')}</th>
                    <th>{t('admin.colMatchSchedule')}</th>
                    <th>{t('admin.colCreatedAt')}</th>
                    <th>{t('admin.colStatus')}</th>
                    <th>{t('admin.colActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {postsData?.items.map((post) => {
                    const postTone = getPostStatusBadgeTone(post.status)
                    return (
                      <tr key={post.id}>
                        <td>
                          <div className="admin-mgmt-primary-text">
                            {post.title}
                          </div>
                          <div className="admin-mgmt-sub-text">
                            {post.content.length > 80
                              ? `${post.content.slice(0, 80)}...`
                              : post.content}
                          </div>
                        </td>
                        <td>
                          <div className="admin-mgmt-primary-text">
                            {post.authorName}
                          </div>
                          <div className="admin-mgmt-sub-text">
                            {post.authorEmail}
                          </div>
                        </td>
                        <td>
                          <div className="admin-mgmt-primary-text">
                            {formatPlaySlot(
                              post.playDate,
                              post.startTime,
                              post.endTime,
                            )}
                          </div>
                          <div className="admin-mgmt-sub-text">
                            {post.fieldName ?? '—'} • {post.currentPlayers}/
                            {post.maxPlayers ?? '—'}
                          </div>
                        </td>
                        <td>{formatAdminDateTime(post.createdAt, locale)}</td>
                        <td>
                          <span
                            className={`admin-mgmt-badge admin-mgmt-badge--${postTone}`}
                          >
                            {renderPostStatusLabel(post.status)}
                          </span>
                        </td>
                        <td>
                          <div className="admin-mgmt-actions">
                            <button
                              type="button"
                              className="admin-mgmt-btn"
                              onClick={() => openPostModal(post)}
                            >
                              <EyeOutlined />
                              {t('admin.actionInspect')}
                            </button>
                            {post.status !== 'closed' && (
                              <button
                                type="button"
                                className="admin-mgmt-btn admin-mgmt-btn--danger"
                                disabled={isSubmitting}
                                onClick={() => confirmRemovePost(post)}
                              >
                                <DeleteOutlined />
                                {t('admin.actionRemovePost')}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (reviewsData?.items.length ?? 0) === 0 ? (
          <div className="admin-mgmt-empty">
            <p>{t('admin.emptyReviews')}</p>
            <button
              type="button"
              className="admin-mgmt-btn"
              onClick={resetFilters}
            >
              {t('admin.actionResetFilters')}
            </button>
          </div>
        ) : (
          <div className="admin-mgmt-table-wrap">
            <table className="admin-mgmt-table">
              <thead>
                <tr>
                  <th>{t('admin.colReviewContent')}</th>
                  <th>{t('admin.colAuthor')}</th>
                  <th>{t('admin.colTarget')}</th>
                  <th>{t('admin.colCreatedAt')}</th>
                  <th>{t('admin.colStatus')}</th>
                  <th>{t('admin.colActions')}</th>
                </tr>
              </thead>
              <tbody>
                {reviewsData?.items.map((review) => {
                  const tone = getReviewStatusBadgeTone(
                    review.moderationStatus,
                  )
                  return (
                    <tr key={`${review.reviewType}-${review.id}`}>
                      <td>
                        <div className="admin-mgmt-primary-text">
                          <StarFilled
                            style={{ color: '#fbbf24', marginRight: 5 }}
                          />
                          {review.rating}/5 •{' '}
                          {review.reviewType === 'field'
                            ? t('admin.reviewTypeField')
                            : t('admin.reviewTypeUser')}
                        </div>
                        <div className="admin-mgmt-sub-text">
                          {review.comment || '—'}
                        </div>
                      </td>
                      <td>
                        <div className="admin-mgmt-primary-text">
                          {review.authorName}
                        </div>
                        <div className="admin-mgmt-sub-text">
                          {review.authorEmail}
                        </div>
                      </td>
                      <td>
                        <div className="admin-mgmt-primary-text">
                          {review.targetName}
                        </div>
                        <div
                          className="admin-mgmt-sub-text"
                          style={{ color: '#f87171' }}
                        >
                          {review.flagReason ?? '—'}
                        </div>
                      </td>
                      <td>{formatAdminDateTime(review.createdAt, locale)}</td>
                      <td>
                        <span
                          className={`admin-mgmt-badge admin-mgmt-badge--${tone}`}
                        >
                          {renderReviewStatusLabel(review.moderationStatus)}
                        </span>
                      </td>
                      <td>
                        <div className="admin-mgmt-actions">
                          <button
                            type="button"
                            className="admin-mgmt-btn admin-mgmt-btn--primary"
                            onClick={() => {
                              setModerationNote('')
                              openReviewModal(review)
                            }}
                          >
                            <EyeOutlined />
                            {t('admin.actionModerate')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {currentMeta && currentMeta.total > 0 && (
          <div className="admin-mgmt-pagination">
            <span>
              {t('admin.paginationShowing', {
                page: currentMeta.page,
                totalPages: currentMeta.totalPages,
                total: currentMeta.total,
              })}
            </span>
            <div className="admin-mgmt-actions">
              <button
                type="button"
                className="admin-mgmt-btn"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                {t('admin.paginationPrev')}
              </button>
              <button
                type="button"
                className="admin-mgmt-btn"
                disabled={page >= currentMeta.totalPages || isLoading}
                onClick={() =>
                  setPage((p) => Math.min(currentMeta.totalPages, p + 1))
                }
              >
                {t('admin.paginationNext')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <Modal
        open={Boolean(selectedUser)}
        title={t('admin.userDetailEyebrow')}
        onCancel={closeUserModal}
        footer={[
          <button
            key="close"
            type="button"
            className="admin-mgmt-btn"
            onClick={closeUserModal}
          >
            {t('admin.actionClose')}
          </button>,
          selectedUser && selectedUser.role !== 'admin' ? (
            <button
              key="toggle"
              type="button"
              style={{ marginLeft: 8 }}
              disabled={isSubmitting}
              className={`admin-mgmt-btn ${
                selectedUser.status === 'suspended'
                  ? 'admin-mgmt-btn--primary'
                  : 'admin-mgmt-btn--danger'
              }`}
              onClick={() => {
                const target = selectedUser
                closeUserModal()
                confirmToggleUser(target)
              }}
            >
              {selectedUser.status === 'suspended'
                ? t('admin.actionUnlock')
                : t('admin.actionLock')}
            </button>
          ) : null,
        ]}
      >
        {selectedUser && (
          <div>
            {selectedUserDetail && (
              <div className="admin-mgmt-modal-stats">
                <div className="admin-mgmt-modal-stat-box">
                  <div className="admin-mgmt-modal-stat-val">
                    {selectedUserDetail.stats.bookingsCount}
                  </div>
                  <div className="admin-mgmt-modal-stat-lbl">
                    {t('admin.userStatsBookings')}
                  </div>
                </div>
                <div className="admin-mgmt-modal-stat-box">
                  <div className="admin-mgmt-modal-stat-val">
                    {selectedUserDetail.stats.fieldsCount}
                  </div>
                  <div className="admin-mgmt-modal-stat-lbl">
                    {t('admin.userStatsFields')}
                  </div>
                </div>
                <div className="admin-mgmt-modal-stat-box">
                  <div className="admin-mgmt-modal-stat-val">
                    {selectedUserDetail.stats.postsCount}
                  </div>
                  <div className="admin-mgmt-modal-stat-lbl">
                    {t('admin.userStatsPosts')}
                  </div>
                </div>
                <div className="admin-mgmt-modal-stat-box">
                  <div className="admin-mgmt-modal-stat-val">
                    {selectedUserDetail.reliabilityScore}
                  </div>
                  <div className="admin-mgmt-modal-stat-lbl">
                    {t('admin.userReliability')}
                  </div>
                </div>
              </div>
            )}
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID">
                <code>{selectedUser.id}</code>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.colUser')}>
                <strong>{selectedUser.fullName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.email')}>
                {selectedUser.email}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.phone')}>
                {selectedUserDetail?.phone ?? selectedUser.phone ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.colRole')}>
                {renderRoleLabel(selectedUser.role)}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.colReports')}>
                {selectedUser.reportsCount}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.colCreatedAt')}>
                {formatAdminDateTime(selectedUser.createdAt, locale)}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.colStatus')}>
                {renderUserStatusLabel(selectedUser.status)}
              </Descriptions.Item>
              {isDetailLoading && (
                <Descriptions.Item label="...">{'Loading...'}</Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* Post Detail Modal */}
      <Modal
        open={Boolean(selectedPost)}
        title={t('admin.postDetailEyebrow')}
        onCancel={closePostModal}
        footer={[
          <button
            key="close"
            type="button"
            className="admin-mgmt-btn"
            onClick={closePostModal}
          >
            {t('admin.actionClose')}
          </button>,
          selectedPost && selectedPost.status !== 'closed' ? (
            <button
              key="remove"
              type="button"
              style={{ marginLeft: 8 }}
              disabled={isSubmitting}
              className="admin-mgmt-btn admin-mgmt-btn--danger"
              onClick={() => {
                const target = selectedPost
                closePostModal()
                confirmRemovePost(target)
              }}
            >
              <DeleteOutlined />
              {t('admin.actionRemovePost')}
            </button>
          ) : null,
        ]}
      >
        {selectedPost && (
          <Descriptions
            column={1}
            bordered
            size="small"
            style={{ marginTop: 12 }}
          >
            <Descriptions.Item label="ID">
              <code>{selectedPost.id}</code>
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.colPostTitle')}>
              <strong>{selectedPost.title}</strong>
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.colAuthor')}>
              {selectedPost.authorName} ({selectedPost.authorEmail})
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.colMatchSchedule')}>
              {formatPlaySlot(
                selectedPost.playDate,
                selectedPost.startTime,
                selectedPost.endTime,
              )}{' '}
              • {selectedPost.fieldName ?? '—'}
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.colStatus')}>
              {renderPostStatusLabel(selectedPost.status)}
            </Descriptions.Item>
            <Descriptions.Item label={t('admin.pitchDescription')}>
              {selectedPost.content}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Review Moderation Modal */}
      <Modal
        open={Boolean(selectedReview)}
        title={t('admin.reviewDetailEyebrow')}
        onCancel={closeReviewModal}
        footer={[
          <button
            key="close"
            type="button"
            className="admin-mgmt-btn"
            onClick={closeReviewModal}
          >
            {t('admin.actionClose')}
          </button>,
          selectedReview ? (
            <button
              key="dismiss"
              type="button"
              style={{ marginLeft: 8 }}
              disabled={isSubmitting}
              className="admin-mgmt-btn admin-mgmt-btn--primary"
              onClick={() =>
                void handleModerateReview(
                  selectedReview,
                  'dismiss',
                  moderationNote,
                )
              }
            >
              <CheckCircleOutlined />
              {t('admin.actionDismissReport')}
            </button>
          ) : null,
          selectedReview &&
          selectedReview.moderationStatus === 'pending' ? (
            <button
              key="hide"
              type="button"
              style={{ marginLeft: 8 }}
              disabled={isSubmitting}
              className="admin-mgmt-btn admin-mgmt-btn--danger"
              onClick={() =>
                void handleModerateReview(
                  selectedReview,
                  'hide',
                  moderationNote,
                )
              }
            >
              <DeleteOutlined />
              {t('admin.actionHideReview')}
            </button>
          ) : null,
        ]}
      >
        {selectedReview && (
          <div style={{ marginTop: 12 }}>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="ID">
                <code>{selectedReview.id}</code>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.requestType')}>
                {selectedReview.reviewType === 'field'
                  ? t('admin.reviewTypeField')
                  : t('admin.reviewTypeUser')}{' '}
                ({selectedReview.rating}/5 ★)
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.colAuthor')}>
                {selectedReview.authorName} ({selectedReview.authorEmail})
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.colTarget')}>
                <strong>{selectedReview.targetName}</strong>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.rejectReason')}>
                <span style={{ color: '#f87171', fontWeight: 600 }}>
                  {selectedReview.flagReason ?? '—'}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.colReviewContent')}>
                {selectedReview.comment || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('admin.colStatus')}>
                {renderReviewStatusLabel(selectedReview.moderationStatus)}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 14 }}>
              <label
                htmlFor="admin-moderation-note"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {t('admin.moderationNoteLabel')}
              </label>
              <textarea
                id="admin-moderation-note"
                className="admin-mgmt-note-area"
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                placeholder={t('admin.moderationNotePlaceholder')}
              />
            </div>
          </div>
        )}
      </Modal>
    </section>
  )
}
