import React, { useState, useRef } from 'react';
import type { ConfiguratorState } from './types';
import { COLOR_LOCALE } from './types';
import { useTranslation } from 'react-i18next';
import { Rotate3D } from 'lucide-react';
import { WindowTypeGraphic } from './WindowTypeGraphic';
import { ScrollWheel } from './ScrollWheel';

interface BlueprintPreviewProps {
  state: ConfiguratorState;
  uploadedImage: string | null;
  onDimensionChange?: (width: number, height: number) => void;
  activeLimits?: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
}

export const BlueprintPreview: React.FC<BlueprintPreviewProps> = ({ state, uploadedImage, onDimensionChange, activeLimits }) => {
  const { t } = useTranslation();
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1.0);
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [widthText, setWidthText] = useState(state.dimensions.width.toString());
  const [heightText, setHeightText] = useState(state.dimensions.height.toString());
  const dragStartX = useRef(0);
  const currentRotation = useRef(0);

  React.useEffect(() => {
    setWidthText(state.dimensions.width.toString());
    setHeightText(state.dimensions.height.toString());
  }, [state.dimensions.width, state.dimensions.height]);

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



  const handleWheel = (e: React.WheelEvent) => {
    if (!uploadedImage) return;
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    setScaleFactor((prev) => Math.max(0.2, Math.min(2.0, prev + delta)));
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
            frameFill={imgUrl ? `url(#${patternId})` : undefined}
          />
        </div>
      </div>
    );
  };

  const isShowingExterior = Math.abs(Math.round(rotationY / 180) % 2) === 1;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-8 bg-transparent" style={{ perspective: '1200px' }}>
      
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

      {!uploadedImage && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-mammut-white/50 opacity-60 pointer-events-none">
          <Rotate3D size={14} /> {t('configurator.blueprint.dragToRotate', 'Drag to rotate freely in 3D')}
        </div>
      )}
      {/* Container that exactly matches the 3D flip container's bounds for accurate overlay positioning */}
      <div className="w-full h-full flex-1 relative">
        
        {/* Static screen-space overlay (Scroll wheels and dimension pills) */}
        {!uploadedImage && onDimensionChange && (
          <div className="absolute inset-0 pointer-events-none z-30">
            {/* Vertical scroll wheel for Height on the left */}
            <div 
              className="absolute pointer-events-auto flex items-center justify-center"
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
              className="absolute pointer-events-auto flex items-center justify-center"
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
              className="absolute flex justify-center pointer-events-auto"
              style={{
                left: overlayLeft,
                top: `calc(${overlayTop} + ${overlayHeight} - 44px)`,
                width: overlayWidth,
              }}
            >
              <div className="bg-mammut-darker/90 border border-mammut-gold/60 rounded-full shadow-lg backdrop-blur-sm flex items-center px-3 py-0.5">
                <input
                  type="number"
                  value={widthText}
                  onChange={(e) => {
                    setWidthText(e.target.value);
                    const num = Number(e.target.value);
                    if (!isNaN(num) && num >= minW && num <= maxW) {
                      onDimensionChange(num, realH);
                    }
                  }}
                  onBlur={(e) => {
                    let val = Number(e.target.value) || minW;
                    val = Math.max(minW, Math.min(maxW, val));
                    onDimensionChange(val, realH);
                    setWidthText(val.toString());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-12 bg-transparent text-mammut-gold text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
                />
                <span className="text-mammut-gold text-[10px] font-black ml-1 select-none pointer-events-none">mm</span>
              </div>
            </div>

            {/* Height Dimension pill overlay on the left side inside the frame */}
            <div 
              className="absolute flex items-center pointer-events-auto"
              style={{
                left: `calc(${overlayLeft} + 12px)`,
                top: overlayTop,
                height: overlayHeight,
              }}
            >
              <div className="bg-mammut-darker/90 border border-mammut-gold/60 rounded-full shadow-lg backdrop-blur-sm flex items-center px-3 py-0.5">
                <input
                  type="number"
                  value={heightText}
                  onChange={(e) => {
                    setHeightText(e.target.value);
                    const num = Number(e.target.value);
                    if (!isNaN(num) && num >= minH && num <= maxH) {
                      onDimensionChange(realW, num);
                    }
                  }}
                  onBlur={(e) => {
                    let val = Number(e.target.value) || minH;
                    val = Math.max(minH, Math.min(maxH, val));
                    onDimensionChange(realW, val);
                    setHeightText(val.toString());
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-12 bg-transparent text-mammut-gold text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
                />
                <span className="text-mammut-gold text-[10px] font-black ml-1 select-none pointer-events-none">mm</span>
              </div>
            </div>
          </div>
        )}

        {/* 3D flip container */}
        <div 
          className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing hover:scale-105 select-none touch-none"
          style={{ 
            transformStyle: 'preserve-3d', 
            transform: `translate(${posX}px, ${posY}px) scale(${scaleFactor}) rotateY(${rotationY}deg)`,
            transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onWheel={handleWheel}
        >
          {renderFace(false)}
          {renderFace(true)}
        </div>
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
