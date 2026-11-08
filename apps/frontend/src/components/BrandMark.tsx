import { Link } from 'react-router-dom'

interface BrandMarkProps {
  to?: string
}

export function BrandMark({ to = '/' }: BrandMarkProps) {
  return (
    <Link className="brand-mark" to={to} aria-label="PitchMaster home">
      <span className="brand-mark__icon" aria-hidden="true"><i /><i /><i /></span>
      <span>PitchMaster</span>
    </Link>
  )
}

