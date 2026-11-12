import type { ReactNode } from 'react'

export interface OwnerBreadcrumbItem {
  title: ReactNode
  href?: string
}

export interface OwnerTabItem {
  key: string
  label: ReactNode
  icon?: ReactNode
  to?: string
  active?: boolean
  onClick?: () => void
}

export type OwnerFieldSubTabKey =
  | 'courts'
  | 'services'
  | 'pricing'
  | 'hours'
  | 'images'
  | 'edit'

export interface OwnerPageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  breadcrumbs?: OwnerBreadcrumbItem[]
  eyebrow?: string
  actions?: ReactNode
  tabs?: OwnerTabItem[]
  className?: string
  fieldId?: string
  activeTabKey?: OwnerFieldSubTabKey
}

