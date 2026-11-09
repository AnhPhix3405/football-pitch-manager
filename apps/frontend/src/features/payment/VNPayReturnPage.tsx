import { Button, Card, Descriptions, Result, Spin, Typography } from 'antd'
import {
  CheckCircleFilled,
  CloseCircleFilled,
  HomeOutlined,
  UnorderedListOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useVNPayReturn } from './hooks/useVNPayReturn'
import { formatPrice } from '../fields/field.data'

const { Text } = Typography

export function VNPayReturnPage() {
  const { t } = useTranslation()
  const { loading, hasParams, verification, error, rawParams } = useVNPayReturn()

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 450 }}>
        <Spin size="large" />
        <Text style={{ marginTop: 16 }}>
          {t('payment.return.verifying', { defaultValue: 'Đang xác thực kết quả thanh toán từ VNPay...' })}
        </Text>
      </div>
    )
  }

  // Trường hợp truy cập trực tiếp URL mà không có query parameters từ VNPay
  if (!hasParams) {
    return (
      <div className="user-page" style={{ maxWidth: 680, margin: '40px auto', padding: '0 20px' }}>
        <Card style={{ background: '#141414', borderColor: '#262626' }}>
          <Result
            status="info"
            icon={<InfoCircleOutlined style={{ color: '#38bdf8' }} />}
            title={t('payment.return.noTxTitle', { defaultValue: 'Chưa có thông tin phiên giao dịch' })}
            subTitle={t('payment.return.noTxDesc', {
              defaultValue:
                'Trang này tự động tiếp nhận dữ liệu phản hồi từ cổng VNPay sau khi thanh toán. Hiện chưa có phiên thanh toán nào được thực hiện.',
            })}
            extra={[
              <Link to="/bookings" key="bookings">
                <Button type="primary" icon={<UnorderedListOutlined />}>
                  {t('payment.return.goToBookings', { defaultValue: 'Xem danh sách đặt sân' })}
                </Button>
              </Link>,
              <Link to="/" key="home">
                <Button icon={<HomeOutlined />}>
                  {t('payment.return.goHome', { defaultValue: 'Về trang chủ' })}
                </Button>
              </Link>,
            ]}
          />
        </Card>
      </div>
    )
  }

  if (error || !verification) {
    return (
      <div className="user-page" style={{ maxWidth: 680, margin: '40px auto', padding: '0 20px' }}>
        <Card style={{ background: '#141414', borderColor: '#262626' }}>
          <Result
            status="error"
            icon={<CloseCircleFilled style={{ color: '#ef4444' }} />}
            title={t('payment.return.errorTitle', { defaultValue: 'Xác thực thanh toán thất bại' })}
            subTitle={error || t('payment.return.errorDesc', { defaultValue: 'Không thể xác thực thông tin phản hồi từ cổng thanh toán VNPay.' })}
            extra={[
              <Link to="/bookings" key="bookings">
                <Button type="primary">
                  {t('payment.return.goToBookings', { defaultValue: 'Xem danh sách đặt sân' })}
                </Button>
              </Link>,
              <Link to="/" key="home">
                <Button icon={<HomeOutlined />}>
                  {t('payment.return.goHome', { defaultValue: 'Về trang chủ' })}
                </Button>
              </Link>,
            ]}
          />
        </Card>
      </div>
    )
  }

  if (verification.isValid && verification.status === 'pending') {
    return <Result status="info" title={t('payment.settings.pending')}
      extra={<Link to="/bookings">{t('payment.return.goToBookings')}</Link>} />
  }

  const isSuccess = verification.isValid && verification.isSuccess

  return (
    <div className="user-page" style={{ maxWidth: 680, margin: '40px auto', padding: '0 20px' }}>
      <Card style={{ background: '#141414', borderColor: '#262626' }}>
        {isSuccess ? (
          <Result
            status="success"
            icon={<CheckCircleFilled style={{ color: '#8cfc70' }} />}
            title={t('payment.return.successTitle', { defaultValue: 'Thanh toán VNPay thành công!' })}
            subTitle={t('payment.return.successSubTitle', {
              defaultValue: 'Đơn đặt sân của bạn đã được thanh toán cọc thành công và cập nhật trạng thái.',
            })}
            extra={[
              <Link to="/bookings" key="bookings">
                <Button type="primary" icon={<UnorderedListOutlined />}>
                  {t('payment.return.viewBookings', { defaultValue: 'Lịch đặt sân của tôi' })}
                </Button>
              </Link>,
              <Link to="/" key="home">
                <Button icon={<HomeOutlined />}>
                  {t('payment.return.goHome', { defaultValue: 'Về trang chủ' })}
                </Button>
              </Link>,
            ]}
          />
        ) : (
          <Result
            status="warning"
            icon={<CloseCircleFilled style={{ color: '#f59e0b' }} />}
            title={t('payment.return.failedTitle', { defaultValue: 'Thanh toán không thành công' })}
            subTitle={
              rawParams.vnp_ResponseCode === '24'
                ? t('payment.return.cancelledByUser', { defaultValue: 'Bạn đã hủy bỏ giao dịch trên cổng thanh toán VNPay.' })
                : rawParams.vnp_ResponseCode === '51'
                  ? t('payment.return.insufficientFund', { defaultValue: 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.' })
                  : verification.message || t('payment.return.failedDefault', { defaultValue: 'Giao dịch không thành công hoặc xảy ra lỗi trong quá trình xử lý.' })
            }
            extra={[
              <Link to="/bookings" key="retry">
                <Button type="primary">
                  {t('payment.return.retryInBookings', { defaultValue: 'Quay lại đơn đặt sân' })}
                </Button>
              </Link>,
              <Link to="/" key="home">
                <Button icon={<HomeOutlined />}>
                  {t('payment.return.goHome', { defaultValue: 'Về trang chủ' })}
                </Button>
              </Link>,
            ]}
          />
        )}

        <Descriptions
          title={t('payment.return.txDetailsTitle', { defaultValue: 'Chi tiết giao dịch' })}
          bordered
          column={1}
          size="small"
          style={{ marginTop: 24 }}
        >
          <Descriptions.Item label={t('payment.return.amount', { defaultValue: 'Số tiền' })}>
            <strong style={{ color: isSuccess ? '#8cfc70' : '#f59e0b', fontSize: 16 }}>
              {formatPrice(verification.amount)}
            </strong>
          </Descriptions.Item>
          {verification.txnRef && (
            <Descriptions.Item label={t('payment.return.txnRef', { defaultValue: 'Mã tham chiếu' })}>
              <Text copyable className="font-mono">{verification.txnRef}</Text>
            </Descriptions.Item>
          )}
          {verification.transactionNo && (
            <Descriptions.Item label={t('payment.return.vnpayTxnNo', { defaultValue: 'Mã giao dịch VNPay' })}>
              <span className="font-mono">{verification.transactionNo}</span>
            </Descriptions.Item>
          )}
          {verification.bankCode && (
            <Descriptions.Item label={t('payment.return.bankCode', { defaultValue: 'Ngân hàng / Cổng' })}>
              {verification.bankCode}
            </Descriptions.Item>
          )}
          {rawParams.vnp_PayDate && (
            <Descriptions.Item label={t('payment.return.payDate', { defaultValue: 'Thời gian thanh toán' })}>
              {rawParams.vnp_PayDate.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$3/$2/$1 $4:$5:$6')}
            </Descriptions.Item>
          )}
        </Descriptions>

      </Card>
    </div>
  )
}
