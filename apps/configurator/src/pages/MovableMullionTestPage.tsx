import React, { useState, Suspense, useRef } from 'react';
import { MovableMullionTestViewer } from '../components/configurator/MovableMullionTestViewer';
import { Loader2 } from 'lucide-react';
import { Html, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { AdaptiveCamera } from '../components/configurator/AdaptiveCamera';

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
];

function LoadingOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#eab676]" />
        <span className="text-xs font-bold uppercase tracking-widest">Assembling 3D Profiles...</span>
      </div>
    </div>
  );
}

export const MovableMullionTestPage: React.FC = () => {
  // Set default dimensions as requested: 1400wide x 1230 height
  const [width, setWidth] = useState(1400);
  const [height, setHeight] = useState(1230);
  const [colorIdx, setColorIdx] = useState(0);
  const [biColor, setBiColor] = useState(false);
  const [sealIdx, setSealIdx] = useState(0);
  const controlsRef = useRef<any>(null);

  const c = COLORS[colorIdx];
  const extColor = c.ext;
  const intColor = biColor ? c.int : c.ext;

  const label = (text: string) => (
    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#eab676' }}>
      {text}
    </div>
  );

  const divider = <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />;

  const scale = 0.001;
  const W_M = width * scale;
  const H_M = height * scale;
  const maxDim = Math.max(W_M, H_M);

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: '#0a0a14' }}>
      {/* ── 3D Viewport ── */}
      <div className="relative flex-1">
        <Suspense fallback={<LoadingOverlay />}>
          <Canvas
            shadows
            gl={{ antialias: true, preserveDrawingBuffer: true }}
            camera={{ position: [W_M / 2, H_M / 2, -maxDim * 2.2], fov: 30 }}
            style={{ background: '#0d0d14' }}
          >
            <AdaptiveCamera
              maxDim={maxDim}
              targetX={W_M / 2}
              targetY={H_M / 2}
              targetZ={-0.041}
              angle={0}
              defaultRadiusMult={2.2}
              fov={30}
              zSign={-1}
              controlsRef={controlsRef}
            />

            <ambientLight intensity={0.5} />
            <directionalLight
              position={[W_M * 2.5, H_M * 3, -H_M * 2]}
              intensity={2.5}
              castShadow
              color="#fff6e8"
            />
            <directionalLight position={[-W_M, H_M * 0.5, -H_M]} intensity={0.8} color="#a8c8ff" />
            <directionalLight position={[W_M * 0.5, -H_M, -H_M * 0.5]} intensity={0.3} />

            <MovableMullionTestViewer
              widthMm={width}
              heightMm={height}
              colorExt={extColor}
              colorInt={intColor}
              sealColor={SEAL_COLORS[sealIdx].value}
            />

            <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} />
          </Canvas>
        </Suspense>

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
          Movable Mullion 3D Test Viewer (1400 x 1230)
        </div>

        {/* Legend */}
        <div
          className="absolute bottom-4 left-4 flex flex-col gap-1.5 px-3 py-2 rounded-xl text-[10px]"
          style={{
            background: 'rgba(8,8,20,0.75)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(16px)',
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          <div className="text-white/80 font-bold uppercase tracking-wider mb-0.5">
            Test Details
          </div>
          <div>Left Sash: Passive Sash (swings with central floating mullion)</div>
          <div>Right Sash: Active Sash</div>
          <div className="mt-1 text-white/40 border-t border-white/5 pt-1">
            Click green/red hotspots to toggle sashes open/closed.
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
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#eab676' }}>Junction Assembly</div>
          <div className="text-sm font-bold text-white mt-0.5">Double Sash</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Movable Mullion 50029
          </div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {width} × {height} mm
          </div>
        </div>

        {divider}

        {/* Dimensions */}
        <div>
          {label('Dimensions')}
          {[
            { lbl: 'Width',  val: width,  min: 800, max: 2400, set: setWidth  },
            { lbl: 'Height', val: height, min: 500, max: 2000, set: setHeight },
          ].map(({ lbl, val, min, max, set }) => (
            <div key={lbl} className="mb-3">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <span>{lbl}</span>
                <span style={{ color: '#eab676', fontWeight: 700 }}>{val} mm</span>
              </div>
              <input
                type="range" min={min} max={max} step={10} value={val}
                onChange={e => set(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: '#eab676' }}
              />
            </div>
          ))}
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
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer"
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
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all cursor-pointer"
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
                className="w-7 h-7 rounded-full transition-all cursor-pointer"
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

        {/* Footer info */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Rendered using dynamic loop assemblies from frame 50001, sash 50013, and mullion 50029.
          </div>
        </div>
      </div>
    </div>
  );
};
export default MovableMullionTestPage;
