import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IGLO_EDGE_COLORS, type SwatchColor } from '../../data/productDetails';

interface ColorPaletteOverlayProps {
  colorExt: string;
  colorInt: string;
  onChangeExt: (color: SwatchColor) => void;
  onChangeInt: (color: SwatchColor) => void;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

// ─── Color lookup ────────────────────────────────────────────────────────────

const isColorMatch = (color: SwatchColor, val: string): boolean => {
  if (!val) return false;
  if (color.id === val) return true;
  const normVal = val.toLowerCase().replace(/^c/, '').padStart(4, '0');
  const normId  = color.id.toLowerCase().replace(/^c/, '').padStart(4, '0');
  return normId === normVal || color.hex.toLowerCase() === val.toLowerCase();
};

// ─── Geometry ────────────────────────────────────────────────────────────────
// SVG canvas: the WHEEL CENTER is anchored at the BOTTOM-RIGHT corner (SVG_W, SVG_H).
// Only the top-left quadrant (angles 180°–270°) is rendered, giving a quarter-circle fan.
//
// SVG angle convention (standard SVG / Math):
//   0° = right (+x), 90° = down (+y), 180° = left (-x), 270° = up (-y)
//
// Visible window:  [180°, 270°]  →  top-left quadrant from the corner anchor point.

const SVG_W   = 310;      // canvas width  (= max reach of outer ring + margin)
const SVG_H   = 310;      // canvas height
const CX      = SVG_W;    // wheel center at right edge
const CY      = SVG_H;    // wheel center at bottom edge

// Outer ring (Exterior colors)
const O_RIN  = 172;   // inner radius of outer ring
const O_ROUT = 247;   // outer radius of outer ring  → 75 px thick (B side as long as A)

// Inner ring (Interior colors)
const I_RIN  = 85;    // inner radius of inner ring
const I_ROUT = 160;   // outer radius of inner ring  →  75 px thick

// Gap between rings: I_ROUT to O_RIN = 12 px (visual breathing room)

// Visible arc window (degrees)
const WIN_A = 180;   // start (left edge, flush)
const WIN_B = 270;   // end   (top edge)

// Per-color wedge geometry
const N          = IGLO_EDGE_COLORS.length;   // 43 colours
const WEDGE_DEG  = 360 / N;                   // ≈ 8.37° per colour
const WEDGE_GAP  = 0.5;                       // small gap between wedges (deg, each side)

// Rotation speeds (degrees / second)
const OUTER_SPEED =  5;   // clockwise
const INNER_SPEED = -8;   // counter-clockwise (negative)



// ─── SVG wedge path builder ──────────────────────────────────────────────────
function wedgePath(
  rIn: number, rOut: number,
  a1Deg: number, a2Deg: number,
): string {
  const a1  = (a1Deg * Math.PI) / 180;
  const a2  = (a2Deg * Math.PI) / 180;
  const big = Math.abs(a2Deg - a1Deg) > 180 ? 1 : 0;

  const ix1 = CX + rIn  * Math.cos(a1);
  const iy1 = CY + rIn  * Math.sin(a1);
  const ox1 = CX + rOut * Math.cos(a1);
  const oy1 = CY + rOut * Math.sin(a1);
  const ox2 = CX + rOut * Math.cos(a2);
  const oy2 = CY + rOut * Math.sin(a2);
  const ix2 = CX + rIn  * Math.cos(a2);
  const iy2 = CY + rIn  * Math.sin(a2);

  return [
    `M${f(ix1)},${f(iy1)}`,
    `L${f(ox1)},${f(oy1)}`,
    `A${rOut},${rOut},0,${big},1,${f(ox2)},${f(oy2)}`,
    `L${f(ix2)},${f(iy2)}`,
    `A${rIn},${rIn},0,${big},0,${f(ix1)},${f(iy1)}`,
    'Z',
  ].join('');
}

const f = (n: number) => n.toFixed(2);

function normDeg(a: number): number {
  return ((a % 360) + 360) % 360;
}

/** Returns true if the midpoint angle of a wedge lies within the visible window. */
function inWindow(midDeg: number): boolean {
  const m = normDeg(midDeg);
  return m >= WIN_A - WEDGE_DEG * 0.6 && m <= WIN_B + WEDGE_DEG * 0.6;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function ColorPaletteOverlay({
  colorExt, colorInt, onChangeExt, onChangeInt, className, onOpenChange,
}: ColorPaletteOverlayProps) {
  const [isOpen, setIsOpen]       = useState(false);
  const [hovExt, setHovExt]       = useState<number | null>(null);
  const [hovInt, setHovInt]       = useState<number | null>(null);
  const [isAutoSpin, setIsAutoSpin] = useState(true);
  const containerRef              = useRef<HTMLDivElement>(null);
  const inactivityTimerRef        = useRef<NodeJS.Timeout | null>(null);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    setIsAutoSpin(false);
    inactivityTimerRef.current = setTimeout(() => {
      setIsAutoSpin(true);
    }, 6000);
  }, []);

  // Rotation state (mutable refs – no re-render cost per degree)
  const outerAngle = useRef(0);
  const innerAngle = useRef(0);
  const outerPause = useRef(0);   // ms remaining in pause
  const innerPause = useRef(0);
  const lastTs     = useRef<number | null>(null);
  const rafId      = useRef<number | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Dragging state ref
  const dragState = useRef({
    active: false,
    target: null as 'outer' | 'inner' | null,
    startPointerAngle: 0,
    startWheelAngle: 0,
    hasDragged: false,
    startX: 0,
    startY: 0
  });

  // Trigger re-render each animation frame
  const [, tick] = useState(0);

  const activeExtIdx = IGLO_EDGE_COLORS.findIndex(c => isColorMatch(c, colorExt));
  const activeIntIdx = IGLO_EDGE_COLORS.findIndex(c => isColorMatch(c, colorInt));

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left - CX;
    const py = e.clientY - rect.top - CY;
    const r = Math.sqrt(px * px + py * py);
    
    let target: 'outer' | 'inner' | null = null;
    if (r >= 166 && r <= 265) {
      target = 'outer';
    } else if (r >= 70 && r < 166) {
      target = 'inner';
    }

    if (!target) return;

    svg.setPointerCapture(e.pointerId);

    const startPointerAngle = normDeg(Math.atan2(py, px) * 180 / Math.PI);
    const startWheelAngle = target === 'outer' ? outerAngle.current : innerAngle.current;

    dragState.current = {
      active: true,
      target,
      startPointerAngle,
      startWheelAngle,
      hasDragged: false,
      startX: e.clientX,
      startY: e.clientY
    };

    setIsAutoSpin(false); // Stop motion when dragging starts
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    // ── Start 6-second hold timer to apply to both sides and sync wheels ────
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    const targetWedgeIdx = Math.round(normDeg(startPointerAngle - (target === 'outer' ? outerAngle.current : innerAngle.current)) / WEDGE_DEG) % N;
    const color = IGLO_EDGE_COLORS[targetWedgeIdx];
    
    longPressTimer.current = setTimeout(() => {
      if (color) {
        // Sync color to both sides
        onChangeExt(color);
        onChangeInt(color);
        
        // Align wheels & pause auto rotation
        if (target === 'outer') {
          innerAngle.current = outerAngle.current;
          innerPause.current = 3000;
          outerPause.current = 3000;
        } else {
          outerAngle.current = innerAngle.current;
          outerPause.current = 3000;
          innerPause.current = 3000;
        }
        
        // Visual feedback / state tick
        tick(n => n + 1);
      }
    }, 6000);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragState.current;
    if (!drag.active || !drag.target) return;

    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left - CX;
    const py = e.clientY - rect.top - CY;
    const r = Math.sqrt(px * px + py * py);

    const currentPointerAngle = normDeg(Math.atan2(py, px) * 180 / Math.PI);
    let diff = currentPointerAngle - drag.startPointerAngle;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    // Check deviation to see if we should cancel the 6-second hold
    let angleDiff = Math.abs(diff);
    const startPx = drag.startX - rect.left - CX;
    const startPy = drag.startY - rect.top - CY;
    const startR = Math.sqrt(startPx * startPx + startPy * startPy);
    const radDiff = Math.abs(r - startR);

    // Cancel the hold if they spin the wheel by >12 degrees or slide radially by >25px
    if (angleDiff > 12 || radDiff > 25) {
      drag.hasDragged = true;
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    const newAngle = normDeg(drag.startWheelAngle + diff);

    if (drag.target === 'outer') {
      outerAngle.current = newAngle;
    } else {
      innerAngle.current = newAngle;
    }

    tick(n => n + 1);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragState.current;
    
    // Clear 6-second hold timer on release
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!drag.active) return;
    
    const wasClick = !drag.hasDragged;
    
    e.currentTarget.releasePointerCapture(e.pointerId);
    drag.active = false;
    
    if (wasClick && drag.target) {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const px = e.clientX - rect.left - CX;
      const py = e.clientY - rect.top - CY;
      const r = Math.sqrt(px * px + py * py);
      
      const theta = normDeg((Math.atan2(py, px) * 180) / Math.PI);
      
      if (drag.target === 'outer' && r >= 166 && r <= 265) {
        const diffDeg = normDeg(theta - outerAngle.current);
        const idx = Math.round(diffDeg / WEDGE_DEG) % N;
        const color = IGLO_EDGE_COLORS[idx];
        if (color) {
          onChangeExt(color);
          outerPause.current = 1600;
        }
      } else if (drag.target === 'inner' && r >= 70 && r < 166) {
        const diffDeg = normDeg(theta - innerAngle.current);
        const idx = Math.round(diffDeg / WEDGE_DEG) % N;
        const color = IGLO_EDGE_COLORS[idx];
        if (color) {
          onChangeInt(color);
          innerPause.current = 1600;
        }
      }
    }
    
    resetInactivityTimer();

    setTimeout(() => {
      drag.hasDragged = false;
    }, 50);
  };

  // ── Animation loop ─────────────────────────────────────────────────────────
  const loop = useCallback((ts: number) => {
    if (!lastTs.current) lastTs.current = ts;
    const dt = (ts - lastTs.current) / 1000;
    lastTs.current = ts;

    const isDragging = dragState.current.active;

    if (!isDragging && isAutoSpin) {
      if (outerPause.current > 0) {
        outerPause.current = Math.max(0, outerPause.current - dt * 1000);
      } else {
        outerAngle.current = (outerAngle.current + OUTER_SPEED * dt) % 360;
      }

      if (innerPause.current > 0) {
        innerPause.current = Math.max(0, innerPause.current - dt * 1000);
      } else {
        innerAngle.current = (innerAngle.current + INNER_SPEED * dt + 360) % 360;
      }
    }

    tick(n => n + 1);
    rafId.current = requestAnimationFrame(loop);
  }, [isAutoSpin]);

  useEffect(() => {
    if (isOpen) {
      lastTs.current = null;
      rafId.current  = requestAnimationFrame(loop);
      setIsAutoSpin(true); // Counter-animate immediately on open
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    } else {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    }
    return () => { 
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isOpen, loop]);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // ── Build wedge elements ───────────────────────────────────────────────────
  const outerWedges: React.ReactNode[] = [];
  const innerWedges: React.ReactNode[] = [];
  let hoveredOuterWedge: React.ReactNode = null;
  let hoveredInnerWedge: React.ReactNode = null;

  for (let i = 0; i < N; i++) {
    const color = IGLO_EDGE_COLORS[i];

    // ── Outer ring (exterior) ────────────────────────────────────────────────
    const oMid = normDeg(i * WEDGE_DEG + outerAngle.current);
    if (inWindow(oMid)) {
      const oA1     = oMid - WEDGE_DEG / 2 + WEDGE_GAP;
      const oA2     = oMid + WEDGE_DEG / 2 - WEDGE_GAP;
      const oMidRad = (oMid * Math.PI) / 180;
      const oMidR   = (O_RIN + O_ROUT) / 2;
      const imgCX   = CX + oMidR * Math.cos(oMidRad);
      const imgCY   = CY + oMidR * Math.sin(oMidRad);
      const imgSize = 135;   // Increased to ensure seamless texture filling at any angle

      const isSel = i === activeExtIdx;
      const isHov = hovExt === i;
      const cid   = `co${i}`;

      const wedgeEl = (
        <g 
          key={`o-${i}`}
          style={{
            transform: isHov ? 'scale(1.5)' : 'scale(1)',
            transformOrigin: `${f(imgCX)}px ${f(imgCY)}px`,
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <defs>
            <clipPath id={cid}>
              <path d={wedgePath(O_RIN, O_ROUT, oA1, oA2)} />
            </clipPath>
          </defs>

          {/* Texture image, clipped to wedge shape */}
          {color.image ? (
            <image
              href={color.image}
              x={imgCX - imgSize / 2}
              y={imgCY - imgSize / 2}
              width={imgSize}
              height={imgSize}
              clipPath={`url(#${cid})`}
              preserveAspectRatio="xMidYMid slice"
              style={{ cursor: 'pointer' }}
              onClick={() => { if (dragState.current.hasDragged) return; onChangeExt(color); outerPause.current = 1600; }}
              onMouseEnter={() => setHovExt(i)}
              onMouseLeave={() => setHovExt(null)}
            />
          ) : (
            <path
              d={wedgePath(O_RIN, O_ROUT, oA1, oA2)}
              fill={color.hex}
              style={{ cursor: 'pointer' }}
              onClick={() => { if (dragState.current.hasDragged) return; onChangeExt(color); outerPause.current = 1600; }}
              onMouseEnter={() => setHovExt(i)}
              onMouseLeave={() => setHovExt(null)}
            />
          )}

          {/* Overlay: hover tint + selection border */}
          <path
            d={wedgePath(O_RIN, O_ROUT, oA1, oA2)}
            fill={
              isHov ? 'rgba(255,255,255,0.14)'
              : 'none'
            }
            stroke={
              isHov ? 'rgba(255,255,255,0.55)'
              : 'none'
            }
            strokeWidth={1}
            pointerEvents="none"
          />

          {/* Glow dot at tip of selected wedge */}
          {isSel && (
            <>
              {/* Outer glow circle */}
              <circle
                cx={f(CX + (O_ROUT - 10) * Math.cos(oMidRad))}
                cy={f(CY + (O_ROUT - 10) * Math.sin(oMidRad))}
                r={8}
                fill="#d4d4d8"
                opacity={0.4}
                filter="url(#grey-glow)"
                pointerEvents="none"
              />
              <circle
                cx={f(CX + (O_ROUT - 10) * Math.cos(oMidRad))}
                cy={f(CY + (O_ROUT - 10) * Math.sin(oMidRad))}
                r={5}
                fill="#d4d4d8"
                stroke="white"
                strokeWidth={1.5}
                pointerEvents="none"
              />
            </>
          )}
        </g>
      );

      if (isHov) {
        hoveredOuterWedge = wedgeEl;
      } else {
        outerWedges.push(wedgeEl);
      }
    }

    // ── Inner ring (interior) ────────────────────────────────────────────────
    const iMid = normDeg(i * WEDGE_DEG + innerAngle.current);
    if (inWindow(iMid)) {
      const iA1     = iMid - WEDGE_DEG / 2 + WEDGE_GAP;
      const iA2     = iMid + WEDGE_DEG / 2 - WEDGE_GAP;
      const iMidRad = (iMid * Math.PI) / 180;
      const iMidR   = (I_RIN + I_ROUT) / 2;
      const imgCX   = CX + iMidR * Math.cos(iMidRad);
      const imgCY   = CY + iMidR * Math.sin(iMidRad);
      const imgSize = 135;   // Increased to ensure seamless texture filling at any angle

      const isSel = i === activeIntIdx;
      const isHov = hovInt === i;
      const cid   = `ci${i}`;

      const wedgeEl = (
        <g 
          key={`i-${i}`}
          style={{
            transform: isHov ? 'scale(1.5)' : 'scale(1)',
            transformOrigin: `${f(imgCX)}px ${f(imgCY)}px`,
            transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          <defs>
            <clipPath id={cid}>
              <path d={wedgePath(I_RIN, I_ROUT, iA1, iA2)} />
            </clipPath>
          </defs>

          {color.image ? (
            <image
              href={color.image}
              x={imgCX - imgSize / 2}
              y={imgCY - imgSize / 2}
              width={imgSize}
              height={imgSize}
              clipPath={`url(#${cid})`}
              preserveAspectRatio="xMidYMid slice"
              style={{ cursor: 'pointer' }}
              onClick={() => { if (dragState.current.hasDragged) return; onChangeInt(color); innerPause.current = 1600; }}
              onMouseEnter={() => setHovInt(i)}
              onMouseLeave={() => setHovInt(null)}
            />
          ) : (
            <path
              d={wedgePath(I_RIN, I_ROUT, iA1, iA2)}
              fill={color.hex}
              style={{ cursor: 'pointer' }}
              onClick={() => { if (dragState.current.hasDragged) return; onChangeInt(color); innerPause.current = 1600; }}
              onMouseEnter={() => setHovInt(i)}
              onMouseLeave={() => setHovInt(null)}
            />
          )}

          <path
            d={wedgePath(I_RIN, I_ROUT, iA1, iA2)}
            fill={
              isHov ? 'rgba(255,255,255,0.14)'
              : 'none'
            }
            stroke={
              isHov ? 'rgba(255,255,255,0.55)'
              : 'none'
            }
            strokeWidth={1}
            pointerEvents="none"
          />

          {isSel && (
            <>
              {/* Outer glow circle */}
              <circle
                cx={f(CX + (I_ROUT - 8) * Math.cos(iMidRad))}
                cy={f(CY + (I_ROUT - 8) * Math.sin(iMidRad))}
                r={7}
                fill="#d4d4d8"
                opacity={0.4}
                filter="url(#grey-glow)"
                pointerEvents="none"
              />
              <circle
                cx={f(CX + (I_ROUT - 8) * Math.cos(iMidRad))}
                cy={f(CY + (I_ROUT - 8) * Math.sin(iMidRad))}
                r={4}
                fill="#d4d4d8"
                stroke="white"
                strokeWidth={1.5}
                pointerEvents="none"
              />
            </>
          )}
        </g>
      );

      if (isHov) {
        hoveredInnerWedge = wedgeEl;
      } else {
        innerWedges.push(wedgeEl);
      }
    }
  }

  if (hoveredOuterWedge) {
    outerWedges.push(hoveredOuterWedge);
  }
  if (hoveredInnerWedge) {
    innerWedges.push(hoveredInnerWedge);
  }



  // ── Active / hovered colour references ────────────────────────────────────
  const extColor = activeExtIdx >= 0 ? IGLO_EDGE_COLORS[activeExtIdx] : null;
  const intColor = activeIntIdx >= 0 ? IGLO_EDGE_COLORS[activeIntIdx] : null;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    // Anchor point: bottom-right of the 3D viewport area, just above the trigger btn
    <div 
      ref={containerRef} 
      className={className || "absolute bottom-3 right-[54px] md:bottom-4 md:right-[68px] z-40"}
      style={
        isOpen 
          ? { zIndex: 99999, position: 'absolute', bottom: '0px', right: '0px' } 
          : { zIndex: 40 }
      }
    >
      <style>{`
        @keyframes qwheel-in {
          from { opacity: 0; transform-origin: bottom right; transform: scale(0.7) rotate(-8deg); }
          to   { opacity: 1; transform-origin: bottom right; transform: scale(1)   rotate(0deg);  }
        }
        @keyframes qwheel-out {
          from { opacity: 1; transform-origin: bottom right; transform: scale(1);   }
          to   { opacity: 0; transform-origin: bottom right; transform: scale(0.7); }
        }
        .qwheel-open  { animation: qwheel-in  0.38s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .qwheel-close { animation: qwheel-out 0.22s ease-in forwards; pointer-events: none; }

        .qwheel-btn {
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                      background-color 0.2s, border-color 0.2s, box-shadow 0.2s;
        }
        .qwheel-btn.open  { transform: rotate(45deg); }
        .qwheel-btn:hover:not(.open) { transform: scale(1.08); }

        /* Tooltip chip */
        .qwheel-tip {
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 4px 9px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.03em;
          pointer-events: none;
          white-space: nowrap;
          animation: qwheel-in 0.15s ease forwards;
        }

        /* Label chips beneath btn */
        .qwheel-chip {
          display: flex;
          align-items: center;
          gap: 5px;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-radius: 6px;
          padding: 3px 7px 3px 4px;
          pointer-events: none;
        }
      `}</style>

      {/* ── Quarter-wheel SVG ──────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="qwheel-open absolute"
          style={{
            bottom: '0px',
            right:  '0px',
            width:  SVG_W,
            height: SVG_H,
            pointerEvents: 'auto',
          }}
        >
          <svg
            width={SVG_W}
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            style={{
              display: 'block',
              overflow: 'visible',
              touchAction: 'none',
              cursor: dragState.current.active ? 'grabbing' : 'grab',
              filter: 'drop-shadow(-4px -4px 6px rgba(0, 0, 0, 0.225))'
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <defs>
              <filter id="grey-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* ── Subtle frosted ring-track arcs (quarter-arc strokes) ──── */}
            {/* These sit BEHIND the wedges to give depth context */}

            {/* Outer track */}
            <path
              d={`
                M${f(CX + O_RIN * Math.cos(WIN_A * Math.PI / 180))},
                 ${f(CY + O_RIN * Math.sin(WIN_A * Math.PI / 180))}
                A${O_RIN},${O_RIN},0,0,1,
                 ${f(CX + O_RIN * Math.cos(WIN_B * Math.PI / 180))},
                 ${f(CY + O_RIN * Math.sin(WIN_B * Math.PI / 180))}
              `}
              fill="none"
              stroke="rgba(56,189,248,0.09)"
              strokeWidth={O_ROUT - O_RIN + 2}
              strokeLinecap="round"
            />

            {/* Inner track */}
            <path
              d={`
                M${f(CX + I_RIN * Math.cos(WIN_A * Math.PI / 180))},
                 ${f(CY + I_RIN * Math.sin(WIN_A * Math.PI / 180))}
                A${I_RIN},${I_RIN},0,0,1,
                 ${f(CX + I_RIN * Math.cos(WIN_B * Math.PI / 180))},
                 ${f(CY + I_RIN * Math.sin(WIN_B * Math.PI / 180))}
              `}
              fill="none"
              stroke="rgba(234,179,8,0.07)"
              strokeWidth={I_ROUT - I_RIN + 2}
              strokeLinecap="round"
            />

            {/* ── Wedges ─────────────────────────────────────────────────── */}
            {innerWedges}
            {outerWedges}



            {/* ── Ring-edge arc borders removed (borderless style with shadows) ── */}

            {/* Text descriptions eliminated from color fan overlay */}

          </svg>

          {/* ── Play/Pause Toggle Button ──────────────────────────────────── */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              const nextAuto = !isAutoSpin;
              setIsAutoSpin(nextAuto);
              if (inactivityTimerRef.current) {
                clearTimeout(inactivityTimerRef.current);
                inactivityTimerRef.current = null;
              }
              if (!nextAuto) {
                // If paused, resume auto-rotation after 6 seconds of inactivity
                inactivityTimerRef.current = setTimeout(() => {
                  setIsAutoSpin(true);
                }, 6000);
              }
            }}
            className="absolute w-8 h-8 rounded-full bg-black/80 hover:bg-black border border-white/20 hover:border-mammut-gold/60 text-mammut-gold flex items-center justify-center transition-all shadow-md active:scale-90"
            style={{
              bottom: '12px',
              right: '12px',
              zIndex: 50,
              cursor: 'pointer',
            }}
            title={isAutoSpin ? "Pause Auto-Rotation" : "Start Auto-Rotation"}
          >
            {isAutoSpin ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {/* ── Hover tooltip removed to only show color names in the chips ── */}
        </div>
      )}

      {/* ── Active colour chips (shown when wheel is open) ──────────────── */}
      {isOpen && (extColor || intColor) && (
        <div
          className="absolute flex flex-col gap-1"
          style={{ bottom: '58px', right: '54px', pointerEvents: 'none' }}
        >
          {extColor && (
            <div className="qwheel-chip">
              <div
                style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  backgroundImage: extColor.image ? `url(${extColor.image})` : 'none',
                  backgroundColor: extColor.hex,
                  backgroundSize: 'cover',
                  border: '1.5px solid rgba(56,189,248,0.7)',
                }}
              />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#38bdf8', lineHeight: 1 }}>
                EXT
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {extColor.name}
              </span>
            </div>
          )}
          {intColor && (
            <div className="qwheel-chip">
              <div
                style={{
                  width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                  backgroundImage: intColor.image ? `url(${intColor.image})` : 'none',
                  backgroundColor: intColor.hex,
                  backgroundSize: 'cover',
                  border: '1.5px solid rgba(234,179,8,0.7)',
                }}
              />
              <span style={{ fontSize: 9, fontWeight: 700, color: '#eab308', lineHeight: 1 }}>
                INT
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {intColor.name}
              </span>
            </div>
          )}
        </div>
      )}

      {/* ── Trigger button ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(p => !p)}
        className={`qwheel-btn ${isOpen ? 'open' : ''} w-12 h-12 rounded-full flex items-center justify-center border active:scale-95 shadow-xl z-50 cursor-pointer relative ${
          isOpen
            ? 'bg-mammut-gold text-black border-mammut-gold shadow-[0_0_24px_rgba(217,119,6,0.5)]'
            : 'bg-black/85 text-mammut-gold border-gray-800 hover:border-mammut-gold'
        }`}
        title="Toggle Color Palette Wheel"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-5 h-5">
            <path strokeLinecap="round" d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 500 500" fill="none" className="w-7 h-7">
            {/* Blade 7 (Rotation 0 deg - pointing up) */}
            <g transform="rotate(0, 400, 400)">
              <path d="M 360,320 L 440,320 L 440,400 A 40,40 0 0,1 360,400 Z" fill="#d4f0a2" />
              <path d="M 360,260 L 440,260 L 440,320 L 360,320 Z" fill="#c1e38a" />
              <path d="M 360,200 L 440,200 L 440,260 L 360,260 Z" fill="#9ec06c" />
              <path d="M 360,140 L 440,140 L 440,200 L 360,200 Z" fill="#789c50" />
              <path d="M 360,140 L 360,80 A 40,40 0 0,1 440,80 L 440,140 Z" fill="#618a3d" />
            </g>
            {/* Blade 6 (Rotation -15 deg) */}
            <g transform="rotate(-15, 400, 400)">
              <path d="M 360,320 L 440,320 L 440,400 A 40,40 0 0,1 360,400 Z" fill="#bada55" />
              <path d="M 360,260 L 440,260 L 440,320 L 360,320 Z" fill="#7fa867" />
              <path d="M 360,200 L 440,200 L 440,260 L 360,260 Z" fill="#426b31" />
              <path d="M 360,140 L 440,140 L 440,200 L 360,200 Z" fill="#284d1a" />
              <path d="M 360,140 L 360,80 A 40,40 0 0,1 440,80 L 440,140 Z" fill="#1a330e" />
            </g>
            {/* Blade 5 (Rotation -30 deg) */}
            <g transform="rotate(-30, 400, 400)">
              <path d="M 360,320 L 440,320 L 440,400 A 40,40 0 0,1 360,400 Z" fill="#007554" />
              <path d="M 360,260 L 440,260 L 440,320 L 360,320 Z" fill="#a2d39c" />
              <path d="M 360,200 L 440,200 L 440,260 L 360,260 Z" fill="#8cc63f" />
              <path d="M 360,140 L 440,140 L 440,200 L 360,200 Z" fill="#006837" />
              <path d="M 360,140 L 360,80 A 40,40 0 0,1 440,80 L 440,140 Z" fill="#009245" />
            </g>
            {/* Blade 4 (Rotation -45 deg) */}
            <g transform="rotate(-45, 400, 400)">
              <path d="M 360,320 L 440,320 L 440,400 A 40,40 0 0,1 360,400 Z" fill="#7accc8" />
              <path d="M 360,260 L 440,260 L 440,320 L 360,320 Z" fill="#1b1464" />
              <path d="M 360,200 L 440,200 L 440,260 L 360,260 Z" fill="#2e3192" />
              <path d="M 360,140 L 440,140 L 440,200 L 360,200 Z" fill="#0071bc" />
              <path d="M 360,140 L 360,80 A 40,40 0 0,1 440,80 L 440,140 Z" fill="#29abe2" />
            </g>
            {/* Blade 3 (Rotation -60 deg) */}
            <g transform="rotate(-60, 400, 400)">
              <path d="M 360,320 L 440,320 L 440,400 A 40,40 0 0,1 360,400 Z" fill="#f68b2c" />
              <path d="M 360,260 L 440,260 L 440,320 L 360,320 Z" fill="#f4987f" />
              <path d="M 360,200 L 440,200 L 440,260 L 360,260 Z" fill="#fbaf3f" />
              <path d="M 360,140 L 440,140 L 440,200 L 360,200 Z" fill="#eb1c24" />
              <path d="M 360,140 L 360,80 A 40,40 0 0,1 440,80 L 440,140 Z" fill="#c92127" />
            </g>
            {/* Blade 2 (Rotation -75 deg) */}
            <g transform="rotate(-75, 400, 400)">
              <path d="M 360,320 L 440,320 L 440,400 A 40,40 0 0,1 360,400 Z" fill="#f7f4db" />
              <path d="M 360,260 L 440,260 L 440,320 L 360,320 Z" fill="#ffdd7b" />
              <path d="M 360,200 L 440,200 L 440,260 L 360,260 Z" fill="#8a7060" />
              <path d="M 360,140 L 440,140 L 440,200 L 360,200 Z" fill="#fddbd0" />
              <path d="M 360,140 L 360,80 A 40,40 0 0,1 440,80 L 440,140 Z" fill="#e66d5c" />
            </g>
            {/* Blade 1 (Rotation -90 deg - pointing left) */}
            <g transform="rotate(-90, 400, 400)">
              <path d="M 360,320 L 440,320 L 440,400 A 40,40 0 0,1 360,400 Z" fill="#eadcd3" />
              <path d="M 360,260 L 440,260 L 440,320 L 360,320 Z" fill="#eccdbb" />
              <path d="M 360,200 L 440,200 L 440,260 L 360,260 Z" fill="#d8b19a" />
              <path d="M 360,140 L 440,140 L 440,200 L 360,200 Z" fill="#bd9581" />
              <path d="M 360,140 L 360,80 A 40,40 0 0,1 440,80 L 440,140 Z" fill="#a47e6d" />
            </g>
            {/* Pivot dot */}
            <circle cx="400" cy="400" r="22" fill="#0071bc" />
          </svg>
        )}
      </button>
    </div>
  );
}
