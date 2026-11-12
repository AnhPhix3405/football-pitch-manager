import { ArrowLeftOutlined, DollarOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOwnerFieldDetail } from './service/owner.service'
import { OwnerPricingManager } from './components/OwnerPricingManager'
import { OwnerPageHeader } from './components/OwnerPageHeader'
import type { BackendFieldItem } from '../fields/service/field.service'

export function OwnerPricingPage() {
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
          { title: 'Quản lý bảng giá' },
        ]}
        icon={<DollarOutlined />}
        title={`Quản lý bảng giá & Tình trạng sân ${field ? `· ${field.name}` : ''}`}
        subtitle={
          field?.address ? (
            <span>
              <EnvironmentOutlined /> {field.address}
              {field.district ? `, ${field.district}` : ''}
            </span>
          ) : (
            'Cấu hình bảng giá theo loại sân (5, 7, 11), loại ngày (thường, cuối tuần, lễ) và khung giờ chống chồng chéo.'
          )
        }
        fieldId={fieldId}
        activeTabKey="pricing"
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/fields')}>
            Quay lại
          </Button>
        }
      />

      <OwnerPricingManager fieldId={fieldId} fieldName={field?.name} />
    </section>
  )
}
