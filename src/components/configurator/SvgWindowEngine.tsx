import React, { useState } from 'react';

interface SvgWindowEngineProps {
  width: number;
  height: number;
  colorExt?: string;
  colorExtTexture?: string;
  colorInt?: string;
  colorIntTexture?: string;
  frameThickness?: number;
  viewSide?: 'interior' | 'exterior';
  weldType?: 'standard' | 'v-perfect';
  typology?: string;
  sealColor?: string;
}

/**
 * SvgWindowEngine
 * 
 * Renders a scalable 2D elevation of a window frame.
 * Implements a programmatic 9-slice approach so the frame thickness
 * remains constant regardless of the total width/height.
 */
export const SvgWindowEngine: React.FC<SvgWindowEngineProps> = ({
  width = 1000,
  height = 1000,
  colorExt = '#4B4B4D', // Anthracite
  colorExtTexture = '',
  colorInt = '#FFFFFF', // White
  colorIntTexture = '',
  frameThickness = 70, // Standard frame thickness in mm
  viewSide = 'interior',
  weldType = 'standard',
  typology = 'F104',
  sealColor = '',
}) => {
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: 100, h: 100 });
  const [showLens, setShowLens] = useState(false);

  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [mode, setMode] = useState<'rotate' | 'magnify'>('rotate');
  const [isTouch, setIsTouch] = useState(false);

  const offsetVal = isTouch ? 120 : 0;
  const lensX = pointerPos.x;
  const lensY = pointerPos.y - offsetVal;

  // Compute effective view side based on physical 3D rotation
  const baseRotation = viewSide === 'interior' ? 0 : 180;
  const currentRotation = baseRotation + rotationY;
  const normalizedRotation = ((currentRotation % 360) + 360) % 360;
  const effectiveViewSide = (normalizedRotation > 90 && normalizedRotation < 270) ? 'exterior' : 'interior';

  const activeFrameThickness = effectiveViewSide === 'interior' ? frameThickness : frameThickness + 20;

  const transform = effectiveViewSide === 'interior' ? `scale(-1, 1) translate(-${width}, 0)` : '';
  const mainFrameColor = effectiveViewSide === 'interior' ? colorInt : colorExt;
  const mainFrameTexture = effectiveViewSide === 'interior' ? colorIntTexture : colorExtTexture;
  
  const getGasketColor = (side: 'interior' | 'exterior') => {
    const color = sealColor || ((typology === 'F100' || typology === 'F104') ? 'czarny' : 'czarny');
    if (color === 'czarny') return '#111111';
    if (color === 'szary') return '#888888';
    if (color === 'mix' || color === 'czarny/sz') {
      return side === 'exterior' ? '#111111' : '#888888';
    }
    if (color === 'szary/czar') {
      return side === 'exterior' ? '#888888' : '#111111';
    }
    return '#111111';
  };

  const finalMainFillV = mainFrameTexture ? 'url(#frameTextureV)' : mainFrameColor;
  const finalMainFillH = mainFrameTexture ? 'url(#frameTextureH)' : mainFrameColor;
  const finalBeadFillV = finalMainFillV;
  const finalBeadFillH = finalMainFillH;

  const handlePointerDown = (e: React.PointerEvent) => {
    const isTouchEvent = e.pointerType === 'touch';
    setIsTouch(isTouchEvent);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPointerPos({ x, y });
    setContainerSize({ w: rect.width, h: rect.height });

    if (mode === 'magnify') {
      setIsDragging(false);
      setShowLens(true);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        console.error('Failed to set pointer capture:', err);
      }
    } else {
      setIsDragging(true);
      setStartX(e.clientX);
      setShowLens(false);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch (err) {
        console.error('Failed to set pointer capture:', err);
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isTouchEvent = e.pointerType === 'touch';
    setIsTouch(isTouchEvent);

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'magnify') {
      if (e.buttons > 0 || isTouchEvent) {
        setShowLens(true);
        setPointerPos({ x, y });
        setContainerSize({ w: rect.width, h: rect.height });
      }
    } else if (isDragging) {
      const deltaX = e.clientX - startX;
      setRotationY(prev => prev + deltaX * 0.5);
      setStartX(e.clientX);
    } else if (!isTouchEvent) {
      // Hover magnifier on desktop
      setPointerPos({ x, y });
      setContainerSize({ w: rect.width, h: rect.height });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    if (e.pointerType === 'touch' || mode === 'magnify') {
      setShowLens(false);
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignore
    }
  };

  const isSash = typology === 'F100';
  const glassOffset = isSash ? 130 : 90;
  const beadOuter = isSash ? 110 : 70;
  const beadInner = glassOffset;
  const sashOuter = activeFrameThickness;
  const sashInner = effectiveViewSide === 'interior' ? beadOuter : glassOffset;

  // Extracted SVG Content for reuse in the magnifying glass
  const svgContent = (
    <>
      <style>
        {`
          .frm-main-v { fill: ${finalMainFillV}; transition: fill 0.3s ease; }
          .frm-main-h { fill: ${finalMainFillH}; transition: fill 0.3s ease; }
          .mitre-line { stroke: ${weldType === 'v-perfect' ? 'transparent' : 'rgba(0,0,0,0.4)'}; stroke-width: 1px; }
          .bzd-seam { stroke: rgba(0,0,0,0.6); stroke-width: 1px; fill: none; }
          .glass { fill: #cce6ff; opacity: 0.6; }
          .bead-v { fill: ${finalBeadFillV}; stroke: rgba(0,0,0,0.1); stroke-width: 1px; transition: fill 0.3s ease; }
          .bead-h { fill: ${finalBeadFillH}; stroke: rgba(0,0,0,0.1); stroke-width: 1px; transition: fill 0.3s ease; }
          .gasket { stroke: ${getGasketColor(effectiveViewSide)}; transition: stroke 0.3s ease; fill: none; stroke-width: 6px; }
        `}
      </style>

      <defs>
        <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.1)" />
        </linearGradient>
        
        {mainFrameTexture && (
          <>
            <pattern id="frameTextureV" patternUnits="userSpaceOnUse" width="300" height="300" patternTransform="rotate(90)">
              <image href={mainFrameTexture} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
            <pattern id="frameTextureH" patternUnits="userSpaceOnUse" width="300" height="300">
              <image href={mainFrameTexture} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          </>
        )}

        {mainFrameTexture && (
          <>
            <pattern id="beadTextureV" patternUnits="userSpaceOnUse" width="300" height="300" patternTransform="rotate(90)">
              <image href={mainFrameTexture} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
            <pattern id="beadTextureH" patternUnits="userSpaceOnUse" width="300" height="300">
              <image href={mainFrameTexture} x="0" y="0" width="300" height="300" preserveAspectRatio="xMidYMid slice" />
            </pattern>
          </>
        )}
      </defs>

      <g transform={transform}>
        {/* Main Frame (Split into 4 segments for directional texture grain mapping) */}
        <polygon className="frm-main-h" points={`0,0 ${width},0 ${width - activeFrameThickness},${activeFrameThickness} ${activeFrameThickness},${activeFrameThickness}`} />
        <polygon className="frm-main-h" points={`0,${height} ${width},${height} ${width - activeFrameThickness},${height - activeFrameThickness} ${activeFrameThickness},${height - activeFrameThickness}`} />
        <polygon className="frm-main-v" points={`0,0 ${activeFrameThickness},${activeFrameThickness} ${activeFrameThickness},${height - activeFrameThickness} 0,${height}`} />
        <polygon className="frm-main-v" points={`${width},0 ${width - activeFrameThickness},${activeFrameThickness} ${width - activeFrameThickness},${height - activeFrameThickness} ${width},${height}`} />

        {/* Sash Frame (F100 Only) */}
        {isSash && (
          <>
            <polygon className="frm-main-h" points={`${sashOuter},${sashOuter} ${width - sashOuter},${sashOuter} ${width - sashInner},${sashInner} ${sashInner},${sashInner}`} />
            <polygon className="frm-main-h" points={`${sashOuter},${height - sashOuter} ${width - sashOuter},${height - sashOuter} ${width - sashInner},${height - sashInner} ${sashInner},${height - sashInner}`} />
            <polygon className="frm-main-v" points={`${sashOuter},${sashOuter} ${sashInner},${sashInner} ${sashInner},${height - sashInner} ${sashOuter},${height - sashOuter}`} />
            <polygon className="frm-main-v" points={`${width - sashOuter},${sashOuter} ${width - sashInner},${sashInner} ${width - sashInner},${height - sashInner} ${width - sashOuter},${height - sashOuter}`} />

            {/* Seam between Main Frame and Sash */}
            <rect 
              x={sashOuter} 
              y={sashOuter} 
              width={width - 2 * sashOuter} 
              height={height - 2 * sashOuter} 
              className="bzd-seam"
            />
          </>
        )}

        {/* Gradient overlay for depth */}
        <path
          fill="url(#frameGradient)"
          d={`
            M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z
            M ${glassOffset},${glassOffset} L ${glassOffset},${height - glassOffset} L ${width - glassOffset},${height - glassOffset} L ${width - glassOffset},${glassOffset} Z
          `}
          fillRule="evenodd"
        />

        {/* Mitre Cuts (45 degree weld seams) - extending through BZD */}
        <line x1="0" y1="0" x2={glassOffset} y2={glassOffset} className="mitre-line" />
        <line x1={width} y1="0" x2={width - glassOffset} y2={glassOffset} className="mitre-line" />
        <line x1="0" y1={height} x2={glassOffset} y2={height - glassOffset} className="mitre-line" />
        <line x1={width} y1={height} x2={width - glassOffset} y2={height - glassOffset} className="mitre-line" />

        {/* Glazing Bead (BZD) - Only visible from the interior */}
        {effectiveViewSide === 'interior' && (
          <>
            <polygon className="bead-h" points={`${beadOuter},${beadOuter} ${width - beadOuter},${beadOuter} ${width - beadInner},${beadInner} ${beadInner},${beadInner}`} />
            <polygon className="bead-h" points={`${beadOuter},${height - beadOuter} ${width - beadOuter},${height - beadOuter} ${width - beadInner},${height - beadInner} ${beadInner},${height - beadInner}`} />
            <polygon className="bead-v" points={`${beadOuter},${beadOuter} ${beadInner},${beadInner} ${beadInner},${height - beadInner} ${beadOuter},${height - beadOuter}`} />
            <polygon className="bead-v" points={`${width - beadOuter},${beadOuter} ${width - beadInner},${beadInner} ${width - beadInner},${height - beadInner} ${width - beadOuter},${height - beadOuter}`} />

            {/* Seam between Sash/Frame and BZD */}
            <rect 
              x={beadOuter} 
              y={beadOuter} 
              width={width - 2 * beadOuter} 
              height={height - 2 * beadOuter} 
              className="bzd-seam"
            />
          </>
        )}

        {/* Glass Package */}
        <rect 
          x={glassOffset} 
          y={glassOffset} 
          width={width - 2 * glassOffset} 
          height={height - 2 * glassOffset} 
          className="glass" 
        />
        
        {/* Gasket (GSK_INT) and inner shadow */}
        <rect 
          x={glassOffset} 
          y={glassOffset} 
          width={width - 2 * glassOffset} 
          height={height - 2 * glassOffset} 
          className="gasket"
        />
      </g>
    </>
  );

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center p-8 group"
      onPointerEnter={(e) => e.pointerType !== 'touch' && !isDragging && setShowLens(true)}
      onPointerLeave={(e) => e.pointerType !== 'touch' && setShowLens(false)}
    >
      {/* Mode Toggle for Mobile & Touch Devices */}
      <div className="absolute top-4 left-4 z-40 bg-gray-900/90 border border-gray-700/80 p-1 rounded-lg flex items-center gap-1 shadow-2xl backdrop-blur-sm">
        <button 
          onClick={() => { setMode('rotate'); setShowLens(false); }} 
          className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all duration-200 flex items-center gap-1 ${mode === 'rotate' ? 'bg-mammut-gold text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
          title="Drag to Rotate Window"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Rotate
        </button>
        <button 
          onClick={() => { setMode('magnify'); }} 
          className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all duration-200 flex items-center gap-1 ${mode === 'magnify' ? 'bg-mammut-gold text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
          title="Touch & Drag to Magnify Details"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Zoom
        </button>
      </div>
      {/* Magnifying Glass Lens Overlay */}
      {showLens && !isDragging && (
        <div 
          className="absolute rounded-full border-[3px] border-mammut-gold shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-none z-50 bg-gray-900"
          style={{
            width: 250,
            height: 250,
            left: lensX - 125,
            top: lensY - 125,
            overflow: 'hidden'
          }}
        >
           <div style={{
             position: 'absolute',
             width: containerSize.w,
             height: containerSize.h,
             transformOrigin: '0 0',
             transform: `translate(${125 - pointerPos.x * 3}px, ${125 - pointerPos.y * 3}px) scale(3)`,
           }}>
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full"
                style={{ 
                  transform: `rotateY(${currentRotation}deg)`, 
                  transformStyle: 'preserve-3d',
                }}
                xmlns="http://www.w3.org/2000/svg"
              >
                 {svgContent}
              </svg>
           </div>
        </div>
      )}

      {/* 3D Container for Main SVG */}
      <div 
        className={`relative w-full h-full flex items-center justify-center cursor-ew-resize perspective-1000 select-none ${mode === 'magnify' ? 'touch-none' : 'touch-pan-y'}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Interaction Hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 tracking-widest uppercase">
          Drag to rotate
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full transition-transform duration-75 ease-out"
          style={{ 
            transform: `rotateY(${currentRotation}deg)`, 
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0px 10px 30px rgba(0,0,0,0.2))' 
          }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {svgContent}
        </svg>
      </div>

      {/* HTML Overlays for Dimension Lines (Identical to WindowVisualizer structure) */}
      <div className="absolute bottom-4 left-16 right-16 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="w-full border-b border-gray-400 relative">
          <div className="absolute top-1/2 left-0 w-2 h-2 border-l border-gray-400 -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-2 h-2 border-r border-gray-400 -translate-y-1/2"></div>
        </div>
      </div>

      <div className="absolute top-16 bottom-16 left-4 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="h-full border-l border-gray-400 relative">
          <div className="absolute top-0 left-1/2 w-2 h-2 border-t border-gray-400 -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-2 border-b border-gray-400 -translate-x-1/2"></div>
        </div>
      </div>

    </div>
  );
};
