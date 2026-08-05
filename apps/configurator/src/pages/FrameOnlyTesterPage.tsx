/**
 * FrameOnlyTesterPage.tsx
 * Dedicated test viewer page for the outer IGE frame and gaskets.
 * Route: /frame-only-tester
 */

import React, { useState } from 'react';
import { F2MPXViewer } from '../components/configurator/F2MPXViewer';

export const FrameOnlyTesterPage: React.FC = () => {
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(2000);
  const [sealColor, setSealColor] = useState('#1a1a1a');
  const [colorExt, setColorExt] = useState('#f0ece6');
  const [colorInt, setColorInt] = useState('#f0ece6');

  return (
    <div className="fixed inset-0 flex bg-[#09090e] text-white overflow-hidden">
      
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <F2MPXViewer
          width={width}
          height={height}
          colorExt={colorExt}
          colorInt={colorInt}
          sealColor={sealColor}
        />
        
        {/* Top Floating Badge */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold tracking-wide">IGE Frame Test Viewer</span>
        </div>
      </div>

      {/* Control panel */}
      <div className="w-80 border-l border-white/10 bg-black/80 backdrop-blur-md p-6 flex flex-col gap-6 overflow-y-auto z-20">
        <div>
          <h2 className="text-[#eab676] font-bold text-xs uppercase tracking-widest mb-1">Status</h2>
          <p className="text-xl font-bold">IGE Outer Frame</p>
          <p className="text-xs text-white/50">Geometry sourced from IGE_F104.json</p>
        </div>

        <hr className="border-white/10" />

        {/* Dimension Controls */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#eab676]">Dimensions</h3>
          
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/60">Width</span>
              <span className="font-bold text-[#eab676]">{width} mm</span>
            </div>
            <input
              type="range"
              min={800}
              max={2400}
              step={10}
              value={width}
              onChange={e => setWidth(Number(e.target.value))}
              className="w-full accent-[#eab676]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/60">Height</span>
              <span className="font-bold text-[#eab676]">{height} mm</span>
            </div>
            <input
              type="range"
              min={1000}
              max={2800}
              step={10}
              value={height}
              onChange={e => setHeight(Number(e.target.value))}
              className="w-full accent-[#eab676]"
            />
          </div>
        </div>

        <hr className="border-white/10" />

        {/* Colors */}
        <div className="flex flex-col gap-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#eab676]">Materials</h3>
          
          <div>
            <label className="block text-xs text-white/60 mb-1">Exterior Profile Color</label>
            <input
              type="color"
              value={colorExt}
              onChange={e => setColorExt(e.target.value)}
              className="w-full h-8 bg-transparent cursor-pointer rounded border border-white/20"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Interior Profile Color</label>
            <input
              type="color"
              value={colorInt}
              onChange={e => setColorInt(e.target.value)}
              className="w-full h-8 bg-transparent cursor-pointer rounded border border-white/20"
            />
          </div>

          <div>
            <label className="block text-xs text-white/60 mb-1">Gasket Color</label>
            <select
              value={sealColor}
              onChange={e => setSealColor(e.target.value)}
              className="w-full bg-[#18181f] border border-white/20 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#eab676]"
            >
              <option value="#1a1a1a">Black</option>
              <option value="#808080">Grey</option>
              <option value="#e0e0e0">White</option>
              <option value="#4a2f1a">Brown</option>
            </select>
          </div>
        </div>

        <hr className="border-white/10" />

        <div className="mt-auto">
          <p className="text-[10px] text-white/30 leading-relaxed">
            Double window step-by-step assembly.<br />
            Currently testing: Step 1 (Outer Frame).
          </p>
        </div>
      </div>

    </div>
  );
};
