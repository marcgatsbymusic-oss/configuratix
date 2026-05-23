import React, { useState, useRef } from 'react';
import type { ConfiguratorState } from './types';
import { COLOR_LOCALE } from './types';
import { useTranslation } from 'react-i18next';
import { Rotate3D } from 'lucide-react';
import { WindowTypeGraphic } from './WindowTypeGraphic';

interface BlueprintPreviewProps {
  state: ConfiguratorState;
  uploadedImage: string | null;
}

export const BlueprintPreview: React.FC<BlueprintPreviewProps> = ({ state, uploadedImage }) => {
  const { t } = useTranslation();
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
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

  // Dimension layout constants (in SVG user units)
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

  // Convert SVG frame box to % of the container for the overlay
  // The SVG viewBox is SVG_W × SVG_H; the overlay div fills 100%
  const overlayLeft   = `${(offsetX / SVG_W) * 100}%`;
  const overlayTop    = `${(offsetY / SVG_H) * 100}%`;
  const overlayWidth  = `${(frameW / SVG_W) * 100}%`;
  const overlayHeight = `${(frameH / SVG_H) * 100}%`;

  const renderFace = (isExterior: boolean) => {
    const colorId = isExterior ? state.exteriorColor : state.interiorColor;
    const colorData = COLOR_LOCALE.colors[colorId];
    const imgUrl = colorData?.swatch?.match(/url\(['"']?(.*?)['"']?\)/)?.[1] || '';
    const patternId = isExterior ? 'frame_texture_ext' : 'frame_texture_int';

    return (
      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility: 'hidden',
          transform: isExterior ? 'rotateY(180deg) translateZ(-1px)' : 'rotateY(0deg) translateZ(1px)',
        }}
      >
        {/* Dimension callout SVG (no window graphic here anymore) */}
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="absolute inset-0 w-full h-full pointer-events-none select-none"
          vectorEffect="non-scaling-stroke"
        >
          <defs>
            {imgUrl && (
              <pattern id={patternId} width="200" height="200" patternUnits="userSpaceOnUse">
                <image href={imgUrl} width="200" height="200" preserveAspectRatio="xMidYMid slice" />
              </pattern>
            )}
          </defs>

          {/* Measurements removed as requested */}

          {/* View label */}
          <text x={SVG_W / 2} y={SVG_H - 12} textAnchor="middle" fill="#555" fontSize="11" fontFamily="system-ui" fontWeight="700" letterSpacing="2">
            {isExterior
              ? t('configurator.blueprint.exteriorView', 'EXTERIOR VIEW').toUpperCase()
              : t('configurator.blueprint.interiorView', 'INTERIOR VIEW').toUpperCase()}
          </text>
        </svg>

        {/* Live WindowTypeGraphic overlay — perfectly positioned over the dimension frame */}
        <div
          className="absolute"
          style={{
            left: overlayLeft,
            top: overlayTop,
            width: overlayWidth,
            height: overlayHeight,
          }}
        >
          <WindowTypeGraphic
            id={state.windowTypeId}
            sashOpenings={state.sashOpenings}
            className={isExterior ? 'scale-x-[-1]' : ''}
          />
        </div>
      </div>
    );
  };

  const isShowingExterior = Math.abs(Math.round(rotationY / 180) % 2) === 1;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-8 bg-transparent" style={{ perspective: '1200px' }}>
      
      {/* Interior / Exterior toggle */}
      <div className="absolute top-4 right-4 flex gap-1 z-20 bg-mammut-dark/80 backdrop-blur rounded-lg p-1 shadow-sm border border-mammut-border">
        <button 
          onClick={() => setRotationY(0)} 
          className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${!isShowingExterior ? 'bg-mammut-gold !text-black shadow-md' : 'text-mammut-white/60 hover:bg-[#2a2a2b]'}`}
        >
          {t('configurator.blueprint.interiorView', 'Interior')}
        </button>
        <button 
          onClick={() => setRotationY(180)} 
          className={`px-3 py-1.5 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all ${isShowingExterior ? 'bg-mammut-gold !text-black shadow-md' : 'text-mammut-white/60 hover:bg-[#2a2a2b]'}`}
        >
          {t('configurator.blueprint.exteriorView', 'Exterior')}
        </button>
      </div>

      {/* Drag hint */}
      {!uploadedImage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-mammut-white/50 opacity-60 pointer-events-none">
          <Rotate3D size={14} /> {t('configurator.blueprint.dragToRotate', 'Drag to rotate freely in 3D')}
        </div>
      )}

      {/* 3D flip container */}
      <div 
        className="w-full h-full flex-1 relative cursor-grab active:cursor-grabbing hover:scale-105 select-none touch-none"
        style={{ 
          transformStyle: 'preserve-3d', 
          transform: `translate(${posX}px, ${posY}px) scale(${scaleFactor}) rotateY(${rotationY}deg)`,
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
        {renderFace(false)}
        {renderFace(true)}
      </div>

      {uploadedImage && (
        <div className="absolute bottom-12 left-4 right-4 z-30 bg-mammut-dark/95 backdrop-blur border border-mammut-border p-4 rounded-2xl space-y-3 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between text-xs font-bold text-mammut-white/70">
            <span className="tracking-wider uppercase text-mammut-gold">{t('configurator.blueprint.positionOptions', 'Position & Size')}</span>
            <button 
              onClick={() => { setScaleFactor(1.0); setPosX(0); setPosY(0); }}
              className="text-[10px] text-mammut-gold hover:text-[#d9a565] transition-colors font-bold uppercase tracking-wider"
            >
              {t('configurator.blueprint.resetWindowFit', 'Reset Fit')}
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-mammut-white/40 w-12 tracking-wider uppercase">{t('configurator.blueprint.scale', 'Scale')}</span>
              <input 
                type="range" 
                min="0.2" 
                max="2.0" 
                step="0.02" 
                value={scaleFactor} 
                onChange={(e) => setScaleFactor(parseFloat(e.target.value))}
                className="flex-1 accent-mammut-gold h-1 bg-mammut-darker rounded-lg cursor-pointer animate-none"
              />
              <span className="text-[10px] text-mammut-gold font-mono w-10 text-right">{Math.round(scaleFactor * 100)}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-mammut-white/40 w-12 tracking-wider uppercase">{t('configurator.blueprint.horizontal', 'Horiz')}</span>
              <input 
                type="range" 
                min="-200" 
                max="200" 
                step="1" 
                value={posX} 
                onChange={(e) => setPosX(parseInt(e.target.value))}
                className="flex-1 accent-mammut-gold h-1 bg-mammut-darker rounded-lg cursor-pointer animate-none"
              />
              <span className="text-[10px] text-mammut-gold font-mono w-10 text-right">{posX}px</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-mammut-white/40 w-12 tracking-wider uppercase">{t('configurator.blueprint.vertical', 'Vert')}</span>
              <input 
                type="range" 
                min="-200" 
                max="200" 
                step="1" 
                value={posY} 
                onChange={(e) => setPosY(parseInt(e.target.value))}
                className="flex-1 accent-mammut-gold h-1 bg-mammut-darker rounded-lg cursor-pointer animate-none"
              />
              <span className="text-[10px] text-mammut-gold font-mono w-10 text-right">{posY}px</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
