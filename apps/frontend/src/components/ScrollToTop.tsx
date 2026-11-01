import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { smoothScrollToTop } from '../utils/scroll.utils'

/**
 * Automatically scrolls window smoothly to top upon route change.
 */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    smoothScrollToTop(0)
  }, [pathname])

  return null
}
