import { message } from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  AdminSubscriptionPlan,
  CreateSubscriptionPlanPayload,
  SubscriptionKpiMetrics,
  SubscriptionPlanStatusFilter,
  SubscriptionPlanViewMode,
  UpdateSubscriptionPlanPayload,
} from '../interface/admin-subscription.interface'
import { adminSubscriptionService } from '../service/admin-subscription.service'

export function useAdminSubscriptions() {
  const { t } = useTranslation()
  const [plans, setPlans] = useState<AdminSubscriptionPlan[]>([])
  const [allPlansForKpi, setAllPlansForKpi] = useState<AdminSubscriptionPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SubscriptionPlanStatusFilter>('ALL')
  const [viewMode, setViewMode] = useState<SubscriptionPlanViewMode>('grid')

  const [modalVisible, setModalVisible] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [selectedPlan, setSelectedPlan] = useState<AdminSubscriptionPlan | null>(null)

  const [drawerVisible, setDrawerVisible] = useState(false)
  const [inspectedPlan, setInspectedPlan] = useState<AdminSubscriptionPlan | null>(null)

  // Debounce search query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  // Fetch all plans once / after mutations to keep KPI cards accurate
  const fetchKpiPlans = useCallback(async () => {
    try {
      const data = await adminSubscriptionService.getSubscriptionPlans({ status: 'ALL' })
      setAllPlansForKpi(data)
    } catch {
      // Fallback silently if KPI fetch fails
    }
  }, [])

  // Fetch filtered plans based on debounced search and active status filter
  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminSubscriptionService.getSubscriptionPlans({
        search: debouncedSearch.trim() || undefined,
        status: statusFilter,
      })
      setPlans(data)
    } catch {
      message.error(
        t('admin.fetchPlansError', {
          defaultValue: 'Không thể tải danh sách gói dịch vụ',
        }),
      )
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, statusFilter, t])

  useEffect(() => {
    void fetchPlans()
  }, [fetchPlans])

  useEffect(() => {
    void fetchKpiPlans()
  }, [fetchKpiPlans])

  const kpiMetrics = useMemo<SubscriptionKpiMetrics>(() => {
    const baseList = allPlansForKpi.length > 0 ? allPlansForKpi : plans
    const total = baseList.length
    const active = baseList.filter((p) => p.isActive).length
    const inactive = total - active
    const numericPrices = baseList.map((p) => Number(p.price) || 0)
    const minPrice = numericPrices.length > 0 ? Math.min(...numericPrices) : 0
    const maxPrice = numericPrices.length > 0 ? Math.max(...numericPrices) : 0

    return { total, active, inactive, minPrice, maxPrice }
  }, [allPlansForKpi, plans])

  const openCreateModal = () => {
    setSelectedPlan(null)
    setModalMode('create')
    setModalVisible(true)
  }

  const openEditModal = (plan: AdminSubscriptionPlan) => {
    setSelectedPlan(plan)
    setModalMode('edit')
    setModalVisible(true)
  }

  const closeModal = () => {
    setModalVisible(false)
    setSelectedPlan(null)
  }

  const openDetailDrawer = async (plan: AdminSubscriptionPlan) => {
    setInspectedPlan(plan)
    setDrawerVisible(true)
    setDetailLoading(true)
    try {
      const freshPlan = await adminSubscriptionService.getSubscriptionPlanById(plan.id)
      setInspectedPlan(freshPlan)
    } catch {
      // Keep optimistic plan data if detail API fails
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetailDrawer = () => {
    setDrawerVisible(false)
    setInspectedPlan(null)
  }

  const handleCreatePlan = async (payload: CreateSubscriptionPlanPayload) => {
    setActionLoading(true)
    try {
      await adminSubscriptionService.createSubscriptionPlan(payload)
      message.success(
        t('admin.createPlanSuccess', {
          defaultValue: 'Tạo gói dịch vụ mới thành công!',
        }),
      )
      closeModal()
      await Promise.all([fetchPlans(), fetchKpiPlans()])
    } catch {
      message.error(
        t('admin.createPlanError', {
          defaultValue: 'Lỗi khi tạo gói dịch vụ mới',
        }),
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdatePlan = async (
    id: string,
    payload: UpdateSubscriptionPlanPayload,
  ) => {
    setActionLoading(true)
    try {
      await adminSubscriptionService.updateSubscriptionPlan(id, payload)
      message.success(
        t('admin.updatePlanSuccess', {
          defaultValue: 'Cập nhật gói dịch vụ thành công!',
        }),
      )
      closeModal()
      await Promise.all([fetchPlans(), fetchKpiPlans()])
    } catch {
      message.error(
        t('admin.updatePlanError', {
          defaultValue: 'Lỗi khi cập nhật gói dịch vụ',
        }),
      )
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleStatus = async (plan: AdminSubscriptionPlan) => {
    setActionLoading(true)
    try {
      if (plan.isActive) {
        await adminSubscriptionService.deactivateSubscriptionPlan(plan.id)
        message.success(
          t('admin.deactivateSuccess', {
            defaultValue: 'Đã tạm ngưng gói dịch vụ thành công',
          }),
        )
      } else {
        await adminSubscriptionService.updateSubscriptionPlan(plan.id, {
          isActive: true,
        })
        message.success(
          t('admin.reactivateSuccess', {
            defaultValue: 'Đã kích hoạt lại gói dịch vụ thành công',
          }),
        )
      }
      await Promise.all([fetchPlans(), fetchKpiPlans()])
    } catch {
      message.error(
        t('admin.toggleStatusError', {
          defaultValue: 'Lỗi khi thay đổi trạng thái gói dịch vụ',
        }),
      )
    } finally {
      setActionLoading(false)
    }
  }

  return {
    plans,
    allPlansCount: allPlansForKpi.length || plans.length,
    loading,
    detailLoading,
    actionLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    kpiMetrics,
    modalVisible,
    modalMode,
    selectedPlan,
    drawerVisible,
    inspectedPlan,
    fetchPlans,
    openCreateModal,
    openEditModal,
    closeModal,
    openDetailDrawer,
    closeDetailDrawer,
    handleCreatePlan,
    handleUpdatePlan,
    handleToggleStatus,
  }
}
