import React, { useState, useRef } from 'react';
import type { ConfiguratorState } from './types';
import { OPENING_TYPES, COLOR_LOCALE } from './types';
import { useTranslation } from 'react-i18next';
import { Rotate3D } from 'lucide-react';

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
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const currentRotation = useRef(0);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    currentRotation.current = rotationY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    setRotationY(currentRotation.current + deltaX * 0.8);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    const snapped = Math.round(rotationY / 180) * 180;
    setRotationY(snapped);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    currentRotation.current = rotationY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStartX.current;
    setRotationY(currentRotation.current + deltaX * 0.8);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    const snapped = Math.round(rotationY / 180) * 180;
    setRotationY(snapped);
  };

  const layout = LAYOUT_MAP[state.windowTypeId] || LAYOUT_MAP['1-flugel'];
  const SVG_W = 500;
  const SVG_H = 600;
  const DIM_PAD_BOTTOM = 60;
  const DIM_PAD_RIGHT = 60;
  const DIM_PAD_TOP = 20;
  const DIM_PAD_LEFT = 20;

  const MAX_W = SVG_W - DIM_PAD_LEFT - DIM_PAD_RIGHT;
  const MAX_H = SVG_H - DIM_PAD_TOP - DIM_PAD_BOTTOM;
  const realW = state.dimensions.width || 1000;
  const realH = state.dimensions.height || 1000;
  const scale = Math.min(MAX_W / realW, MAX_H / realH);
  
  const frameW = realW * scale;
  const frameH = realH * scale;

  const offsetX = DIM_PAD_LEFT + (MAX_W - frameW) / 2;
  const offsetY = DIM_PAD_TOP + (MAX_H - frameH) / 2;
  const F_THICK = Math.min(12, Math.min(frameW, frameH) * 0.08);

  const renderBlueprint = (isExterior: boolean) => {
    const colorId = isExterior ? state.exteriorColor : state.interiorColor;
    const colorData = COLOR_LOCALE.colors[colorId];
    const imgUrl = colorData?.swatch?.match(/url\(['"]?(.*?)['"]?\)/)?.[1] || '';
    const patternId = isExterior ? 'frame_texture_ext' : 'frame_texture_int';

    return (
      <svg 
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
        vectorEffect="non-scaling-stroke"
        style={{ backfaceVisibility: 'hidden', transform: isExterior ? 'rotateY(180deg) translateZ(-1px)' : 'rotateY(0deg) translateZ(1px)' }}
      >
        <defs>
          {imgUrl && (
            <pattern id={patternId} width="200" height="200" patternUnits="userSpaceOnUse">
              <image href={imgUrl} width="200" height="200" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          )}
        </defs>

        <line x1={offsetX} y1={SVG_H - DIM_PAD_BOTTOM + 20} x2={offsetX + frameW} y2={SVG_H - DIM_PAD_BOTTOM + 20} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={offsetX} y1={SVG_H - DIM_PAD_BOTTOM + 15} x2={offsetX} y2={SVG_H - DIM_PAD_BOTTOM + 25} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={offsetX + frameW} y1={SVG_H - DIM_PAD_BOTTOM + 15} x2={offsetX + frameW} y2={SVG_H - DIM_PAD_BOTTOM + 25} stroke="#e2e8f0" strokeWidth="1" />
        <text x={offsetX + frameW / 2} y={SVG_H - DIM_PAD_BOTTOM + 12} textAnchor="middle" fill="#94a3b8" fontSize="16" className="font-sans font-bold">{realW}</text>

        <text x={SVG_W / 2} y={SVG_H - 10} textAnchor="middle" fill="#94a3b8" fontSize="14" className="font-sans font-black tracking-[0.2em] uppercase">
          {isExterior ? t('configurator.blueprint.exteriorView', 'Exterior View') : t('configurator.blueprint.interiorView', 'Interior View')}
        </text>

        <line x1={SVG_W - 15} y1={offsetY} x2={SVG_W - 15} y2={offsetY + frameH} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={SVG_W - 20} y1={offsetY} x2={SVG_W - 10} y2={offsetY} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={SVG_W - 20} y1={offsetY + frameH} x2={SVG_W - 10} y2={offsetY + frameH} stroke="#e2e8f0" strokeWidth="1" />
        <text x={SVG_W - 25} y={offsetY + frameH / 2} textAnchor="middle" fill="#94a3b8" fontSize="16" transform={`rotate(90, ${SVG_W - 25}, ${offsetY + frameH / 2})`} className="font-sans font-bold">{realH}</text>

        <g transform={`translate(${offsetX}, ${offsetY})`}>
          <rect x="0" y="0" width={frameW} height={frameH} fill={imgUrl ? `url(#${patternId})` : '#ffffff'} stroke="#64748b" strokeWidth="2" />
          <rect x={F_THICK} y={F_THICK} width={frameW - (F_THICK*2)} height={frameH - (F_THICK*2)} fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

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
            const S_THICK = Math.min(10, Math.min(sw, sh) * 0.1);

            return (
              <g key={i}>
                <rect x={sx} y={sy} width={sw} height={sh} fill={imgUrl ? `url(#${patternId})` : '#ffffff'} stroke="#64748b" strokeWidth="1.5" />
                <rect x={sx + S_THICK} y={sy + S_THICK} width={Math.max(1, sw - (S_THICK*2))} height={Math.max(1, sh - (S_THICK*2))} fill={isExterior ? "#0f172a" : "#cffafe"} stroke="#94a3b8" strokeWidth="1" />

                {!isFixed && (
                  <g stroke="#ef4444" strokeWidth="1.5" fill="none" opacity={isExterior ? "0.3" : "0.85"}>
                    {(isDKL || isDL) && (
                      <path d={`M${sx + S_THICK},${sy + S_THICK} L${sx + sw - S_THICK},${sy + sh / 2} L${sx + S_THICK},${sy + sh - S_THICK}`} transform={isExterior ? `translate(${sx*2 + sw}, 0) scale(-1, 1)` : ""} />
                    )}
                    {(isDKR || isDR) && (
                      <path d={`M${sx + sw - S_THICK},${sy + S_THICK} L${sx + S_THICK},${sy + sh / 2} L${sx + sw - S_THICK},${sy + sh - S_THICK}`} transform={isExterior ? `translate(${sx*2 + sw}, 0) scale(-1, 1)` : ""} />
                    )}
                    {(isDKL || isDKR || isK) && (
                      <path d={`M${sx + S_THICK},${sy + sh - S_THICK} L${sx + sw / 2},${sy + S_THICK} L${sx + sw - S_THICK},${sy + sh - S_THICK}`} strokeDasharray="5,4" />
                    )}
                  </g>
                )}

                {!isExterior && !isFixed && (isDKL || isDL) && (
                  <g transform={`translate(${sx + sw - (S_THICK/2)}, ${sy + (sh / 2) - 20})`}>
                    <rect x="-4" y="0" width="8" height="40" fill="#f8fafc" stroke="#475569" strokeWidth="1" rx="2" />
                    <rect x="-20" y="16" width="20" height="8" fill="#ffffff" stroke="#475569" strokeWidth="1" rx="4" />
                  </g>
                )}
                {!isExterior && !isFixed && (isDKR || isDR) && (
                  <g transform={`translate(${sx + (S_THICK/2)}, ${sy + (sh / 2) - 20})`}>
                    <rect x="-4" y="0" width="8" height="40" fill="#f8fafc" stroke="#475569" strokeWidth="1" rx="2" />
                    <rect x="0" y="16" width="20" height="8" fill="#ffffff" stroke="#475569" strokeWidth="1" rx="4" />
                  </g>
                )}
                {!isExterior && !isFixed && isK && (
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
    );
  };

  const isShowingExterior = Math.abs(Math.round(rotationY / 180) % 2) === 1;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-8 bg-transparent" style={{ perspective: '1200px' }}>
      
      <div className="absolute top-4 right-4 flex gap-1 z-20 bg-white/80 backdrop-blur rounded-lg p-1 shadow-sm border border-slate-200/50">
        <button 
          onClick={() => setRotationY(0)} 
          className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${!isShowingExterior ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          {t('configurator.blueprint.interiorView', 'Interior')}
        </button>
        <button 
          onClick={() => setRotationY(180)} 
          className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${isShowingExterior ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
        >
          {t('configurator.blueprint.exteriorView', 'Exterior')}
        </button>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-60 pointer-events-none">
        <Rotate3D size={14} /> Drag to rotate freely in 3D
      </div>

      <div 
        className="w-full h-full flex-1 relative cursor-grab active:cursor-grabbing hover:scale-105 select-none touch-none"
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: `rotateY(${rotationY}deg)`,
          transition: isDragging ? 'none' : 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          touchAction: 'none'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        {renderBlueprint(false)}
        {renderBlueprint(true)}
      </div>
    </div>
  );
};
