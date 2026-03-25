import type { ConfiguratorState } from './types';
import { OPENING_TYPES, COLOR_LOCALE } from './types';
import { useTranslation } from 'react-i18next';

// Coordinate map for drawing the architectural layout (using identical schema to WindowTypeGraphic)
const LAYOUT_MAP: Record<string, {x: number, y: number, w: number, h: number}[]> = {
  '1-flugel': [{ x: 0, y: 0, w: 100, h: 100 }],
  '1-flugel-oberlicht': [{ x: 0, y: 0, w: 100, h: 30 }, { x: 0, y: 30, w: 100, h: 70 }],
  '1-flugel-unterlicht': [{ x: 0, y: 0, w: 100, h: 70 }, { x: 0, y: 70, w: 100, h: 30 }],
  '2-flugel': [{ x: 0, y: 0, w: 50, h: 100 }, { x: 50, y: 0, w: 50, h: 100 }],
  '2-flugel-oberlicht': [{ x: 0, y: 0, w: 100, h: 30 }, { x: 0, y: 30, w: 50, h: 70 }, { x: 50, y: 30, w: 50, h: 70 }],
  '2-flugel-oberlicht-asym': [{ x: 0, y: 0, w: 100, h: 30 }, { x: 0, y: 30, w: 35, h: 70 }, { x: 35, y: 30, w: 65, h: 70 }],
  '2-flugel-unterlicht': [{ x: 0, y: 0, w: 50, h: 70 }, { x: 50, y: 0, w: 50, h: 70 }, { x: 0, y: 70, w: 100, h: 30 }],
  '2-flugel-unterlicht-asym': [{ x: 0, y: 0, w: 35, h: 70 }, { x: 35, y: 0, w: 65, h: 70 }, { x: 0, y: 70, w: 100, h: 30 }],
  '3-flugel': [{ x: 0, y: 0, w: 33.33, h: 100 }, { x: 33.33, y: 0, w: 33.33, h: 100 }, { x: 66.66, y: 0, w: 33.34, h: 100 }],
  '3-flugel-oberlicht': [{ x: 0, y: 0, w: 100, h: 30 }, { x: 0, y: 30, w: 33.33, h: 70 }, { x: 33.33, y: 30, w: 33.33, h: 70 }, { x: 66.66, y: 30, w: 33.34, h: 70 }],
  '3-flugel-oberlicht-asym': [{ x: 0, y: 0, w: 100, h: 30 }, { x: 0, y: 30, w: 25, h: 70 }, { x: 25, y: 30, w: 50, h: 70 }, { x: 75, y: 30, w: 25, h: 70 }],
  '3-flugel-unterlicht': [{ x: 0, y: 0, w: 33.33, h: 70 }, { x: 33.33, y: 0, w: 33.33, h: 70 }, { x: 66.66, y: 0, w: 33.34, h: 70 }, { x: 0, y: 70, w: 100, h: 30 }],
  '3-flugel-unterlicht-asym': [{ x: 0, y: 0, w: 25, h: 70 }, { x: 25, y: 0, w: 50, h: 70 }, { x: 75, y: 0, w: 25, h: 70 }, { x: 0, y: 70, w: 100, h: 30 }],
  '4-flugel': [{ x: 0, y: 0, w: 25, h: 100 }, { x: 25, y: 0, w: 25, h: 100 }, { x: 50, y: 0, w: 25, h: 100 }, { x: 75, y: 0, w: 25, h: 100 }]
};

interface BlueprintPreviewProps {
  state: ConfiguratorState;
}

export const BlueprintPreview: React.FC<BlueprintPreviewProps> = ({ state }) => {
  const { t } = useTranslation();
  const layout = LAYOUT_MAP[state.windowTypeId] || LAYOUT_MAP['1-flugel'];
  
  // Outer rendering dimensions
  const SVG_W = 500;
  const SVG_H = 600;
  
  // Padding for the dimension markers (arrows and text)
  const DIM_PAD_BOTTOM = 60;
  const DIM_PAD_RIGHT = 60;
  const DIM_PAD_TOP = 20;
  const DIM_PAD_LEFT = 20;

  // Calculate the maximum available space for the window itself
  const MAX_W = SVG_W - DIM_PAD_LEFT - DIM_PAD_RIGHT;
  const MAX_H = SVG_H - DIM_PAD_TOP - DIM_PAD_BOTTOM;

  // Safety fallback integers
  const realW = state.dimensions.width || 1000;
  const realH = state.dimensions.height || 1000;

  // Calculate proportional scaling to fit the entire window inside the Max boundaries
  const scale = Math.min(MAX_W / realW, MAX_H / realH);
  
  const frameW = realW * scale;
  const frameH = realH * scale;

  // Center the blueprint dynamically if it doesn't take up the full space
  const offsetX = DIM_PAD_LEFT + (MAX_W - frameW) / 2;
  const offsetY = DIM_PAD_TOP + (MAX_H - frameH) / 2;

  // Frame thickness should scale slightly so tiny windows don't overlap, but max out at 12
  const F_THICK = Math.min(12, Math.min(frameW, frameH) * 0.08);

  // Extract exact URL from the CSS backgroundImage string (e.g. "url('/assets/windowcolors/textures/img.webp')")
  const colorData = COLOR_LOCALE.colors[state.color];
  const imgUrl = colorData?.swatch?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || '';

  return (
    <div className="w-full h-full flex items-center justify-center p-4 bg-white">
      <svg 
        viewBox={`0 0 ${SVG_W} ${SVG_H}`} 
        className="w-full h-full max-h-[600px] object-contain drop-shadow-sm"
        vectorEffect="non-scaling-stroke"
      >
        <defs>
          {imgUrl && (
            <pattern id="frame_texture" width="200" height="200" patternUnits="userSpaceOnUse">
              <image href={imgUrl} width="200" height="200" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>

        {/* Outer Dimension Lines (Bottom Width) - ABOVE Interior View */}
        <line x1={offsetX} y1={SVG_H - DIM_PAD_BOTTOM + 20} x2={offsetX + frameW} y2={SVG_H - DIM_PAD_BOTTOM + 20} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={offsetX} y1={SVG_H - DIM_PAD_BOTTOM + 15} x2={offsetX} y2={SVG_H - DIM_PAD_BOTTOM + 25} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={offsetX + frameW} y1={SVG_H - DIM_PAD_BOTTOM + 15} x2={offsetX + frameW} y2={SVG_H - DIM_PAD_BOTTOM + 25} stroke="#e2e8f0" strokeWidth="1" />
        <text x={offsetX + frameW / 2} y={SVG_H - DIM_PAD_BOTTOM + 12} textAnchor="middle" fill="#94a3b8" fontSize="16" className="font-sans font-bold">{realW}</text>

        {/* Interior View Badge (BOTTOM MOST) */}
        <text x={SVG_W / 2} y={SVG_H - 10} textAnchor="middle" fill="#cbd5e1" fontSize="14" className="font-sans font-black tracking-[0.2em] uppercase">{t('configurator.blueprint.interiorView')}</text>

        {/* Outer Dimension Lines (Right Height) */}
        <line x1={SVG_W - 15} y1={offsetY} x2={SVG_W - 15} y2={offsetY + frameH} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={SVG_W - 20} y1={offsetY} x2={SVG_W - 10} y2={offsetY} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={SVG_W - 20} y1={offsetY + frameH} x2={SVG_W - 10} y2={offsetY + frameH} stroke="#e2e8f0" strokeWidth="1" />
        <text x={SVG_W - 25} y={offsetY + frameH / 2} textAnchor="middle" fill="#94a3b8" fontSize="16" transform={`rotate(90, ${SVG_W - 25}, ${offsetY + frameH / 2})`} className="font-sans font-bold">{realH}</text>

        {/* The Mathematical Window Assembly */}
        <g transform={`translate(${offsetX}, ${offsetY})`}>
          {/* Main Outer Frame (Clean White Base or Textured) */}
          <rect x="0" y="0" width={frameW} height={frameH} fill={imgUrl ? 'url(#frame_texture)' : '#ffffff'} stroke="#64748b" strokeWidth="2" />
          {/* Inner Glazing Frame Structure */}
          <rect x={F_THICK} y={F_THICK} width={frameW - (F_THICK*2)} height={frameH - (F_THICK*2)} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

          {/* Individual Sashes & Glass Rendering */}
          {layout.map((sash, i) => {
            const sx = F_THICK + (sash.x / 100) * (frameW - (F_THICK*2));
            const sy = F_THICK + (sash.y / 100) * (frameH - (F_THICK*2));
            const sw = (sash.w / 100) * (frameW - (F_THICK*2));
            const sh = (sash.h / 100) * (frameH - (F_THICK*2));

            const openingId = state.sashOpenings[i] || 'o1';
            const opening = OPENING_TYPES.find(o => o.id === openingId);
            const isFixed = opening?.shortCode === 'F' || !opening;
            const isDKL = opening?.shortCode === 'DKL';
            const isDKR = opening?.shortCode === 'DKR';
            const isDL = opening?.shortCode === 'DL';
            const isDR = opening?.shortCode === 'DR';
            const isK = opening?.shortCode === 'K';

            // Sash thickness
            const S_THICK = Math.min(10, Math.min(sw, sh) * 0.1);

            return (
              <g key={i}>
                {/* Sash Frame Base (Clean White Base or Textured) */}
                <rect x={sx} y={sy} width={sw} height={sh} fill={imgUrl ? 'url(#frame_texture)' : '#ffffff'} stroke="#64748b" strokeWidth="1.5" />
                {/* Glass Area Fill */}
                <rect x={sx + S_THICK} y={sy + S_THICK} width={Math.max(1, sw - (S_THICK*2))} height={Math.max(1, sh - (S_THICK*2))} fill="#cffafe" stroke="#94a3b8" strokeWidth="1" />

                {/* Red Opening Vectors (Drawn UNDER the handle) */}
                {!isFixed && (
                  <g stroke="#ef4444" strokeWidth="1.5" fill="none" opacity="0.85">
                    {/* Turn Left */}
                    {(isDKL || isDL) && (
                      <path d={`M${sx + S_THICK},${sy + S_THICK} L${sx + sw - S_THICK},${sy + sh / 2} L${sx + S_THICK},${sy + sh - S_THICK}`} />
                    )}
                    {/* Turn Right */}
                    {(isDKR || isDR) && (
                      <path d={`M${sx + sw - S_THICK},${sy + S_THICK} L${sx + S_THICK},${sy + sh / 2} L${sx + sw - S_THICK},${sy + sh - S_THICK}`} />
                    )}
                    {/* Tilt Lines */}
                    {(isDKL || isDKR || isK) && (
                      <path d={`M${sx + S_THICK},${sy + sh - S_THICK} L${sx + sw / 2},${sy + S_THICK} L${sx + sw - S_THICK},${sy + sh - S_THICK}`} strokeDasharray="5,4" />
                    )}
                  </g>
                )}

                {/* Highly Realistic Hardware Handle Indicators (Centered accurately across the inner sash frame) */}
                {!isFixed && (isDKL || isDL) && (
                  <g transform={`translate(${sx + sw - (S_THICK/2)}, ${sy + (sh / 2) - 20})`}>
                    <rect x="-4" y="0" width="8" height="40" fill="#f8fafc" stroke="#475569" strokeWidth="1" rx="2" />
                    <rect x="-20" y="16" width="20" height="8" fill="#ffffff" stroke="#475569" strokeWidth="1" rx="4" />
                  </g>
                )}
                {!isFixed && (isDKR || isDR) && (
                  <g transform={`translate(${sx + (S_THICK/2)}, ${sy + (sh / 2) - 20})`}>
                    <rect x="-4" y="0" width="8" height="40" fill="#f8fafc" stroke="#475569" strokeWidth="1" rx="2" />
                    <rect x="0" y="16" width="20" height="8" fill="#ffffff" stroke="#475569" strokeWidth="1" rx="4" />
                  </g>
                )}
                {!isFixed && isK && (
                  <g transform={`translate(${sx + (sw / 2) - 20}, ${sy + (S_THICK/2)})`}>
                    <rect x="0" y="-4" width="40" height="8" fill="#f8fafc" stroke="#475569" strokeWidth="1" rx="2" />
                    <rect x="16" y="0" width="8" height="20" fill="#ffffff" stroke="#475569" strokeWidth="1" rx="4" />
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
