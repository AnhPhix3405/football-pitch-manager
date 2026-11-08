import React, { useMemo } from 'react'

export interface EmotionStarMascotProps {
  rating: number
  size?: number
  className?: string
}

export const EmotionStarMascot = React.memo(function EmotionStarMascot({
  rating,
  size = 110,
  className = '',
}: EmotionStarMascotProps) {
  // Determine mood category: 5 (ecstatic), 4 (neutral/thoughtful), <=3 (sad/crying)
  const mood = useMemo(() => {
    if (rating >= 5) return 'happy'
    if (rating === 4) return 'neutral'
    return 'sad'
  }, [rating])

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className="w-full h-full drop-shadow-[0_10px_20px_rgba(251,191,36,0.25)] transition-all duration-300"
      >
        <defs>
          {/* Star Body Gradient */}
          <linearGradient id="starBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          {/* Star Top Highlight */}
          <linearGradient id="starHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Teardrop Gradient */}
          <linearGradient id="tearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7DD3FC" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>

          {/* Inner Glow Filter */}
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Warm Ambient Glow Circle */}
        <circle
          cx="60"
          cy="60"
          r="48"
          fill="#F59E0B"
          opacity="0.12"
        />

        {/* Rounded Plump Star Body */}
        <path
          d="M 60 14
             C 63 14, 66 18, 71 29
             L 74 36
             C 76 40, 81 43, 86 44
             L 97 46
             C 107 48, 110 54, 103 61
             L 95 68
             C 91 72, 89 77, 91 82
             L 93 94
             C 95 104, 89 108, 81 103
             L 71 96
             C 66 93, 60 93, 55 96
             L 45 103
             C 37 108, 31 104, 33 94
             L 35 82
             C 37 77, 35 72, 31 68
             L 23 61
             C 16 54, 19 48, 29 46
             L 40 44
             C 45 43, 50 40, 52 36
             L 55 29
             C 60 18, 63 14, 60 14 Z"
          fill="url(#starBodyGrad)"
          stroke="#D97706"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Star Top Highlight Arc */}
        <path
          d="M 60 17
             C 62 17, 65 20, 69 29
             L 72 36
             C 74 39, 78 41, 83 42
             L 93 44
             C 97 45, 96 48, 92 51
             C 80 47, 65 30, 60 17 Z"
          fill="url(#starHighlight)"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="40" cy="65" rx="5" ry="3.2" fill="#F43F5E" opacity="0.45" />
        <ellipse cx="80" cy="65" rx="5" ry="3.2" fill="#F43F5E" opacity="0.45" />

        {/* 5-STAR MOOD: JOYFUL & SMILING */}
        {mood === 'happy' && (
          <g className="transition-all duration-300">
            {/* Eyes: Happy Curved Arcs */}
            <path
              d="M 43 54 Q 49 46 55 54"
              fill="none"
              stroke="#1E293B"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M 65 54 Q 71 46 77 54"
              fill="none"
              stroke="#1E293B"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Happy Open Mouth with Tongue */}
            <g transform="translate(0, 3)">
              <path
                d="M 52 61 Q 60 74 68 61 Z"
                fill="#881337"
                stroke="#1E293B"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M 56 68 Q 60 63 64 68 Q 60 73 56 68 Z"
                fill="#FB7185"
              />
            </g>
          </g>
        )}

        {/* 4-STAR MOOD: NEUTRAL / THOUGHTFUL */}
        {mood === 'neutral' && (
          <g className="transition-all duration-300">
            {/* Eyes: Round Curious Eyes with White Highlight */}
            <circle cx="49" cy="53" r="5" fill="#1E293B" />
            <circle cx="51" cy="51" r="1.8" fill="#FFFFFF" />

            <circle cx="71" cy="53" r="5" fill="#1E293B" />
            <circle cx="73" cy="51" r="1.8" fill="#FFFFFF" />

            {/* Subtle Straight / Mild Neutral Mouth */}
            <path
              d="M 54 66 Q 60 64 66 66"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* 1-3 STAR MOOD: SAD / CRYING */}
        {mood === 'sad' && (
          <g className="transition-all duration-300">
            {/* Sad Slanted Eyebrows */}
            <path
              d="M 44 46 L 52 49"
              fill="none"
              stroke="#1E293B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 76 46 L 68 49"
              fill="none"
              stroke="#1E293B"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Eyes: Sad Puppy Eyes */}
            <circle cx="49" cy="55" r="5" fill="#1E293B" />
            <circle cx="50.8" cy="53.5" r="1.6" fill="#FFFFFF" />

            <circle cx="71" cy="55" r="5" fill="#1E293B" />
            <circle cx="72.8" cy="53.5" r="1.6" fill="#FFFFFF" />

            {/* Sad Down-turned Mouth */}
            <path
              d="M 54 69 Q 60 62 66 69"
              fill="none"
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Falling Teardrop (Right under Left Eye) */}
            <path
              d="M 44 65 C 44 63, 47 59, 47 59 C 47 59, 50 63, 50 65 C 50 67.5, 47.5 69, 45.5 68 C 44.5 67.5, 44 66.5, 44 65 Z"
              fill="url(#tearGrad)"
            />
            {/* Teardrop highlight */}
            <circle cx="46" cy="64" r="0.9" fill="#FFFFFF" opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  )
})

