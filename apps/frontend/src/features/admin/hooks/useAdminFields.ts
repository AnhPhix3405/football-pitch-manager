import { message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type {
  AdminFieldDetail,
  AdminFieldItem,
  AdminFieldKpi,
  AdminFieldStatusFilter,
} from '../interface/admin-field.interface';
import { adminFieldService } from '../service/admin-field.service';

export function useAdminFields() {
  const { t } = useTranslation();

  const [fields, setFields] = useState<AdminFieldItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [kpi, setKpi] = useState<AdminFieldKpi | null>(null);
  const [kpiLoading, setKpiLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdminFieldStatusFilter>('ALL');
  const [districtFilter, setDistrictFilter] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Drawer State
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [selectedFieldDetail, setSelectedFieldDetail] = useState<AdminFieldDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Status Action Modal State
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [targetField, setTargetField] = useState<AdminFieldItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Debounce search query input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch KPI data
  const fetchKpi = useCallback(async () => {
    setKpiLoading(true);
    try {
      const data = await adminFieldService.getKpi();
      setKpi(data);
    } catch {
      // Keep silent or fallback
    } finally {
      setKpiLoading(false);
    }
  }, []);

  // Fetch paginated & filtered fields
  const fetchFields = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFieldService.getFields({
        page,
        limit: pageSize,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter,
        district: districtFilter,
      });
      setFields(res.items);
      setTotal(res.total);
    } catch {
      message.error(t('adminFields.fetchFailed', { defaultValue: 'Không thể tải danh sách sân bóng từ máy chủ.' }));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, districtFilter, page, pageSize, statusFilter, t]);

  useEffect(() => {
    void fetchFields();
  }, [fetchFields]);

  useEffect(() => {
    void fetchKpi();
  }, [fetchKpi]);

  const openDetailDrawer = async (field: AdminFieldItem) => {
    setDetailDrawerOpen(true);
    setDetailLoading(true);
    setSelectedFieldDetail(null);
    try {
      const detail = await adminFieldService.getFieldDetail(field.id);
      setSelectedFieldDetail(detail);
    } catch {
      message.error(t('adminFields.fetchDetailFailed', { defaultValue: 'Không thể tải hồ sơ chi tiết sân bóng.' }));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailDrawer = () => {
    setDetailDrawerOpen(false);
    setSelectedFieldDetail(null);
  };

  const openStatusModal = (field: AdminFieldItem) => {
    setTargetField(field);
    setStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setTargetField(null);
    setStatusModalOpen(false);
  };

  const handleUpdateStatus = async (status: 'active' | 'inactive', reason?: string) => {
    if (!targetField) return;
    setActionLoading(true);
    try {
      await adminFieldService.updateFieldStatus(targetField.id, { status, reason });
      message.success(
        status === 'active'
          ? t('adminFields.unlockSuccess', { defaultValue: 'Đã kích hoạt lại cụm sân thành công.' })
          : t('adminFields.lockSuccess', { defaultValue: 'Đã tạm ngưng hoạt động cụm sân thành công.' }),
      );
      closeStatusModal();
      await Promise.all([fetchFields(), fetchKpi()]);
    } catch {
      message.error(t('adminFields.actionFailed', { defaultValue: 'Thao tác không thành công, vui lòng thử lại.' }));
    } finally {
      setActionLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([fetchFields(), fetchKpi()]);
  };

  return {
    fields,
    total,
    loading,
    kpi,
    kpiLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    districtFilter,
    setDistrictFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    detailDrawerOpen,
    selectedFieldDetail,
    detailLoading,
    statusModalOpen,
    targetField,
    actionLoading,
    openDetailDrawer,
    closeDetailDrawer,
    openStatusModal,
    closeStatusModal,
    handleUpdateStatus,
    refreshData,
  };
}
