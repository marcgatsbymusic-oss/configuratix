import React from 'react';

// ─── Type Definitions ─────────────────────────────────────────────────────────
type OpeningId = 'o1' | 'o2' | 'o3' | 'o4' | 'o5' | 'o6' | 'fix';

interface WindowTypeGraphicProps {
  id: string;
  sashOpenings?: string[];
  className?: string;
  showLabels?: boolean;
}

// ─── Layout Definitions ───────────────────────────────────────────────────────
type CellDef = { x: number; y: number; w: number; h: number };

const LAYOUTS: Record<string, CellDef[]> = {
  '1':    [{ x: 0, y: 0, w: 1, h: 1 }],
  '1-OL': [{ x: 0, y: 0, w: 1, h: 0.28 }, { x: 0, y: 0.28, w: 1, h: 0.72 }],
  '1-UL': [{ x: 0, y: 0, w: 1, h: 0.72 }, { x: 0, y: 0.72, w: 1, h: 0.28 }],
  '2':    [{ x: 0, y: 0, w: 0.5, h: 1 }, { x: 0.5, y: 0, w: 0.5, h: 1 }],
  '2A':   [{ x: 0, y: 0, w: 0.35, h: 1 }, { x: 0.35, y: 0, w: 0.65, h: 1 }],
  '2-OL': [
    { x: 0, y: 0, w: 1, h: 0.28 },
    { x: 0, y: 0.28, w: 0.5, h: 0.72 },
    { x: 0.5, y: 0.28, w: 0.5, h: 0.72 },
  ],
  '3': [
    { x: 0, y: 0, w: 0.333, h: 1 },
    { x: 0.333, y: 0, w: 0.334, h: 1 },
    { x: 0.667, y: 0, w: 0.333, h: 1 },
  ],
  '3-OL': [
    { x: 0, y: 0, w: 1, h: 0.28 },
    { x: 0, y: 0.28, w: 0.333, h: 0.72 },
    { x: 0.333, y: 0.28, w: 0.334, h: 0.72 },
    { x: 0.667, y: 0.28, w: 0.333, h: 0.72 },
  ],
  '4': [
    { x: 0, y: 0, w: 0.25, h: 1 },
    { x: 0.25, y: 0, w: 0.25, h: 1 },
    { x: 0.5, y: 0, w: 0.25, h: 1 },
    { x: 0.75, y: 0, w: 0.25, h: 1 },
  ],
};

function resolveLayout(id: string): string {
  if (!id) return '1';
  const c = id.toUpperCase();
  if (c === 'B100') return '1';
  if (c === 'B200') return '2';
  if (c === 'B201') return '1-OL';
  if (c === 'B300') return '2-OL';
  if (c.startsWith('F1')) {
    if (['F102','F103','F103E','F103P','F103Z'].includes(c)) return '1-OL';
    if (['F107','F108'].includes(c)) return '1-UL';
    return '1';
  }
  if (c.startsWith('F2')) {
    if (['F202','F204','F206','F208','F250','F252'].includes(c)) return '2-OL';
    if (['F201','F203','F205','F207'].includes(c)) return '2A';
    return '2';
  }
  if (c.startsWith('F3')) {
    if (['F301','F303','F307','F350'].includes(c)) return '3-OL';
    return '3';
  }
  if (c.startsWith('F4')) return '4';
  return '1';
}

// ─── Opening Lines ─────────────────────────────────────────────────────────────
function OpeningLines({ opening, x1, y1, x2, y2 }: {
  opening: OpeningId; x1: number; y1: number; x2: number; y2: number;
}) {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;

  const sp = { stroke: '#566673', strokeWidth: 0.15, strokeLinecap: 'butt' as const, fill: 'none' };

  if (opening === 'o1' || opening === 'fix') {
    return null;
  }

  // o3: Handle Left, Hinges Right
  if (opening === 'o3') {
    return (
      <g>
        <line x1={x2} y1={y1} x2={x1} y2={cy} {...sp} />{/* TR → LC */}
        <line x1={x2} y1={y2} x2={x1} y2={cy} {...sp} />{/* BR → LC */}
        <line x1={x1} y1={y2} x2={cx} y2={y1} {...sp} />{/* BL → TC (Points UP) */}
        <line x1={x2} y1={y2} x2={cx} y2={y1} {...sp} />{/* BR → TC (Points UP) */}
      </g>
    );
  }

  // o2: Handle Right, Hinges Left
  if (opening === 'o2') {
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={cy} {...sp} />{/* TL → RC */}
        <line x1={x1} y1={y2} x2={x2} y2={cy} {...sp} />{/* BL → RC */}
        <line x1={x1} y1={y1} x2={cx} y2={y2} {...sp} />{/* TL → BC */}
        <line x1={x2} y1={y1} x2={cx} y2={y2} {...sp} />{/* TR → BC */}
      </g>
    );
  }

  if (opening === 'o4') { // Turn left
    return (
      <g>
        <line x1={x2} y1={y1} x2={x1} y2={cy} {...sp} />
        <line x1={x2} y1={y2} x2={x1} y2={cy} {...sp} />
      </g>
    );
  }

  if (opening === 'o5') { // Turn right
    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={cy} {...sp} />
        <line x1={x1} y1={y2} x2={x2} y2={cy} {...sp} />
      </g>
    );
  }

  if (opening === 'o6') { // Kipp only
    return (
      <g>
        <line x1={x1} y1={y1} x2={cx} y2={y2} {...sp} />{/* TL → BC */}
        <line x1={x2} y1={y1} x2={cx} y2={y2} {...sp} />{/* TR → BC */}
      </g>
    );
  }

  return null;
}

// ─── Lever Handle ─────────────────────────────────────────────────────────────
function LeverHandle({ opening, px, py, pw, ph, sashThickness = 6 }: {
  opening: OpeningId; px: number; py: number; pw: number; ph: number; sashThickness?: number;
}) {
  if (opening === 'o1' || opening === 'fix') return null;

  const cy = py + ph / 2;         
  const isLeftHandle = opening === 'o3' || opening === 'o5';

  const BP_W  = 1.5;
  const BP_H  = 9.5;
  const gripW = 1.0; 

  if (isLeftHandle) {
    const centerX = px + (sashThickness / 2);
    const bpL = centerX - BP_W / 2;
    const bpT = cy - BP_H / 2;
    const bpB = cy + BP_H / 2;

    const pivotY = bpT + 1.8; 
    const handleL = bpL - 2.5;

    const pathD = `
      M ${centerX},${pivotY - 0.5}
      C ${handleL},${pivotY - 0.5} ${handleL},${pivotY + 0.5} ${handleL},${pivotY + 2}
      L ${handleL},${bpB - 1}
      C ${handleL},${bpB + 0.2} ${centerX - 0.5},${bpB + 0.2} ${centerX},${bpB - 0.2}
      L ${centerX},${bpB - 1.2}
      C ${handleL + gripW},${bpB - 1.2} ${handleL + gripW},${bpB - 2} ${handleL + gripW},${bpB - 3}
      L ${handleL + gripW},${pivotY + 1.5}
      C ${handleL + gripW},${pivotY + 0.5} ${centerX},${pivotY + 0.5} ${centerX},${pivotY + 0.5}
      Z
    `;

    return (
      <g>
        <rect x={bpL + 0.2} y={bpT + 0.2} width={BP_W} height={BP_H} rx="0.75" fill="rgba(0,0,0,0.15)" />
        <rect x={bpL} y={bpT} width={BP_W} height={BP_H} rx="0.75" fill="#fefefe" stroke="#666" strokeWidth="0.15" />
        <circle cx={centerX} cy={pivotY} r="0.8" fill="#e0e0e0" stroke="#888" strokeWidth="0.15" />
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" transform="translate(0.3, 0.3)" />
        <path d={pathD} fill="#f4f4f4" stroke="#555" strokeWidth="0.2" strokeLinejoin="round" />
      </g>
    );
  } else {
    // Mirrored for right handle
    const centerX = px + pw - (sashThickness / 2);
    const bpL = centerX - BP_W / 2;
    const bpT = cy - BP_H / 2;
    const bpB = cy + BP_H / 2;

    const pivotY = bpT + 1.8; 
    const handleR = centerX + BP_W / 2 + 2.5;

    const pathD = `
      M ${centerX},${pivotY - 0.5}
      C ${handleR},${pivotY - 0.5} ${handleR},${pivotY + 0.5} ${handleR},${pivotY + 2}
      L ${handleR},${bpB - 1}
      C ${handleR},${bpB + 0.2} ${centerX + 0.5},${bpB + 0.2} ${centerX},${bpB - 0.2}
      L ${centerX},${bpB - 1.2}
      C ${handleR - gripW},${bpB - 1.2} ${handleR - gripW},${bpB - 2} ${handleR - gripW},${bpB - 3}
      L ${handleR - gripW},${pivotY + 1.5}
      C ${handleR - gripW},${pivotY + 0.5} ${centerX},${pivotY + 0.5} ${centerX},${pivotY + 0.5}
      Z
    `;

    return (
      <g>
        <rect x={bpL + 0.2} y={bpT + 0.2} width={BP_W} height={BP_H} rx="0.75" fill="rgba(0,0,0,0.15)" />
        <rect x={bpL} y={bpT} width={BP_W} height={BP_H} rx="0.75" fill="#fefefe" stroke="#666" strokeWidth="0.15" />
        <circle cx={centerX} cy={pivotY} r="0.8" fill="#e0e0e0" stroke="#888" strokeWidth="0.15" />
        <path d={pathD} fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" transform="translate(-0.3, 0.3)" />
        <path d={pathD} fill="#f4f4f4" stroke="#555" strokeWidth="0.2" strokeLinejoin="round" />
      </g>
    );
  }
}

// ─── Hinge Plates ─────────────────────────────────────────────────────────────
function Hinges({ opening, py, ph, gapCenter }: {
  opening: OpeningId; py: number; ph: number; gapCenter: number;
}) {
  if (opening === 'o1' || opening === 'fix') return null;

  const isRightHinged = opening === 'o3' || opening === 'o5';
  
  const w = 1.0;
  const h = 5.0;
  
  // To perfectly match the image, place them very close to the top/bottom corners.
  // The distance from the sash top edge to the top hinge, and bottom edge to bottom hinge.
  const topY = py + 1.5;
  const botY = py + ph - h - 1.5;

  const Hinge = ({ x, y }: { x: number; y: number }) => (
    <g stroke="#777" strokeWidth="0.15" fill="#fefefe">
      {/* Shadow */}
      <rect x={x + 0.2} y={y + 0.2} width={w} height={h} fill="rgba(0,0,0,0.15)" stroke="none" />
      {/* Outer block */}
      <rect x={x} y={y} width={w} height={h} />
      {/* Internal lines to make it look like a 3-part hinge cylinder */}
      <line x1={x} y1={y + 1} x2={x + w} y2={y + 1} />
      <line x1={x} y1={y + h - 1} x2={x + w} y2={y + h - 1} />
    </g>
  );

  const hx = isRightHinged ? gapCenter - (w / 2) : gapCenter - (w / 2);

  return (
    <g>
      <Hinge x={hx} y={topY} />
      <Hinge x={hx} y={botY} />
    </g>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
import { StaticF100 } from './StaticF100';

export const WindowTypeGraphic: React.FC<WindowTypeGraphicProps> = ({
  id,
  sashOpenings = [],
  className = ''
}) => {
  if (!id) return null;

  const isF100 = id.toUpperCase().includes('F100');

  // Immediately render the static immaculately traced SVG if this is an F100 window
  if (isF100) {
    return <StaticF100 className={`w-full h-full ${className}`} />;
  }

  const layoutKey = resolveLayout(id);
  const cells = LAYOUTS[layoutKey] || LAYOUTS['1'];

  // ViewBox constants (in SVG user units)
  const VW = 100, VH = 100;
  
  // Dimensions matching the provided F100 image proportions perfectly
  const F  = 4.5;    // Fixed outer frame thickness
  const G  = 0.4;    // Gap between frames
  const S  = 6.0;    // Moveable sash frame thickness
  // const INSET_B = 0.5; // Stroke bevel thickness
  
  // Total container available for cells internal area
  const IW = VW - (F * 2);
  const IH = VH - (F * 2);

  const GLASS_COLOR = '#b8cfe0';
  const FRAME_COLOR = '#ffffff';
  const DARK_BORDER = '#959695';   // For the frame demarcations
  // const BEVEL       = '#dadada';   // Optional subtle 3d hint

  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className={`w-full h-full ${className}`}
      preserveAspectRatio="xMidYMid meet"
      aria-label={`Window type ${id}`}
    >
      {/* 1. Outer Frame Fill (No stroke on the absolute outer edge as requested) */}
      <rect x={0} y={0} width={VW} height={VH} fill={FRAME_COLOR} />

      {/* ── Render each cell ── */}
      {cells.map((cell, idx) => {
        // cell box X,Y relative to the inner working area
        const cellX = F + cell.x * IW;
        const cellY = F + cell.y * IH;
        const cellW = cell.w * IW;
        const cellH = cell.h * IH;

        const opening = (sashOpenings[idx] as OpeningId) || 'o1';
        const isFixed = opening === 'o1' || opening === 'fix';

        // Dark grey line demarcating the inner edge of the purely white outer frame
        const outerFrameLineParams = {
          x: cellX, y: cellY, width: cellW, height: cellH
        };

        if (isFixed) {
          // A fixed window has NO movable sash frame. The glass sits directly in the outer frame.
          return (
            <g key={idx}>
              {/* Gap / Outer Demarcation */}
              <rect {...outerFrameLineParams} fill="none" stroke={DARK_BORDER} strokeWidth="0.2" />
              {/* Glass Fill */}
              <rect
                x={cellX + G} y={cellY + G}
                width={cellW - G*2} height={cellH - G*2}
                fill={GLASS_COLOR}
              />
              {/* Inner Bevel Shadow on Glass */}
              <rect
                x={cellX + G} y={cellY + G}
                width={cellW - G*2} height={cellH - G*2}
                fill="none" stroke="#89a7bf" strokeWidth="0.5"
              />
            </g>
          );
        }

        // --- OPENING SASH RENDER (Matches F100) ---
        // Sash block coordinates
        const sx = cellX + G;
        const sy = cellY + G;
        const sw = cellW - G * 2;
        const sh = cellH - G * 2;

        // Glass block coordinates (inside sash)
        const gx = sx + S;
        const gy = sy + S;
        const gw = sw - S * 2;
        const gh = sh - S * 2;

        return (
          <g key={idx}>
            {/* outer frame boundary line */}
            <rect {...outerFrameLineParams} fill="none" stroke={DARK_BORDER} strokeWidth="0.15" />
            
            {/* The gap background (darker to denote split between frames) */}
            <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke="#ddd" strokeWidth={G} />

            {/* Sub-Sash Fill */}
            <rect x={sx} y={sy} width={sw} height={sh} fill={FRAME_COLOR} />
            
            {/* Sash outer borderline */}
            <rect x={sx} y={sy} width={sw} height={sh} fill="none" stroke={DARK_BORDER} strokeWidth="0.15" />

            {/* Sash corner miters (45 deg diagonal lines on the sash frame) */}
            <g stroke={DARK_BORDER} strokeWidth="0.15">
              {/* Top Left */}
              <line x1={sx} y1={sy} x2={gx} y2={gy} />
              {/* Top Right */}
              <line x1={sx + sw} y1={sy} x2={gx + gw} y2={gy} />
              {/* Bottom Left */}
              <line x1={sx} y1={sy + sh} x2={gx} y2={gy + gh} />
              {/* Bottom Right */}
              <line x1={sx + sw} y1={sy + sh} x2={gx + gw} y2={gy + gh} />
            </g>

            {/* Sash inner borderline */}
            <rect x={gx} y={gy} width={gw} height={gh} fill="none" stroke={DARK_BORDER} strokeWidth="0.2" />

            {/* Glass Fill */}
            <rect x={gx} y={gy} width={gw} height={gh} fill={GLASS_COLOR} />

            {/* Glass Inner Inset Shadow (gives slight depth) */}
            <rect x={gx} y={gy} width={gw} height={gh} fill="none" stroke="#9bb7cd" strokeWidth="0.6" />

            {/* ── Opening Lines ── */}
            <OpeningLines opening={opening} x1={gx} y1={gy} x2={gx + gw} y2={gy + gh} />

            {/* ── Hinges ── */}
            {/* Gap center is slightly to the right of sx+sw (if right hinged), or to the left of sx (if left hinged) */}
            <Hinges
              opening={opening}
              py={sy} ph={sh}
              gapCenter={opening === 'o3' || opening === 'o5' ? sx + sw + (G/2) : sx - (G/2)}
            />

            {/* ── Lever Handle ── */}
            <LeverHandle
              opening={opening}
              px={sx} py={sy} pw={sw} ph={sh}
              sashThickness={S}
            />
          </g>
        );
      })}
    </svg>
  );
};

export { resolveLayout as resolveCantorLayout };
