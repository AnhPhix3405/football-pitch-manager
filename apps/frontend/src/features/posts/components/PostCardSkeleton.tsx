import { memo } from 'react'

export const PostCardSkeleton = memo(function PostCardSkeleton() {
  return (
    <article className="post-card post-card--daily post-card--skeleton" aria-hidden="true">
      {/* Header: Avatar, Name & Status pill */}
      <header className="post-card__header">
        <div className="post-card__header-left">
          <div className="skeleton-box skeleton-avatar" />
          <div className="skeleton-author-info">
            <div className="skeleton-box skeleton-name" />
            <div className="skeleton-box skeleton-pill" />
          </div>
        </div>
      </header>

      {/* Bold Title Placeholder */}
      <div className="skeleton-box skeleton-title" />

      {/* Tags row */}
      <div className="skeleton-tags-row">
        <div className="skeleton-box skeleton-tag" />
        <div className="skeleton-box skeleton-tag" />
      </div>

      {/* Meta Row (Date, Time, Location) */}
      <div className="skeleton-meta-row">
        <div className="skeleton-box skeleton-meta" />
        <div className="skeleton-box skeleton-meta" />
      </div>

      {/* Cover Image Placeholder */}
      <div className="skeleton-box skeleton-cover" />

      {/* Footer Toolbar */}
      <footer className="skeleton-footer">
        <div className="skeleton-box skeleton-action" />
        <div className="skeleton-box skeleton-action" />
      </footer>
    </article>
  )
})
