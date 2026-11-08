import { Link } from 'react-router-dom'

export function BrandMark({ to = '/' }: { to?: string }) {
  return (
    <Link className="brand-mark" to={to} aria-label="PitchMaster home">
      <span className="brand-mark__icon" aria-hidden="true"><i /><i /><i /></span>
      <span>PitchMaster</span>
    </Link>
  )
}
