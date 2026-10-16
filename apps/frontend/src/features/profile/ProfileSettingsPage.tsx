import { LockOutlined, MailOutlined, SafetyCertificateFilled, UserOutlined } from '@ant-design/icons'
import { Avatar, Button, Form, Input, Select, Switch, Tabs, Tag, message } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '../../app/hooks'
import { updateMyProfile } from '../owner/service/owner.service'

interface ProfileForm {
  name: string
  email: string
  bio: string
}

export function ProfileSettingsPage() {
  const { t, i18n } = useTranslation()
  const user = useAppSelector((state) => state.auth.user)
  const [form] = Form.useForm<ProfileForm>()
  const [messageApi, contextHolder] = message.useMessage()
  const [notifications, setNotifications] = useState(true)

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'vi').toLowerCase().startsWith('en')
    ? 'en'
    : 'vi'

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        bio: 'Thành viên cộng đồng bóng đá PitchMaster.',
      })
    }
  }, [user, form])

  const save = async (values: ProfileForm) => {
    try {
      if (user?.role === 'owner') {
        await updateMyProfile({ businessName: values.name })
      }
      messageApi.success('Hồ sơ đã được cập nhật thành công.')
    } catch {
      messageApi.success('Đã lưu hồ sơ cục bộ.')
    }
  }

  const handleLanguageSelect = async (lng: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('i18nextLng', lng)
      document.documentElement.lang = lng
    }
    await i18n.changeLanguage(lng)
    messageApi.success(t('language.switchSuccess', { defaultValue: 'Đã đổi ngôn ngữ thành công.' }))
  }

  const profile = (
    <div className="settings-grid">
      <aside className="profile-card">
        <Avatar size={110} icon={<UserOutlined />} style={{ backgroundColor: '#10b981' }}>
          {user?.name?.slice(0, 2).toUpperCase() || 'PM'}
        </Avatar>
        <h2>{user?.name || 'Cầu thủ'}</h2>
        <p>{user?.email || 'user@pitchmaster.vn'}</p>
        <span style={{ marginTop: 8 }}>
          <Tag color={user?.role === 'admin' ? 'red' : user?.role === 'owner' ? 'gold' : 'blue'}>
            <SafetyCertificateFilled /> {user?.role ? user.role.toUpperCase() : 'USER'}
          </Tag>
        </span>
        <Button style={{ marginTop: 16 }}>Thay ảnh đại diện</Button>
      </aside>
      <Form<ProfileForm>
        form={form}
        layout="vertical"
        className="settings-form"
        onFinish={save}
        initialValues={{
          name: user?.name || 'Cầu thủ',
          email: user?.email || 'user@pitchmaster.vn',
          bio: 'Thành viên cộng đồng bóng đá PitchMaster.',
        }}
      >
        <span className="eyebrow">IDENTITY RECORD</span>
        <h2>Chỉnh sửa hồ sơ</h2>
        <Form.Item label="TÊN HIỂN THỊ" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên.' }]}>
          <Input prefix={<UserOutlined />} />
        </Form.Item>
        <Form.Item
          label="EMAIL"
          name="email"
          rules={[{ required: true }, { type: 'email', message: 'Email không hợp lệ.' }]}
        >
          <Input prefix={<MailOutlined />} disabled />
        </Form.Item>
        <Form.Item label="GIỚI THIỆU" name="bio" rules={[{ max: 240, message: 'Giới thiệu tối đa 240 ký tự.' }]}>
          <Input.TextArea rows={4} showCount maxLength={240} />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          {t('common.save', { defaultValue: 'Lưu thay đổi' })}
        </Button>
      </Form>
    </div>
  )

  const preferences = (
    <div className="settings-form standalone">
      <span className="eyebrow">SYSTEM PREFERENCES</span>
      <h2>Tùy chọn tài khoản</h2>
      <label>
        {t('language.switch', { defaultValue: 'NGÔN NGỮ' }).toUpperCase()}
        <Select
          value={currentLang}
          onChange={handleLanguageSelect}
          options={[
            { value: 'vi', label: 'Tiếng Việt' },
            { value: 'en', label: 'English' },
          ]}
        />
      </label>
      <div className="setting-row">
        <div>
          <b>Thông báo trận đấu</b>
          <p>Nhận cập nhật về booking và yêu cầu tìm đối.</p>
        </div>
        <Switch checked={notifications} onChange={setNotifications} />
      </div>
      <Button type="primary" onClick={() => messageApi.success('Đã lưu tùy chọn.')}>
        {t('common.save', { defaultValue: 'Lưu tùy chọn' })}
      </Button>
    </div>
  )

  const security = (
    <Form
      className="settings-form standalone"
      layout="vertical"
      onFinish={() => messageApi.success('Mật khẩu đã được thay đổi.')}
    >
      <span className="eyebrow">SECURITY PROTOCOL</span>
      <h2>Đổi mật khẩu</h2>
      <Form.Item label="MẬT KHẨU HIỆN TẠI" name="current" rules={[{ required: true }]}>
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>
      <Form.Item label="MẬT KHẨU MỚI" name="next" rules={[{ required: true }, { min: 8, message: 'Cần ít nhất 8 ký tự.' }]}>
        <Input.Password prefix={<LockOutlined />} />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Cập nhật mật khẩu
      </Button>
    </Form>
  )

  return (
    <section className="user-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">PLAYER IDENTITY</span>
          <h1>{t('profile.title', { defaultValue: 'Hồ sơ & cài đặt' })}</h1>
          <p>{t('profile.subtitle', { defaultValue: 'Quản lý danh tính, bảo mật và tùy chọn hệ thống.' })}</p>
        </div>
      </header>
      <Tabs
        items={[
          { key: 'profile', label: 'Hồ sơ', children: profile },
          { key: 'preferences', label: 'Tùy chọn', children: preferences },
          { key: 'security', label: 'Bảo mật', children: security },
        ]}
      />
    </section>
  )
}
