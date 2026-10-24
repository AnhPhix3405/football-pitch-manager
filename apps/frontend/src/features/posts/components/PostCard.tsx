import {
  CalendarOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Popconfirm, Tag, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { MatchPost } from '../../user/user.data'

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

  const statusLabel =
    post.status === 'open'
      ? t('posts.status.open', { defaultValue: 'ĐANG MỞ' })
      : post.status === 'matched'
        ? t('posts.status.matched', { defaultValue: 'ĐÃ GHÉP' })
        : t('posts.status.closed', { defaultValue: 'ĐÃ ĐÓNG' })

  return (
    <article className="post-card">
      <header className="post-card__header">
        <div className="post-card__header-left">
          <span className={`booking-card__status-pill booking-card__status-pill--${post.status === 'open' ? 'confirmed' : post.status === 'matched' ? 'pending' : 'cancelled'}`}>
            <span className="booking-card__status-dot" />
            <span>{statusLabel}</span>
          </span>
          <Tag className="post-card__tag">{post.format}</Tag>
          <Tag className="post-card__tag">{post.level}</Tag>
        </div>

        <div className="post-card__header-actions">
          <Tooltip title={manage ? t('common.manage', { defaultValue: 'Quản lý' }) : t('posts.viewMatch', { defaultValue: 'Xem chi tiết kèo' })}>
            <Link to={`/posts/${post.id}`} className="booking-card__icon-btn" aria-label="Xem chi tiết">
              <EyeOutlined />
            </Link>
          </Tooltip>

          {manage && onDelete && (
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
          )}
        </div>
      </header>

      <h2>{post.title}</h2>
      <p>
        Đăng bởi <b>{post.team}</b>
      </p>

      <dl>
        <div>
          <dt>
            <CalendarOutlined /> THỜI GIAN
          </dt>
          <dd>
            {post.date} · {post.time}
          </dd>
        </div>
        <div>
          <dt>
            <EnvironmentOutlined /> ĐỊA ĐIỂM
          </dt>
          <dd>{post.location}</dd>
        </div>
        <div>
          <dt>
            <TeamOutlined /> ĐANG CẦN
          </dt>
          <dd>
            {post.needed
              ? `${post.needed} ${post.needed > 1 ? 'người' : 'đội'}`
              : 'Đã ghép đủ'}
          </dd>
        </div>
      </dl>

      <footer className="post-card__footer">
        <span className="post-card__applicants-count">{post.applicants} lượt quan tâm</span>
      </footer>
    </article>
  )
}

