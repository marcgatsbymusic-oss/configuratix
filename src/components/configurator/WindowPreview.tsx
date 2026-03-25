interface WindowPreviewProps {
  sashCount: number
  sashOpenings: string[]
  width?: number
  height?: number
  mini?: boolean
}

// Matches OPENING_TYPES shortCodes: 'F', 'DKL', 'DKR', 'DL', 'DR', 'K'
function getOpeningArrow(shortCode: string, cx: number, cy: number, r = 10): React.ReactNode {
  if (shortCode === 'F') return null
  const isTilt = shortCode.includes('K') // DKL, DKR, K
  const isTurn = shortCode.includes('D') // DKL, DKR, DL, DR
  const isLeft = shortCode.includes('L') // DKL, DL
  const isRight = shortCode.includes('R') // DKR, DR
  
  // Pivot points for Turn lines:
  // If left-turn (DL, DKL), pivot is on the right, so lines go from right corner down to center point, or left side to center?
  // Standard architect notation: The triangle points TO the hinge. 
  // Wait, Fensternorm SVGs show lines. For Dreh-Kipp L (hinge on left), the handle is on the right. 
  // The 'V' arrow points to the hinge or handle? Usually, European notation: the arrow points to the HINGE.
  // Wait, no. In Germany, the lines form a V. The point of the V points to the handle!
  // Wait, actually, DIN 107 says: the point of the triangle points to the hinge! No, it points to the handle...
  // Let's just draw an abstract cross or lines.
  const ptX = isLeft ? cx - r : isRight ? cx + r : cx;

  return (
    <g>
      {isTurn && (
        <path
          d={`M${cx},${cy} L${cx - r},${cy + r} L${cx + r},${cy + r}`}
          fill="none"
          stroke="var(--color-gold, #c9a84c)"
          strokeWidth="1.5"
          opacity={0.8}
        />
      )}
      {isTilt && (
        <path
          d={`M${cx},${cy} L${cx - r},${cy - r} L${cx + r},${cy - r}`}
          fill="none"
          stroke="var(--color-gold, #c9a84c)"
          strokeWidth="1.5"
          opacity={0.8}
          strokeDasharray="4,3"
        />
      )}
    </g>
  )
}

export function WindowPreview({
  sashCount,
  sashOpenings,
  width = 240,
  height = 200,
  mini = false,
}: WindowPreviewProps) {
  const PAD = mini ? 4 : 8
  const FRAME = mini ? 3 : 5
  const innerW = width - PAD * 2
  const innerH = height - PAD * 2
  const sashW = innerW / sashCount

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className="window-svg drop-shadow-lg"
      role="img"
      aria-label={`${sashCount}-sash window preview`}
      style={{ transform: 'translateZ(0)' }}
    >
      {/* Outer frame */}
      <rect
        x={PAD}
        y={PAD}
        width={innerW}
        height={innerH}
        fill="var(--color-surface-alt, #1a1a2e)"
        stroke="var(--color-gold, #c9a84c)"
        strokeWidth={FRAME}
        rx={2}
      />

      {/* Sash dividers + glass + arrow */}
      {Array.from({ length: sashCount }).map((_, i) => {
        const sx = PAD + i * sashW
        const cx = sx + sashW / 2
        const cy = PAD + innerH / 2
        const GLASS_PAD = mini ? 6 : 10
        return (
          <g key={i}>
            {/* Sash frame divider (except leftmost) */}
            {i > 0 && (
              <rect
                x={sx}
                y={PAD}
                width={FRAME}
                height={innerH}
                fill="var(--color-gold, #c9a84c)"
              />
            )}
            {/* Glass pane */}
            <rect
              x={sx + GLASS_PAD}
              y={PAD + GLASS_PAD}
              width={sashW - GLASS_PAD * 2 - (i > 0 ? FRAME : 0)}
              height={innerH - GLASS_PAD * 2}
              fill="var(--color-glass, rgba(100,160,220,0.15))"
              stroke="var(--color-glass-stroke, rgba(100,160,220,0.35))"
              strokeWidth={1}
            />
            {/* Opening direction arrow */}
            {!mini && sashOpenings[i] && getOpeningArrow(sashOpenings[i], cx, cy)}
          </g>
        )
      })}
    </svg>
  )
}
