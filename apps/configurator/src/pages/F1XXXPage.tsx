/**
 * F1XXXPage.tsx
 * Standalone page for testing/previewing the F1XXX openable frame and sash window viewer.
 * Route: /f1xxx
 */

import React, { useState } from 'react';
import { F1XXXViewer } from '../components/configurator/F1XXXViewer';

export const F1XXXPage: React.FC = () => {
  const [width,  setWidth]  = useState(1000);
  const [height, setHeight] = useState(1000);

  // A small palette for quick testing
  const colors = [
    { label: 'White',     ext: '#f0ece6', int: '#f0ece6' },
    { label: 'Anthracite', ext: '#2d2d2d', int: '#f0ece6' },
    { label: 'Golden Oak', ext: '#8B5E2E', int: '#c4955a' },
    { label: 'Graphite',  ext: '#3a3a3a', int: '#3a3a3a' },
  ];
  const [colorIdx, setColorIdx] = useState(0);
  const c = colors[colorIdx];

  return (
    <div className="fixed inset-0 flex bg-[#0e0e1a] overflow-hidden">
      {/* 3D viewport */}
      <div className="relative flex-1">
        <F1XXXViewer
          width={width}
          height={height}
          colorExt={c.ext}
          colorInt={c.int}
          onDimensionChange={(w, h) => { setWidth(w); setHeight(h); }}
          activeLimits={{ minWidth: 400, maxWidth: 2400, minHeight: 400, maxHeight: 2400 }}
        />
      </div>

      {/* Side panel */}
      <div
        className="flex flex-col gap-4 p-5 shrink-0"
        style={{
          width: 220,
          background: 'rgba(8,8,22,0.92)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#eab676] mb-1">Profile</div>
          <div className="text-sm font-bold text-white">IGLO 5</div>
          <div className="text-xs text-white/40 mt-0.5">F1XXX — Frame & Sash</div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#eab676] mb-2">Dimensions</div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Width',  value: width,  max: 2400, set: (v: number) => setWidth(v) },
              { label: 'Height', value: height, max: 2400, set: (v: number) => setHeight(v) },
            ].map(({ label, value, max, set }) => (
              <div key={label}>
                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                  <span>{label}</span><span className="text-[#eab676] font-bold">{value} mm</span>
                </div>
                <input
                  type="range" min={400} max={max} step={10} value={value}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full accent-[#eab676]"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#eab676] mb-2">Color</div>
          <div className="flex flex-col gap-1.5">
            {colors.map((col, i) => (
              <button
                key={col.label}
                onClick={() => setColorIdx(i)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all"
                style={{
                  background: colorIdx === i ? 'rgba(234,182,118,0.12)' : 'transparent',
                  border: `1px solid ${colorIdx === i ? 'rgba(234,182,118,0.4)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: col.ext, border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <span className="text-xs text-white/70">{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[9px] text-white/25 leading-relaxed">
            Profile geometry sourced from<br />2_IGLO 5 FRAME_AND_ SASH_FUSION PROCESSED.dxf
          </div>
        </div>
      </div>
    </div>
  );
};
