import {
  CalendarOutlined,
  CameraOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateFilled,
  ThunderboltFilled,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Empty,
  Form,
  Input,
  Modal,
  Segmented,
  Select,
  Spin,
  Switch,
  Tabs,
  message,
} from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { useUserProfile } from '../../hooks/useUserProfile'
import { updateMyProfile } from '../owner/service/owner.service'
import type { MatchPost } from '../user/user.data'
import { useBookings, type BookingFilterType } from '../bookings/hooks/useBookings'
import { useMyPosts } from '../posts/hooks/useMyPosts'
import { deletePost } from '../posts/service/post.service'
import { PostCard } from '../posts/components/PostCard'
import { BookingCard } from '../bookings/components/BookingCard'
import { CreatePostModal } from '../posts/components/CreatePostModal'
import { BlurCircle } from '../../components/BlurCircle'
import { PillButton } from '../../components/PillButton'
import profilePanelBg from '../../assets/profile_panel.jpg'
import { ALLOWED_AVATAR_TYPES, MAX_AVATAR_SIZE } from './constants/profile.constant'
import type { PasswordForm, ProfileForm } from './interface/profile.types'

export function ProfileSettingsPage() {
  const { t, i18n } = useTranslation()
  const user = useAppSelector((state) => state.auth.user)
  const {
    profile,
    loading: profileLoading,
    updating: profileUpdating,
    uploadingAvatar,
    updatingLocation,
    updateProfile,
    uploadAvatar,
    updateLocation,
  } = useUserProfile()
  const [form] = Form.useForm<ProfileForm>()
  const [passwordForm] = Form.useForm<PasswordForm>()
  const [messageApi, contextHolder] = message.useMessage()
  const [notifications, setNotifications] = useState(true)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  // Booking history state & hook
  const { filter: bookingFilter, setFilter: setBookingFilter, visible: visibleBookings, cancel: cancelBooking } = useBookings()

  // Match post history state & hook
  const [postStatus, setPostStatus] = useState<MatchPost['status']>('open')
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false)
  const { apiPosts, loading: postsLoading, refetch: refetchPosts } = useMyPosts(postStatus)

  const visiblePosts = apiPosts

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'vi').toLowerCase().startsWith('en')
    ? 'en'
    : 'vi'

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        name: profile.fullName || user?.name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || '',
        bio: profile.bio || 'Thành viên cộng đồng bóng đá PitchMaster.',
        lat: profile.lat ?? undefined,
        lng: profile.lng ?? undefined,
      })
    } else if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        phone: '',
        bio: 'Thành viên cộng đồng bóng đá PitchMaster.',
        lat: undefined,
        lng: undefined,
      })
    }
  }, [profile, user, form])

  const save = async (values: ProfileForm) => {
    try {
      await updateProfile({
        fullName: values.name.trim(),
        phone: values.phone?.trim() || undefined,
        bio: values.bio?.trim() || undefined,
        lat:
          values.lat !== undefined && values.lat !== null && !isNaN(Number(values.lat))
            ? Number(values.lat)
            : undefined,
        lng:
          values.lng !== undefined && values.lng !== null && !isNaN(Number(values.lng))
            ? Number(values.lng)
            : undefined,
      })
      if (user?.role === 'owner') {
        await updateMyProfile({ businessName: values.name.trim() })
      }
      messageApi.success(t('profile.updateSuccess', { defaultValue: 'Hồ sơ đã được cập nhật thành công.' }))
    } catch {
      messageApi.error(t('profile.updateError', { defaultValue: 'Cập nhật hồ sơ thất bại. Vui lòng thử lại.' }))
    }
  }

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      messageApi.error(
        t('chat.invalidImageFormat', {
          defaultValue: 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP, GIF)',
        }),
      )
      return
    }
    if (file.size > MAX_AVATAR_SIZE) {
      messageApi.error(
        t('chat.imageSizeLimit', {
          defaultValue: 'Dung lượng ảnh tối đa là 10MB',
        }),
      )
      return
    }

    try {
      await uploadAvatar(file)
      messageApi.success(
        t('profile.avatarUploadSuccess', {
          defaultValue: 'Cập nhật ảnh đại diện thành công.',
        }),
      )
    } catch {
      messageApi.error(
        t('profile.avatarUploadFailed', {
          defaultValue: 'Tải ảnh đại diện thất bại. Vui lòng thử lại.',
        }),
      )
    }
  }

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      messageApi.error(
        t('profile.location.notSupported', {
          defaultValue: 'Trình duyệt không hỗ trợ Geolocation.',
        }),
      )
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          await updateLocation(latitude, longitude)
          form.setFieldsValue({ lat: latitude, lng: longitude })
          messageApi.success(
            t('profile.location.updateSuccess', {
              defaultValue: 'Cập nhật vị trí thành công.',
            }),
          )
        } catch {
          messageApi.error(
            t('profile.location.updateError', {
              defaultValue: 'Không thể lấy vị trí hiện tại của bạn.',
            }),
          )
        }
      },
      () => {
        messageApi.error(
          t('profile.location.updateError', {
            defaultValue: 'Không thể lấy vị trí hiện tại của bạn.',
          }),
        )
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const handlePasswordChange = async () => {
    messageApi.success(t('profile.passwordChanged', { defaultValue: 'Mật khẩu đã được thay đổi thành công.' }))
    setIsPasswordModalOpen(false)
    passwordForm.resetFields()
  }

  const handleLanguageSelect = async (lng: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('i18nextLng', lng)
      document.documentElement.lang = lng
    }
    await i18n.changeLanguage(lng)
    messageApi.success(t('language.switchSuccess', { defaultValue: 'Đã đổi ngôn ngữ thành công.' }))
  }


  const handleCancelBooking = (id: string) =>
    Modal.confirm({
      title: t('booking.cancelModal.title', { defaultValue: 'Hủy lịch đặt sân?' }),
      content: t('booking.cancelModal.content', { defaultValue: 'Lịch sẽ được chuyển sang trạng thái đã hủy.' }),
      okText: t('booking.cancelModal.ok', { defaultValue: 'Xác nhận hủy' }),
      okButtonProps: { danger: true },
      cancelText: t('booking.cancelModal.cancel', { defaultValue: 'Giữ lịch' }),
      onOk: () => {
        cancelBooking(id)
        messageApi.success(t('booking.cancelModal.success', { defaultValue: 'Đã hủy lịch đặt sân.' }))
      },
    })

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId)
      messageApi.success(t('posts.deleteSuccess', { defaultValue: 'Đã xóa bài đăng thành công.' }))
      refetchPosts()
    } catch (err: unknown) {
      messageApi.error(
        err instanceof Error ? err.message : t('posts.deleteModal.error', { defaultValue: 'Lỗi khi xóa bài đăng.' }),
      )
    }
  }

  const displayName =
    profile?.fullName?.trim() ||
    user?.name?.trim() ||
    user?.email?.split('@')[0] ||
    t('auth.guest', { defaultValue: 'Khách' })
  const initials = displayName.slice(0, 1).toUpperCase()

  // 1. Tab: Đặt sân
  const bookingsTab = (
    <div className="profile-tab-pane">
      <div className="profile-history-toolbar">
        <Segmented
          value={bookingFilter}
          onChange={(val) => setBookingFilter(val as BookingFilterType)}
          options={[
            { value: 'upcoming', label: t('booking.tabs.upcoming', { defaultValue: 'Sắp tới' }) },
            { value: 'pending', label: t('booking.tabs.pending', { defaultValue: 'Chờ xử lý' }) },
            { value: 'history', label: t('booking.tabs.history', { defaultValue: 'Lịch sử' }) },
          ]}
        />
        <Link to="/fields">
          <PillButton
            variant="primary"
            icon={<PlusOutlined />}
            text={t('booking.newBooking', { defaultValue: 'Đặt sân mới' })}
          />
        </Link>
      </div>

      {visibleBookings.length ? (
        <div className="booking-card-grid">
          {visibleBookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
            />
          ))}
        </div>
      ) : (
        <Empty description={t('profile.history.noBookings', { defaultValue: 'Chưa có lịch đặt sân nào.' })} />
      )}
    </div>
  )

  // 2. Tab: Bài đăng
  const postsTab = (
    <div className="profile-tab-pane">
      <div className="profile-history-toolbar">
        <Segmented
          value={postStatus}
          onChange={(val) => setPostStatus(val as MatchPost['status'])}
          options={[
            { value: 'open', label: t('posts.status.open', { defaultValue: 'Đang mở' }) },
            { value: 'matched', label: t('posts.status.matched', { defaultValue: 'Đã ghép' }) },
            { value: 'closed', label: t('posts.status.closed', { defaultValue: 'Đã đóng' }) },
          ]}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <PillButton
            variant="secondary"
            icon={<ReloadOutlined />}
            onClick={() => refetchPosts()}
            loading={postsLoading}
            text={t('common.refresh', { defaultValue: 'Làm mới' })}
          />
          <PillButton
            variant="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreatePostOpen(true)}
            text={t('posts.createPost', { defaultValue: 'Tạo bài đăng' })}
          />
        </div>
      </div>

      {postsLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : visiblePosts.length ? (
        <div className="post-grid">
          {visiblePosts.map((post) => (
            <PostCard post={post} manage key={post.id} onDelete={handleDeletePost} />
          ))}
        </div>
      ) : (
        <Empty description={t('profile.history.noPosts', { defaultValue: 'Chưa có bài đăng nào.' })} />
      )}
    </div>
  )

  // 3. Tab: Chỉnh sửa hồ sơ
  const editProfileTab = (
    <div className="profile-tab-pane">
      <Spin spinning={profileLoading}>
        <Form<ProfileForm>
          form={form}
          layout="vertical"
          className="settings-form standalone"
          onFinish={save}
          initialValues={{
            name: profile?.fullName || user?.name || 'Cầu thủ',
            email: profile?.email || user?.email || 'user@pitchmaster.vn',
            phone: profile?.phone || '',
            bio: profile?.bio || 'Thành viên cộng đồng bóng đá PitchMaster.',
          }}
        >
          <span className="eyebrow">IDENTITY RECORD</span>
          <h2>{t('profile.tabs.editProfile', { defaultValue: 'Chỉnh sửa hồ sơ' })}</h2>
          <Form.Item
            label="TÊN HIỂN THỊ"
            name="name"
            rules={[{ required: true, message: t('profile.nameRequired', { defaultValue: 'Vui lòng nhập tên hiển thị.' }) }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>
          <Form.Item
            label="EMAIL"
            name="email"
            rules={[{ required: true }, { type: 'email', message: 'Email không hợp lệ.' }]}
          >
            <Input prefix={<MailOutlined />} disabled />
          </Form.Item>
          <Form.Item
            label={t('profile.phoneLabel', { defaultValue: 'SỐ ĐIỆN THOẠI' })}
            name="phone"
          >
            <Input prefix={<PhoneOutlined />} placeholder={t('profile.phonePlaceholder', { defaultValue: 'Nhập số điện thoại liên hệ' })} />
          </Form.Item>
          <Form.Item label="GIỚI THIỆU" name="bio" rules={[{ max: 240, message: 'Giới thiệu tối đa 240 ký tự.' }]}>
            <Input.TextArea rows={4} showCount maxLength={240} />
          </Form.Item>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Form.Item
              label={t('profile.location.lat', { defaultValue: 'Vĩ độ (Lat)' })}
              name="lat"
            >
              <Input
                type="number"
                step="0.000001"
                prefix={<EnvironmentOutlined />}
                placeholder="10.762622"
              />
            </Form.Item>
            <Form.Item
              label={t('profile.location.lng', { defaultValue: 'Kinh độ (Lng)' })}
              name="lng"
            >
              <Input
                type="number"
                step="0.000001"
                prefix={<EnvironmentOutlined />}
                placeholder="106.660172"
              />
            </Form.Item>
          </div>
          <div style={{ marginBottom: 20 }}>
            <Button
              icon={<CompassOutlined />}
              loading={updatingLocation}
              onClick={handleGetCurrentLocation}
            >
              {t('profile.location.getCurrent', { defaultValue: 'Lấy vị trí hiện tại' })}
            </Button>
          </div>
          <PillButton
            type="submit"
            variant="primary"
            loading={profileUpdating}
            text={t('common.save', { defaultValue: 'Lưu thay đổi' })}
          />
        </Form>
      </Spin>
    </div>
  )

  // 4. Tab: Tùy chọn
  const preferencesTab = (
    <div className="profile-tab-pane">
      <div className="settings-form standalone">
        <span className="eyebrow">SYSTEM PREFERENCES</span>
        <h2>{t('profile.tabs.preferences', { defaultValue: 'Tùy chọn' })}</h2>
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
        <PillButton
          variant="primary"
          onClick={() => messageApi.success('Đã lưu tùy chọn.')}
          text={t('common.save', { defaultValue: 'Lưu tùy chọn' })}
        />
      </div>
    </div>
  )

  return (
    <div className="profile-page-wrapper">
      <BlurCircle variant="lime" size={540} left="-10%" bottom="0%" blur={130} opacity={0.32} />
      <BlurCircle variant="emerald" size={580} right="-8%" top="30%" blur={120} opacity={0.25} />
      {contextHolder}

      {/* Full-width Hero Card with stadium background banner */}
      <div className="profile-hero-card profile-hero-card--fullwidth">
        <div
          className="profile-hero-card__banner"
          style={{ backgroundImage: `url(${profilePanelBg})` }}
        >
          <div className="profile-hero-card__banner-overlay" />
          <div className="profile-hero-card__banner-glow" />
        </div>

        <div className="profile-hero-card__container">
          <div className="profile-hero-card__body">
            {/* Circular Avatar */}
            <div className="profile-hero-card__avatar-box">
              <div className="profile-hero-card__avatar-circle">
                <Spin spinning={uploadingAvatar}>
                  <Avatar
                    size={156}
                    shape="circle"
                    src={profile?.avatarUrl || undefined}
                    className="profile-hero-card__avatar"
                  >
                    {initials}
                  </Avatar>
                </Spin>
              </div>
            </div>

            {/* Profile Info & Actions */}
            <div className="profile-hero-card__main-info">
              <div className="profile-hero-card__title-row">
                <h2 className="profile-hero-card__name">{displayName}</h2>
                <span className="profile-hero-card__pro-tag">
                  <ThunderboltFilled /> {user?.role ? user.role.toUpperCase() : 'USER'}
                </span>
              </div>
              <p className="profile-hero-card__bio">
                {profile?.bio || 'Thành viên cộng đồng bóng đá PitchMaster.'} · {profile?.email || user?.email}
              </p>

              <div className="profile-hero-card__actions">
                <input
                  type="file"
                  ref={avatarInputRef}
                  accept={ALLOWED_AVATAR_TYPES.join(',')}
                  style={{ display: 'none' }}
                  onChange={handleAvatarSelect}
                />
                <Button
                  type="primary"
                  icon={<CameraOutlined />}
                  loading={uploadingAvatar}
                  className="profile-btn-primary"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  {t('profile.changeAvatar', { defaultValue: 'Đổi ảnh đại diện' })}
                </Button>
                <Button
                  icon={<LockOutlined />}
                  className="profile-btn-secondary"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  {t('profile.changePassword', { defaultValue: 'Đổi mật khẩu' })}
                </Button>
              </div>
            </div>

            {/* Right Statistics Box */}
            <div className="profile-hero-card__stats">
              <div className="profile-stat-item">
                <span className="profile-stat-item__label">
                  {t('profile.stats.bookings', { defaultValue: 'Đặt sân' })}
                </span>
                <b className="profile-stat-item__value">{visibleBookings.length}</b>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-item__label">
                  {t('profile.stats.posts', { defaultValue: 'Bài đăng' })}
                </span>
                <b className="profile-stat-item__value">{visiblePosts.length}</b>
              </div>
              <div className="profile-stat-item">
                <span className="profile-stat-item__label">
                  {t('profile.stats.rating', { defaultValue: 'Đánh giá' })}
                </span>
                <b className="profile-stat-item__value">5.0 ★</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top-level Tabs placed inside centered content container */}
      <div className="profile-content-container">
        <Tabs
          className="profile-portfolio-tabs"
          items={[
            {
              key: 'bookings',
              label: (
                <span>
                  <CalendarOutlined /> {t('profile.tabs.bookings', { defaultValue: 'Đặt sân' })}
                </span>
              ),
              children: bookingsTab,
            },
            {
              key: 'posts',
              label: (
                <span>
                  <UserOutlined /> {t('profile.tabs.posts', { defaultValue: 'Bài đăng' })}
                </span>
              ),
              children: postsTab,
            },
            {
              key: 'editProfile',
              label: (
                <span>
                  <SafetyCertificateFilled />{' '}
                  {t('profile.tabs.editProfile', { defaultValue: 'Chỉnh sửa hồ sơ' })}
                </span>
              ),
              children: editProfileTab,
            },
            {
              key: 'preferences',
              label: (
                <span>
                  <ThunderboltFilled />{' '}
                  {t('profile.tabs.preferences', { defaultValue: 'Tùy chọn' })}
                </span>
              ),
              children: preferencesTab,
            },
          ]}
        />
      </div>

      {/* Modal Đổi mật khẩu */}
      <Modal
        open={isPasswordModalOpen}
        title={t('profile.changePassword', { defaultValue: 'Đổi mật khẩu' })}
        onCancel={() => {
          setIsPasswordModalOpen(false)
          passwordForm.resetFields()
        }}
        onOk={() => passwordForm.submit()}
        okText={t('common.confirm', { defaultValue: 'Xác nhận' })}
        cancelText={t('common.cancel', { defaultValue: 'Hủy' })}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handlePasswordChange}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="MẬT KHẨU HIỆN TẠI"
            name="current"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            label="MẬT KHẨU MỚI"
            name="next"
            rules={[{ required: true, min: 8, message: 'Cần ít nhất 8 ký tự.' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
          <Form.Item
            label="XÁC NHẬN MẬT KHẨU MỚI"
            name="confirm"
            dependencies={['next']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('next') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'))
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>
        </Form>
      </Modal>

      <CreatePostModal
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSuccess={() => refetchPosts()}
      />
    </div>
  )
}
