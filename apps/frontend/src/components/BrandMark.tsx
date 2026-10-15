import { Link } from 'react-router-dom'

export function BrandMark() {
  return (
    <Link className="brand-mark" to="/" aria-label="PitchMaster home">
      <span className="brand-mark__icon" aria-hidden="true"><i /><i /><i /></span>
      <span>PitchMaster</span>
    </Link>
  )
}
