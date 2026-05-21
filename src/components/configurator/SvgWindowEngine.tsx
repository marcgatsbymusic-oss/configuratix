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
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ w: 100, h: 100 });
  const [showLens, setShowLens] = useState(false);

  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

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
    setIsDragging(true);
    setStartX(e.clientX);
    setShowLens(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!isDragging) {
      setLensPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setContainerSize({ w: rect.width, h: rect.height });
    } else {
      const deltaX = e.clientX - startX;
      setRotationY(prev => prev + deltaX * 0.5);
      setStartX(e.clientX);
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
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
      onPointerEnter={() => !isDragging && setShowLens(true)}
      onPointerLeave={() => setShowLens(false)}
    >
      {/* Magnifying Glass Lens Overlay */}
      {showLens && !isDragging && (
        <div 
          className="absolute rounded-full border-[3px] border-mammut-gold shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-none z-50 bg-gray-900"
          style={{
            width: 250,
            height: 250,
            left: lensPos.x - 125,
            top: lensPos.y - 125,
            overflow: 'hidden'
          }}
        >
           <div style={{
             position: 'absolute',
             width: containerSize.w,
             height: containerSize.h,
             transformOrigin: `${lensPos.x}px ${lensPos.y}px`,
             transform: `translate(${125 - lensPos.x}px, ${125 - lensPos.y}px) scale(3)`,
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
        className="relative w-full h-full flex items-center justify-center cursor-ew-resize perspective-1000 touch-pan-y"
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
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-3 py-1 text-xs font-bold text-white border border-gray-700 rounded-full shadow-sm">
            {width} mm
          </span>
        </div>
      </div>

      <div className="absolute top-16 bottom-16 left-4 flex flex-col items-center justify-center z-20 pointer-events-none">
        <div className="h-full border-l border-gray-400 relative">
          <div className="absolute top-0 left-1/2 w-2 h-2 border-t border-gray-400 -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-2 h-2 border-b border-gray-400 -translate-x-1/2"></div>
          <span 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-3 py-1 text-xs font-bold text-white border border-gray-700 rounded-full shadow-sm"
            style={{ transform: 'translate(-50%, -50%) rotate(-90deg)' }}
          >
            {height} mm
          </span>
        </div>
      </div>

    </div>
  );
};
