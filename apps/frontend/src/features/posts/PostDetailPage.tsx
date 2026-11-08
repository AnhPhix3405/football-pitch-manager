import {
  CheckOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  CommentOutlined,
  DeleteOutlined,
  DownOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  SendOutlined,
  StarFilled,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Input, Spin, Tag, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { useConfirmModal } from '../../hooks'
import { PillButton } from '../../components/PillButton'
import { BlurCircle } from '../../components/BlurCircle'
import type { MatchPost } from '../user/user.data'
import { mapBackendPostToMatchPost } from './hooks/usePublicPosts'
import { usePostDetail } from './hooks/usePostDetail'
import type { BackendPostMatch } from './interface/post.types'
import { UserReviewModal } from '../reviews/components/UserReviewModal'
import { reviewService } from '../reviews/services/review.service'

function getDisplayName(
  user?: { fullName?: string | null; email?: string } | null,
  fallback = 'Người dùng',
): string {
  if (user?.fullName?.trim()) {
    return user.fullName.trim()
  }
  if (user?.email?.trim()) {
    return user.email.trim().split('@')[0]
  }
  return fallback
}

function checkMatchFinished(
  playDate?: string | null,
  startTime?: string | null,
  endTime?: string | null,
  serverFinished?: boolean,
): boolean {
  if (serverFinished !== undefined) {
    return serverFinished
  }
  if (!playDate) return false
  const endTimeStr = endTime || startTime
  const end = new Date(`${playDate}T${endTimeStr}`)
  return !isNaN(end.getTime()) && new Date() >= end
}

export function PostDetailPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { postId = '' } = useParams()
  const currentUser = useAppSelector((state) => state.auth.user)
  const {
    postData,
    matches,
    comments,
    loading,
    actionLoading,
    applyForMatch,
    acceptMatchApplicant,
    rejectMatchApplicant,
    sendComment,
    changeStatus,
    deleteCurrentPost,
  } = usePostDetail(postId)
  const { showConfirm, ConfirmDialog } = useConfirmModal()

  const [commentText, setCommentText] = useState('')
  const [messageApi, contextHolder] = message.useMessage()

  const post: MatchPost | undefined = postData
    ? mapBackendPostToMatchPost(postData)
    : undefined

  const isOwner = Boolean(currentUser?.id && postData?.userId === currentUser.id)
  const hasApplied = Boolean(
    currentUser?.id && matches.some((m) => m.applicantId === currentUser.id),
  )

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewTarget, setReviewTarget] = useState<{ id: string; name: string } | null>(null)
  const [hasReviewedOpponent, setHasReviewedOpponent] = useState(false)
  const [reviewStatus, setReviewStatus] = useState<{
    isFinished: boolean
    isMatched: boolean
    hasReviewedOpponent: boolean
    opponent: { id: string; fullName: string | null; avatarUrl: string | null } | null
    canReview: boolean
  } | null>(null)

  useEffect(() => {
    if (!postId || !currentUser?.id) return
    reviewService
      .getPostMatchReviewStatus(postId)
      .then((res) => {
        setReviewStatus(res)
        setHasReviewedOpponent(res.hasReviewedOpponent)
      })
      .catch(() => {
        // Fallback silently
      })
  }, [postId, currentUser?.id])

  const acceptedMatch = useMemo(
    () => matches.find((m) => m.status === 'accepted'),
    [matches],
  )
  const isParticipant = Boolean(
    currentUser?.id &&
    (postData?.userId === currentUser.id ||
      matches.some((m) => m.status === 'accepted' && m.applicantId === currentUser.id)),
  )

  const isMatchFinished = checkMatchFinished(
    postData?.playDate,
    postData?.startTime,
    postData?.endTime,
    reviewStatus?.isFinished,
  )

  const handleApply = async () => {
    if (!currentUser) {
      messageApi.warning(t('posts.detail.loginPrompt'))
      return
    }
    try {
      await applyForMatch()
      messageApi.success(t('posts.applied'))
    } catch (err: unknown) {
      messageApi.error(
        err instanceof Error ? err.message : t('posts.applicantModal.actionError'),
      )
    }
  }

  const handleStatusChange = async (newStatus: 'open' | 'matched' | 'closed') => {
    if (!post || newStatus === post.status) return
    try {
      await changeStatus(newStatus)
      messageApi.success(t('posts.statusUpdateSuccess'))
    } catch (err: unknown) {
      messageApi.error(
        err instanceof Error ? err.message : t('posts.statusUpdateError'),
      )
    }
  }

  const handleDeletePost = () => {
    showConfirm({
      title: t('posts.deleteModal.title'),
      content: t('posts.deleteModal.content'),
      okText: t('posts.deleteModal.confirm'),
      danger: true,
      onOk: async () => {
        try {
          await deleteCurrentPost()
          messageApi.success(t('posts.deleteModal.success'))
          setTimeout(() => {
            navigate('/opponents')
          }, 400)
        } catch (err: unknown) {
          messageApi.error(
            err instanceof Error ? err.message : t('posts.deleteModal.error'),
          )
        }
      },
    })
  }

  const handleDecide = (match: BackendPostMatch, accept: boolean) => {
    const applicantName = getDisplayName(match.applicant, 'Đội bạn')
    showConfirm({
      title: accept
        ? t('posts.applicantModal.acceptTitle', { name: applicantName })
        : t('posts.applicantModal.rejectTitle', { name: applicantName }),
      content: accept
        ? t('posts.applicantModal.acceptContent')
        : t('posts.applicantModal.rejectContent'),
      okText: accept
        ? t('posts.applicantModal.acceptBtn')
        : t('posts.applicantModal.rejectBtn'),
      danger: !accept,
      onOk: async () => {
        try {
          if (accept) {
            await acceptMatchApplicant(match.id)
            messageApi.success(
              t('posts.applicantModal.acceptSuccess', { name: applicantName }),
            )
            messageApi.info(
              t('posts.applicantModal.chatReadyPrompt', {
                defaultValue:
                  'Cuộc trò chuyện đã được tạo. Bạn có thể vào mục Đoạn chat để trao đổi chi tiết.',
              }),
              6,
            )
          } else {
            await rejectMatchApplicant(match.id)
            messageApi.info(
              t('posts.applicantModal.rejectSuccess', { name: applicantName }),
            )
          }
        } catch (err: unknown) {
          messageApi.error(
            err instanceof Error
              ? err.message
              : t('posts.applicantModal.actionError'),
          )
        }
      },
    })
  }

  const handleSendComment = async () => {
    if (!commentText.trim()) return
    if (!currentUser) {
      messageApi.warning(t('posts.detail.loginPrompt'))
      return
    }
    try {
      await sendComment(commentText.trim())
      setCommentText('')
      messageApi.success(t('posts.detail.sendSuccess'))
    } catch (err: unknown) {
      messageApi.error(
        err instanceof Error ? err.message : t('posts.detail.sendError'),
      )
    }
  }

  if (loading) {
    return (
      <section
        className="user-page"
        style={{ textAlign: 'center', padding: '120px 0' }}
      >
        <Spin size="large" />
      </section>
    )
  }

  if (!post) {
    return (
      <section
        className="user-page"
        style={{ textAlign: 'center', padding: '80px 0' }}
      >
        <p style={{ color: 'var(--sage)', marginBottom: 20 }}>
          {t('posts.detail.notFound')}
        </p>
        <Link className="post-detail-back-link" to="/opponents">
          ← {t('posts.detail.back')}
        </Link>
      </section>
    )
  }

  const authorName = getDisplayName(postData?.user, post.team || 'Đội bóng')
  const authorAvatar = postData?.user?.avatarUrl || undefined
  const postDateFormatted = postData?.createdAt
    ? new Date(postData.createdAt).toLocaleDateString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    : ''

  return (
    <section className="user-page post-detail-page-wrapper">
      {contextHolder}
      <BlurCircle
        variant="lime"
        size={420}
        top="-60px"
        left="-80px"
        opacity={0.15}
        animate
      />
      <BlurCircle
        variant="blue"
        size={380}
        top="35%"
        right="-80px"
        opacity={0.12}
        animate
      />

      <nav className="post-detail-nav">
        <Link className="post-detail-back-link" to="/opponents">
          ← {t('posts.detail.back')}
        </Link>
      </nav>

      <div className="post-detail-grid">
        {/* Left Column: Post Details */}
        <article className="post-detail">
          <div className="post-detail__top-bar">
            <div className="post-detail__author-info">
              <Avatar
                size={44}
                src={authorAvatar}
                icon={<UserOutlined />}
                style={{
                  background: 'rgba(140, 252, 112, 0.15)',
                  border: '1px solid rgba(140, 252, 112, 0.3)',
                  color: 'var(--lime)',
                }}
              >
                {authorName.charAt(0).toUpperCase()}
              </Avatar>
              <div className="post-detail__author-meta">
                <span className="author-name">{authorName}</span>
                <span className="author-sub">
                  {postDateFormatted ? ` ${postDateFormatted}` : ''}
                </span>
              </div>
            </div>
          </div>

          {post.imageUrl && (
            <div className="post-detail__cover">
              <img
                src={post.imageUrl}
                alt={post.title}
                loading="lazy"
                decoding="async"
              />
            </div>
          )}

          <h1>{post.title}</h1>

          <div className="post-detail__specs-grid">

            <div className="post-detail__spec-card">
              <div className="flex flex-row items-center gap-2 ">
                <div className="post-detail__spec-icon icon-location">
                  <EnvironmentOutlined />
                </div>
                <span className="post-detail__spec-label">
                  {t('posts.detail.specs.location')}
                </span>
              </div>
              <span className="post-detail__spec-val">{post.location}</span>
            </div>

            <div className="post-detail__spec-card">
              <div className="flex flex-row items-center gap-2 ">
                <div className="post-detail__spec-icon icon-time">
                  <ClockCircleOutlined />
                </div>
                <span className="post-detail__spec-label">
                  {t('posts.detail.specs.time')}
                </span>
              </div>
              <span className="post-detail__spec-val">
                {post.date} · {post.time}
              </span>
            </div>

            <div className="post-detail__spec-card">
              <div className="flex flex-row items-center gap-2 ">
                <div className="post-detail__spec-icon icon-team">
                  <TeamOutlined />
                </div>
                <span className="post-detail__spec-label">
                  {t('posts.detail.specs.format')}
                </span>
              </div>
              <span className="post-detail__spec-val">
                {post.format} · {post.level}
              </span>
            </div>
          </div>

          <div className="post-detail__desc-box">
            <h3>
              {t('posts.detail.descriptionTitle')}
            </h3>
            <p>{post.description || t('posts.detail.noDescription')}</p>
          </div>

          {!isOwner && post.status === 'open' && (
            <div className="post-detail__cta-bar">
              <PillButton
                variant="primary"
                size="lg"
                loading={actionLoading}
                disabled={hasApplied}
                onClick={handleApply}
                text={hasApplied ? t('posts.applied') : t('posts.applyMatch')}
              />
            </div>
          )}

          {isMatchFinished && isParticipant && !!acceptedMatch && (
            <div
              className="post-detail__post-match-banner"
              style={{
                marginTop: 20,
                padding: '16px 20px',
                borderRadius: 14,
                background: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16,
                flexWrap: 'wrap',
              }}
            >
              <div>
                <b
                  style={{
                    color: '#eab308',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 14,
                  }}
                >
                  <StarFilled />{' '}
                  {t('posts.detail.postMatchActions', {
                    defaultValue: 'Đánh giá sau trận đấu',
                  })}
                </b>
                <p
                  style={{
                    margin: '4px 0 0',
                    color: 'var(--sage)',
                    fontSize: 13,
                  }}
                >
                  {t('posts.detail.matchFinishedNotice', {
                    defaultValue:
                      'Trận đấu đã kết thúc. Hãy gửi đánh giá tinh thần thể thao cho đối thủ!',
                  })}
                </p>
              </div>
              <Button
                type="primary"
                icon={<StarFilled />}
                disabled={hasReviewedOpponent}
                onClick={() => {
                  if (reviewStatus?.opponent) {
                    setReviewTarget({
                      id: reviewStatus.opponent.id,
                      name: reviewStatus.opponent.fullName || 'Đối thủ',
                    })
                  } else {
                    const targetId = isOwner
                      ? acceptedMatch.applicantId
                      : postData?.userId || ''
                    const targetName = isOwner
                      ? getDisplayName(acceptedMatch.applicant, 'Đối thủ')
                      : authorName
                    setReviewTarget({ id: targetId, name: targetName })
                  }
                  setReviewModalOpen(true)
                }}
                style={{
                  background: hasReviewedOpponent ? undefined : '#eab308',
                  borderColor: hasReviewedOpponent ? undefined : '#eab308',
                  color: hasReviewedOpponent ? undefined : '#0f172a',
                  fontWeight: 700,
                  height: 38,
                  borderRadius: 9999,
                  padding: '0 20px',
                }}
              >
                {hasReviewedOpponent
                  ? `✓ ${t('posts.detail.opponentReviewed', { defaultValue: 'Đã đánh giá' })}`
                  : t('posts.detail.rateOpponent', { defaultValue: 'Đánh giá đối thủ' })}
              </Button>
            </div>
          )}
        </article>

        {/* Right Column: Sidebar (Sticky) with Controls, Applicants, and Discussion */}
        <aside className="post-detail-sidebar">
          {isOwner && (
            <div className="post-detail-owner-card">
              <Dropdown
                menu={{
                  items: [
                    { key: 'open', label: t('posts.status.open') },
                    { key: 'matched', label: t('posts.status.matched') },
                    { key: 'closed', label: t('posts.status.closed') },
                  ],
                  onClick: ({ key }) =>
                    handleStatusChange(key as 'open' | 'matched' | 'closed'),
                }}
                disabled={actionLoading}
              >
                <Button
                  style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderColor: 'rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                  }}
                >
                  <span>
                    {post.status === 'open'
                      ? t('posts.status.open')
                      : post.status === 'matched'
                        ? t('posts.status.matched')
                        : t('posts.status.closed')}
                  </span>
                  <DownOutlined />
                </Button>
              </Dropdown>
              <Button
                danger
                icon={<DeleteOutlined />}
                loading={actionLoading}
                onClick={handleDeletePost}
              >
              </Button>
            </div>
          )}

          {/* Applicant Panel */}
          <section className="applicant-panel">
            <header>
              <h2>{t('posts.detail.applicantsTitle')}</h2>
              <Tag
                color={
                  matches.filter((m) => m.status === 'pending').length > 0
                    ? 'green'
                    : 'default'
                }
              >
                {matches.filter((m) => m.status === 'pending').length}
              </Tag>
            </header>

            {matches.length === 0 ? (
              <p
                style={{
                  color: '#888',
                  fontStyle: 'italic',
                  padding: '12px 0',
                  margin: 0,
                  fontSize: 13,
                }}
              >
                {t('posts.detail.noApplicants')}
              </p>
            ) : (
              <div className="applicant-list">
                {matches.map((item) => (
                  <div
                    className="applicant-card"
                    key={item.id}
                  >
                    {/* Top Row: Avatar + Name + Status Icon */}
                    <div className="flex items-center justify-between w-full min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar
                          size={28}
                          src={item.applicant?.avatarUrl || undefined}
                          icon={<UserOutlined />}
                          style={{
                            background: 'rgba(140, 252, 112, 0.2)',
                            color: 'var(--lime)',
                            flexShrink: 0,
                          }}
                        >
                          {getDisplayName(item.applicant).charAt(0).toUpperCase()}
                        </Avatar>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="applicant-card__name truncate text-xs font-semibold text-white">
                            {getDisplayName(item.applicant, 'Đội bạn')}
                          </span>
                          {item.status === 'accepted' && (
                            <span
                              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#8cfc70]/15 text-[#8cfc70] text-[10px] font-bold"
                              title="Accepted"
                            >
                              ✓
                            </span>
                          )}
                          {item.status === 'rejected' && (
                            <span
                              className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-red-500/15 text-red-400 text-[10px] font-bold"
                              title="Denied"
                            >
                              ✕
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Actions placed below the avatar */}
                    <div className="applicant-card__actions flex items-center gap-1.5 pt-0.5 w-full">
                      {isOwner && item.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleDecide(item, true)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#8cfc70]/12 text-[#8cfc70] border border-[#8cfc70]/30 hover:bg-[#8cfc70]/20 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <CheckOutlined className="text-[10px]" />
                            <span>{t('posts.detail.accept', { defaultValue: 'Chấp nhận' })}</span>
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleDecide(item, false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white/[0.04] text-zinc-400 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 active:scale-95 transition-all disabled:opacity-50"
                          >
                            <CloseOutlined className="text-[10px]" />
                            <span>{t('posts.detail.reject', { defaultValue: 'Từ chối' })}</span>
                          </button>
                        </>
                      )}

                      {item.status === 'accepted' &&
                        (isOwner || item.applicantId === currentUser?.id) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => navigate('/messages')}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#8cfc70]/12 text-[#8cfc70] border border-[#8cfc70]/30 hover:bg-[#8cfc70]/20 active:scale-95 transition-all"
                            >
                              <MessageOutlined className="text-[11px]" />
                              <span>{t('posts.detail.chat', { defaultValue: 'Nhắn tin' })}</span>
                            </button>
                            {isMatchFinished && (
                              <button
                                type="button"
                                disabled={hasReviewedOpponent}
                                onClick={() => {
                                  const targetId = isOwner
                                    ? item.applicantId
                                    : postData?.userId || ''
                                  const targetName = isOwner
                                    ? getDisplayName(item.applicant, 'Đối thủ')
                                    : authorName
                                  setReviewTarget({ id: targetId, name: targetName })
                                  setReviewModalOpen(true)
                                }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-400/30 hover:bg-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
                              >
                                <StarFilled className="text-amber-400 text-[10px]" />
                                <span>
                                  {hasReviewedOpponent
                                    ? t('posts.detail.opponentReviewed', { defaultValue: 'Đã đánh giá' })
                                    : t('posts.detail.rateOpponent', { defaultValue: 'Đánh giá' })}
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Discussion */}
          <section className="discussion">
            <header>
              <h2>
                <CommentOutlined
                  style={{ marginRight: 6, color: 'var(--lime)' }}
                />
                {t('posts.detail.discussionTitle')} ({comments.length})
              </h2>
            </header>

            {comments.length === 0 ? (
              <p
                style={{
                  color: '#888',
                  fontStyle: 'italic',
                  marginBottom: 14,
                  fontSize: 13,
                }}
              >
                {t('posts.detail.noComments')}
              </p>
            ) : (
              <div className="discussion-comments-list">
                {comments.map((item) => (
                  <div className="discussion-comment-item" key={item.id}>
                    <div className="discussion-comment-header">
                      <Avatar
                        size="small"
                        src={item.user?.avatarUrl || undefined}
                        icon={<UserOutlined />}
                        style={{ background: 'rgba(255, 255, 255, 0.1)', flexShrink: 0 }}
                      >
                        {getDisplayName(item.user).charAt(0).toUpperCase()}
                      </Avatar>
                      <span className="discussion-comment-author">
                        {getDisplayName(item.user, 'Thành viên')}
                      </span>
                      <span className="discussion-comment-time">
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="discussion-comment-body">{item.content}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="discussion-input-row">
              <Input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onPressEnter={handleSendComment}
                placeholder={t('posts.detail.commentPlaceholder')}
              />
              <PillButton
                variant="primary"
                icon={<SendOutlined />}
                loading={actionLoading}
                onClick={handleSendComment}
                text={t('posts.detail.send')}
              />
            </div>
          </section>
        </aside>
      </div>

      {reviewTarget && (
        <UserReviewModal
          open={reviewModalOpen}
          targetUserId={reviewTarget.id}
          targetUserName={reviewTarget.name}
          postId={postId || post?.id}
          onClose={() => {
            setReviewModalOpen(false)
            setReviewTarget(null)
          }}
          onSuccess={() => {
            setHasReviewedOpponent(true)
            setReviewModalOpen(false)
            setReviewTarget(null)
          }}
        />
      )}

      {ConfirmDialog}
    </section>
  )
}
