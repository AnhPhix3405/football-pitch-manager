import {
  AlertOutlined,
  CheckCircleFilled,
  ClearOutlined,
  ClockCircleOutlined,
  CloseCircleFilled,
  CloudServerOutlined,
  CopyOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileSearchOutlined,
  LinkOutlined,
  ReloadOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
  WarningFilled,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  DatePicker,
  Drawer,
  Dropdown,
  Empty,
  Input,
  Progress,
  Segmented,
  Select,
  Skeleton,
  Table,
  Tag,
  Tooltip,
  message,
} from 'antd';
import type { MenuProps } from 'antd';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdminReports } from '../../hooks/useAdminReports';
import {
  AUDIT_ACTION_TAG_CONFIG,
  AUDIT_CATEGORY_OPTIONS,
  MODERATION_STATUS_OPTIONS,
  MODERATION_TYPE_OPTIONS,
} from './constants/admin-reports.constant';
import type {
  AdminAuditItem,
  AdminModerationReportItem,
  ReportTabType,
} from './interface/admin-reports.interface';
import {
  formatBytes,
  formatLatency,
  formatReportTimestamp,
} from './utils/admin-reports.util';
import './AdminReportsPage.css';

export function AdminReportsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    activeTab,
    setActiveTab,

    // Moderation Reports
    reportsData,
    reportsLoading,
    reportsError,
    reportsSearch,
    setReportsSearch,
    reportsType,
    setReportsType,
    reportsStatus,
    setReportsStatus,
    reportsPage,
    setReportsPage,
    setReportsDateRange,
    refetchReports,
    resetReportsFilters,

    // Audit Logs
    auditData,
    auditLoading,
    auditError,
    auditSearch,
    setAuditSearch,
    auditCategory,
    setAuditCategory,
    auditPage,
    setAuditPage,
    setAuditDateRange,
    refetchAudits,
    resetAuditFilters,

    // System Status
    systemData,
    systemLoading,
    systemError,
    lastRefreshedAt,
    autoRefreshInterval,
    setAutoRefreshInterval,
    refetchSystemStatus,

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
  } = useAdminReports();

  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isReportDrawerOpen, setIsReportDrawerOpen] = useState(false);

  const handleCopy = useCallback(
    async (text: string, label = 'Mã') => {
      try {
        await navigator.clipboard.writeText(text);
        message.success(
          t('admin.copiedToClipboard', {
            defaultValue: `${label} đã được sao chép vào bộ nhớ tạm.`,
          }),
        );
      } catch {
        message.error('Không thể sao chép vào clipboard.');
      }
    },
    [t],
  );

  const handleExportClick = async (format: 'json' | 'csv') => {
    try {
      await handleExport(format);
      message.success(
        t('admin.exportSuccess', {
          defaultValue: 'Đã xuất dữ liệu báo cáo thành công.',
        }),
      );
    } catch {
      message.error(
        t('admin.exportFailed', {
          defaultValue: 'Xuất dữ liệu báo cáo thất bại.',
        }),
      );
    }
  };

  const exportMenuItems: MenuProps['items'] = [
    {
      key: 'csv',
      label: t('admin.exportCsv', { defaultValue: 'Xuất file CSV (Excel)' }),
      onClick: () => void handleExportClick('csv'),
    },
    {
      key: 'json',
      label: t('admin.exportJson', { defaultValue: 'Xuất file JSON' }),
      onClick: () => void handleExportClick('json'),
    },
  ];

  // Columns for Moderation Reports (5 key fields + actions per #1003)
  const reportColumns = useMemo(
    () => [
      {
        title: t('admin.reportType', { defaultValue: 'LOẠI VI PHẠM' }),
        dataIndex: 'type',
        key: 'type',
        width: 130,
        render: (type: 'post' | 'review' | 'user') => {
          let color = 'blue';
          let label = t('admin.typePost', { defaultValue: 'Bài đăng' });
          if (type === 'review') {
            color = 'purple';
            label = t('admin.typeReview', { defaultValue: 'Đánh giá' });
          } else if (type === 'user') {
            color = 'volcano';
            label = t('admin.typeUser', { defaultValue: 'Tài khoản' });
          }
          return <Tag color={color}>{label}</Tag>;
        },
      },
      {
        title: t('admin.reportReason', { defaultValue: 'LÝ DO VI PHẠM' }),
        dataIndex: 'reason',
        key: 'reason',
        render: (reason: string) => (
          <span style={{ fontWeight: 600 }}>{reason}</span>
        ),
      },
      {
        title: t('admin.reportAuthor', { defaultValue: 'ĐỐI TƯỢNG / TÁC GIẢ' }),
        dataIndex: 'author',
        key: 'author',
      },
      {
        title: t('admin.reportContent', { defaultValue: 'NỘI DUNG TRÍCH DẪN' }),
        dataIndex: 'content',
        key: 'content',
        ellipsis: true,
        render: (content: string) => (
          <Tooltip title={content} placement="topLeft">
            <span className="table-content-ellipsis">{content}</span>
          </Tooltip>
        ),
      },
      {
        title: t('admin.reportTimeAndStatus', {
          defaultValue: 'TRẠNG THÁI & THỜI GIAN',
        }),
        key: 'statusAndTime',
        width: 180,
        align: 'right' as const,
        render: (_: unknown, item: AdminModerationReportItem) => (
          <div
            style={{
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              gap: 4,
            }}
          >
            <Tag
              color={item.status === 'pending' ? 'gold' : 'green'}
              style={{ margin: 0 }}
            >
              {item.status === 'pending'
                ? t('admin.statusPending', { defaultValue: 'Chờ xử lý' })
                : t('admin.statusResolved', { defaultValue: 'Đã giải quyết' })}
            </Tag>
            <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
              {formatReportTimestamp(item.reportedAt)}
            </span>
          </div>
        ),
      },
      {
        title: t('admin.reportAction', { defaultValue: 'THAO TÁC' }),
        key: 'action',
        width: 100,
        render: (_: unknown, item: AdminModerationReportItem) => (
          <div style={{ display: 'flex', gap: 6 }}>
            <Tooltip
              title={t('admin.viewDetail', { defaultValue: 'Xem chi tiết' })}
            >
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => {
                  setIsReportDrawerOpen(true);
                  void loadReportDetail(item.id);
                }}
              />
            </Tooltip>
            {item.status === 'pending' && (
              <Tooltip title="Chuyển đến trang Quản lý & Xử lý vi phạm">
                <Button
                  size="small"
                  type="primary"
                  ghost
                  icon={<LinkOutlined />}
                  onClick={() => navigate('/admin/management')}
                />
              </Tooltip>
            )}
          </div>
        ),
      },
    ],
    [t, navigate, loadReportDetail],
  );

  // Columns for Audit Logs (5 key fields + actions per #1003)
  const auditColumns = useMemo(
    () => [
      {
        title: t('admin.auditTime', { defaultValue: 'THỜI GIAN' }),
        dataIndex: 'timestamp',
        key: 'timestamp',
        width: 160,
        render: (time: string) => formatReportTimestamp(time),
      },
      {
        title: t('admin.auditActor', { defaultValue: 'NGƯỜI THỰC HIỆN' }),
        dataIndex: 'actor',
        key: 'actor',
        render: (actor: string, item: AdminAuditItem) => (
          <div className="actor-cell">
            <Tag color={item.actorRole === 'admin' ? 'geekblue' : 'default'}>
              {item.actorRole.toUpperCase()}
            </Tag>
            <span>{actor}</span>
          </div>
        ),
      },
      {
        title: t('admin.auditAction', { defaultValue: 'HÀNH ĐỘNG' }),
        key: 'action',
        width: 160,
        render: (_: unknown, item: AdminAuditItem) => {
          const cfg = AUDIT_ACTION_TAG_CONFIG[item.action] || {
            color: 'default',
            label: item.action,
          };
          return <Tag color={cfg.color}>{cfg.label}</Tag>;
        },
      },
      {
        title: t('admin.auditCategory', { defaultValue: 'DANH MỤC' }),
        dataIndex: 'category',
        key: 'category',
        width: 130,
        render: (cat: string) => <Tag color="blue">{cat}</Tag>,
      },
      {
        title: t('admin.auditTarget', { defaultValue: 'MỤC TIÊU & IP' }),
        dataIndex: 'target',
        key: 'target',
        ellipsis: true,
        render: (target: string, item: AdminAuditItem) => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Tooltip title={target} placement="topLeft">
              <span className="table-content-ellipsis">{target}</span>
            </Tooltip>
            <span className="ip-badge" style={{ width: 'fit-content' }}>
              {item.ip ?? 'internal'}
            </span>
          </div>
        ),
      },
      {
        title: t('admin.viewDetail', { defaultValue: 'CHI TIẾT' }),
        key: 'detail',
        width: 80,
        render: (_: unknown, item: AdminAuditItem) => (
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setIsAuditDrawerOpen(true);
              void loadAuditLogDetail(item.id);
            }}
          >
            {t('admin.viewDetail', { defaultValue: 'Xem' })}
          </Button>
        ),
      },
    ],
    [t, loadAuditLogDetail],
  );

  return (
    <section className="admin-reports-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <span className="eyebrow">
            {t('admin.reportsEyebrow', {
              defaultValue: 'OBSERVABILITY & COMPLIANCE',
            })}
          </span>
          <h1 className="page-title">
            {t('admin.reportsTitle', {
              defaultValue: 'Báo cáo & Giám sát hệ thống',
            })}
          </h1>
          <p className="page-subtitle">
            {t('admin.reportsSubtitle', {
              defaultValue:
                'Phân tích kiểm duyệt, nhật ký kiểm toán và theo dõi sức khỏe hạ tầng thời gian thực.',
            })}
          </p>
        </div>
        <div className="header-actions">
          <Dropdown menu={{ items: exportMenuItems }} placement="bottomRight">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={isExporting}
            >
              {t('admin.exportReport', { defaultValue: 'Xuất báo cáo' })}
            </Button>
          </Dropdown>
        </div>
      </header>

      {/* Toolbar */}
      <div className="toolbar">
        <Segmented
          value={activeTab}
          onChange={(val) => setActiveTab(val as ReportTabType)}
          options={[
            {
              value: 'reports',
              label: t('admin.tabReports', {
                defaultValue: 'Báo cáo kiểm duyệt',
              }),
              icon: <FileSearchOutlined />,
            },
            {
              value: 'audit',
              label: t('admin.tabAudit', { defaultValue: 'Audit Log' }),
              icon: <SafetyCertificateOutlined />,
            },
            {
              value: 'system',
              label: t('admin.tabSystem', { defaultValue: 'Trạng thái hạ tầng' }),
              icon: <CloudServerOutlined />,
            },
          ]}
        />

        <div className="toolbar-filters">
          {activeTab === 'reports' && (
            <>
              <Input
                prefix={<SearchOutlined />}
                value={reportsSearch}
                onChange={(e) => setReportsSearch(e.target.value)}
                placeholder={t('admin.searchReportsPlaceholder', {
                  defaultValue: 'Tìm mã, tác giả, lý do vi phạm...',
                })}
                style={{ width: 220 }}
                allowClear
              />
              <Select
                value={reportsType}
                onChange={setReportsType}
                style={{ width: 150 }}
                options={MODERATION_TYPE_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: t(opt.labelKey, { defaultValue: opt.defaultLabel }),
                }))}
              />
              <Select
                value={reportsStatus}
                onChange={setReportsStatus}
                style={{ width: 140 }}
                options={MODERATION_STATUS_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: t(opt.labelKey, { defaultValue: opt.defaultLabel }),
                }))}
              />
              <DatePicker.RangePicker
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setReportsDateRange([
                      dates[0].startOf('day').toISOString(),
                      dates[1].endOf('day').toISOString(),
                    ]);
                  } else {
                    setReportsDateRange(null);
                  }
                }}
              />
            </>
          )}

          {activeTab === 'audit' && (
            <>
              <Input
                prefix={<SearchOutlined />}
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder={t('admin.searchAuditPlaceholder', {
                  defaultValue: 'Tìm event, actor, action, IP...',
                })}
                style={{ width: 230 }}
                allowClear
              />
              <Select
                value={auditCategory}
                onChange={setAuditCategory}
                style={{ width: 170 }}
                options={AUDIT_CATEGORY_OPTIONS.map((opt) => ({
                  value: opt.value,
                  label: t(opt.labelKey, { defaultValue: opt.defaultLabel }),
                }))}
              />
              <DatePicker.RangePicker
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setAuditDateRange([
                      dates[0].startOf('day').toISOString(),
                      dates[1].endOf('day').toISOString(),
                    ]);
                  } else {
                    setAuditDateRange(null);
                  }
                }}
              />
            </>
          )}

          {activeTab === 'system' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Select
                value={autoRefreshInterval}
                onChange={setAutoRefreshInterval}
                style={{ width: 145 }}
                options={[
                  {
                    value: 0,
                    label: t('admin.autoRefreshOff', {
                      defaultValue: 'Tự động: Tắt',
                    }),
                  },
                  {
                    value: 30,
                    label: t('admin.autoRefresh30s', {
                      defaultValue: 'Tự động: 30s',
                    }),
                  },
                  {
                    value: 60,
                    label: t('admin.autoRefresh60s', {
                      defaultValue: 'Tự động: 60s',
                    }),
                  },
                ]}
              />
              {lastRefreshedAt && (
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  <ClockCircleOutlined style={{ marginRight: 4 }} />
                  {t('admin.lastUpdated', { defaultValue: 'Cập nhật: ' })}
                  {lastRefreshedAt}
                </span>
              )}
              <Button
                icon={<ReloadOutlined />}
                loading={systemLoading}
                onClick={() => void refetchSystemStatus()}
              >
                {t('admin.refreshSystem', { defaultValue: 'Làm mới' })}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tab 1: Moderation Reports */}
      {activeTab === 'reports' && (
        <>
          {reportsError && (
            <Alert
              type="error"
              message={reportsError}
              action={<Button onClick={() => void refetchReports()}>Thử lại</Button>}
              showIcon
            />
          )}

          <div className="metrics-grid">
            <article className="metric-card">
              <div className="metric-icon-wrap total">
                <AlertOutlined />
              </div>
              <div className="metric-info">
                <span className="metric-value">
                  {reportsData?.metrics?.totalReports ?? 0}
                </span>
                <span className="metric-label">
                  {t('admin.metricTotalReports', { defaultValue: 'Tổng báo cáo' })}
                </span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon-wrap pending">
                <FileSearchOutlined />
              </div>
              <div className="metric-info">
                <span className="metric-value">
                  {reportsData?.metrics?.pendingReports ?? 0}
                </span>
                <span className="metric-label">
                  {t('admin.metricPendingReports', {
                    defaultValue: 'Đang chờ xử lý',
                  })}
                </span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon-wrap resolved">
                <CheckCircleFilled />
              </div>
              <div className="metric-info">
                <span className="metric-value">
                  {reportsData?.metrics?.resolvedReports ?? 0}
                </span>
                <span className="metric-label">
                  {t('admin.metricResolvedReports', {
                    defaultValue: 'Đã giải quyết',
                  })}
                </span>
              </div>
            </article>

            <article className="metric-card">
              <div className="metric-icon-wrap rate">
                <SafetyCertificateOutlined />
              </div>
              <div className="metric-info">
                <span className="metric-value">
                  {reportsData?.metrics?.processedWithin24hRate ?? 100}%
                </span>
                <span className="metric-label">
                  {t('admin.metricProcessedIn24h', {
                    defaultValue: 'Xử lý dưới 24h',
                  })}
                </span>
              </div>
            </article>
          </div>

          <div className="table-container">
            {reportsLoading && !reportsData ? (
              <Skeleton active paragraph={{ rows: 6 }} style={{ padding: 20 }} />
            ) : (
              <Table
                rowKey="id"
                dataSource={reportsData?.items ?? []}
                columns={reportColumns}
                loading={reportsLoading}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div className="table-empty-wrap">
                          <p className="empty-title">
                            {t('admin.emptyModerationReports', {
                              defaultValue:
                                'Không có báo cáo vi phạm nào phù hợp.',
                            })}
                          </p>
                          <p className="empty-subtitle">
                            {t('admin.emptyFilterHelp', {
                              defaultValue:
                                'Thử điều chỉnh hoặc xóa bộ lọc để hiển thị dữ liệu.',
                            })}
                          </p>
                          <Button
                            size="small"
                            icon={<ClearOutlined />}
                            onClick={resetReportsFilters}
                          >
                            {t('admin.clearAllFilters', {
                              defaultValue: 'Xóa bộ lọc',
                            })}
                          </Button>
                        </div>
                      }
                    />
                  ),
                }}
                pagination={{
                  current: reportsPage,
                  pageSize: 10,
                  total: reportsData?.total ?? 0,
                  onChange: (page) => setReportsPage(page),
                  showTotal: (total) => `Tổng ${total} báo cáo vi phạm`,
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <>
          {auditError && (
            <Alert
              type="error"
              message={auditError}
              action={<Button onClick={() => void refetchAudits()}>Thử lại</Button>}
              showIcon
            />
          )}

          <div className="table-container">
            {auditLoading && !auditData ? (
              <Skeleton active paragraph={{ rows: 8 }} style={{ padding: 20 }} />
            ) : (
              <Table
                rowKey="id"
                dataSource={auditData?.items ?? []}
                columns={auditColumns}
                loading={auditLoading}
                scroll={{ x: 880 }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={
                        <div className="table-empty-wrap">
                          <p className="empty-title">
                            {t('admin.emptyAuditLogs', {
                              defaultValue:
                                'Không tìm thấy nhật ký kiểm toán phù hợp.',
                            })}
                          </p>
                          <p className="empty-subtitle">
                            {t('admin.emptyFilterHelp', {
                              defaultValue:
                                'Thử điều chỉnh hoặc xóa bộ lọc để hiển thị dữ liệu.',
                            })}
                          </p>
                          <Button
                            size="small"
                            icon={<ClearOutlined />}
                            onClick={resetAuditFilters}
                          >
                            {t('admin.clearAllFilters', {
                              defaultValue: 'Xóa bộ lọc',
                            })}
                          </Button>
                        </div>
                      }
                    />
                  ),
                }}
                pagination={{
                  current: auditPage,
                  pageSize: 10,
                  total: auditData?.total ?? 0,
                  onChange: (page) => setAuditPage(page),
                  showTotal: (total) => `Tổng ${total} sự kiện kiểm toán`,
                }}
              />
            )}
          </div>
        </>
      )}

      {/* Tab 3: System Status */}
      {activeTab === 'system' && (
        <>
          {systemError && (
            <Alert
              type="error"
              message={systemError}
              action={
                <Button onClick={() => void refetchSystemStatus()}>Thử lại</Button>
              }
              showIcon
            />
          )}

          {systemLoading && !systemData ? (
            <Skeleton active paragraph={{ rows: 6 }} style={{ padding: 20 }} />
          ) : (
            <div className="system-grid">
              {(systemData?.nodes ?? []).map((node) => {
                let statusColor = 'green';
                let StatusIcon = CheckCircleFilled;
                if (node.status === 'DEGRADED') {
                  statusColor = 'gold';
                  StatusIcon = WarningFilled;
                } else if (node.status === 'OUTAGE') {
                  statusColor = 'red';
                  StatusIcon = CloseCircleFilled;
                }

                let NodeIcon = CloudServerOutlined;
                if (node.key === 'primary_database') {
                  NodeIcon = DatabaseOutlined;
                }

                return (
                  <article key={node.key} className="system-card">
                    <div className="node-header">
                      <div className="node-title-group">
                        <NodeIcon className="node-icon" />
                        <div>
                          <h3 className="node-name">{node.name}</h3>
                          <p className="node-detail">{node.detail}</p>
                        </div>
                      </div>
                      <Tag color={statusColor}>
                        <StatusIcon style={{ marginRight: 4 }} />
                        {node.status}
                      </Tag>
                    </div>

                    <Progress
                      percent={node.healthPercent}
                      status={node.status === 'OUTAGE' ? 'exception' : 'active'}
                      strokeColor={
                        node.status === 'OPERATIONAL'
                          ? '#10b981'
                          : node.status === 'DEGRADED'
                            ? '#f59e0b'
                            : '#ef4444'
                      }
                      trailColor="#1e293b"
                    />

                    <div className="node-telemetry">
                      <div className="telemetry-item">
                        <span className="telemetry-label">
                          {t('admin.latency', { defaultValue: 'Độ trễ' })}
                        </span>
                        <span className="telemetry-value">
                          {formatLatency(node.latencyMs)}
                        </span>
                      </div>

                      {node.metrics?.uptimeSeconds !== undefined && (
                        <div className="telemetry-item">
                          <span className="telemetry-label">
                            {t('admin.uptime', { defaultValue: 'Thời gian chạy' })}
                          </span>
                          <span className="telemetry-value">
                            {Math.floor(node.metrics.uptimeSeconds / 3600)}h
                          </span>
                        </div>
                      )}

                      {node.metrics?.heapUsedMb !== undefined && (
                        <div className="telemetry-item">
                          <span className="telemetry-label">
                            {t('admin.heapMemory', { defaultValue: 'Bộ nhớ Heap' })}
                          </span>
                          <span className="telemetry-value">
                            {node.metrics.heapUsedMb} MB
                          </span>
                        </div>
                      )}

                      {node.metrics?.activeConnections !== undefined && (
                        <div className="telemetry-item">
                          <span className="telemetry-label">
                            {t('admin.activeConnections', {
                              defaultValue: 'Pool kết nối',
                            })}
                          </span>
                          <span className="telemetry-value">
                            {node.metrics.activeConnections}
                          </span>
                        </div>
                      )}

                      {node.metrics?.databaseSizeBytes !== undefined && (
                        <div className="telemetry-item">
                          <span className="telemetry-label">
                            {t('admin.databaseSize', {
                              defaultValue: 'Dung lượng DB',
                            })}
                          </span>
                          <span className="telemetry-value">
                            {formatBytes(node.metrics.databaseSizeBytes)}
                          </span>
                        </div>
                      )}

                      {node.metrics?.connectedClients !== undefined && (
                        <div className="telemetry-item">
                          <span className="telemetry-label">
                            {t('admin.connectedClients', {
                              defaultValue: 'Clients kết nối',
                            })}
                          </span>
                          <span className="telemetry-value">
                            {node.metrics.connectedClients}
                          </span>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Drawer: Chi tiết Audit Log */}
      <Drawer
        rootClassName="admin-reports-drawer"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <SafetyCertificateOutlined style={{ color: '#10b981', fontSize: 18 }} />
            <span>
              {t('admin.auditDetailTitle', {
                defaultValue: 'Chi tiết sự kiện kiểm toán',
              })}
            </span>
            {selectedAuditLog && (
              <Tag color="cyan" style={{ margin: 0, fontSize: 11, fontWeight: 600 }}>
                {selectedAuditLog.category}
              </Tag>
            )}
          </div>
        }
        open={isAuditDrawerOpen}
        onClose={() => {
          setIsAuditDrawerOpen(false);
          setSelectedAuditLog(null);
        }}
        width={500}
      >
        {drawerLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} style={{ padding: 16 }} />
        ) : selectedAuditLog ? (
          <div>
            <div className="drawer-compact-card">
              <div className="drawer-compact-row">
                <span className="drawer-compact-label">ID SỰ KIỆN</span>
                <div className="drawer-compact-value">
                  <span className="id-text">{selectedAuditLog.id}</span>
                  <Tooltip
                    title={t('admin.copyCode', {
                      defaultValue: 'Sao chép mã sự kiện',
                    })}
                  >
                    <Button
                      type="text"
                      size="small"
                      aria-label={t('admin.copyCode', {
                        defaultValue: 'Sao chép mã sự kiện',
                      })}
                      className="copy-action-btn"
                      icon={<CopyOutlined style={{ fontSize: 12 }} />}
                      onClick={() =>
                        void handleCopy(
                          selectedAuditLog.id,
                          t('admin.auditEventId', { defaultValue: 'Mã sự kiện' }),
                        )
                      }
                    />
                  </Tooltip>
                </div>
              </div>

              <div className="drawer-compact-row">
                <span className="drawer-compact-label">HÀNH ĐỘNG</span>
                <div className="drawer-compact-value">
                  <Tag
                    color={
                      AUDIT_ACTION_TAG_CONFIG[selectedAuditLog.action]?.color ??
                      'default'
                    }
                    style={{ margin: 0 }}
                  >
                    {AUDIT_ACTION_TAG_CONFIG[selectedAuditLog.action]?.label ??
                      selectedAuditLog.action}
                  </Tag>
                  <Tag color="blue" style={{ margin: 0 }}>
                    {selectedAuditLog.category}
                  </Tag>
                </div>
              </div>

              <div className="drawer-compact-row">
                <span className="drawer-compact-label">NGƯỜI THỰC HIỆN</span>
                <div className="drawer-compact-value">
                  <span>{selectedAuditLog.actor}</span>
                  <Tag style={{ margin: 0 }}>{selectedAuditLog.actorRole}</Tag>
                </div>
              </div>

              <div className="drawer-compact-row">
                <span className="drawer-compact-label">MỤC TIÊU TÁC ĐỘNG</span>
                <div className="drawer-compact-value">
                  <span style={{ fontWeight: 600 }}>{selectedAuditLog.target}</span>
                </div>
              </div>

              <div className="drawer-compact-row">
                <span className="drawer-compact-label">THỜI GIAN</span>
                <div className="drawer-compact-value">
                  {formatReportTimestamp(selectedAuditLog.timestamp)}
                </div>
              </div>

              <div className="drawer-compact-row align-top">
                <span className="drawer-compact-label">IP & THIẾT BỊ</span>
                <div
                  className="drawer-compact-value"
                  style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}
                >
                  <span>{selectedAuditLog.ip ?? 'internal'}</span>
                  {selectedAuditLog.userAgent && (
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {selectedAuditLog.userAgent}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="drawer-payload-section">
              <div className="drawer-payload-header">
                <div className="drawer-payload-title">
                  <span>DỮ LIỆU THAY ĐỔI</span>
                  <span className="json-badge">JSON</span>
                </div>
                <Button
                  size="small"
                  type="text"
                  aria-label={t('admin.copyPayload', { defaultValue: 'Sao chép JSON' })}
                  icon={<CopyOutlined />}
                  onClick={() =>
                    void handleCopy(
                      JSON.stringify(selectedAuditLog.details ?? {}, null, 2),
                      'JSON Payload',
                    )
                  }
                >
                  {t('admin.copyPayload', { defaultValue: 'Sao chép' })}
                </Button>
              </div>
              <pre className="json-viewer-compact">
                {JSON.stringify(selectedAuditLog.details ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        ) : null}
      </Drawer>

      {/* Drawer: Chi tiết Báo cáo vi phạm */}
      <Drawer
        rootClassName="admin-reports-drawer"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AlertOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
            <span>
              {t('admin.reportDetailTitle', {
                defaultValue: 'Chi tiết báo cáo vi phạm',
              })}
            </span>
            {selectedReport && (
              <Tag
                color={selectedReport.type === 'post' ? 'blue' : 'purple'}
                style={{ margin: 0, fontSize: 11, fontWeight: 600 }}
              >
                {selectedReport.type.toUpperCase()}
              </Tag>
            )}
          </div>
        }
        open={isReportDrawerOpen}
        onClose={() => {
          setIsReportDrawerOpen(false);
          setSelectedReport(null);
        }}
        width={500}
      >
        {drawerLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} style={{ padding: 16 }} />
        ) : selectedReport ? (
          <div>
            <div className="drawer-compact-card">
              <div className="drawer-compact-row">
                <span className="drawer-compact-label">MÃ BÁO CÁO</span>
                <div className="drawer-compact-value">
                  <span className="id-text">{selectedReport.id}</span>
                  <Tooltip
                    title={t('admin.copyCode', { defaultValue: 'Sao chép mã' })}
                  >
                    <Button
                      type="text"
                      size="small"
                      aria-label={t('admin.copyCode', { defaultValue: 'Sao chép mã' })}
                      className="copy-action-btn"
                      icon={<CopyOutlined style={{ fontSize: 12 }} />}
                      onClick={() =>
                        void handleCopy(
                          selectedReport.id,
                          t('admin.reportId', { defaultValue: 'Mã báo cáo' }),
                        )
                      }
                    />
                  </Tooltip>
                </div>
              </div>

              <div className="drawer-compact-row">
                <span className="drawer-compact-label">PHÂN LOẠI</span>
                <div className="drawer-compact-value">
                  <Tag
                    color={selectedReport.type === 'post' ? 'blue' : 'purple'}
                    style={{ margin: 0 }}
                  >
                    {selectedReport.type.toUpperCase()}
                  </Tag>
                  <Tag
                    color={selectedReport.status === 'pending' ? 'gold' : 'green'}
                    style={{ margin: 0 }}
                  >
                    {selectedReport.status === 'pending'
                      ? 'Chờ xử lý'
                      : 'Đã giải quyết'}
                  </Tag>
                </div>
              </div>

              <div className="drawer-compact-row">
                <span className="drawer-compact-label">LÝ DO VI PHẠM</span>
                <div className="drawer-compact-value">
                  <span style={{ fontWeight: 600, color: '#f87171' }}>
                    {selectedReport.reason}
                  </span>
                </div>
              </div>

              <div className="drawer-compact-row">
                <span className="drawer-compact-label">NGƯỜI GỬI</span>
                <div className="drawer-compact-value">
                  {selectedReport.author}
                </div>
              </div>

              <div className="drawer-compact-row">
                <span className="drawer-compact-label">THỜI GIAN</span>
                <div className="drawer-compact-value">
                  {formatReportTimestamp(selectedReport.reportedAt)}
                </div>
              </div>

              {selectedReport.actionTaken && (
                <div className="drawer-compact-row">
                  <span className="drawer-compact-label">ĐÃ XỬ LÝ</span>
                  <div className="drawer-compact-value" style={{ color: '#34d399' }}>
                    {selectedReport.actionTaken} (bởi {selectedReport.moderator})
                  </div>
                </div>
              )}
            </div>

            <div className="drawer-payload-section" style={{ marginBottom: 20 }}>
              <div className="drawer-payload-header">
                <span className="drawer-payload-title">NỘI DUNG BÁO CÁO</span>
              </div>
              <div className="drawer-content-box">
                {selectedReport.content}
              </div>
            </div>

            {selectedReport.status === 'pending' && (
              <Button
                type="primary"
                block
                className="drawer-action-btn"
                icon={<LinkOutlined />}
                onClick={() => {
                  setIsReportDrawerOpen(false);
                  setSelectedReport(null);
                  navigate('/admin/management');
                }}
              >
                Chuyển tới trang Kiểm duyệt để xử lý vi phạm
              </Button>
            )}
          </div>
        ) : null}
      </Drawer>
    </section>
  );
}
