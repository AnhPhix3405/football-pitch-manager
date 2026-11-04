import {
  CalendarOutlined,
  CopyOutlined,
  ReloadOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Spin,
  Switch,
  TimePicker,
  message,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { useEffect, useState } from 'react'
import { useOwnerOpeningHours } from '../hooks/useOwnerOpeningHours'
import type { OpeningHourInput } from '../interface/owner-field.types'
import './OwnerOpeningHoursManager.css'

export interface OwnerOpeningHoursManagerProps {
  fieldId: string
  fieldName?: string
}

const DAY_NAMES: Record<number, string> = {
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
  7: 'Chủ Nhật',
}

interface RowState {
  dayOfWeek: number
  openTime: Dayjs
  closeTime: Dayjs
  isClosed: boolean
}

export function OwnerOpeningHoursManager({ fieldId }: OwnerOpeningHoursManagerProps) {
  const { hours, loading, error, loadHours, saveOpeningHours } = useOwnerOpeningHours(fieldId)
  const [rows, setRows] = useState<RowState[]>([])
  const [saving, setSaving] = useState(false)

  // Initialize 7 days state
  useEffect(() => {
    const initialRows: RowState[] = [1, 2, 3, 4, 5, 6, 7].map((day) => {
      const existing = hours.find((h) => h.dayOfWeek === day)
      const openStr = existing?.openTime ? existing.openTime.slice(0, 5) : '06:00'
      const closeStr = existing?.closeTime ? existing.closeTime.slice(0, 5) : day >= 6 ? '23:00' : '22:00'

      return {
        dayOfWeek: day,
        openTime: dayjs(openStr, 'HH:mm'),
        closeTime: dayjs(closeStr, 'HH:mm'),
        isClosed: existing?.isClosed ?? false,
      }
    })
    setRows(initialRows)
  }, [hours])

  const handleTimeChange = (day: number, type: 'open' | 'close', val: Dayjs | null) => {
    if (!val) return
    setRows((prev) =>
      prev.map((r) =>
        r.dayOfWeek === day
          ? {
              ...r,
              [type === 'open' ? 'openTime' : 'closeTime']: val,
            }
          : r,
      ),
    )
  }

  const handleToggleClosed = (day: number, checked: boolean) => {
    setRows((prev) =>
      prev.map((r) =>
        r.dayOfWeek === day
          ? {
              ...r,
              isClosed: checked,
            }
          : r,
      ),
    )
  }

  const handleApplyToAll = () => {
    const monday = rows.find((r) => r.dayOfWeek === 1)
    if (!monday) return
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        openTime: monday.openTime,
        closeTime: monday.closeTime,
        isClosed: monday.isClosed,
      })),
    )
    message.success('Đã sao chép khung giờ của Thứ Hai cho cả tuần!')
  }

  const handleSave = async () => {
    // Validate: When !isClosed, openTime < closeTime
    for (const r of rows) {
      if (!r.isClosed) {
        if (!r.openTime.isBefore(r.closeTime)) {
          message.error(
            `Giờ mở cửa của ${DAY_NAMES[r.dayOfWeek]} (${r.openTime.format('HH:mm')}) phải sớm hơn giờ đóng cửa (${r.closeTime.format('HH:mm')}).`,
          )
          return
        }
      }
    }

    try {
      setSaving(true)
      const payload: OpeningHourInput[] = rows.map((r) => ({
        dayOfWeek: r.dayOfWeek,
        openTime: r.openTime.format('HH:mm'),
        closeTime: r.closeTime.format('HH:mm'),
        isClosed: r.isClosed,
      }))

      await saveOpeningHours({ hours: payload })
      message.success('Đã lưu cấu hình giờ mở cửa 7 ngày trong tuần thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu giờ mở cửa'
      message.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="oohm-container">
      <div className="oohm-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ color: 'var(--white)', margin: '0 0 4px 0', fontSize: 16 }}>
              Cấu hình giờ hoạt động 7 ngày (Opening Hours - FIELD-06)
            </h3>
            <span style={{ fontSize: 12, color: 'var(--sage)' }}>
              Cập nhật nguyên tử toàn bộ lịch tuần từ Thứ Hai đến Chủ Nhật.
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <Button icon={<CopyOutlined />} onClick={handleApplyToAll}>
              Áp dụng Thứ Hai cho cả tuần
            </Button>
            <Button icon={<ReloadOutlined />} loading={loading} onClick={() => void loadHours()}>
              Làm mới
            </Button>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={handleSave}>
              Lưu cấu hình tuần
            </Button>
          </div>
        </div>

        {error && <Alert type="error" message={error} showIcon />}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 12, color: 'var(--sage)' }}>Đang tải lịch mở cửa...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rows.map((row) => (
              <div className="oohm-day-row" key={row.dayOfWeek}>
                <div className="oohm-day-name">
                  <CalendarOutlined style={{ color: 'var(--lime)' }} />
                  <span>{DAY_NAMES[row.dayOfWeek]}</span>
                </div>

                <div className="oohm-time-inputs">
                  <span style={{ color: 'var(--sage)', fontSize: 12 }}>Mở cửa:</span>
                  <TimePicker
                    value={row.openTime}
                    format="HH:mm"
                    minuteStep={15}
                    disabled={row.isClosed}
                    onChange={(val) => handleTimeChange(row.dayOfWeek, 'open', val)}
                  />
                  <span style={{ color: 'var(--sage)', fontSize: 12 }}>Đóng cửa:</span>
                  <TimePicker
                    value={row.closeTime}
                    format="HH:mm"
                    minuteStep={15}
                    disabled={row.isClosed}
                    onChange={(val) => handleTimeChange(row.dayOfWeek, 'close', val)}
                  />
                </div>

                <div className="oohm-status-toggle">
                  <span style={{ fontSize: 12, color: row.isClosed ? 'var(--muted)' : 'var(--lime)' }}>
                    {row.isClosed ? 'Đóng cửa / Nghỉ' : 'Mở cửa đón khách'}
                  </span>
                  <Switch
                    checked={row.isClosed}
                    onChange={(checked) => handleToggleClosed(row.dayOfWeek, checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
