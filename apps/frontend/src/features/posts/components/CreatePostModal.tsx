import {
  CalendarOutlined,
  CameraOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  DownOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  PictureOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  DatePicker,
  Dropdown,
  Input,
  Modal,
  Popover,
  Select,
  Spin,
  message,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import { type ChangeEvent, useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppSelector } from '~/app/hooks'
import {
  DEFAULT_POST_MAX_PLAYERS,
  POST_AFTERNOON_EVENING_SLOTS,
  POST_MORNING_SLOTS,
  POST_SKILL_LEVEL_OPTIONS,
} from '~/constants/post.constant'
import { useCreatePost } from '~/hooks/useCreatePost'
import { isSlotExpired } from '../utils/post.utils'

const FORMAT_OPTIONS = [
  { key: '5v5', label: '5v5 (10 cầu thủ)', players: 10 },
  { key: '7v7', label: '7v7 (14 cầu thủ)', players: 14 },
  { key: '11v11', label: '11v11 (22 cầu thủ)', players: 22 },
]

export function CreatePostModal({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const { t } = useTranslation()
  const currentUser = useAppSelector((state) => state.auth.user)
  const [messageApi, contextHolder] = message.useMessage()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [playDate, setPlayDate] = useState<Dayjs>(dayjs().add(1, 'day'))
  const [timeSlot, setTimeSlot] = useState<string>(POST_AFTERNOON_EVENING_SLOTS[1]) // '17:30 - 19:00'
  const [skillLevel, setSkillLevel] = useState<string>('Trung bình khá')
  const [formatKey, setFormatKey] = useState<string>('7v7')
  const [maxPlayers, setMaxPlayers] = useState<number>(DEFAULT_POST_MAX_PLAYERS)
  const [location, setLocation] = useState<string>('')

  const {
    submitting,
    uploadingImage,
    imagePreviewUrl,
    selectImage,
    removeImage,
    submitPost,
  } = useCreatePost()

  // Reset fields only when opening modal
  const prevOpenRef = useRef(false)
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setTitle('')
      setContent('')
      setPlayDate(dayjs().add(1, 'day'))
      setTimeSlot(POST_AFTERNOON_EVENING_SLOTS[1])
      setSkillLevel('Trung bình khá')
      setFormatKey('7v7')
      setMaxPlayers(DEFAULT_POST_MAX_PLAYERS)
      setLocation('')
      removeImage()
    }
    prevOpenRef.current = open
  }, [open, removeImage])

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        messageApi.error(t('posts.modal.invalidImage', { defaultValue: 'Vui lòng chọn file hình ảnh (JPG, PNG, WebP).' }))
        return
      }
      try {
        await selectImage(file)
      } catch (err: unknown) {
        messageApi.error(
          err instanceof Error
            ? err.message
            : t('posts.modal.uploadError', { defaultValue: 'Tải ảnh lên thất bại. Vui lòng thử lại.' }),
        )
      }
    }
    e.target.value = ''
  }

  const handleSelectFormat = (key: string) => {
    setFormatKey(key)
    const matched = FORMAT_OPTIONS.find((f) => f.key === key)
    if (matched) {
      setMaxPlayers(matched.players)
    }
  }

  const handleSubmit = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      messageApi.warning(t('posts.modal.titleRequired', { defaultValue: 'Vui lòng nhập tiêu đề bài đăng.' }))
      return
    }
    if (!timeSlot) {
      messageApi.warning(t('posts.modal.slotRequired', { defaultValue: 'Vui lòng chọn khung giờ thi đấu.' }))
      return
    }

    try {
      await submitPost({
        title: trimmedTitle,
        content: content.trim() || undefined,
        playDate: playDate.format('YYYY-MM-DD'),
        timeSlot,
        skillLevelRequired: skillLevel,
        maxPlayers,
        location: location.trim() || undefined,
      })

      messageApi.success(t('posts.modal.success', { defaultValue: 'Đăng bài thành công!' }))
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 350)
    } catch (err: unknown) {
      messageApi.error(
        err instanceof Error
          ? err.message
          : t('posts.modal.error', { defaultValue: 'Đăng bài thất bại. Vui lòng thử lại.' }),
      )
    }
  }

  const allSlots = [...POST_MORNING_SLOTS, ...POST_AFTERNOON_EVENING_SLOTS]

  const matchDetailsContent = (
    <div className="minimal-match-details-popover">
      <div className="minimal-popover-item">
        <label><CalendarOutlined /> {t('booking.flow.matchDate', { defaultValue: 'Ngày thi đấu' })}</label>
        <DatePicker
          value={playDate}
          onChange={(date) => date && setPlayDate(date)}
          format="DD/MM/YYYY"
          minDate={dayjs()}
          allowClear={false}
          style={{ width: '100%' }}
        />
      </div>

      <div className="minimal-popover-item">
        <label><ClockCircleOutlined /> {t('posts.createModal.slotLabel', { defaultValue: 'Khung giờ' })}</label>
        <Select
          value={timeSlot}
          onChange={setTimeSlot}
          style={{ width: '100%' }}
          options={allSlots.map((slot) => ({
            value: slot,
            label: slot,
            disabled: isSlotExpired(slot, playDate),
          }))}
        />
      </div>

      <div className="minimal-popover-item">
        <label><TeamOutlined /> {t('posts.skillLevel', { defaultValue: 'Trình độ' })}</label>
        <Select
          value={skillLevel}
          onChange={setSkillLevel}
          style={{ width: '100%' }}
          options={POST_SKILL_LEVEL_OPTIONS.map((opt) => ({
            value: opt.value,
            label: t(opt.labelKey, { defaultValue: opt.defaultLabel }),
          }))}
        />
      </div>
    </div>
  )

  const locationContent = (
    <div className="minimal-match-details-popover" style={{ width: 260 }}>
      <div className="minimal-popover-item">
        <label><EnvironmentOutlined /> {t('posts.createPage.locationLabel', { defaultValue: 'Địa điểm / Sân bóng' })}</label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={t('posts.modal.locationPlaceholder', { defaultValue: 'Ví dụ: Sân Chánh Hưng, Q8' })}
          allowClear
          autoFocus
        />
      </div>
    </div>
  )

  const formatMenuItems = FORMAT_OPTIONS.map((opt) => ({
    key: opt.key,
    label: opt.label,
  }))

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        onCancel={onClose}
        footer={null}
        closable={false}
        centered
        width={640}
        wrapClassName="minimal-post-modal-wrap"
        className="minimal-post-modal"
        destroyOnClose
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Top Header: Avatar + Audience & Close Button */}
        <div className="minimal-modal-header">
          <div className="minimal-modal-user">
            <Avatar
              src={currentUser?.avatarUrl}
              size={36}
              className="minimal-modal-avatar"
            >
              {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <div className="minimal-modal-audience-pill">
              <GlobalOutlined />
              <span>{t('posts.modal.everyone', { defaultValue: 'Everyone' })}</span>
            </div>
          </div>

          <div className="minimal-modal-header-actions">
            <button
              type="button"
              className="minimal-modal-icon-btn"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseOutlined />
            </button>
          </div>
        </div>

        {/* Post Title */}
        <div className="minimal-modal-title-wrap">
          <input
            type="text"
            className="minimal-modal-title-input"
            placeholder={t('posts.modal.titlePlaceholder', { defaultValue: 'Post title...' })}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
          />
        </div>

        {/* Main Content / Thoughts */}
        <div className="minimal-modal-body">
          <textarea
            className="minimal-modal-content-input"
            rows={5}
            placeholder={t('posts.modal.contentPlaceholder', { defaultValue: 'Share your thoughts' })}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {/* Cover image button or preview */}
        <div className="minimal-modal-cover-section">
          {imagePreviewUrl && (
            <div className="minimal-modal-cover-preview">
              <img src={imagePreviewUrl} alt="Cover preview" />
              <button
                type="button"
                className="minimal-modal-cover-remove"
                onClick={removeImage}
                title={t('posts.modal.removeCover', { defaultValue: 'Gỡ ảnh bìa' })}
              >
                <CloseOutlined />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="minimal-modal-footer">
          <div className="minimal-modal-footer-left">
            <Dropdown
              menu={{
                items: formatMenuItems,
                onClick: ({ key }) => handleSelectFormat(key),
              }}
              trigger={['click']}
            >
              <button type="button" className="minimal-modal-pill-dropdown">
                <span>{formatKey}</span>
                <DownOutlined style={{ fontSize: 10 }} />
              </button>
            </Dropdown>

            <button
              type="button"
              className="minimal-modal-tool-btn"
              onClick={() => fileInputRef.current?.click()}
              title={t('posts.modal.addCover', { defaultValue: 'Add cover' })}
              disabled={uploadingImage}
            >
              <PictureOutlined />
            </button>

            <Popover
              content={matchDetailsContent}
              title={t('posts.modal.matchConfig', { defaultValue: 'Cấu hình trận đấu' })}
              trigger="click"
              placement="top"
            >
              <button
                type="button"
                className="minimal-modal-tool-btn"
                title={t('posts.modal.matchConfig', { defaultValue: 'Cấu hình trận đấu' })}
              >
                <CalendarOutlined />
              </button>
            </Popover>

            <Popover
              content={locationContent}
              title={t('posts.createPage.locationLabel', { defaultValue: 'Địa điểm / Sân bóng' })}
              trigger="click"
              placement="top"
            >
              <button
                type="button"
                className={`minimal-modal-tool-btn ${location ? 'is-active' : ''}`}
                title={location ? `${t('posts.createPage.locationLabel', { defaultValue: 'Địa điểm' })}: ${location}` : t('posts.createPage.locationLabel', { defaultValue: 'Địa điểm / Sân bóng' })}
              >
                <EnvironmentOutlined />
              </button>
            </Popover>
          </div>

          <div className="minimal-modal-footer-right">
            <button
              type="button"
              className="minimal-modal-post-btn"
              onClick={handleSubmit}
              disabled={!title.trim() || !timeSlot || submitting || uploadingImage}
            >
              {submitting || uploadingImage
                ? t('posts.modal.submitting', { defaultValue: 'Posting...' })
                : t('posts.modal.postBtn', { defaultValue: 'Post' })}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
