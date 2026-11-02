import { Empty, Spin } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BlurCircle } from '~/components/BlurCircle'
import { CreatePostModal } from './components/CreatePostModal'
import { OpponentDiscoveryToolbar } from './components/OpponentDiscoveryToolbar'
import { PostCard } from './components/PostCard'
import { PostCardSkeleton } from './components/PostCardSkeleton'
import { filterPosts, usePublicPosts } from './hooks/usePublicPosts'
import type { OpponentFilterValues } from './interface/post.types'

export function OpponentDiscoveryPage() {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<OpponentFilterValues>({
    search: '',
    skillLevel: 'all',
    playDate: null,
  })
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { apiPosts, loading, loadingMore, hasMore, loadMore, refetch } = usePublicPosts(
    filters.search,
    filters.skillLevel,
    filters.playDate,
  )

  const visible = useMemo(() => {
    return filterPosts(apiPosts, filters.search, filters.skillLevel, filters.playDate)
  }, [apiPosts, filters.search, filters.skillLevel, filters.playDate])

  // Trích xuất địa điểm từ danh sách bài đăng thực tế để gợi ý linh hoạt
  const dynamicLocations = useMemo(() => {
    const locs = new Set<string>()
    apiPosts.forEach((p) => {
      if (p.location && p.location !== 'TP.HCM' && p.location !== 'Sân bóng tại TP.HCM') {
        locs.add(p.location)
      }
    })
    return Array.from(locs)
  }, [apiPosts])

  const handleFiltersChange = useCallback((newFilters: OpponentFilterValues) => {
    setFilters(newFilters)
  }, [])

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  const handleOpenCreateModal = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseCreateModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const sentinelEl = sentinelRef.current
    if (!sentinelEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first?.isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore()
        }
      },
      { root: null, rootMargin: '250px', threshold: 0.1 },
    )

    observer.observe(sentinelEl)
    return () => {
      observer.disconnect()
    }
  }, [hasMore, loading, loadingMore, loadMore])

  return (
    <section className="user-page opponent-discovery-page">
      {/* Ambient Blur Circles phát sáng nền phong cách PitchMaster */}
      <BlurCircle
        variant="lime"
        size={560}
        top="-40px"
        right="-80px"
        opacity={0.3}
        blur={110}
      />
      <BlurCircle
        variant="emerald"
        size={460}
        top="35%"
        left="-120px"
        opacity={0.22}
        blur={100}
      />

      {/* 1 Khối điều khiển độc lập: Đứng yên, không bị re-render chung khi bài đăng tải lại */}
      <OpponentDiscoveryToolbar
        onFiltersChange={handleFiltersChange}
        onRefresh={handleRefresh}
        onCreatePost={handleOpenCreateModal}
        loading={loading}
        dynamicLocations={dynamicLocations}
      />

      {/* Khu vực bài đăng: Cố định vị trí, chống giật layout khi tải/lọc */}
      <div className="opponent-discovery__content-wrap">
        <Spin spinning={loading}>
          <div className="opponent-discovery__posts-container">
            {visible.length > 0 ? (
              <>
                <div className="post-grid">
                  {visible.map((post) => (
                    <PostCard post={post} key={post.id} />
                  ))}

                  {/* Hiệu ứng Skeleton Cards mô phỏng khi đang tải thêm bài */}
                  {loadingMore &&
                    Array.from({ length: 4 }).map((_, idx) => (
                      <PostCardSkeleton key={`skeleton-load-more-${idx}`} />
                    ))}
                </div>

                {/* Sentinel kích hoạt infinite scroll khi cuộn tới chân trang */}
                <div ref={sentinelRef} className="post-scroll-sentinel" />

                {/* Đã xem hết tất cả */}
                {!hasMore && !loading && (
                  <div className="post-scroll-status post-scroll-status--end">
                    <span>{t('posts.allLoaded')}</span>
                  </div>
                )}
              </>
            ) : !loading ? (
              <div className="opponent-discovery__empty">
                <Empty description={t('posts.empty')} />
              </div>
            ) : null}
          </div>
        </Spin>
      </div>

      <CreatePostModal
        open={isModalOpen}
        onClose={handleCloseCreateModal}
        onSuccess={handleRefresh}
      />
    </section>
  )
}
