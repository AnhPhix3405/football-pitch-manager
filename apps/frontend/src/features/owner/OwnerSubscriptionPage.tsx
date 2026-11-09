import { useRef, useState } from 'react'
import { CheckOutlined, DownloadOutlined, RocketOutlined } from '@ant-design/icons'
import { Button, Empty, Modal, Segmented, Table, Tag, Spin } from 'antd'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '../fields/field.data'
import { transactions } from './owner.data'
import { useSubscription } from '../subscription/hooks/useSubscription'

export function OwnerSubscriptionPage() {
  const { t, i18n } = useTranslation()
  const [tab, setTab] = useState<'plan' | 'transactions'>('plan')
  const [manageOpen, setManageOpen] = useState(false)
  const {
    plans,
    mySubscription,
    loading,
    subscribing,
    handleSubscribe,
    handleCancel,
  } = useSubscription()

  const plansRef = useRef<HTMLDivElement>(null)
  const currentSubscription =
    mySubscription?.status === 'active' || mySubscription?.status === 'pending_payment'
      ? mySubscription
      : null
  const currentPlan = currentSubscription?.plan ?? plans.find((plan) => plan.id === currentSubscription?.planId)

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
                <h2>{currentPlan?.name ?? t('owner.subscription.noCurrentPlan')}</h2>
                {currentSubscription?.endDate && (
                  <p>{t('subscription.renewsOn', {
                    date: new Intl.DateTimeFormat(i18n.language).format(new Date(currentSubscription.endDate)),
                  })}</p>
                )}
              </span>
            </div>
            {currentPlan && <strong>{formatPrice(Number(currentPlan.price))}</strong>}
            <Button onClick={() => setManageOpen(true)}>
              {t('subscription.manageBtn')}
            </Button>
          </article>

          <Modal
            title={t('subscription.manageBtn')}
            open={manageOpen}
            onCancel={() => setManageOpen(false)}
            footer={[
              <Button key="close" onClick={() => setManageOpen(false)}>{t('common.close')}</Button>,
              currentSubscription ? (
                <Button key="cancel-plan" danger onClick={() => {
                  setManageOpen(false)
                  confirmCancel(currentSubscription.id)
                }}>
                  {t('subscription.cancelBtn')}
                </Button>
              ) : (
                <Button key="view-plans" type="primary" onClick={() => {
                  setManageOpen(false)
                  plansRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' })
                  plansRef.current?.focus({ preventScroll: true })
                }}>
                  {t('owner.subscription.availablePlans')}
                </Button>
              ),
            ]}
          >
            <p>{currentPlan?.name ?? t('owner.subscription.noCurrentPlan')}</p>
          </Modal>

          <div ref={plansRef} tabIndex={-1} aria-label={t('owner.subscription.availablePlans')}>
            {plans.length === 0 && <Empty description={t('owner.subscription.noPlans')} />}
            <div className="plan-grid">
            {plans.map((plan) => {
              const isCurrent = currentSubscription?.planId === plan.id
              const features = Array.isArray(plan.benefit?.features)
                ? plan.benefit.features.filter((feature): feature is string => typeof feature === 'string')
                : []

              return (
                <article
                  className={plan.name === 'Pro Facility' ? 'featured' : ''}
                  key={plan.id}
                >
                  <h2>{plan.name}</h2>
                  <strong>{Number(plan.price) === 0 ? t('owner.subscription.free') : formatPrice(Number(plan.price))}</strong>
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
                    disabled={Boolean(currentSubscription)}
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
