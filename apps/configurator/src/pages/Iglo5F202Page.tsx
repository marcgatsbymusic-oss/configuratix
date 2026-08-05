/**
 * Iglo5F202Page.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Route: /iglo5-f202
 * Window: F202 — Okno 2 kw. słupek ruchomy
 *         (Double casement, movable mullion, from seed window_types.json)
 *
 * Profile Components (IGLO 5):
 *   50003 · Rama 75mm             (frame)
 *   50034 · Skrzydło 120mm N_Z   (left sash — passive / turn L)
 *   50031 · Skrzydło 105mm D_W   (right sash — active / tilt-turn R)
 *   50029 · Słupek ruchomy       (movable mullion, floats with left sash)
 * ─────────────────────────────────────────────────────────────────────────
 */

import React, { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Loader2, Square, SwitchCamera, Maximize2 } from 'lucide-react';
import { Iglo5F202Viewer } from '../components/configurator/Iglo5F202Viewer';
import { AdaptiveCamera } from '../components/configurator/AdaptiveCamera';

// ── Colour palette (Drutex IGLO 5 RAL options) ────────────────────────────
const EXT_COLORS = [
  { label: 'White',        ext: '#f2f0ec', id: 'white'      },
  { label: 'Anthracite',   ext: '#383e42', id: 'anthracite' },
  { label: 'Grey',         ext: '#9ba0a6', id: 'grey'       },
  { label: 'Dark Green',   ext: '#2c4a34', id: 'dkgreen'    },
  { label: 'Dark Brown',   ext: '#4a2c1a', id: 'brown'      },
  { label: 'Black',        ext: '#1a1a1a', id: 'black'      },
  { label: 'Cream',        ext: '#f4f0e4', id: 'cream'      },
  { label: 'Dune',         ext: '#c4a882', id: 'dune'       },
];

const INT_COLORS = [
  { label: 'White',        hex: '#f2f0ec', id: 'white'      },
  { label: 'Anthracite',   hex: '#383e42', id: 'anthracite' },
  { label: 'Oak Decor',    hex: '#c8924c', id: 'oak'        },
  { label: 'Walnut',       hex: '#7a4c28', id: 'walnut'     },
  { label: 'Mahogany',     hex: '#6e2a18', id: 'mahog'      },
  { label: 'Black',        hex: '#1a1a1a', id: 'black'      },
  { label: 'Grey',         hex: '#9ba0a6', id: 'grey'       },
  { label: 'Cream',        hex: '#f4f0e4', id: 'cream'      },
];

const SEAL_COLORS = [
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Grey',  value: '#808080' },
  { label: 'White', value: '#e0e0e0' },
];

// ── Tiny helpers ──────────────────────────────────────────────────────────

const gold = '#eab676';

function Spinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: gold }} />
        <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: gold }}>
          Assembling profiles…
        </span>
      </div>
    </div>
  );
}

function Label({ text }: { text: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: gold }}>
      {text}
    </div>
  );
}

const divider = <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />;

// ── Page ──────────────────────────────────────────────────────────────────

export const Iglo5F202Page: React.FC = () => {
  const [width,  setWidth]  = useState(1500);
  const [height, setHeight] = useState(1200);

  const [extIdx,  setExtIdx]  = useState(0);
  const [intIdx,  setIntIdx]  = useState(0);
  const [biColor, setBiColor] = useState(false);
  const [sealIdx, setSealIdx] = useState(0);

  const [leftOpen,  setLeftOpen]  = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const controlsRef = useRef<any>(null);

  const scale  = 0.001;
  const W_M    = width  * scale;
  const H_M    = height * scale;
  const maxDim = Math.max(W_M, H_M);

  const colorExt  = EXT_COLORS[extIdx].ext;
  const colorInt  = biColor ? INT_COLORS[intIdx].hex : colorExt;

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: '#f5f5f0' }}>

      {/* ── 3D Viewport ─────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <Suspense fallback={<Spinner />}>
          <Canvas
            shadows
            gl={{ antialias: true, preserveDrawingBuffer: true }}
            camera={{ position: [W_M / 2, H_M / 2, -maxDim * 2.4], fov: 30 }}
            style={{ background: '#f0f0eb' }}
          >
            <color attach="background" args={['#f0f0eb']} />
            <AdaptiveCamera
              maxDim={maxDim}
              targetX={W_M / 2}
              targetY={H_M / 2}
              targetZ={-0.041}
              angle={0}
              defaultRadiusMult={2.4}
              fov={30}
              zSign={-1}
              controlsRef={controlsRef}
            />

            {/* Lighting — bright studio for white bg */}
            <ambientLight intensity={1.4} />
            <directionalLight
              position={[W_M * 2.5, H_M * 3, -H_M * 2]}
              intensity={2.0}
              castShadow
              color="#fff6e8"
            />
            <directionalLight position={[-W_M, H_M * 0.5, -H_M]} intensity={0.8} color="#a8c8ff" />
            <directionalLight position={[W_M * 0.5, -H_M, -H_M * 0.5]} intensity={0.35} />

            {/* The window */}
            <Iglo5F202Viewer
              widthMm={width}
              heightMm={height}
              colorExt={colorExt}
              colorInt={colorInt}
              sealColor={SEAL_COLORS[sealIdx].value}
              leftOpen={leftOpen}
              rightOpen={rightOpen}
              onToggleLeft={() => setLeftOpen(v => !v)}
              onToggleRight={() => setRightOpen(v => !v)}
            />

            <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.05} />
          </Canvas>
        </Suspense>

        {/* Top-left badge */}
        <div
          className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: 'rgba(234,182,118,0.18)',
            border: `1px solid rgba(180,120,40,0.45)`,
            color: '#7a5000',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: gold }} />
          IGLO 5 · F202 · Okno 2 kw. słupek ruchomy
        </div>

        {/* Profile tags */}
        <div
          className="absolute top-4 right-4 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.09)',
            backdropFilter: 'blur(16px)',
          }}
        >
          {[
            ['Frame',   '50003 · Rama 75mm'],
            ['Sash L',  '50034 · 120mm N_Z'],
            ['Sash R',  '50031 · 105mm D_W'],
            ['Mullion', '50029 · Słupek ruchomy'],
          ].map(([role, name]) => (
            <div key={role} className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider w-12" style={{ color: '#b07000' }}>{role}</span>
              <span className="text-[10px]" style={{ color: 'rgba(0,0,0,0.55)' }}>{name}</span>
            </div>
          ))}
        </div>

        {/* Bottom-left legend */}
        <div
          className="absolute bottom-4 left-4 flex flex-col gap-1 px-3 py-2 rounded-xl"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.09)',
            backdropFilter: 'blur(16px)',
            color: 'rgba(0,0,0,0.45)',
            fontSize: 10,
          }}
        >
          <div className="font-bold uppercase tracking-wider mb-0.5" style={{ fontSize: 10, color: '#222' }}>
            F202 — Double · Movable Mullion
          </div>
          <div>Left sash:  Turn (L-hand) — passive, carries post</div>
          <div>Right sash: TiltTurn (R-hand) — active</div>
          <div className="mt-1 border-t border-black/5 pt-1" style={{ color: 'rgba(0,0,0,0.25)' }}>
            Click green / rose hotspots to animate
          </div>
        </div>

        {/* Dimension indicator */}
        <div
          className="absolute bottom-4 right-4 text-[11px] font-mono px-3 py-1.5 rounded-lg"
          style={{
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(0,0,0,0.09)',
            color: 'rgba(0,0,0,0.45)',
          }}
        >
          {width} × {height} mm
        </div>
      </div>

      {/* ── Control Panel ───────────────────────────────────────────── */}
      <div
        className="flex flex-col gap-4 p-5 shrink-0 overflow-y-auto"
        style={{
          width: 240,
          background: 'rgba(6,6,16,0.97)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Header */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: gold }}>
            IGLO 5 · Catalogue Code
          </div>
          <div className="text-[22px] font-bold text-white mt-0.5 tracking-tight">F202</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Okno 2 kw. słupek ruchomy
          </div>
          <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.22)' }}>
            PVC · 70mm system depth
          </div>
        </div>

        {divider}

        {/* Dimensions */}
        <div>
          <Label text="Dimensions" />
          {[
            { lbl: 'Width',  val: width,  min: 800, max: 2400, set: setWidth  },
            { lbl: 'Height', val: height, min: 500, max: 2200, set: setHeight },
          ].map(({ lbl, val, min, max, set }) => (
            <div key={lbl} className="mb-3">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>{lbl}</span>
                <span style={{ color: gold, fontWeight: 700 }}>{val} mm</span>
              </div>
              <input
                type="range" min={min} max={max} step={10} value={val}
                onChange={e => set(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{ accentColor: gold }}
              />
            </div>
          ))}
        </div>

        {divider}

        {/* Exterior colour */}
        <div>
          <Label text="Exterior Colour" />
          <div className="flex flex-col gap-1">
            {EXT_COLORS.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setExtIdx(i)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left cursor-pointer transition-all"
                style={{
                  background: extIdx === i ? 'rgba(234,182,118,0.10)' : 'transparent',
                  border: `1px solid ${extIdx === i ? 'rgba(234,182,118,0.38)' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: c.ext, border: '1px solid rgba(255,255,255,0.2)' }}
                />
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {divider}

        {/* Bi-colour toggle */}
        <div>
          <button
            onClick={() => setBiColor(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all"
            style={{
              background: biColor ? 'rgba(234,182,118,0.10)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${biColor ? 'rgba(234,182,118,0.38)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>Bi-Colour Interior</span>
            <div className="w-8 h-4 rounded-full relative" style={{ background: biColor ? gold : 'rgba(255,255,255,0.15)' }}>
              <div
                className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                style={{ left: biColor ? '18px' : '2px' }}
              />
            </div>
          </button>

          {biColor && (
            <div className="flex flex-col gap-1 mt-2">
              <Label text="Interior Colour" />
              {INT_COLORS.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setIntIdx(i)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left cursor-pointer transition-all"
                  style={{
                    background: intIdx === i ? 'rgba(234,182,118,0.10)' : 'transparent',
                    border: `1px solid ${intIdx === i ? 'rgba(234,182,118,0.38)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ background: c.hex, border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {divider}

        {/* Seal colour */}
        <div>
          <Label text="Seal Colour" />
          <div className="flex gap-2">
            {SEAL_COLORS.map((s, i) => (
              <button
                key={s.label}
                title={s.label}
                onClick={() => setSealIdx(i)}
                className="w-8 h-8 rounded-full cursor-pointer transition-all"
                style={{
                  background: s.value,
                  border: sealIdx === i ? `2px solid ${gold}` : '2px solid rgba(255,255,255,0.15)',
                  boxShadow: sealIdx === i ? `0 0 0 1px rgba(234,182,118,0.35)` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {divider}

        {/* Opening toggles */}
        <div>
          <Label text="Sash Control" />
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setLeftOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-[11px]"
              style={{
                background: leftOpen ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${leftOpen ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.06)'}`,
                color: leftOpen ? '#4ade80' : 'rgba(255,255,255,0.5)',
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: '#4ade80' }} />
              Left Sash — {leftOpen ? 'Open' : 'Closed'}
            </button>
            <button
              onClick={() => setRightOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-[11px]"
              style={{
                background: rightOpen ? 'rgba(251,113,133,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${rightOpen ? 'rgba(251,113,133,0.4)' : 'rgba(255,255,255,0.06)'}`,
                color: rightOpen ? '#fb7185' : 'rgba(255,255,255,0.5)',
              }}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: '#fb7185' }} />
              Right Sash — {rightOpen ? 'Tilted' : 'Closed'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Geometry from seed/data/profiles/.<br />
            Engine: build_from_code.js F202 plan.<br />
            Profiles: 50003, 50034, 50031, 50029.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Iglo5F202Page;
