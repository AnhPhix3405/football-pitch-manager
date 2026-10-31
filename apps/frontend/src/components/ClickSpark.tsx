import {
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from 'react'

export interface ClickSparkProps {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
  extraScale?: number
  children?: ReactNode
  className?: string
  style?: CSSProperties
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
}

interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
}

export function ClickSpark({
  sparkColor = '#ff4d6d',
  sparkSize = 10,
  sparkRadius = 24,
  sparkCount = 8,
  duration = 450,
  extraScale = 1.0,
  children,
  className = '',
  style,
  onClick,
}: ClickSparkProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sparksRef = useRef<Spark[]>([])
  const animFrameIdRef = useRef<number | null>(null)
  const drawRef = useRef<(currentTime: number) => void>(() => {})

  const draw = useCallback(
    (currentTime: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const activeSparks: Spark[] = []

      sparksRef.current.forEach((spark) => {
        const elapsed = currentTime - spark.startTime
        if (elapsed < duration) {
          activeSparks.push(spark)
          const linearProgress = elapsed / duration
          // Ease-out curve
          const progress = 1 - Math.pow(1 - linearProgress, 2)
          const currentRadius = progress * sparkRadius * extraScale
          const currentSize = sparkSize * (1 - progress)

          const x1 = spark.x + Math.cos(spark.angle) * currentRadius
          const y1 = spark.y + Math.sin(spark.angle) * currentRadius
          const x2 = spark.x + Math.cos(spark.angle) * (currentRadius + currentSize)
          const y2 = spark.y + Math.sin(spark.angle) * (currentRadius + currentSize)

          ctx.save()
          ctx.beginPath()
          ctx.moveTo(x1, y1)
          ctx.lineTo(x2, y2)
          ctx.strokeStyle = sparkColor
          ctx.lineWidth = Math.max(1, 2.5 * (1 - progress))
          ctx.lineCap = 'round'
          ctx.shadowColor = sparkColor
          ctx.shadowBlur = 4
          ctx.stroke()
          ctx.restore()
        }
      })

      sparksRef.current = activeSparks

      if (activeSparks.length > 0) {
        animFrameIdRef.current = requestAnimationFrame((t) => drawRef.current(t))
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        animFrameIdRef.current = null
      }
    },
    [duration, extraScale, sparkColor, sparkRadius, sparkSize],
  )

  useEffect(() => {
    drawRef.current = draw
  }, [draw])

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      onClick(e)
    }

    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const rect = container.getBoundingClientRect()
    // Sync canvas resolution with display size
    if (canvas.width !== rect.width || canvas.height !== rect.height) {
      canvas.width = rect.width
      canvas.height = rect.height
    }

    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    const now = performance.now()

    const newSparks: Spark[] = []
    for (let i = 0; i < sparkCount; i++) {
      const angle = (i * 2 * Math.PI) / sparkCount + (Math.random() * 0.2 - 0.1)
      newSparks.push({
        x: clickX,
        y: clickY,
        angle,
        startTime: now,
      })
    }

    sparksRef.current.push(...newSparks)

    if (animFrameIdRef.current === null) {
      animFrameIdRef.current = requestAnimationFrame((t) => drawRef.current(t))
    }
  }

  // Resize canvas when container size changes
  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = width
        canvas.height = height
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`click-spark-container ${className}`}
      style={{ position: 'relative', display: 'inline-flex', ...style }}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      />
      {children}
    </div>
  )
}
