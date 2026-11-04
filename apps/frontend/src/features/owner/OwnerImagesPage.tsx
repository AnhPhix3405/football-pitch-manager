import { ArrowLeftOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { Breadcrumb, Button } from 'antd'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getOwnerFieldDetail } from './service/owner.service'
import { OwnerImagesManager } from './components/OwnerImagesManager'
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
    <section className="owner-page" style={{ padding: '24px 0' }}>
      <header className="user-page__head" style={{ marginBottom: 20 }}>
        <div>
          <Breadcrumb
            items={[
              { title: <Link to="/owner/fields">Sân của tôi</Link> },
              { title: field?.name || 'Chi tiết cụm sân' },
              { title: 'Thư viện hình ảnh' },
            ]}
            style={{ marginBottom: 8 }}
          />
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: 'var(--lime)' }}>📸</span>
            Thư viện hình ảnh {field ? `· ${field.name}` : ''}
          </h1>
          <p>
            {field?.address ? (
              <span>
                <EnvironmentOutlined /> {field.address}
                {field.district ? `, ${field.district}` : ''}
              </span>
            ) : (
              'Quản lý danh sách hình ảnh, đặt ảnh đại diện (thumbnail) và thứ tự hiển thị của cụm sân.'
            )}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/owner/fields')}>
            Quay lại
          </Button>
          <Link to={`/owner/fields/${fieldId}/courts`}>
            <Button>Quản lý sân con</Button>
          </Link>
          <Link to={`/owner/fields/${fieldId}/edit`}>
            <Button type="primary">Cấu hình cụm sân</Button>
          </Link>
        </div>
      </header>

      <OwnerImagesManager fieldId={fieldId} fieldName={field?.name} />
    </section>
  )
}
