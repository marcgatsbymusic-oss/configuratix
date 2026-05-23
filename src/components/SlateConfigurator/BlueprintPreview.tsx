import React, { useState, useRef } from 'react';
import type { ConfiguratorState } from './types';
import { COLOR_LOCALE } from './types';
import { useTranslation } from 'react-i18next';
import { Rotate3D } from 'lucide-react';
import { WindowTypeGraphic } from './WindowTypeGraphic';
import { ScrollWheel } from './ScrollWheel';

interface BlueprintPreviewProps {
  state: ConfiguratorState;
  onDimensionChange?: (width: number, height: number) => void;
  activeLimits?: {
    minWidth: number;
    maxWidth: number;
    minHeight: number;
    maxHeight: number;
  };
}

export const BlueprintPreview: React.FC<BlueprintPreviewProps> = ({ state, onDimensionChange, activeLimits }) => {
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

  // Dimension layout constants (in SVG user units)
  const SVG_W = 500;
  const SVG_H = 600;
  const DIM_PAD_BOTTOM = 80; // slightly increased to make space for the bottom wheel
  const DIM_PAD_RIGHT = 60;
  const DIM_PAD_TOP = 20;
  const DIM_PAD_LEFT = 60; // slightly increased to make space for the left wheel

  const MAX_W = SVG_W - DIM_PAD_LEFT - DIM_PAD_RIGHT;
  const MAX_H = SVG_H - DIM_PAD_TOP - DIM_PAD_BOTTOM;
  const realW = state.dimensions.width || 1000;
  const realH = state.dimensions.height || 1000;
  const scale = Math.min(MAX_W / realW, MAX_H / realH);
  
  const frameW = realW * scale;
  const frameH = realH * scale;

  const offsetX = DIM_PAD_LEFT + (MAX_W - frameW) / 2;
  const offsetY = DIM_PAD_TOP + (MAX_H - frameH) / 2;

  const minW = activeLimits?.minWidth || 500;
  const maxW = activeLimits?.maxWidth || 3000;
  const minH = activeLimits?.minHeight || 500;
  const maxH = activeLimits?.maxHeight || 2500;

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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-mammut-white/50 opacity-60 pointer-events-none">
        <Rotate3D size={14} /> {t('configurator.blueprint.dragToRotate', 'Drag to rotate freely in 3D')}
      </div>

      {/* Scrollable tuning wheels for dimensions (Static screen-space overlay) */}
      {onDimensionChange && (
        <>
          {/* Vertical scroll wheel for Height on the left */}
          <div 
            className="absolute z-30 flex items-center justify-center"
            style={{
              left: `calc(${overlayLeft} - 26px)`,
              top: overlayTop,
              height: overlayHeight,
              width: '20px'
            }}
          >
            <ScrollWheel
              value={realH}
              onChange={(h) => onDimensionChange(realW, h)}
              min={minH}
              max={maxH}
              orientation="vertical"
              variant="half-stick"
              className="h-full"
            />
          </div>

          {/* Horizontal scroll wheel for Width at the bottom */}
          <div 
            className="absolute z-30 flex items-center justify-center"
            style={{
              left: overlayLeft,
              top: `calc(${overlayTop} + ${overlayHeight} + 6px)`,
              width: overlayWidth,
              height: '20px'
            }}
          >
            <ScrollWheel
              value={realW}
              onChange={(w) => onDimensionChange(w, realH)}
              min={minW}
              max={maxW}
              orientation="horizontal"
              variant="half-stick"
              className="w-full"
            />
          </div>

          {/* Width Dimension pill overlay at the bottom center of the frame */}
          <div 
            className="absolute z-20 flex justify-center pointer-events-none"
            style={{
              left: overlayLeft,
              top: `calc(${overlayTop} + ${overlayHeight} - 44px)`,
              width: overlayWidth,
            }}
          >
            <span className="bg-mammut-darker/90 border border-mammut-gold/60 text-mammut-gold px-3.5 py-1 rounded-full text-xs font-black tracking-widest shadow-lg backdrop-blur-sm select-none">
              {realW} mm
            </span>
          </div>

          {/* Height Dimension pill overlay on the left side inside the frame */}
          <div 
            className="absolute z-20 flex items-center pointer-events-none"
            style={{
              left: `calc(${overlayLeft} + 12px)`,
              top: overlayTop,
              height: overlayHeight,
            }}
          >
            <span className="bg-mammut-darker/90 border border-mammut-gold/60 text-mammut-gold px-3.5 py-1 rounded-full text-xs font-black tracking-widest shadow-lg backdrop-blur-sm select-none">
              {realH} mm
            </span>
          </div>
        </>
      )}

      {/* 3D flip container */}
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
        {renderFace(false)}
        {renderFace(true)}
      </div>
    </div>
  );
};
