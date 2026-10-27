import {
  CalendarOutlined,
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  DownOutlined,
  EnvironmentOutlined,
  MessageOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Input, Spin, Tag, message } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAppSelector } from '../../app/hooks'
import { useConfirmModal } from '../../hooks'
import { PillButton } from '../../components/PillButton'
import { matchPosts, type MatchPost } from '../user/user.data'
import { mapBackendPostToMatchPost } from './hooks/usePublicPosts'
import { usePostDetail } from './hooks/usePostDetail'
import type { BackendPostMatch } from './interface/post.types'

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

  const fallbackPost = matchPosts.find((item) => item.id === postId)
  const post: MatchPost | undefined = postData
    ? mapBackendPostToMatchPost(postData)
    : fallbackPost

  const isOwner = Boolean(currentUser?.id && postData?.userId === currentUser.id)
  const hasApplied = Boolean(
    currentUser?.id && matches.some((m) => m.applicantId === currentUser.id),
  )

  const handleApply = async () => {
    if (!currentUser) {
      messageApi.warning('Vui lòng đăng nhập để bắt đối.')
      return
    }
    try {
      await applyForMatch()
      messageApi.success('Đã gửi yêu cầu bắt đối! Chờ chủ bài duyệt.')
    } catch (err: unknown) {
      messageApi.error(err instanceof Error ? err.message : 'Không thể gửi yêu cầu.')
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
            navigate('/posts')
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
    const applicantName = match.applicant?.fullName || match.applicant?.email || 'Đội bạn'
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
            messageApi.success(t('posts.applicantModal.acceptSuccess', { name: applicantName }))
            messageApi.info(
              t('posts.applicantModal.chatReadyPrompt', {
                defaultValue:
                  'Cuộc trò chuyện đã được tạo. Bạn có thể vào mục Đoạn chat để trao đổi chi tiết.',
              }),
              6,
            )
          } else {
            await rejectMatchApplicant(match.id)
            messageApi.info(t('posts.applicantModal.rejectSuccess', { name: applicantName }))
          }
        } catch (err: unknown) {
          messageApi.error(
            err instanceof Error ? err.message : t('posts.applicantModal.actionError'),
          )
        }
      },
    })
  }

  const handleSendComment = async () => {
    if (!commentText.trim()) return
    if (!currentUser) {
      messageApi.warning('Vui lòng đăng nhập để bình luận.')
      return
    }
    try {
      await sendComment(commentText.trim())
      setCommentText('')
      messageApi.success('Đã gửi bình luận.')
    } catch (err: unknown) {
      messageApi.error(err instanceof Error ? err.message : 'Không thể gửi bình luận.')
    }
  }

  if (loading) {
    return (
      <section className="user-page" style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </section>
    )
  }

  if (!post) {
    return (
      <section className="user-page">
        Không tìm thấy bài đăng. <Link to="/posts">Quay lại danh sách</Link>
      </section>
    )
  }

  return (
    <section className="user-page">
      {contextHolder}
      <Link className="back-link" to="/posts">
        ← Trở lại danh sách bài đăng
      </Link>

      <div className="post-detail-grid">
        <article className="post-detail">
          <header>
            <Tag color={post.status === 'open' ? 'green' : post.status === 'matched' ? 'blue' : 'default'}>
              {post.status === 'open' ? 'MATCH REQUEST' : post.status === 'matched' ? 'MATCHED' : 'CLOSED'}
            </Tag>
            <Tag>{post.status.toUpperCase()}</Tag>
          </header>
          <h1>{post.title}</h1>
          <div className="post-metadata">
            <span>
              <EnvironmentOutlined /> {post.location}
            </span>
            <span>
              <CalendarOutlined /> {post.date} · {post.time}
            </span>
            <span>
              <TeamOutlined /> {post.format} · {post.level}
            </span>
          </div>
          <p>{post.description}</p>

          {!isOwner && post.status === 'open' && (
            <div style={{ marginTop: 24 }}>
              <PillButton
                variant="primary"
                size="lg"
                loading={actionLoading}
                disabled={hasApplied}
                onClick={handleApply}
                text={hasApplied ? 'Đã gửi yêu cầu bắt đối' : 'Bắt đối / Xin giao lưu ngay'}
              />
            </div>
          )}
        </article>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignSelf: 'start' }}>
          {isOwner && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Dropdown
                menu={{
                  items: [
                    { key: 'open', label: t('posts.status.open') },
                    { key: 'matched', label: t('posts.status.matched') },
                    { key: 'closed', label: t('posts.status.closed') },
                  ],
                  onClick: ({ key }) => handleStatusChange(key as 'open' | 'matched' | 'closed'),
                }}
                disabled={actionLoading}
              >
                <Button
                  style={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
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
                {t('posts.ownerControls.deleteBtn')}
              </Button>
            </div>
          )}

          <aside className="applicant-panel">
            <header>
              <h2>Ứng viên xin bắt đối</h2>
              <Tag color={matches.filter((m) => m.status === 'pending').length > 0 ? 'green' : 'default'}>
                {matches.filter((m) => m.status === 'pending').length} PENDING
              </Tag>
            </header>

          {matches.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', padding: '16px 0' }}>
              Chưa có ứng viên nào gửi yêu cầu bắt đối.
            </p>
          ) : (
            matches.map((item) => (
              <div className="applicant" key={item.id} style={{ marginBottom: 12 }}>
                <div>
                  <b>{item.applicant?.fullName || item.applicant?.email || 'Đội bóng'}</b>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Trạng thái:{' '}
                    <Tag color={item.status === 'accepted' ? 'green' : item.status === 'rejected' ? 'red' : 'gold'}>
                      {item.status.toUpperCase()}
                    </Tag>
                  </div>
                </div>

                {isOwner && item.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      size="small"
                      loading={actionLoading}
                      onClick={() => handleDecide(item, true)}
                    >
                      Nhận
                    </Button>
                    <Button
                      danger
                      icon={<CloseOutlined />}
                      size="small"
                      loading={actionLoading}
                      onClick={() => handleDecide(item, false)}
                    >
                      Từ chối
                    </Button>
                  </div>
                )}

                {item.status === 'accepted' && (isOwner || item.applicantId === currentUser?.id) && (
                  <Button
                    type="primary"
                    icon={<MessageOutlined />}
                    size="small"
                    onClick={() => navigate('/messages')}
                  >
                    {t('chat.sendMessage', { defaultValue: 'Nhắn tin' })}
                  </Button>
                )}
              </div>
            ))
          )}
        </aside>
      </div>

        <section className="discussion">
          <h2>Thảo luận ({comments.length})</h2>
          {comments.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', marginBottom: 16 }}>
              Chưa có bình luận nào. Hãy bắt đầu cuộc trò chuyện!
            </p>
          ) : (
            comments.map((item) => (
              <blockquote key={item.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Avatar size="small" icon={<UserOutlined />} />
                  <b>{item.user?.fullName || item.user?.email || 'Thành viên'}</b>
                  <small style={{ color: '#888', marginLeft: 'auto' }}>
                    {new Date(item.createdAt).toLocaleTimeString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </small>
                </div>
                <p style={{ margin: 0 }}>{item.content}</p>
              </blockquote>
            ))
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onPressEnter={handleSendComment}
              placeholder="Thêm câu hỏi hoặc thảo luận về trận đấu..."
            />
            <PillButton
              variant="primary"
              icon={<SendOutlined />}
              loading={actionLoading}
              onClick={handleSendComment}
              text="Gửi"
            />
          </div>
        </section>
      </div>
      {ConfirmDialog}
    </section>
  )
}
