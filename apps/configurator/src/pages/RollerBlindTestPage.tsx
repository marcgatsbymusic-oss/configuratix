/**
 * RollerBlindTestPage.tsx
 * Standalone page for testing/previewing the ROLLER_BLIND_BOX_225 roller blinds.
 * Route: /roller-blind-test
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLLER_BLIND_BOX_225Viewer } from '../components/configurator/ROLLER_BLIND_BOX_225Viewer';
import { ArrowLeft } from 'lucide-react';

export const RollerBlindTestPage: React.FC = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1500);

  // Roller blind colors
  const colors = [
    { label: 'Anthracite', hex: '#383e42' },
    { label: 'White', hex: '#f3f4f6' },
    { label: 'Gray', hex: '#8a939e' },
    { label: 'Golden Oak', hex: '#a67c45' },
    { label: 'Dark Oak', hex: '#5c4021' },
    { label: 'Deep Black', hex: '#111111' },
  ];
  const [colorExtIdx, setColorExtIdx] = useState(0); // default anthracite
  const [colorIntIdx, setColorIntIdx] = useState(1); // default white
  const [colorBlindIdx, setColorBlindIdx] = useState(2); // default gray

  const extColor = colors[colorExtIdx];
  const intColor = colors[colorIntIdx];
  const blindColor = colors[colorBlindIdx];

  return (
    <div className="fixed inset-0 flex bg-[#0e0e1a] overflow-hidden">
      {/* 3D viewport */}
      <div className="relative flex-1">
        <ROLLER_BLIND_BOX_225Viewer
          width={width}
          height={height}
          colorExt={extColor.hex}
          colorInt={intColor.hex}
          colorBlind={blindColor.hex}
          onDimensionChange={(w, h) => { setWidth(w); setHeight(h); }}
          activeLimits={{ minWidth: 500, maxWidth: 3000, minHeight: 500, maxHeight: 2500 }}
        />
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/configurator-test')}
          className="absolute top-3 left-3 z-30 flex items-center justify-center p-2 rounded-lg border border-white/10 bg-[#080816]/80 hover:bg-white/5 hover:border-white/20 text-white/70 hover:text-white transition-all active:scale-95 backdrop-blur-md"
          title="Back to Configurator Test"
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span className="text-xs font-bold uppercase tracking-wider">Back</span>
        </button>
      </div>

      {/* Side panel */}
      <div
        className="flex flex-col gap-4 p-5 shrink-0 overflow-y-auto"
        style={{
          width: 260,
          background: 'rgba(8,8,22,0.92)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#eab676] mb-1">Product Info</div>
          <div className="text-sm font-bold text-white">ROLLER BLIND 225</div>
          <div className="text-xs text-white/40 mt-0.5">Aluminum Roller Blinds Casing</div>
        </div>

        {/* Dimensions */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#eab676] mb-2">Dimensions</div>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Width', value: width, min: 500, max: 3000, set: (v: number) => setWidth(v) },
              { label: 'Height', value: height, min: 500, max: 2500, set: (v: number) => setHeight(v) },
            ].map(({ label, value, min, max, set }) => (
              <div key={label}>
                <div className="flex justify-between text-[10px] text-white/50 mb-1">
                  <span>{label}</span><span className="text-[#eab676] font-bold">{value} mm</span>
                </div>
                <input
                  type="range" min={min} max={max} step={10} value={value}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full accent-[#eab676]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Exterior Color */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#eab676] mb-2">Exterior Color (Outside)</div>
          <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto pr-1">
            {colors.map((col, i) => (
              <button
                key={`ext-${col.label}`}
                onClick={() => setColorExtIdx(i)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg text-left transition-all w-full"
                style={{
                  background: colorExtIdx === i ? 'rgba(234,182,118,0.12)' : 'transparent',
                  border: `1px solid ${colorExtIdx === i ? 'rgba(234,182,118,0.4)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: col.hex, border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <span className="text-[11px] text-white/70">{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interior Color */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#eab676] mb-2">Interior Color (Inside)</div>
          <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto pr-1">
            {colors.map((col, i) => (
              <button
                key={`int-${col.label}`}
                onClick={() => setColorIntIdx(i)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg text-left transition-all w-full"
                style={{
                  background: colorIntIdx === i ? 'rgba(234,182,118,0.12)' : 'transparent',
                  border: `1px solid ${colorIntIdx === i ? 'rgba(234,182,118,0.4)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: col.hex, border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <span className="text-[11px] text-white/70">{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Blind Color */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[#eab676] mb-2">Blind Color (Slats)</div>
          <div className="flex flex-col gap-1 max-h-[120px] overflow-y-auto pr-1">
            {colors.map((col, i) => (
              <button
                key={`blind-${col.label}`}
                onClick={() => setColorBlindIdx(i)}
                className="flex items-center gap-2 px-2 py-1 rounded-lg text-left transition-all w-full"
                style={{
                  background: colorBlindIdx === i ? 'rgba(234,182,118,0.12)' : 'transparent',
                  border: `1px solid ${colorBlindIdx === i ? 'rgba(234,182,118,0.4)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: col.hex, border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <span className="text-[11px] text-white/70">{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="text-[9px] text-white/25 leading-relaxed">
            Case and rail profiles extruded from<br />Roller_Blind_225.dxf
          </div>
        </div>
      </div>
    </div>
  );
};
