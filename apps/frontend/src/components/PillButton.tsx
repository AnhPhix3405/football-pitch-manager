import { LoadingOutlined } from '@ant-design/icons'
import {
  BUTTON_SIZES,
  BUTTON_VARIANTS,
  type PillButtonProps,
} from '../constants/button.constant'

export function PillButton({
  text,
  children,
  onClick,
  icon,
  iconPosition = 'left',
  variant = BUTTON_VARIANTS.PRIMARY,
  size = BUTTON_SIZES.MD,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  style,
}: PillButtonProps) {
  const content = text ?? children
  const isDisabled = disabled || loading

  const renderIcon = () => {
    if (loading) {
      return <LoadingOutlined className="pill-btn__icon pill-btn__spinner" />
    }
    if (icon) {
      return <span className="pill-btn__icon">{icon}</span>
    }
    return null
  }

  const iconNode = renderIcon()

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={style}
      className={`pill-btn pill-btn--${variant} pill-btn--${size} ${isDisabled ? 'pill-btn--disabled' : ''} ${className}`.trim()}
    >
      {iconPosition === 'left' && iconNode}
      {content && <span>{content}</span>}
      {iconPosition === 'right' && iconNode}
    </button>
  )
}
