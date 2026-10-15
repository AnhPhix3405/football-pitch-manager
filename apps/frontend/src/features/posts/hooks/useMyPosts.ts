import { useCallback, useEffect, useState } from 'react'
import { getMyPosts } from '../service/post.service'
import { mapBackendPostToMatchPost } from './usePublicPosts'
import type { MatchPost } from '../../user/user.data'

export function useMyPosts(status: MatchPost['status']) {
  const [apiPosts, setApiPosts] = useState<MatchPost[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMyPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await getMyPosts({ status })
      if (res?.items) {
        setApiPosts(res.items.map(mapBackendPostToMatchPost))
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải bài đăng của tôi')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    loadMyPosts()
  }, [loadMyPosts])

  return { apiPosts, loading, error, refetch: loadMyPosts }
}
