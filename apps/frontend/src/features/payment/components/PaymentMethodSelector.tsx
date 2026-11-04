import { CreditCardOutlined, DollarCircleOutlined } from '@ant-design/icons'
import { Card, Radio, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { PAYMENT_METHOD, type PaymentMethod } from '../constants/payment.constant'

const { Text } = Typography

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  disabled?: boolean
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="payment-method-selector" style={{ marginTop: 16, marginBottom: 16 }}>
      <Text strong style={{ display: 'block', marginBottom: 8 }}>
        {t('payment.selector.title', { defaultValue: 'Phương thức thanh toán' })}
      </Text>

      <Radio.Group
        value={value}
        onChange={(e) => onChange(e.target.value as PaymentMethod)}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Card
            hoverable
            size="small"
            style={{
              borderColor: value === PAYMENT_METHOD.VNPAY ? '#8cfc70' : '#303030',
              background: value === PAYMENT_METHOD.VNPAY ? 'rgba(140, 252, 112, 0.05)' : '#1a1a1a',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onClick={() => !disabled && onChange(PAYMENT_METHOD.VNPAY)}
          >
            <Radio value={PAYMENT_METHOD.VNPAY} style={{ width: '100%' }}>
              <Space direction="vertical" size={2}>
                <Space>
                  <CreditCardOutlined style={{ color: '#0066cc', fontSize: 18 }} />
                  <Text strong>
                    {t('payment.selector.vnpayTitle', { defaultValue: 'Cổng thanh toán VNPay' })}
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', paddingLeft: 24 }}>
                  {t('payment.selector.vnpayDesc', {
                    defaultValue: 'Quét mã QR, Thẻ ATM nội địa, Internet Banking hoặc Thẻ Quốc tế.',
                  })}
                </Text>
              </Space>
            </Radio>
          </Card>

          <Card
            hoverable
            size="small"
            style={{
              borderColor: value === PAYMENT_METHOD.CASH ? '#8cfc70' : '#303030',
              background: value === PAYMENT_METHOD.CASH ? 'rgba(140, 252, 112, 0.05)' : '#1a1a1a',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            onClick={() => !disabled && onChange(PAYMENT_METHOD.CASH)}
          >
            <Radio value={PAYMENT_METHOD.CASH} style={{ width: '100%' }}>
              <Space direction="vertical" size={2}>
                <Space>
                  <DollarCircleOutlined style={{ color: '#8cfc70', fontSize: 18 }} />
                  <Text strong>
                    {t('payment.selector.cashTitle', { defaultValue: 'Thanh toán tiền mặt' })}
                  </Text>
                </Space>
                <Text type="secondary" style={{ fontSize: 13, display: 'block', paddingLeft: 24 }}>
                  {t('payment.selector.cashDesc', {
                    defaultValue: 'Thanh toán trực tiếp cho ban quản lý sân trước giờ bắt đầu thi đấu.',
                  })}
                </Text>
              </Space>
            </Radio>
          </Card>
        </Space>
      </Radio.Group>
    </div>
  )
}
