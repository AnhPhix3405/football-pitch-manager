import { useCallback, useEffect, useState } from 'react'
import {
  acceptMatch,
  applyMatch,
  createPostComment,
  getPostComments,
  getPostDetail,
  getPostMatches,
  rejectMatch,
} from '../service/post.service'
import type { BackendPost, BackendPostComment, BackendPostMatch } from '../interface/post.types'

export function usePostDetail(postId: string) {
  const [postData, setPostData] = useState<BackendPost | null>(null)
  const [matches, setMatches] = useState<BackendPostMatch[]>([])
  const [comments, setComments] = useState<BackendPostComment[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    if (!postId) return
    try {
      setLoading(true)
      setError(null)
      const postRes = await getPostDetail(postId)
      setPostData(postRes)

      const [matchesRes, commentsRes] = await Promise.allSettled([
        getPostMatches(postId),
        getPostComments(postId),
      ])

      if (matchesRes.status === 'fulfilled') {
        setMatches(matchesRes.value || [])
      }
      if (commentsRes.status === 'fulfilled') {
        setComments(commentsRes.value || [])
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Lỗi tải chi tiết bài đăng')
    } finally {
      setLoading(false)
    }
  }, [postId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const applyForMatch = async () => {
    try {
      setActionLoading(true)
      await applyMatch(postId)
      await loadData()
      return true
    } finally {
      setActionLoading(false)
    }
  }

  const acceptMatchApplicant = async (matchId: string) => {
    try {
      setActionLoading(true)
      await acceptMatch(postId, matchId)
      await loadData()
      return true
    } finally {
      setActionLoading(false)
    }
  }

  const rejectMatchApplicant = async (matchId: string) => {
    try {
      setActionLoading(true)
      await rejectMatch(postId, matchId)
      await loadData()
      return true
    } finally {
      setActionLoading(false)
    }
  }

  const sendComment = async (content: string) => {
    try {
      setActionLoading(true)
      await createPostComment(postId, content)
      await loadData()
      return true
    } finally {
      setActionLoading(false)
    }
  }

  return {
    postData,
    matches,
    comments,
    loading,
    actionLoading,
    error,
    refetch: loadData,
    applyForMatch,
    acceptMatchApplicant,
    rejectMatchApplicant,
    sendComment,
  }
}
