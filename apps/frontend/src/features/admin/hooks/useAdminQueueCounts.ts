import { useEffect, useState } from 'react'
import { getAdminOverview } from '../service/admin.service'

export interface AdminQueueCounts {
  pendingOwners: number
  pendingFields: number
  flaggedReviews: number
}

export function useAdminQueueCounts(enabled = true) {
  const [counts, setCounts] = useState<AdminQueueCounts>({
    pendingOwners: 0,
    pendingFields: 0,
    flaggedReviews: 0,
  })

  useEffect(() => {
    if (!enabled) return

    let isMounted = true
    const fetchCounts = async () => {
      try {
        const overview = await getAdminOverview({
          days: 7,
          queueLimit: 0,
          auditLimit: 0,
        })
        if (isMounted && overview?.metrics?.queue) {
          setCounts({
            pendingOwners: overview.metrics.queue.pendingOwnerApprovals ?? 0,
            pendingFields: overview.metrics.queue.pendingFieldApprovals ?? 0,
            flaggedReviews: overview.metrics.queue.flaggedReviews ?? 0,
          })
        }
      } catch {
        // Fallback gracefully without breaking navigation
      }
    }

    void fetchCounts()
    return () => {
      isMounted = false
    }
  }, [enabled])

  return counts
}
