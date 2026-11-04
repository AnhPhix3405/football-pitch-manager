import { useState } from 'react'
import { Modal, Button, Typography, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { PAYMENT_METHOD, type PaymentMethod } from '../constants/payment.constant'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { usePayment } from '../hooks/usePayment'
import { formatPrice } from '../../fields/field.data'

const { Title, Text } = Typography

interface PaymentMethodModalProps {
  open: boolean
  bookingId: string
  bookingCode?: string
  amount: number
  onClose: () => void
  onSuccess?: () => void
}

export function PaymentMethodModal({
  open,
  bookingId,
  bookingCode,
  amount,
  onClose,
  onSuccess,
}: PaymentMethodModalProps) {
  const { t } = useTranslation()
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PAYMENT_METHOD.VNPAY)
  const { loading, processPayment } = usePayment()

  const handlePay = async () => {
    const result = await processPayment(
      bookingId,
      selectedMethod,
      `Thanh toan don dat san ${bookingCode || bookingId}`,
    )
    if (result) {
      if (selectedMethod === PAYMENT_METHOD.CASH) {
        onSuccess?.()
        onClose()
      }
    }
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={t('payment.modal.title', { defaultValue: 'Chọn hình thức thanh toán' })}
      centered
      width={480}
    >
      <div style={{ padding: '8px 0' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">{t('payment.modal.bookingCode', { defaultValue: 'Mã đặt sân:' })}</Text>
            <Text strong className="font-mono">{bookingCode || bookingId.slice(0, 8)}</Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">{t('payment.modal.amountToPay', { defaultValue: 'Số tiền thanh toán:' })}</Text>
            <Title level={4} style={{ margin: 0, color: '#8cfc70' }}>
              {formatPrice(amount)}
            </Title>
          </div>
        </Space>

        <PaymentMethodSelector
          value={selectedMethod}
          onChange={setSelectedMethod}
          disabled={loading}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          <Button onClick={onClose} disabled={loading}>
            {t('common.cancel', { defaultValue: 'Hủy bỏ' })}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handlePay}
            style={{ minWidth: 140 }}
          >
            {selectedMethod === PAYMENT_METHOD.VNPAY
              ? t('payment.modal.payVnpayBtn', { defaultValue: 'Thanh toán qua VNPay' })
              : t('payment.modal.payCashBtn', { defaultValue: 'Xác nhận tiền mặt' })}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
