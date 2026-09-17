import { CheckCircleFilled, ClockCircleOutlined, CreditCardOutlined } from '@ant-design/icons'
import { Alert, Button, Checkbox, DatePicker, Drawer, Radio, Result, Steps } from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useMemo, useState } from 'react'
import { formatPrice } from '../fields/field.data'
import type { FootballField } from '../fields/field.types'

const timeSlots = ['17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00']
const extras = [{ name: 'Thuê bóng thi đấu', price: 30000 }, { name: 'Nước uống cho đội', price: 50000 }, { name: 'Thuê áo bib', price: 40000 }]

export function BookingFlow({ field, open, onClose }: { field: FootballField; open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [date, setDate] = useState<Dayjs>(dayjs().add(1, 'day'))
  const [slot, setSlot] = useState<string>()
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [bookingCode, setBookingCode] = useState('')
  const extrasTotal = useMemo(() => extras.filter((extra) => selectedExtras.includes(extra.name)).reduce((sum, extra) => sum + extra.price, 0), [selectedExtras])
  const total = field.pricePerHour + extrasTotal
  const reset = () => { setStep(0); setSlot(undefined); setSelectedExtras([]); setBookingCode(''); onClose() }
  const confirm = () => { setSubmitting(true); window.setTimeout(() => { setBookingCode(crypto.randomUUID().slice(0, 6).toUpperCase()); setSubmitting(false); setStep(2) }, 800) }
  return <Drawer className="booking-drawer" title="Đặt sân trực tuyến" width={520} open={open} onClose={reset}><Steps current={step} size="small" items={[{ title: 'Chọn lịch' }, { title: 'Xác nhận' }, { title: 'Hoàn tất' }]} />{step === 0 && <div className="booking-step"><span className="eyebrow">01 / SCHEDULE</span><h2>Chọn khung giờ</h2><label>NGÀY THI ĐẤU<DatePicker value={date} onChange={(value) => value && setDate(value)} format="DD/MM/YYYY" disabledDate={(current) => current.isBefore(dayjs(), 'day')} /></label><label>KHUNG GIỜ CÒN TRỐNG<Radio.Group value={slot} onChange={(event) => setSlot(event.target.value)} className="time-grid">{timeSlots.map((time, index) => <Radio.Button value={time} disabled={index === 1} key={time}><ClockCircleOutlined /> {time}</Radio.Button>)}</Radio.Group></label><Alert type="info" showIcon message="Khung 18:00 - 19:00 vừa được người khác giữ chỗ." /><Button type="primary" block size="large" disabled={!slot} onClick={() => setStep(1)}>Tiếp tục</Button></div>}{step === 1 && <div className="booking-step"><span className="eyebrow">02 / CONFIRM</span><h2>Xác nhận đặt sân</h2><div className="booking-summary"><h3>{field.name}</h3><p>{date.format('dddd, DD/MM/YYYY')} · {slot}</p><dl><div><dt>Giá sân (1 giờ)</dt><dd>{formatPrice(field.pricePerHour)}</dd></div></dl></div><label>DỊCH VỤ THÊM<Checkbox.Group value={selectedExtras} onChange={(values) => setSelectedExtras(values as string[])}>{extras.map((extra) => <Checkbox value={extra.name} key={extra.name}><span>{extra.name}</span><b>+{formatPrice(extra.price)}</b></Checkbox>)}</Checkbox.Group></label><div className="booking-total"><span>TỔNG THANH TOÁN</span><strong>{formatPrice(total)}</strong></div><p className="charge-note"><CreditCardOutlined /> Bạn chưa bị tính phí. Thanh toán sẽ được xử lý ở bước tiếp theo.</p><div className="booking-buttons"><Button onClick={() => setStep(0)}>Quay lại</Button><Button type="primary" loading={submitting} onClick={confirm}>Xác nhận đặt sân</Button></div></div>}{step === 2 && <Result icon={<CheckCircleFilled style={{ color: '#8cfc70' }} />} status="success" title="Đặt sân thành công!" subTitle={`Mã đặt sân #PM-${bookingCode} · ${date.format('DD/MM/YYYY')} · ${slot}`} extra={<Button type="primary" onClick={reset}>Hoàn tất</Button>} />}</Drawer>
}
