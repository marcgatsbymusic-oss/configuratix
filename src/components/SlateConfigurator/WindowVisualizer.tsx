// import React from 'react';

export interface WindowVisualizerProps {
  typology: string;
  width: number;
  height: number;
  infills?: { width?: string | number; height?: string | number }[];
}

export function WindowVisualizer({ typology, width, height, infills }: WindowVisualizerProps) {
  const isMultiSash = typology.match(/^F2[0-5][0-9]$/) && infills && infills.length >= 2;
  
  return (
    <div className="relative w-full aspect-square border border-gray-800 rounded-lg bg-white flex items-center justify-center p-16">
      
      {/* Base Image */}
      <img 
        src={`/assets/windowtypes/${typology}.jpg`} 
        alt={typology}
        className="w-full h-full object-contain relative z-10 drop-shadow-md"
        onError={(e) => { 
          e.currentTarget.style.display = 'none'; 
          if (!e.currentTarget.parentElement?.querySelector('.fallback')) {
            e.currentTarget.parentElement!.innerHTML += `<div class="fallback w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg bg-gray-100 text-gray-500 font-bold z-10 relative"><span>Missing Image</span><span class="text-xs font-normal mt-2">${typology}.jpg</span></div>`;
          }
        }}
      />
      
      {/* Dynamic Width Dimension Line */}
      <div className="absolute bottom-6 left-16 right-16 flex flex-col items-center justify-center z-20 gap-2">
        {isMultiSash && (
          <div className="w-full flex gap-1">
            <div className="flex-1 border-b border-gray-400 relative opacity-70">
              <div className="absolute top-1/2 left-0 w-2 h-2 border-l border-gray-400 -translate-y-1/2"></div>
              <div className="absolute top-1/2 right-0 w-2 h-2 border-r border-gray-400 -translate-y-1/2"></div>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-0.5 text-[10px] text-gray-600 border border-gray-200 rounded-full shadow-sm">
                {infills?.[0]?.width || Math.round(width / 2)} mm
              </span>
            </div>
            <div className="flex-1 border-b border-gray-400 relative opacity-70">
              <div className="absolute top-1/2 left-0 w-2 h-2 border-l border-gray-400 -translate-y-1/2"></div>
              <div className="absolute top-1/2 right-0 w-2 h-2 border-r border-gray-400 -translate-y-1/2"></div>
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 py-0.5 text-[10px] text-gray-600 border border-gray-200 rounded-full shadow-sm">
                {infills?.[1]?.width || Math.round(width / 2)} mm
              </span>
            </div>
          </div>
        )}
        <div className="w-full border-b border-black relative">
          <div className="absolute top-1/2 left-0 w-3 h-3 border-l-2 border-black -translate-y-1/2"></div>
          <div className="absolute top-1/2 right-0 w-3 h-3 border-r-2 border-black -translate-y-1/2"></div>
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 text-xs font-bold text-black border border-gray-300 rounded-full shadow-sm">
            {width} mm
          </span>
        </div>
      </div>

      {/* Dynamic Height Dimension Line */}
      <div className="absolute top-16 bottom-16 left-6 flex flex-col items-center justify-center z-20">
        <div className="h-full border-l border-black relative">
          <div className="absolute top-0 left-1/2 w-3 h-3 border-t-2 border-black -translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/2 w-3 h-3 border-b-2 border-black -translate-x-1/2"></div>
          <span 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 py-1 text-xs font-bold text-black border border-gray-300 rounded-full shadow-sm"
            style={{ transform: 'translate(-50%, -50%) rotate(-90deg)' }}
          >
            {height} mm
          </span>
        </div>
      </div>

    </div>
  );
}
