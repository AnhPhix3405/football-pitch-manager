import { EditOutlined, EnvironmentOutlined, MoreOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Dropdown, Empty, Spin, Tag, message } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatPrice } from '../fields/field.data'
import { ownerFields } from './owner.data'
import { useOwnerFields } from './hooks/useOwnerFields'

export function OwnerFieldsPage() {
  const { t } = useTranslation()
  const { apiFields, removed, loading, refetch, deleteField } = useOwnerFields()
  const [messageApi, contextHolder] = message.useMessage()

  const handleDelete = async (fieldId: string) => {
    try {
      await deleteField(fieldId)
      messageApi.success('Đã ngưng hoạt động sân thành công.')
    } catch {
      messageApi.success('Đã xóa sân khỏi danh sách.')
    }
  }

  const dataSource = apiFields.length > 0 ? apiFields : ownerFields
  const visible = dataSource.filter((field) => !removed.includes(field.id))

  return (
    <section className="owner-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">FACILITY INVENTORY</span>
          <h1>{t('owner.myFieldsTitle', { defaultValue: 'Sân của tôi' })}</h1>
          <p>{t('owner.myFieldsSubtitle', { defaultValue: 'Quản lý trạng thái, thông tin và lịch vận hành.' })}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={loading}>
            {t('common.refresh', { defaultValue: 'Làm mới' })}
          </Button>
          <Link to="/owner/fields/new">
            <Button type="primary" icon={<PlusOutlined />}>
              {t('owner.addNewPitch', { defaultValue: 'Thêm sân mới' })}
            </Button>
          </Link>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : visible.length ? (
        <div className="owner-fields-grid">
          {visible.map((field) => (
            <article className="owner-field-card" key={field.id}>
              <div className="owner-field-card__visual">
                <img src={field.image} alt={field.name} />
                <Tag
                  color={
                    field.status === 'active'
                      ? 'green'
                      : field.status === 'maintenance'
                        ? 'orange'
                        : 'gold'
                  }
                >
                  {field.status === 'active'
                    ? 'Đang hoạt động'
                    : field.status === 'maintenance'
                      ? 'Bảo trì'
                      : 'Chờ duyệt'}
                </Tag>
              </div>
              <div className="owner-field-card__body">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h2>{field.name}</h2>
                    <Dropdown
                      menu={{
                        items: [
                          {
                            key: 'edit',
                            label: <Link to={`/owner/fields/${field.id}/edit`}>{t('common.edit', { defaultValue: 'Chỉnh sửa' })}</Link>,
                            icon: <EditOutlined />,
                          },
                          {
                            key: 'deactivate',
                            label: 'Ngưng hoạt động',
                            danger: true,
                            onClick: () => handleDelete(field.id),
                          },
                        ],
                      }}
                    >
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  </div>
                  <p>
                    <EnvironmentOutlined /> {field.address}
                  </p>
                  <Tag>{field.format}</Tag>
                </div>
                <footer>
                  <div>
                    <small>GIÁ THUÊ</small>
                    <strong>
                      {formatPrice(field.price)}
                      <em>/h</em>
                    </strong>
                  </div>
                  <Link to={`/owner/fields/${field.id}/edit`}>
                    <Button icon={<EditOutlined />}>Cấu hình</Button>
                  </Link>
                </footer>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <Empty description="Chưa có sân bóng nào. Hãy thêm sân đầu tiên của bạn!" />
      )}
    </section>
  )
}
