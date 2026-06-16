/**
 * F202RPage.tsx
 * Full-screen standalone test page for the double window with movable post (active right sash).
 * Route: /f202r
 */

import React, { useState } from 'react';
import { F202RViewer } from '../components/configurator/F202RViewer';

const COLORS = [
  { label: 'White',      ext: '#f0ece6', int: '#f0ece6' },
  { label: 'Anthracite', ext: '#2d2d2d', int: '#f0ece6' },
  { label: 'Graphite',   ext: '#3a3a3a', int: '#3a3a3a' },
  { label: 'Golden Oak', ext: '#8B5E2E', int: '#c4955a' },
  { label: 'Steel Blue', ext: '#3b5278', int: '#f0ece6' },
  { label: 'Cream',      ext: '#fdf5e4', int: '#fdf5e4' },
];

const SEAL_COLORS = [
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Grey',  value: '#808080' },
  { label: 'White', value: '#e0e0e0' },
  { label: 'Brown', value: '#4a2f1a' },
];

export const F202RPage: React.FC = () => {
  const [width,      setWidth]      = useState(1200);
  const [height,     setHeight]     = useState(2000);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [colorIdx,   setColorIdx]   = useState(0);
  const [biColor,    setBiColor]    = useState(false);
  const [sealIdx,    setSealIdx]    = useState(0);

  // Roller Blind states
  const [showBlindBox, setShowBlindBox] = useState(true);
  const [blindOpen, setBlindOpen]       = useState(0.0);

  const c        = COLORS[colorIdx];
  const extColor = c.ext;
  const intColor = biColor ? c.int : c.ext;

  const label = (text: string) => (
    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#eab676' }}>
      {text}
    </div>
  );

  const divider = <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />;

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: '#0a0a14' }}>

      {/* ── 3D Viewport ── */}
      <div className="relative flex-1">
        <React.Suspense fallback={null}>
          <F202RViewer
            width={width}
            height={height}
            splitRatio={splitRatio}
            colorExt={extColor}
            colorInt={intColor}
            colorGsk={SEAL_COLORS[sealIdx].value}
            showBlindBox={showBlindBox}
            blindOpen={blindOpen}
            onBlindOpenChange={setBlindOpen}
          />
        </React.Suspense>

        {/* Floating badge */}
        <div
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: 'rgba(234,182,118,0.12)',
            border: '1px solid rgba(234,182,118,0.35)',
            color: '#eab676',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-[#eab676] animate-pulse" />
          F202R — Parametric Double Window (Active Right, Passive Left)
        </div>

        {/* Sash legend */}
        <div
          className="absolute bottom-4 left-4 flex flex-col gap-1.5 px-3 py-2 rounded-xl text-[10px]"
          style={{
            background: 'rgba(8,8,20,0.75)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <div className="flex items-center gap-2 text-white/80 font-bold uppercase tracking-wider mb-0.5">
            Legend &amp; Controls
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-500" />
            <span>Left sash — turn only (no handle)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#eab676]" />
            <span>Movable Post — swings with left sash</span>
          </div>
          <div className="mt-1 text-white/40 border-t border-white/5 pt-1">
            Click hotspot to toggle right sash (active) or left sash open/close
          </div>
        </div>
      </div>

      {/* ── Side Control Panel ── */}
      <div
        className="flex flex-col gap-5 p-5 shrink-0 overflow-y-auto"
        style={{
          width: 228,
          background: 'rgba(7,7,18,0.95)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#eab676' }}>Profile</div>
          <div className="text-sm font-bold text-white mt-0.5">1600-IGLO EDGE</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            F202R Double Window
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {width} × {height} mm (r: {splitRatio.toFixed(2)})
          </div>
        </div>

        {divider}

        {/* Dimensions */}
        <div>
          {label('Dimensions')}
          {[
            { lbl: 'Width',  val: width,  min: 600, max: 3000, step: 10, set: setWidth  },
            { lbl: 'Height', val: height, min: 400, max: 2400, step: 10, set: setHeight },
            { lbl: 'Split Ratio', val: splitRatio, min: 0.2, max: 0.8, step: 0.05, set: setSplitRatio }
          ].map(({ lbl, val, min, max, step, set }) => (
            <div key={lbl} className="mb-3">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <span>{lbl}</span>
                <span style={{ color: '#eab676', fontWeight: 700 }}>{lbl === 'Split Ratio' ? val.toFixed(2) : `${val} mm`}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={val}
                onChange={e => set(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: '#eab676' }}
              />
            </div>
          ))}
        </div>

        {divider}

        {/* Roller Blind Controls */}
        <div>
          {label('Roller Blind')}
          
          {/* Toggle blind box casing */}
          <button
            onClick={() => setShowBlindBox(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all mb-3"
            style={{
              background: showBlindBox ? 'rgba(234,182,118,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${showBlindBox ? 'rgba(234,182,118,0.4)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Blind Box Box</span>
            <div
              className="w-8 h-4 rounded-full relative transition-all"
              style={{ background: showBlindBox ? '#eab676' : 'rgba(255,255,255,0.15)' }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                style={{ left: showBlindBox ? '18px' : '2px' }}
              />
            </div>
          </button>

          {showBlindBox && (
            <div className="flex flex-col gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5">
              {/* Raise/Lower blind */}
              <button
                onClick={() => setBlindOpen(v => v > 0.5 ? 0.0 : 1.0)}
                className="w-full text-center py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff'
                }}
              >
                {blindOpen > 0.5 ? '▼ Lower Blind' : '▲ Raise Blind'}
              </button>

              {/* Blind Opening slider */}
              <div>
                <div className="flex justify-between text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <span>Blind Opening</span>
                  <span style={{ color: '#eab676', fontWeight: 700 }}>
                    {Math.round(blindOpen * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={blindOpen}
                  onChange={(e) => setBlindOpen(parseFloat(e.target.value))}
                  className="w-full"
                  style={{ accentColor: '#eab676' }}
                />
              </div>
            </div>
          )}
        </div>

        {divider}

        {/* Color */}
        <div>
          {label('Colour')}
          <div className="flex flex-col gap-1.5 mb-3">
            {COLORS.map((col, i) => (
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
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>{col.label}</span>
              </button>
            ))}
          </div>

          {/* Bi-color toggle */}
          <button
            onClick={() => setBiColor(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all"
            style={{
              background: biColor ? 'rgba(234,182,118,0.12)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${biColor ? 'rgba(234,182,118,0.4)' : 'rgba(255,255,255,0.07)'}`,
            }}
          >
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>Bi-Color</span>
            <div
              className="w-8 h-4 rounded-full relative transition-all"
              style={{ background: biColor ? '#eab676' : 'rgba(255,255,255,0.15)' }}
            >
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                style={{ left: biColor ? '18px' : '2px' }}
              />
            </div>
          </button>
        </div>

        {divider}

        {/* Seal */}
        <div>
          {label('Seal Colour')}
          <div className="flex gap-2 flex-wrap">
            {SEAL_COLORS.map((s, i) => (
              <button
                key={s.label}
                title={s.label}
                onClick={() => setSealIdx(i)}
                className="w-7 h-7 rounded-full transition-all"
                style={{
                  background: s.value,
                  border: sealIdx === i
                    ? '2px solid #eab676'
                    : '2px solid rgba(255,255,255,0.15)',
                  boxShadow: sealIdx === i ? '0 0 0 1px rgba(234,182,118,0.4)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {divider}

        {/* Footer note */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Right Active Sash (T&amp;T) · Left Inactive Sash (Turn)<br />
            Post Shortening: ext −75mm, int −48mm<br />
            Using IGE_WINDOW_MOVABLE_POST.json
          </div>
        </div>
      </div>
    </div>
  );
};
