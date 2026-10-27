import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Empty, Segmented, Spin, message } from 'antd'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PillButton } from '../../components/PillButton'
import { matchPosts, type MatchPost } from '../user/user.data'
import { CreatePostModal } from './components/CreatePostModal'
import { PostCard } from './components/PostCard'
import { useMyPosts } from './hooks/useMyPosts'
import { deletePost } from './service/post.service'

export function MyPostsPage() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<MatchPost['status']>('open')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const { apiPosts, loading, refetch } = useMyPosts(status)

  const visible =
    apiPosts.length > 0 ? apiPosts : matchPosts.filter((post) => post.status === status)

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId)
      messageApi.success(t('posts.deleteSuccess'))
      refetch()
    } catch (err: unknown) {
      messageApi.error(
        err instanceof Error ? err.message : t('posts.deleteModal.error'),
      )
    }
  }

  return (
    <section className="user-page">
      {contextHolder}
      <header className="user-page__head">
        <div>
          <span className="eyebrow">MY MATCH SIGNALS</span>
          <h1>{t('posts.myPosts')}</h1>
          <p>{t('posts.myPostsSubtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <PillButton
            variant="secondary"
            icon={<ReloadOutlined />}
            onClick={() => refetch()}
            loading={loading}
            text={t('common.refresh')}
          />
          <PillButton
            variant="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
            text={t('posts.createPost')}
          />
        </div>
      </header>

      <Segmented
        value={status}
        onChange={(val) => setStatus(val as MatchPost['status'])}
        options={[
          { value: 'open', label: t('posts.status.open') },
          { value: 'matched', label: t('posts.status.matched') },
          { value: 'closed', label: t('posts.status.closed') },
        ]}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size="large" />
        </div>
      ) : visible.length ? (
        <div className="post-grid">
          {visible.map((post) => (
            <PostCard post={post} manage key={post.id} onDelete={handleDeletePost} />
          ))}
        </div>
      ) : (
        <Empty description={t('posts.empty')} />
      )}

      <CreatePostModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => refetch()}
      />
    </section>
  )
}
