import {
  AppstoreOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import type { AdminFieldKpi } from '../interface/admin-field.interface';

interface FieldKpiCardsProps {
  kpi: AdminFieldKpi | null;
  loading: boolean;
}

export function FieldKpiCards({ kpi, loading }: FieldKpiCardsProps) {
  const { t } = useTranslation();

  const cards = [
    {
      title: t('adminFields.kpiTotal', { defaultValue: 'TỔNG SỐ CỤM SÂN' }),
      value: kpi?.totalFields ?? 0,
      icon: <AppstoreOutlined style={{ color: '#38bdf8', fontSize: 20 }} />,
      color: '#38bdf8',
    },
    {
      title: t('adminFields.kpiActive', { defaultValue: 'ĐANG HOẠT ĐỘNG' }),
      value: kpi?.activeFields ?? 0,
      icon: <CheckCircleOutlined style={{ color: '#10b981', fontSize: 20 }} />,
      color: '#10b981',
    },
    {
      title: t('adminFields.kpiInactive', { defaultValue: 'TẠM NGƯNG / KHÓA' }),
      value: kpi?.inactiveFields ?? 0,
      icon: <StopOutlined style={{ color: '#f43f5e', fontSize: 20 }} />,
      color: '#f43f5e',
    },
    {
      title: t('adminFields.kpiCourts', { defaultValue: 'TỔNG SỐ SÂN CON' }),
      value: kpi?.totalCourts ?? 0,
      icon: <ThunderboltOutlined style={{ color: '#fbbf24', fontSize: 20 }} />,
      color: '#fbbf24',
    },
  ];

  return (
    <div className="admin-fields-kpi-grid">
      {cards.map((card, idx) => (
        <div key={idx} className="admin-fields-kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">{card.title}</span>
            <div className="kpi-icon-wrap" style={{ background: `${card.color}15` }}>
              {card.icon}
            </div>
          </div>
          {loading ? (
            <Skeleton.Input active size="small" style={{ width: 60, marginTop: 8 }} />
          ) : (
            <div className="kpi-card-value" style={{ color: card.color }}>
              {card.value}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
