import { useCallback, useEffect, useState } from 'react';
import type {
  AdminAuditItem,
  AdminAuditListResponse,
  AdminAuditQueryParams,
  AdminModerationReportItem,
  AdminModerationReportsQueryParams,
  AdminModerationReportsResponse,
  AdminSystemStatusResponse,
  ReportTabType,
} from '../interface/admin-reports.interface';
import {
  exportAdminAuditLogs,
  getAdminAuditLogById,
  getAdminAuditLogs,
  getAdminModerationReportById,
  getAdminModerationReports,
  getAdminSystemStatus,
} from '../service/admin.service';
import { triggerBlobDownload } from '../utils/admin-reports.util';

export function useAdminReports() {
  const [activeTab, setActiveTab] = useState<ReportTabType>('reports');

  // Tab 1: Moderation Reports state
  const [reportsData, setReportsData] =
    useState<AdminModerationReportsResponse | null>(null);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsError, setReportsError] = useState<string | null>(null);
  const [reportsSearch, setReportsSearch] = useState('');
  const [reportsType, setReportsType] = useState<
    'all' | 'post' | 'review' | 'user'
  >('all');
  const [reportsStatus, setReportsStatus] = useState<
    'all' | 'pending' | 'resolved'
  >('all');
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsDateRange, setReportsDateRange] = useState<
    [string, string] | null
  >(null);

  // Tab 2: Audit Logs state
  const [auditData, setAuditData] = useState<AdminAuditListResponse | null>(
    null,
  );
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditCategory, setAuditCategory] = useState<string>('ALL');
  const [auditPage, setAuditPage] = useState(1);
  const [auditDateRange, setAuditDateRange] = useState<
    [string, string] | null
  >(null);

  // Tab 3: System Status state
  const [systemData, setSystemData] =
    useState<AdminSystemStatusResponse | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);
  const [systemError, setSystemError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(0);

  // Export loading state
  const [isExporting, setIsExporting] = useState(false);

  // Selected item for drawer view
  const [selectedAuditLog, setSelectedAuditLog] =
    useState<AdminAuditItem | null>(null);
  const [selectedReport, setSelectedReport] =
    useState<AdminModerationReportItem | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const loadAuditLogDetail = useCallback(async (id: string) => {
    setDrawerLoading(true);
    setSelectedAuditLog(null);
    try {
      const data = await getAdminAuditLogById(id);
      setSelectedAuditLog(data);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  const loadReportDetail = useCallback(async (id: string) => {
    setDrawerLoading(true);
    setSelectedReport(null);
    try {
      const data = await getAdminModerationReportById(id);
      setSelectedReport(data);
    } finally {
      setDrawerLoading(false);
    }
  }, []);

  // Fetch Moderation Reports
  const fetchModerationReports = useCallback(async () => {
    setReportsLoading(true);
    setReportsError(null);
    try {
      const params: AdminModerationReportsQueryParams = {
        page: reportsPage,
        limit: 10,
        type: reportsType,
        status: reportsStatus,
        search: reportsSearch.trim() || undefined,
        fromDate: reportsDateRange?.[0] || undefined,
        toDate: reportsDateRange?.[1] || undefined,
      };
      const res = await getAdminModerationReports(params);
      setReportsData(res);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể tải báo cáo kiểm duyệt';
      setReportsError(errorMsg);
    } finally {
      setReportsLoading(false);
    }
  }, [
    reportsPage,
    reportsType,
    reportsStatus,
    reportsSearch,
    reportsDateRange,
  ]);

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    setAuditLoading(true);
    setAuditError(null);
    try {
      const params: AdminAuditQueryParams = {
        page: auditPage,
        limit: 10,
        category: auditCategory,
        search: auditSearch.trim() || undefined,
        fromDate: auditDateRange?.[0] || undefined,
        toDate: auditDateRange?.[1] || undefined,
      };
      const res = await getAdminAuditLogs(params);
      setAuditData(res);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể tải nhật ký kiểm toán';
      setAuditError(errorMsg);
    } finally {
      setAuditLoading(false);
    }
  }, [auditPage, auditCategory, auditSearch, auditDateRange]);

  // Fetch System Status
  const fetchSystemStatus = useCallback(async () => {
    setSystemLoading(true);
    setSystemError(null);
    try {
      const res = await getAdminSystemStatus();
      setSystemData(res);
      setLastRefreshedAt(new Date().toLocaleTimeString());
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Không thể tải thông tin hệ thống';
      setSystemError(errorMsg);
    } finally {
      setSystemLoading(false);
    }
  }, []);

  // Effects to trigger fetch on tab or filter change
  useEffect(() => {
    if (activeTab === 'reports') {
      const timer = setTimeout(() => {
        void fetchModerationReports();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchModerationReports]);

  useEffect(() => {
    if (activeTab === 'audit') {
      const timer = setTimeout(() => {
        void fetchAuditLogs();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab, fetchAuditLogs]);

  useEffect(() => {
    if (activeTab === 'system') {
      void fetchSystemStatus();
    }
  }, [activeTab, fetchSystemStatus]);

  useEffect(() => {
    if (activeTab === 'system' && autoRefreshInterval > 0) {
      const timer = setInterval(() => {
        void fetchSystemStatus();
      }, autoRefreshInterval * 1000);
      return () => clearInterval(timer);
    }
  }, [activeTab, autoRefreshInterval, fetchSystemStatus]);

  // Reset filter handlers
  const resetReportsFilters = useCallback(() => {
    setReportsSearch('');
    setReportsType('all');
    setReportsStatus('all');
    setReportsDateRange(null);
    setReportsPage(1);
  }, []);

  const resetAuditFilters = useCallback(() => {
    setAuditSearch('');
    setAuditCategory('ALL');
    setAuditDateRange(null);
    setAuditPage(1);
  }, []);

  // Reset page when filter changes
  const handleReportsSearchChange = (val: string) => {
    setReportsSearch(val);
    setReportsPage(1);
  };

  const handleReportsTypeChange = (val: 'all' | 'post' | 'review' | 'user') => {
    setReportsType(val);
    setReportsPage(1);
  };

  const handleReportsStatusChange = (val: 'all' | 'pending' | 'resolved') => {
    setReportsStatus(val);
    setReportsPage(1);
  };

  const handleReportsDateRangeChange = (dates: [string, string] | null) => {
    setReportsDateRange(dates);
    setReportsPage(1);
  };

  const handleAuditSearchChange = (val: string) => {
    setAuditSearch(val);
    setAuditPage(1);
  };

  const handleAuditCategoryChange = (val: string) => {
    setAuditCategory(val);
    setAuditPage(1);
  };

  const handleAuditDateRangeChange = (dates: [string, string] | null) => {
    setAuditDateRange(dates);
    setAuditPage(1);
  };

  // Export handler
  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    setIsExporting(true);
    try {
      if (activeTab === 'audit') {
        const params: AdminAuditQueryParams = {
          category: auditCategory,
          search: auditSearch.trim() || undefined,
          fromDate: auditDateRange?.[0] || undefined,
          toDate: auditDateRange?.[1] || undefined,
        };
        const { data, contentType, filename } = await exportAdminAuditLogs(
          params,
          format,
        );
        triggerBlobDownload(data, filename, contentType);
      } else if (activeTab === 'reports') {
        const dateSuffix = new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '');
        const items = reportsData?.items ?? [];
        if (format === 'csv') {
          const BOM = '\uFEFF';
          const headers = [
            'ID',
            'Loại',
            'Tác giả',
            'Lý do',
            'Nội dung',
            'Thời gian',
            'Trạng thái',
          ];
          const escape = (s: string | null | undefined) =>
            `"${String(s ?? '').replace(/"/g, '""')}"`;
          const rows = items.map((i) => [
            escape(i.id),
            escape(i.type),
            escape(i.author),
            escape(i.reason),
            escape(i.content),
            escape(i.reportedAt),
            escape(i.status),
          ]);
          const csvContent =
            BOM + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
          triggerBlobDownload(
            csvContent,
            `moderation-reports-${dateSuffix}.csv`,
            'text/csv; charset=utf-8',
          );
        } else {
          triggerBlobDownload(
            JSON.stringify(items, null, 2),
            `moderation-reports-${dateSuffix}.json`,
            'application/json; charset=utf-8',
          );
        }
      } else {
        const dateSuffix = new Date()
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, '');
        triggerBlobDownload(
          JSON.stringify(systemData, null, 2),
          `system-status-${dateSuffix}.json`,
          'application/json; charset=utf-8',
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  return {
    activeTab,
    setActiveTab,

    // Moderation Reports
    reportsData,
    reportsLoading,
    reportsError,
    reportsSearch,
    setReportsSearch: handleReportsSearchChange,
    reportsType,
    setReportsType: handleReportsTypeChange,
    reportsStatus,
    setReportsStatus: handleReportsStatusChange,
    reportsPage,
    setReportsPage,
    reportsDateRange,
    setReportsDateRange: handleReportsDateRangeChange,
    refetchReports: fetchModerationReports,
    resetReportsFilters,

    // Audit Logs
    auditData,
    auditLoading,
    auditError,
    auditSearch,
    setAuditSearch: handleAuditSearchChange,
    auditCategory,
    setAuditCategory: handleAuditCategoryChange,
    auditPage,
    setAuditPage,
    auditDateRange,
    setAuditDateRange: handleAuditDateRangeChange,
    refetchAudits: fetchAuditLogs,
    resetAuditFilters,

    // System Status
    systemData,
    systemLoading,
    systemError,
    lastRefreshedAt,
    autoRefreshInterval,
    setAutoRefreshInterval,
    refetchSystemStatus: fetchSystemStatus,

    // Drawers / Details
    selectedAuditLog,
    setSelectedAuditLog,
    selectedReport,
    setSelectedReport,
    drawerLoading,
    loadAuditLogDetail,
    loadReportDetail,

    // Actions
    isExporting,
    handleExport,
  };
}
