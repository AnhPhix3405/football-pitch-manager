import { ArrowLeftOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOwnerFieldDetail } from './service/owner.service'
import { OwnerOpeningHoursManager } from './components/OwnerOpeningHoursManager'
import { OwnerPageHeader } from './components/OwnerPageHeader'
import type { BackendFieldItem } from '../fields/service/field.service'

export function OwnerOpeningHoursPage() {
  const { fieldId } = useParams<{ fieldId: string }>()
  const navigate = useNavigate()
  const [field, setField] = useState<BackendFieldItem | null>(null)

  useEffect(() => {
    if (!fieldId) return
    const loadField = async () => {
      try {
        const data = await getOwnerFieldDetail(fieldId)
        setField(data)
      } catch {
        // Ignored
      }
    }
    void loadField()
  }, [fieldId])

  if (!fieldId) {
    return (
      <section className="owner-page" style={{ padding: 24 }}>
        <p>Không tìm thấy mã cụm sân.</p>
        <Button onClick={() => navigate('/owner/fields')}>Quay lại danh sách</Button>
      </section>
    )
  }

  return (
    <section className="owner-page" style={{ padding: '16px 0' }}>
      <OwnerPageHeader
        breadcrumbs={[
          { title: 'Sân của tôi', href: '/owner/fields' },
          { title: field?.name || 'Chi tiết cụm sân' },
          { title: 'Giờ mở cửa' },
        ]}
        icon={<ClockCircleOutlined />}
        title={`Cấu hình giờ mở cửa theo tuần ${field ? `· ${field.name}` : ''}`}
        subtitle={
          field?.address ? (
            <span>
              <EnvironmentOutlined /> {field.address}
              {field.district ? `, ${field.district}` : ''}
            </span>
          ) : (
            'Thiết lập khung giờ đón khách tuần hoàn từ Thứ Hai đến Chủ Nhật cho toàn bộ cụm sân.'
          )
        }
        fieldId={fieldId}
        activeTabKey="hours"
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/fields')}>
            Quay lại
          </Button>
        }
      />

      <OwnerOpeningHoursManager fieldId={fieldId} fieldName={field?.name} />
    </section>
  )
}
