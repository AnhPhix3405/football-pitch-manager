import { useState } from 'react'
import { CheckOutlined, DownloadOutlined, RocketOutlined } from '@ant-design/icons'
import { Button, Modal, Segmented, Table, Tag, Spin } from 'antd'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../fields/field.data'
import { transactions } from './owner.data'
import { useSubscription } from '../subscription/hooks/useSubscription'

export function OwnerSubscriptionPage() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'plan' | 'transactions'>('plan')
  const {
    plans,
    mySubscription,
    loading,
    subscribing,
    handleSubscribe,
    handleCancel,
  } = useSubscription()

  const defaultPlans = [
    {
      id: 'default-starter',
      name: 'Starter',
      price: '0',
      durationDays: 30,
      features: ['1 cụm sân', 'Quản lý lịch cơ bản', 'Báo cáo cơ bản'],
    },
    {
      id: 'default-pro',
      name: 'Pro Facility',
      price: '499000',
      durationDays: 30,
      features: ['Không giới hạn sân', 'Giá linh hoạt cao điểm', 'Báo cáo doanh thu nâng cao', 'Hỗ trợ ưu tiên 24/7'],
    },
    {
      id: 'default-enterprise',
      name: 'Enterprise',
      price: '1990000',
      durationDays: 30,
      features: ['Chuỗi nhiều chi nhánh', 'API kết nối riêng', 'Quản lý tài khoản VIP', 'Cam kết SLA 99.9%'],
    },
  ]

  const displayPlans = plans.length > 0 ? plans : defaultPlans

  const confirmCancel = (id: string) => {
    Modal.confirm({
      title: t('subscription.confirmCancelTitle', { defaultValue: 'Hủy gói hội viên?' }),
      content: t('subscription.confirmCancelContent', {
        defaultValue: 'Sau khi hủy, bạn vẫn có thể sử dụng quyền lợi đến hết thời hạn hiện tại.',
      }),
      okText: t('common.confirm', { defaultValue: 'Xác nhận hủy' }),
      okButtonProps: { danger: true },
      cancelText: t('common.cancel', { defaultValue: 'Đóng' }),
      onOk: () => handleCancel(id),
    })
  }

  return (
    <section className="owner-page">
      <header className="user-page__head">
        <div>
          <span className="eyebrow">{t('subscription.eyebrow', { defaultValue: 'BILLING NODE' })}</span>
          <h1>{t('subscription.title', { defaultValue: 'Gói dịch vụ & Giao dịch' })}</h1>
          <p>{t('subscription.subtitle', { defaultValue: 'Quản lý quyền lợi portal và dòng tiền của cơ sở.' })}</p>
        </div>
      </header>

      <Segmented
        value={tab}
        onChange={(val) => setTab(val as 'plan' | 'transactions')}
        options={[
          { value: 'plan', label: t('subscription.tabs.plan', { defaultValue: 'Gói dịch vụ' }) },
          { value: 'transactions', label: t('subscription.tabs.transactions', { defaultValue: 'Lịch sử giao dịch' }) },
        ]}
      />

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      ) : tab === 'plan' ? (
        <>
          <article className="current-plan">
            <div>
              <RocketOutlined />
              <span>
                <small>{t('subscription.currentPlanLabel', { defaultValue: 'GÓI HIỆN TẠI' })}</small>
                <h2>{mySubscription?.plan?.name || 'PRO FACILITY'}</h2>
                <p>
                  {mySubscription?.endDate
                    ? t('subscription.renewsOn', {
                        date: new Date(mySubscription.endDate).toLocaleDateString('vi-VN'),
                        defaultValue: `Hết hạn vào ${new Date(mySubscription.endDate).toLocaleDateString('vi-VN')}`,
                      })
                    : t('subscription.renewsOn', {
                        date: '22/11/2026',
                        defaultValue: 'Gia hạn vào 22/11/2026',
                      })}
                </p>
              </span>
            </div>
            <strong>
              {formatPrice(Number(mySubscription?.plan?.price || 499000))}
              <small>/tháng</small>
            </strong>
            {mySubscription?.id ? (
              <Button
                danger
                loading={subscribing}
                onClick={() => confirmCancel(mySubscription.id)}
              >
                {t('subscription.cancelBtn', { defaultValue: 'Hủy gói' })}
              </Button>
            ) : (
              <Button onClick={() => setTab('plan')}>
                {t('subscription.manageBtn', { defaultValue: 'Quản lý gói' })}
              </Button>
            )}
          </article>

          <div className="plan-grid">
            {displayPlans.map((plan) => {
              const isCurrent =
                mySubscription?.planId === plan.id ||
                (!mySubscription && plan.name === 'Pro Facility')

              const features =
                'features' in plan && Array.isArray(plan.features)
                  ? plan.features
                  : ['Quản lý cụm sân bóng', 'Báo cáo doanh thu', 'Hỗ trợ kỹ thuật']

              return (
                <article
                  className={plan.name === 'Pro Facility' ? 'featured' : ''}
                  key={plan.id}
                >
                  <h2>{plan.name}</h2>
                  <strong>{Number(plan.price) === 0 ? 'Miễn phí' : formatPrice(Number(plan.price))}</strong>
                  <ul>
                    {features.map((feature: string) => (
                      <li key={feature}>
                        <CheckOutlined /> {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    type={isCurrent ? 'primary' : 'default'}
                    block
                    loading={subscribing}
                    disabled={isCurrent}
                    onClick={() => handleSubscribe(plan.id)}
                  >
                    {isCurrent
                      ? t('subscription.inUse', { defaultValue: 'Đang sử dụng' })
                      : t('subscription.selectPlan', { defaultValue: 'Chọn gói' })}
                  </Button>
                </article>
              )
            })}
          </div>
        </>
      ) : (
        <Table
          rowKey="id"
          dataSource={transactions}
          columns={[
            { title: t('subscription.table.id', { defaultValue: 'MÃ GIAO DỊCH' }), dataIndex: 'id' },
            { title: t('subscription.table.date', { defaultValue: 'NGÀY' }), dataIndex: 'date' },
            { title: t('subscription.table.description', { defaultValue: 'NỘI DUNG' }), dataIndex: 'description' },
            {
              title: t('subscription.table.amount', { defaultValue: 'SỐ TIỀN' }),
              render: (_, item) => (
                <span className={item.amount > 0 ? 'lime' : ''}>{formatPrice(item.amount)}</span>
              ),
            },
            {
              title: t('subscription.table.status', { defaultValue: 'TRẠNG THÁI' }),
              render: (_, item) => <Tag color="green">{item.status}</Tag>,
            },
            {
              title: '',
              render: () => <Button icon={<DownloadOutlined />} aria-label="Tải hóa đơn" />,
            },
          ]}
        />
      )}
    </section>
  )
}
