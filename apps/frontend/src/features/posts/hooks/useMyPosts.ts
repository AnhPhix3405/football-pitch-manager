import { useCallback, useEffect, useState } from 'react'
import { getMyPosts } from '../service/post.service'
import { mapBackendPostToMatchPost } from './usePublicPosts'
import type { MatchPost } from '../../user/user.data'

export function useMyPosts(status: MatchPost['status']) {
  const [apiPosts, setApiPosts] = useState<MatchPost[]>([])
  const [totalCount, setTotalCount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMyPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [res, totalRes] = await Promise.all([
        getMyPosts({ status }),
        getMyPosts({}),
      ])
      if (res?.items) {
        setApiPosts(res.items.map(mapBackendPostToMatchPost))
      }
      if (totalRes?.total !== undefined) {
        setTotalCount(totalRes.total)
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

  return { apiPosts, totalCount, loading, error, refetch: loadMyPosts }
}
