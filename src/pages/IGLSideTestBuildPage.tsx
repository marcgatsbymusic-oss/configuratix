/**
 * IGLSideTestBuildPage.tsx
 * Standalone page for previewing and testing the IGLSIDE_TEST_BUILD sliding door frame assembly rules.
 * Route: /igls-test-build
 */

import React, { useState } from 'react';
import { IGLSideTestBuildViewer } from '../components/configurator/IGLSideTestBuildViewer';

export const IGLSideTestBuildPage: React.FC = () => {
  const [width, setWidth] = useState(2200);
  const [height, setHeight] = useState(2100);

  // Quick testing colors
  const colors = [
    { label: 'Anthracite / White', ext: '#2d2d2d', int: '#f0ece6' },
    { label: 'White / White', ext: '#f0ece6', int: '#f0ece6' },
    { label: 'Golden Oak', ext: '#8B5E2E', int: '#c4955a' },
    { label: 'Black / Black', ext: '#151515', int: '#151515' },
  ];
  
  const [colorIdx, setColorIdx] = useState(0);
  const activeColor = colors[colorIdx];

  return (
    <div className="fixed inset-0 flex bg-[#09090f] overflow-hidden font-sans">
      {/* 3D Viewport */}
      <div className="relative flex-1">
        <IGLSideTestBuildViewer
          width={width}
          height={height}
          colorExt={activeColor.ext}
          colorInt={activeColor.int}
          onDimensionChange={(w, h) => { setWidth(w); setHeight(h); }}
          activeLimits={{ minWidth: 1000, maxWidth: 3000, minHeight: 1000, maxHeight: 3000 }}
        />
      </div>

      {/* Control Sidebar */}
      <div
        className="flex flex-col gap-6 p-6 shrink-0 z-10"
        style={{
          width: 250,
          background: 'rgba(8, 8, 15, 0.95)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676] mb-1">Sliding System</div>
          <div className="text-lg font-bold text-white tracking-tight">IGLSIDE_TEST_BUILD</div>
          <div className="text-xs text-white/40 mt-1 leading-relaxed">
            Scalable 3D Frame &amp; Track Assembly preview.
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Dimension Controls */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676] mb-3">Frame Dimensions</div>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Width (W)', value: width, max: 3000, min: 1000, set: (v: number) => setWidth(v) },
              { label: 'Height (H)', value: height, max: 3000, min: 1000, set: (v: number) => setHeight(v) },
            ].map(({ label, value, min, max, set }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] text-white/50">
                  <span>{label}</span>
                  <span className="text-[#eab676] font-bold">{value} mm</span>
                </div>
                <input
                  type="range" 
                  min={min} 
                  max={max} 
                  step={10} 
                  value={value}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full accent-[#eab676] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Color Presets */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676] mb-3">Color Scheme</div>
          <div className="flex flex-col gap-2">
            {colors.map((col, i) => (
              <button
                key={col.label}
                onClick={() => setColorIdx(i)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer hover:bg-white/5"
                style={{
                  background: colorIdx === i ? 'rgba(234, 182, 118, 0.12)' : 'transparent',
                  border: `1px solid ${colorIdx === i ? 'rgba(234, 182, 118, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
                }}
              >
                <div className="flex gap-0.5 shrink-0">
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20"
                    style={{ background: col.ext }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-white/20 -ml-1"
                    style={{ background: col.int }}
                  />
                </div>
                <span className="text-xs font-semibold text-white/70">{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Assembly Rules Explanation */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676]">Assembly Specifications</div>
          <ul className="text-[10px] text-white/40 list-disc pl-4 flex flex-col gap-1.5 leading-relaxed">
            <li>Aluminium tracks are placed only on bottom, right, and top sides.</li>
            <li>Tracks start short of <span className="text-white/60">34.87 mm</span> from the left edge.</li>
            <li>45-degree mitre cuts align horizontal segments to the vertical segment at the right corners.</li>
          </ul>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div className="text-[9px] text-white/25 leading-relaxed">
            Profile contours generated from<br />
            IGLS_OPENING_DOOR_SECTION_AND_FRAME.json
          </div>
        </div>
      </div>
    </div>
  );
};
