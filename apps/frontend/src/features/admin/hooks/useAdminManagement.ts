import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ADMIN_SEARCH_DEBOUNCE_MS,
  DEFAULT_ADMIN_MANAGEMENT_LIMIT,
} from '../constants/admin-management.constant'
import type {
  AdminPostItem,
  AdminPostsListResponse,
  AdminPostStatusFilter,
  AdminReviewItem,
  AdminReviewsListResponse,
  AdminReviewStatusFilter,
  AdminReviewTypeFilter,
  AdminUserDetail,
  AdminUserItem,
  AdminUserRoleFilter,
  AdminUsersListResponse,
  AdminUserStatusFilter,
  ManagementTab,
} from '../interface/admin-management.interface'
import {
  deleteAdminPost,
  getAdminPosts,
  getAdminReviews,
  getAdminUserDetail,
  getAdminUsers,
  moderateAdminReview,
  updateAdminUserStatus,
} from '../service/admin.service'
import {
  extractAdminErrorMessage,
  parseManagementTabParam,
} from '../utils/admin-management.util'

export function useAdminManagement() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = parseManagementTabParam(searchParams.get('tab'))

  const [activeTab, setActiveTabState] = useState<ManagementTab>(initialTab)
  const [searchQuery, setSearchQueryState] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const [roleFilter, setRoleFilterState] = useState<AdminUserRoleFilter>('all')
  const [userStatusFilter, setUserStatusFilterState] =
    useState<AdminUserStatusFilter>('all')
  const [postStatusFilter, setPostStatusFilterState] =
    useState<AdminPostStatusFilter>('all')
  const [reviewStatusFilter, setReviewStatusFilterState] =
    useState<AdminReviewStatusFilter>('all')
  const [reviewTypeFilter, setReviewTypeFilterState] =
    useState<AdminReviewTypeFilter>('all')

  const [page, setPage] = useState(1)
  const [refreshTick, setRefreshTick] = useState(0)

  const [usersData, setUsersData] = useState<AdminUsersListResponse | null>(
    null,
  )
  const [postsData, setPostsData] = useState<AdminPostsListResponse | null>(
    null,
  )
  const [reviewsData, setReviewsData] =
    useState<AdminReviewsListResponse | null>(null)

  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null)
  const [selectedUserDetail, setSelectedUserDetail] =
    useState<AdminUserDetail | null>(null)
  const [selectedPost, setSelectedPost] = useState<AdminPostItem | null>(null)
  const [selectedReview, setSelectedReview] =
    useState<AdminReviewItem | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  useEffect(() => {
    const paramTab = parseManagementTabParam(searchParams.get('tab'))
    if (paramTab !== activeTab) {
      setActiveTabState(paramTab)
      setPage(1)
    }
  }, [searchParams, activeTab])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchQuery.trim())
      setPage(1)
    }, ADMIN_SEARCH_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const setActiveTab = useCallback(
    (tab: ManagementTab) => {
      setActiveTabState(tab)
      setPage(1)
      setError(null)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set('tab', tab)
      setSearchParams(nextParams, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const setSearchQuery = useCallback((value: string) => {
    setSearchQueryState(value)
  }, [])

  const setRoleFilter = useCallback((value: AdminUserRoleFilter) => {
    setRoleFilterState(value)
    setPage(1)
  }, [])

  const setUserStatusFilter = useCallback((value: AdminUserStatusFilter) => {
    setUserStatusFilterState(value)
    setPage(1)
  }, [])

  const setPostStatusFilter = useCallback((value: AdminPostStatusFilter) => {
    setPostStatusFilterState(value)
    setPage(1)
  }, [])

  const setReviewStatusFilter = useCallback(
    (value: AdminReviewStatusFilter) => {
      setReviewStatusFilterState(value)
      setPage(1)
    },
    [],
  )

  const setReviewTypeFilter = useCallback((value: AdminReviewTypeFilter) => {
    setReviewTypeFilterState(value)
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setSearchQueryState('')
    setDebouncedSearch('')
    setRoleFilterState('all')
    setUserStatusFilterState('all')
    setPostStatusFilterState('all')
    setReviewStatusFilterState('all')
    setReviewTypeFilterState('all')
    setPage(1)
  }, [])

  const refetchCurrentTab = useCallback(() => {
    setRefreshTick((prev) => prev + 1)
  }, [])

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    const fetchTab = async () => {
      try {
        if (activeTab === 'users') {
          const res = await getAdminUsers({
            search: debouncedSearch || undefined,
            role: roleFilter,
            status: userStatusFilter,
            page,
            limit: DEFAULT_ADMIN_MANAGEMENT_LIMIT,
          })
          if (!cancelled) setUsersData(res)
        } else if (activeTab === 'posts') {
          const res = await getAdminPosts({
            search: debouncedSearch || undefined,
            status: postStatusFilter,
            page,
            limit: DEFAULT_ADMIN_MANAGEMENT_LIMIT,
          })
          if (!cancelled) setPostsData(res)
        } else {
          const res = await getAdminReviews({
            search: debouncedSearch || undefined,
            status: reviewStatusFilter,
            reviewType: reviewTypeFilter,
            page,
            limit: DEFAULT_ADMIN_MANAGEMENT_LIMIT,
          })
          if (!cancelled) setReviewsData(res)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            extractAdminErrorMessage(
              err,
              'Không thể tải dữ liệu quản trị. Vui lòng thử lại.',
            ),
          )
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void fetchTab()
    return () => {
      cancelled = true
    }
  }, [
    activeTab,
    debouncedSearch,
    roleFilter,
    userStatusFilter,
    postStatusFilter,
    reviewStatusFilter,
    reviewTypeFilter,
    page,
    refreshTick,
  ])

  const inspectUser = useCallback(async (user: AdminUserItem) => {
    setSelectedUser(user)
    setSelectedUserDetail(null)
    setIsDetailLoading(true)
    try {
      const detail = await getAdminUserDetail(user.id)
      setSelectedUserDetail(detail)
    } catch {
      // Fallback to list row data if detail request fails
    } finally {
      setIsDetailLoading(false)
    }
  }, [])

  const closeUserModal = useCallback(() => {
    setSelectedUser(null)
    setSelectedUserDetail(null)
  }, [])

  const openPostModal = useCallback((post: AdminPostItem) => {
    setSelectedPost(post)
  }, [])

  const closePostModal = useCallback(() => {
    setSelectedPost(null)
  }, [])

  const openReviewModal = useCallback((review: AdminReviewItem) => {
    setSelectedReview(review)
  }, [])

  const closeReviewModal = useCallback(() => {
    setSelectedReview(null)
  }, [])

  const handleToggleUserStatus = useCallback(
    async (user: AdminUserItem, reason?: string): Promise<boolean> => {
      const nextStatus = user.status === 'suspended' ? 'active' : 'suspended'
      setIsSubmitting(true)
      setError(null)
      try {
        const updated = await updateAdminUserStatus(user.id, {
          status: nextStatus,
          reason,
        })
        setFeedbackMessage(
          nextStatus === 'suspended'
            ? `Đã khóa tài khoản ${updated.fullName}.`
            : `Đã mở khóa tài khoản ${updated.fullName}.`,
        )
        if (selectedUser?.id === user.id) {
          setSelectedUser(updated)
          setSelectedUserDetail((prev) =>
            prev ? { ...prev, status: updated.status } : null,
          )
        }
        refetchCurrentTab()
        return true
      } catch (err: unknown) {
        setError(
          extractAdminErrorMessage(
            err,
            'Không thể cập nhật trạng thái tài khoản.',
          ),
        )
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [refetchCurrentTab, selectedUser],
  )

  const handleDeletePost = useCallback(
    async (post: AdminPostItem): Promise<boolean> => {
      setIsSubmitting(true)
      setError(null)
      try {
        await deleteAdminPost(post.id)
        setFeedbackMessage(`Đã gỡ bài đăng "${post.title}".`)
        setSelectedPost(null)
        refetchCurrentTab()
        return true
      } catch (err: unknown) {
        setError(
          extractAdminErrorMessage(err, 'Không thể gỡ bài đăng vi phạm.'),
        )
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [refetchCurrentTab],
  )

  const handleModerateReview = useCallback(
    async (
      review: AdminReviewItem,
      action: 'hide' | 'dismiss',
      reason?: string,
    ): Promise<boolean> => {
      setIsSubmitting(true)
      setError(null)
      try {
        await moderateAdminReview(review.reviewType, review.id, {
          action,
          reason: reason?.trim() || undefined,
        })
        setFeedbackMessage(
          action === 'hide'
            ? 'Đã ẩn đánh giá vi phạm.'
            : 'Đã bỏ qua báo cáo đánh giá.',
        )
        setSelectedReview(null)
        refetchCurrentTab()
        return true
      } catch (err: unknown) {
        setError(
          extractAdminErrorMessage(err, 'Không thể xử lý kiểm duyệt đánh giá.'),
        )
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [refetchCurrentTab],
  )

  const clearFeedback = useCallback(() => {
    setFeedbackMessage(null)
  }, [])

  return {
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
  }
}
