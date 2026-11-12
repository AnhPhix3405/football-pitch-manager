import { AppstoreOutlined, ArrowLeftOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOwnerFieldDetail } from './service/owner.service'
import { OwnerCourtsManager } from './components/OwnerCourtsManager'
import { OwnerPageHeader } from './components/OwnerPageHeader'
import type { BackendFieldItem } from '../fields/service/field.service'

export function OwnerCourtsPage() {
  const { fieldId } = useParams<{ fieldId: string }>()
  const navigate = useNavigate()
  const [field, setField] = useState<BackendFieldItem | null>(null)
  const [, setLoading] = useState(true)

  useEffect(() => {
    if (!fieldId) return
    const loadField = async () => {
      try {
        setLoading(true)
        const data = await getOwnerFieldDetail(fieldId)
        setField(data)
      } catch {
        // Ignored
      } finally {
        setLoading(false)
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
          { title: 'Quản lý sân con' },
        ]}
        icon={<AppstoreOutlined />}
        title={`Quản lý sân con ${field ? `· ${field.name}` : ''}`}
        subtitle={
          field?.address ? (
            <span>
              <EnvironmentOutlined /> {field.address}
              {field.district ? `, ${field.district}` : ''}
            </span>
          ) : (
            'Cấu hình danh sách sân 5, 7, 11 và trạng thái vận hành của từng sân con.'
          )
        }
        fieldId={fieldId}
        activeTabKey="courts"
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/fields')}>
            Quay lại
          </Button>
        }
      />

      <OwnerCourtsManager fieldId={fieldId} fieldName={field?.name} />
    </section>
  )
}
