import { ArrowLeftOutlined, EnvironmentOutlined, PictureOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getOwnerFieldDetail } from './service/owner.service'
import { OwnerImagesManager } from './components/OwnerImagesManager'
import { OwnerPageHeader } from './components/OwnerPageHeader'
import type { BackendFieldItem } from '../fields/service/field.service'

export function OwnerImagesPage() {
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
          { title: 'Thư viện hình ảnh' },
        ]}
        icon={<PictureOutlined />}
        title={`Thư viện hình ảnh ${field ? `· ${field.name}` : ''}`}
        subtitle={
          field?.address ? (
            <span>
              <EnvironmentOutlined /> {field.address}
              {field.district ? `, ${field.district}` : ''}
            </span>
          ) : (
            'Quản lý danh sách hình ảnh, đặt ảnh đại diện (thumbnail) và thứ tự hiển thị của cụm sân.'
          )
        }
        fieldId={fieldId}
        activeTabKey="images"
        actions={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/fields')}>
            Quay lại
          </Button>
        }
      />

      <OwnerImagesManager fieldId={fieldId} fieldName={field?.name} />
    </section>
  )
}
