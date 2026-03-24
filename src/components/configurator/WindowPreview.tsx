interface WindowPreviewProps {
  sashCount: number
  openingType: string
  width?: number
  height?: number
  mini?: boolean
}

function getOpeningArrow(openingType: string, cx: number, cy: number, r = 10): React.ReactNode {
  if (openingType === 'fixed' || openingType === 'sliding') return null
  const isTilt = openingType === 'tilt' || openingType === 'tilt-turn'
  const isTurn = openingType === 'turn' || openingType === 'tilt-turn'
  return (
    <g>
      {isTurn && (
        <path
          d={`M${cx},${cy} L${cx - r},${cy + r} L${cx + r},${cy + r} Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={0.6}
        />
      )}
      {isTilt && (
        <path
          d={`M${cx},${cy} L${cx - r},${cy - r} L${cx + r},${cy - r} Z`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          opacity={0.6}
        />
      )}
    </g>
  )
}

export function WindowPreview({
  sashCount,
  openingType,
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
      className="window-svg"
      role="img"
      aria-label={`${sashCount}-sash ${openingType} window`}
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
            {!mini && getOpeningArrow(openingType, cx, cy)}
          </g>
        )
      })}
    </svg>
  )
}
