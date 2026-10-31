import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  HeartFilled,
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from '@ant-design/icons'
import { Avatar, Popconfirm, Tooltip, message } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ClickSpark } from '~/components/ClickSpark'
import { compressImageUrl } from '~/utils/image-compressor.utils'
import type { MatchPost } from '../../user/user.data'

const STORAGE_KEY_PREFIX = 'pm_post_like_'

export function PostCard({
  post,
  manage = false,
  onDelete,
}: {
  post: MatchPost
  manage?: boolean
  onDelete?: (postId: string) => void
}) {
  const { t } = useTranslation()
  const [messageApi, contextHolder] = message.useMessage()
  const detailUrl = `/posts/${post.id}`
  const displayName = post.authorName || post.team || 'User'

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const fullUrl = `${window.location.origin}${detailUrl}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      messageApi.success(t('posts.copiedLink', { defaultValue: 'Đã sao chép liên kết vào bộ nhớ tạm!' }))
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = fullUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      messageApi.success(t('posts.copiedLink', { defaultValue: 'Đã sao chép liên kết vào bộ nhớ tạm!' }))
    }
  }

  // Compressed avatar image state
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    if (post.authorAvatar) {
      compressImageUrl(post.authorAvatar)
        .then((compressed) => {
          if (active) setAvatarSrc(compressed)
        })
        .catch(() => {
          if (active) setAvatarSrc(post.authorAvatar || null)
        })
    } else {
      setAvatarSrc(null)
    }
    return () => {
      active = false
    }
  }, [post.authorAvatar])

  // Persistent likes state per post via localStorage
  const baseLikes = post.applicants ? post.applicants * 2 + 3 : 5
  const [isLiked, setIsLiked] = useState(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY_PREFIX}${post.id}`) === 'true'
    } catch {
      return false
    }
  })

  const [likes, setLikes] = useState(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${post.id}`)
      return stored === 'true' ? baseLikes + 1 : baseLikes
    } catch {
      return baseLikes
    }
  })

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsLiked((prev) => {
      const next = !prev
      setLikes((curr) => (next ? curr + 1 : Math.max(0, curr - 1)))
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${post.id}`, String(next))
      } catch {
        // Safe catch for storage quota
      }
      return next
    })
  }

  const statusLabel =
    post.status === 'open'
      ? t('posts.status.open', { defaultValue: 'ĐANG MỞ' })
      : post.status === 'matched'
        ? t('posts.status.matched', { defaultValue: 'ĐÃ GHÉP' })
        : t('posts.status.closed', { defaultValue: 'ĐÃ ĐÓNG' })

  // Format hashtags
  const formatTag = `#${post.format}`
  const levelTag = `#${post.level.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <article className="post-card post-card--daily">
      {contextHolder}
      {/* Top Header: Author Avatar & Name & Status & Delete action (if manage) */}
      <header className="post-card__header">
        <div className="post-card__header-left">
          <Avatar
            src={avatarSrc || undefined}
            size={38}
            shape="circle"
            className="post-card__author-avatar"
          >
            {displayName.charAt(0).toUpperCase()}
          </Avatar>
          <div className="post-card__author-info">
            <span className="post-card__author-name">{displayName}</span>
            <span className="post-card__meta-status">
              <span className={`booking-card__status-pill booking-card__status-pill--${post.status === 'open' ? 'confirmed' : post.status === 'matched' ? 'pending' : 'cancelled'}`}>
                <span className="booking-card__status-dot" />
                <span>{statusLabel}</span>
              </span>
            </span>
          </div>
        </div>

        {manage && onDelete && (
          <div className="post-card__header-actions">
            <Popconfirm
              title={t('posts.deleteConfirmTitle', { defaultValue: 'Xóa bài đăng này?' })}
              description={t('posts.deleteConfirmDesc', { defaultValue: 'Hành động này không thể hoàn tác.' })}
              okText={t('posts.deleteModal.confirm', { defaultValue: 'Xóa' })}
              cancelText={t('posts.deleteModal.cancel', { defaultValue: 'Hủy' })}
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(post.id)}
            >
              <Tooltip title={t('common.delete', { defaultValue: 'Xóa bài đăng' })}>
                <button
                  type="button"
                  className="booking-card__icon-btn booking-card__icon-btn--danger"
                  aria-label="Xóa bài đăng"
                >
                  <DeleteOutlined />
                </button>
              </Tooltip>
            </Popconfirm>
          </div>
        )}
      </header>

      {/* Big Bold Title */}
      <h2 className="post-card__title">{post.title}</h2>

      {/* Tags / Hashtags */}
      <div className="post-card__tags-row">
        <span className="post-card__hashtag">{formatTag}</span>
        <span className="post-card__hashtag">{levelTag}</span>
      </div>

      {/* Meta Row: Time & Location */}
      <div className="post-card__meta-row">
        <span className="post-card__meta-item">
          <ClockCircleOutlined />
          <span>{post.date} · {post.time}</span>
        </span>
        {post.location && (
          <span className="post-card__meta-item">
            <EnvironmentOutlined />
            <span>{post.location}</span>
          </span>
        )}
      </div>

      {/* Cover Preview Image */}
      {post.imageUrl && (
        <div className="post-card__cover-preview-wrap">
          <img
            src={post.imageUrl}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="post-card__cover-preview-img"
          />
        </div>
      )}

      {/* Bottom Toolbar: Hearts with ClickSpark + Comments + View Detail Button */}
      <footer className="post-card__footer-toolbar">
        <div className="post-card__footer-left">
          <ClickSpark
            sparkColor="#ff4d6d"
            sparkSize={10}
            sparkRadius={24}
            sparkCount={9}
            duration={400}
          >
            <button
              type="button"
              className={`post-card__action-btn post-card__action-btn--heart ${isLiked ? 'is-liked' : ''}`}
              onClick={handleLike}
              title={isLiked ? t('posts.unlike', { defaultValue: 'Bỏ thích' }) : t('posts.like', { defaultValue: 'Thích' })}
            >
              {isLiked ? (
                <HeartFilled className="post-card__heart-icon post-card__heart-icon--filled" />
              ) : (
                <HeartOutlined className="post-card__heart-icon" />
              )}
              <span className="post-card__action-count">{likes}</span>
            </button>
          </ClickSpark>

          <div
            className="post-card__action-btn post-card__action-btn--static"
            title={t('posts.applicants', { defaultValue: 'Lượt quan tâm' })}
          >
            <MessageOutlined className="post-card__action-icon" />
            <span className="post-card__action-count">{post.applicants}</span>
          </div>
        </div>

        <div className="post-card__footer-right">
          <Tooltip title={t('posts.shareLink', { defaultValue: 'Sao chép liên kết' })}>
            <button
              type="button"
              className="post-card__action-btn"
              onClick={handleShare}
              aria-label={t('posts.shareLink', { defaultValue: 'Sao chép liên kết' })}
            >
              <ShareAltOutlined className="post-card__action-icon" />
            </button>
          </Tooltip>

          <Tooltip title={t('posts.viewDetail', { defaultValue: 'Xem chi tiết' })}>
            <Link
              to={detailUrl}
              className="post-card__action-btn post-card__action-btn--arrow"
              aria-label={t('posts.viewDetail', { defaultValue: 'Xem chi tiết' })}
            >
              <ArrowRightOutlined className="post-card__action-icon" />
            </Link>
          </Tooltip>
        </div>
      </footer>
    </article>
  )
}
