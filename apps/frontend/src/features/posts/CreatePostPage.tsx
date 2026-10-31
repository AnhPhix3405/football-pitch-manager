import {
  ArrowLeftOutlined,
  CameraOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  FireOutlined,
  SendOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  DatePicker,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Spin,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { type ChangeEvent, type DragEvent, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { PillButton } from '~/components/PillButton'
import {
  DEFAULT_POST_MAX_PLAYERS,
  MAX_POST_PLAYERS,
  MIN_POST_PLAYERS,
  POST_AFTERNOON_EVENING_SLOTS,
  POST_MORNING_SLOTS,
  POST_SKILL_LEVEL_OPTIONS,
} from '~/constants/post.constant'
import { useCreatePost } from '~/hooks/useCreatePost'
import { isSlotExpired } from './utils/post.utils'

interface FormValues {
  title: string
  content?: string
  playDate: dayjs.Dayjs
  timeSlot: string
  skillLevelRequired: string
  maxPlayers: number
  location?: string
}

export function CreatePostPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [messageApi, contextHolder] = message.useMessage()
  const [form] = Form.useForm<FormValues>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const selectedDate = Form.useWatch('playDate', form)
  const {
    submitting,
    uploadingImage,
    imagePreviewUrl,
    selectImage,
    removeImage,
    submitPost,
  } = useCreatePost()

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        messageApi.error(t('posts.createPage.invalidImage', { defaultValue: 'Vui lòng chọn tệp hình ảnh (PNG, JPG, WebP).' }))
        return
      }
      selectImage(file)
    }
    e.target.value = ''
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        messageApi.error(t('posts.createPage.invalidImage', { defaultValue: 'Vui lòng chọn tệp hình ảnh (PNG, JPG, WebP).' }))
        return
      }
      selectImage(file)
    }
  }

  const handleFinish = async (values: FormValues) => {
    try {
      const created = await submitPost({
        title: values.title,
        content: values.content,
        playDate: values.playDate.format('YYYY-MM-DD'),
        timeSlot: values.timeSlot,
        skillLevelRequired: values.skillLevelRequired,
        maxPlayers: values.maxPlayers,
        location: values.location,
      })

      messageApi.success(
        t('posts.createPage.success', { defaultValue: 'Đăng bài tìm đối thành công!' }),
      )

      setTimeout(() => {
        navigate(`/posts/${created.id}`)
      }, 500)
    } catch (err: unknown) {
      messageApi.error(
        err instanceof Error
          ? err.message
          : t('posts.createPage.error', { defaultValue: 'Không thể đăng bài. Vui lòng thử lại.' }),
      )
    }
  }

  return (
    <section className="create-post-page-wrapper">
      {contextHolder}

      <div className="create-post-container">
        {/* Top navigation */}
        <div className="create-post-top-bar">
          <Link to="/opponents" className="create-post-back-btn">
            <ArrowLeftOutlined />
            <span>{t('posts.createPage.back', { defaultValue: 'Quay lại danh sách' })}</span>
          </Link>
          <span className="create-post-badge">
            <FireOutlined /> {t('posts.createPage.badge', { defaultValue: 'MATCH SIGNAL' })}
          </span>
        </div>

        {/* Hero header with spacious layout */}
        <header className="create-post-header">
          <h1 className="create-post-title">
            {t('posts.createPage.title', { defaultValue: 'Đăng bài tìm đối thủ' })}
          </h1>
          <p className="create-post-subtitle">
            {t(
              'posts.createPage.subtitle',
              { defaultValue: 'Thiết lập trận giao lưu, tìm đối thủ xứng tầm và hoàn thiện đội hình với các câu lạc bộ bóng đá.' },
            )}
          </p>
        </header>

        {/* Form Container with Glassmorphism */}
        <Form<FormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{
            skillLevelRequired: 'Trung bình khá',
            maxPlayers: DEFAULT_POST_MAX_PLAYERS,
            playDate: dayjs().add(1, 'day'),
          }}
          className="create-post-glass-form"
          requiredMark="optional"
        >
          {/* Section: Cover Image */}
          <div className="create-post-section">
            <div className="create-post-section__header">
              <span className="create-post-section__num">01</span>
              <div>
                <h3 className="create-post-section__title">
                  {t('posts.createPage.coverImageTitle', { defaultValue: 'Ảnh bìa bài đăng (Tùy chọn)' })}
                </h3>
                <p className="create-post-section__desc">
                  {t(
                    'posts.createPage.coverImageDesc',
                    { defaultValue: 'Hình ảnh sân bóng hoặc đội hình giúp bài đăng của bạn thu hút và uy tín hơn.' },
                  )}
                </p>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {imagePreviewUrl ? (
              <div className="create-post-cover-preview">
                <img src={imagePreviewUrl} alt="Cover preview" />
                <div className="create-post-cover-preview__overlay">
                  <PillButton
                    variant="secondary"
                    size="sm"
                    icon={<CameraOutlined />}
                    onClick={() => fileInputRef.current?.click()}
                    text={t('posts.createPage.changeImage', { defaultValue: 'Đổi ảnh khác' })}
                  />
                  <PillButton
                    variant="secondary"
                    size="sm"
                    icon={<DeleteOutlined />}
                    onClick={removeImage}
                    text={t('posts.createPage.removeImage', { defaultValue: 'Gỡ ảnh' })}
                  />
                </div>
              </div>
            ) : (
              <div
                className={`create-post-dropzone ${isDragging ? 'is-dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    fileInputRef.current?.click()
                  }
                }}
              >
                <div className="create-post-dropzone__icon">
                  <CloudUploadOutlined />
                </div>
                <div className="create-post-dropzone__text">
                  <b>{t('posts.createPage.dropzonePrimary', { defaultValue: 'Nhấn để chọn ảnh hoặc kéo thả vào đây' })}</b>
                  <span>{t('posts.createPage.dropzoneHint', { defaultValue: 'Hỗ trợ PNG, JPG, WebP tối đa 5MB. Ảnh sẽ hiển thị dạng banner 16:9.' })}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section: Match Info */}
          <div className="create-post-section">
            <div className="create-post-section__header">
              <span className="create-post-section__num">02</span>
              <div>
                <h3 className="create-post-section__title">
                  {t('posts.createPage.infoTitle', { defaultValue: 'Thông tin trận đấu' })}
                </h3>
                <p className="create-post-section__desc">
                  {t(
                    'posts.createPage.infoDesc',
                    { defaultValue: 'Cung cấp tiêu đề rõ ràng cùng ngày giờ bạn muốn thi đấu.' },
                  )}
                </p>
              </div>
            </div>

            <Form.Item
              label={t('posts.createModal.postTitle', { defaultValue: 'Tiêu đề bài đăng' })}
              name="title"
              rules={[{ required: true, message: t('posts.createPage.titleRequired', { defaultValue: 'Vui lòng nhập tiêu đề bài đăng.' }) }]}
            >
              <Input
                size="large"
                placeholder={t('posts.createPage.titlePlaceholder', { defaultValue: 'Ví dụ: Tìm kèo giao lưu 7v7 tối thứ 6 sân Chánh Hưng' })}
                className="create-post-input"
              />
            </Form.Item>

            <div className="create-post-grid-2">
              <Form.Item
                label={t('booking.flow.matchDate', { defaultValue: 'Ngày thi đấu' })}
                name="playDate"
                rules={[{ required: true, message: t('posts.createPage.dateRequired', { defaultValue: 'Vui lòng chọn ngày thi đấu.' }) }]}
              >
                <DatePicker
                  size="large"
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  minDate={dayjs()}
                  className="create-post-datepicker"
                />
              </Form.Item>

              <Form.Item
                label={t('posts.createPage.locationLabel', { defaultValue: 'Địa điểm / Tên sân bóng' })}
                name="location"
              >
                <Input
                  size="large"
                  prefix={<EnvironmentOutlined style={{ color: 'var(--lime)' }} />}
                  placeholder={t('posts.createPage.locationPlaceholder', { defaultValue: 'Ví dụ: Sân Chánh Hưng, Quận 8, TP.HCM' })}
                  className="create-post-input"
                />
              </Form.Item>
            </div>

            {/* Time Slot Selector */}
            <Form.Item
              label={t('posts.createModal.slotLabel', { defaultValue: 'Khung giờ thi đấu' })}
              name="timeSlot"
              rules={[{ required: true, message: t('posts.createModal.slotRequired', { defaultValue: 'Vui lòng chọn khung giờ thi đấu.' }) }]}
            >
              <Radio.Group className="create-post-slots-group">
                <div className="create-post-slot-block">
                  <span className="create-post-slot-eyebrow">
                    {t('posts.createModal.morningSlots', { defaultValue: 'CA SÁNG' })}
                  </span>
                  <div className="create-post-slot-grid">
                    {POST_MORNING_SLOTS.map((slot) => (
                      <Radio.Button
                        key={slot}
                        value={slot}
                        disabled={isSlotExpired(slot, selectedDate)}
                        className="create-post-slot-btn"
                      >
                        <ClockCircleOutlined />
                        <span>{slot}</span>
                      </Radio.Button>
                    ))}
                  </div>
                </div>

                <div className="create-post-slot-block">
                  <span className="create-post-slot-eyebrow">
                    {t('posts.createModal.afternoonEveningSlots', { defaultValue: 'CA CHIỀU & TỐI' })}
                  </span>
                  <div className="create-post-slot-grid">
                    {POST_AFTERNOON_EVENING_SLOTS.map((slot) => (
                      <Radio.Button
                        key={slot}
                        value={slot}
                        disabled={isSlotExpired(slot, selectedDate)}
                        className="create-post-slot-btn"
                      >
                        <ClockCircleOutlined />
                        <span>{slot}</span>
                      </Radio.Button>
                    ))}
                  </div>
                </div>
              </Radio.Group>
            </Form.Item>
          </div>

          {/* Section: Players & Skill Level */}
          <div className="create-post-section">
            <div className="create-post-section__header">
              <span className="create-post-section__num">03</span>
              <div>
                <h3 className="create-post-section__title">
                  {t('posts.createPage.teamConfigTitle', { defaultValue: 'Quy mô trận đấu & Trình độ' })}
                </h3>
                <p className="create-post-section__desc">
                  {t(
                    'posts.createPage.teamConfigDesc',
                    { defaultValue: 'Thiết lập yêu cầu trình độ kỹ năng và quy mô số lượng cầu thủ.' },
                  )}
                </p>
              </div>
            </div>

            <div className="create-post-grid-2">
              <Form.Item
                label={t('posts.skillLevel', { defaultValue: 'Trình độ yêu cầu' })}
                name="skillLevelRequired"
              >
                <Select
                  size="large"
                  className="create-post-select"
                  options={POST_SKILL_LEVEL_OPTIONS.map((item) => ({
                    value: item.value,
                    label: t(item.labelKey, { defaultValue: item.defaultLabel }),
                  }))}
                />
              </Form.Item>

              <Form.Item
                label={t('posts.createPage.scaleLabel', { defaultValue: 'Số người đá (Quy mô)' })}
                name="maxPlayers"
              >
                <InputNumber
                  size="large"
                  style={{ width: '100%' }}
                  min={MIN_POST_PLAYERS}
                  max={MAX_POST_PLAYERS}
                  prefix={<TeamOutlined style={{ color: 'var(--lime)', marginRight: 6 }} />}
                  addonAfter={t('posts.createPage.playersUnit', { defaultValue: 'cầu thủ' })}
                  className="create-post-number-input"
                />
              </Form.Item>
            </div>

            <Form.Item
              label={t('posts.createModal.description', { defaultValue: 'Mô tả / Thỏa thuận giao lưu' })}
              name="content"
            >
              <Input.TextArea
                rows={4}
                placeholder={t(
                  'posts.createPage.contentPlaceholder',
                  { defaultValue: 'Ví dụ: Đội bóng văn minh, đá giao lưu nhiệt tình, chia đều tiền sân 5-5, chuẩn bị bóng thi đấu sẵn sàng...' },
                )}
                className="create-post-textarea"
              />
            </Form.Item>
          </div>

          {/* Bottom Actions Bar */}
          <div className="create-post-actions-bar">
            <PillButton
              variant="secondary"
              size="lg"
              onClick={() => navigate('/opponents')}
              text={t('common.cancel', { defaultValue: 'Hủy bỏ' })}
              disabled={submitting}
            />
            <PillButton
              variant="primary"
              size="lg"
              type="submit"
              loading={submitting}
              icon={uploadingImage ? <Spin size="small" /> : <SendOutlined />}
              text={
                uploadingImage
                  ? t('posts.createPage.uploadingImage', { defaultValue: 'Đang tải ảnh...' })
                  : submitting
                    ? t('posts.createPage.submitting', { defaultValue: 'Đang đăng bài...' })
                    : t('posts.createModal.submit', { defaultValue: 'Đăng bài ngay' })
              }
            />
          </div>
        </Form>
      </div>
    </section>
  )
}
