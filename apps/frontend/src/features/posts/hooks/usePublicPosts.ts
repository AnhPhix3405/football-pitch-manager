import { useCallback, useEffect, useState } from 'react'
import { getPublicPosts } from '../service/post.service'
import type { BackendPost } from '../interface/post.types'
import type { MatchPost } from '../../user/user.data'

export function mapBackendPostToMatchPost(item: BackendPost): MatchPost {
  const format: '5v5' | '7v7' | '11v11' =
    item.maxPlayers <= 10 ? '5v5' : item.maxPlayers <= 14 ? '7v7' : '11v11'
  return {
    id: item.id,
    title: item.title,
    team: item.user?.fullName || item.user?.email.split('@')[0] || 'Đội bóng',
    authorName: item.user?.fullName || item.user?.email.split('@')[0] || 'Đội bóng',
    authorAvatar: item.user?.avatarUrl || undefined,
    location: item.content?.includes('Địa điểm:')
      ? item.content.split('Địa điểm:')[1]?.replace(')', '').trim() || 'TP.HCM'
      : 'Sân bóng tại TP.HCM',
    date: item.playDate,
    time: `${item.startTime.slice(0, 5)}${item.endTime ? ` – ${item.endTime.slice(0, 5)}` : ''}`,
    format,
    level: item.skillLevelRequired || 'Phong trào',
    needed: 1,
    applicants: 0,
    status: item.status,
    description: item.content || 'Trận đấu giao lưu bóng đá.',
    imageUrl: item.imageUrl || undefined,
  }
}

export function filterPosts(
  posts: MatchPost[],
  query: string,
  level: string,
  selectedDate: string | null,
): MatchPost[] {
  return posts.filter((post) => {
    const matchStatus = post.status === 'open'
    const matchLevel = level === 'all' || post.level === level
    const matchQuery =
      !query || `${post.title} ${post.location} ${post.team}`.toLowerCase().includes(query.toLowerCase())
    const matchDate = !selectedDate || post.date === selectedDate
    return matchStatus && matchLevel && matchQuery && matchDate
  })
}

export function usePublicPosts(query = '', level = 'all', selectedDate: string | null = null) {
  const [apiPosts, setApiPosts] = useState<MatchPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getPublicPosts({
        search: query || undefined,
        skillLevel: level !== 'all' ? level : undefined,
        playDate: selectedDate || undefined,
        status: 'open',
      })
      if (res?.items) {
        setApiPosts(res.items.map(mapBackendPostToMatchPost))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải bài đăng tìm đối')
    } finally {
      setLoading(false)
    }
  }, [query, level, selectedDate])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

  return { apiPosts, loading, error, refetch: loadPosts }
}
