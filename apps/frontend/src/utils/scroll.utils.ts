/**
 * Utility for smooth scrolling to top or a specific target offset.
 */
export function smoothScrollToTop(top = 0): void {
  if (typeof window === 'undefined') return
  try {
    window.scrollTo({
      top,
      left: 0,
      behavior: 'smooth',
    })
  } catch {
    // Fallback for older environments
    window.scrollTo(0, top)
  }
}
