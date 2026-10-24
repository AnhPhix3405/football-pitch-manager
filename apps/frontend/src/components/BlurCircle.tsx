import React from 'react'

export interface BlurCircleProps {
  variant?: 'lime' | 'amber' | 'emerald' | 'blue'
  color?: string
  size?: number | string
  top?: number | string
  left?: number | string
  right?: number | string
  bottom?: number | string
  blur?: number | string
  opacity?: number
  animate?: boolean
  className?: string
  style?: React.CSSProperties
}

const variantGradients: Record<NonNullable<BlurCircleProps['variant']>, { center: string; mid: string }> = {
  lime: {
    center: 'rgba(175, 255, 130, 0.48)',
    mid: 'rgba(140, 252, 112, 0.26)',
  },
  amber: {
    center: 'rgba(255, 200, 80, 0.45)',
    mid: 'rgba(245, 160, 45, 0.24)',
  },
  emerald: {
    center: 'rgba(55, 240, 140, 0.45)',
    mid: 'rgba(34, 197, 94, 0.24)',
  },
  blue: {
    center: 'rgba(80, 215, 255, 0.42)',
    mid: 'rgba(56, 189, 248, 0.22)',
  },
}

export function BlurCircle({
  variant = 'lime',
  color,
  size = 500,
  top,
  left,
  right,
  bottom,
  blur = 85,
  opacity = 1,
  animate = true,
  className = '',
  style = {},
}: BlurCircleProps) {
  const gradient = variantGradients[variant]
  const background = color
    ? `radial-gradient(circle, ${color} 0%, transparent 70%)`
    : `radial-gradient(circle, ${gradient.center} 0%, ${gradient.mid} 45%, transparent 70%)`
  const sizeValue = typeof size === 'number' ? `${size}px` : size
  const blurValue = typeof blur === 'number' ? `${blur}px` : blur

  const circleStyle: React.CSSProperties = {
    position: 'absolute',
    width: sizeValue,
    height: sizeValue,
    top,
    left,
    right,
    bottom,
    background,
    borderRadius: '50%',
    filter: `blur(${blurValue})`,
    opacity,
    pointerEvents: 'none',
    zIndex: 1,
    ...style,
  }

  return (
    <div
      aria-hidden="true"
      className={`blur-circle ${animate ? 'blur-circle--animated' : ''} ${className}`}
      style={circleStyle}
    />
  )
}
