/**
 * Iglo5FixedViewer.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * F1T0 — "Okno stałe" (Fixed / non-opening window, single light)
 *
 * Profiles (from seed/data/profiles/):
 *   50003 · Rama 75mm             (frame, all 4 sides)
 *   50110 · Listwa H              (glazing bead, all 4 sides, direct-glaze)
 *   szyba_24mm                    (glass unit)
 *   gasket__250010                (frame gasket)
 *   gasket__250011                (bead gasket)
 *
 * Assembly: Frame wraps directly around the glazing unit — no sash.
 *           Glazing bead clips into the frame rebate from the interior side.
 * ─────────────────────────────────────────────────────────────────────────
 */

import React, { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';

import frameProfile  from '../../../data/profiles/frame__50003_rama_75mm.json';
import beadProfile   from '../../../data/profiles/glazing_bead__50110_listwa_H.json';
import glassProfile  from '../../../data/profiles/glass__szyba_24mm.json';
import spacerProfile from '../../../data/profiles/spacer_bridge__mostek_podszybowy.json';
import gasket250010  from '../../../data/profiles/gasket__250010.json';
import gasket250011  from '../../../data/profiles/gasket__250011.json';

import { transformLoop } from '../../../engine/assemble.ts';
import type { Loop } from '../../../engine/assemble.ts';

// ── Helpers ──────────────────────────────────────────────────────────────

function normalizeLoops(profile: any): Loop[] {
  return (profile.loops || []).map((loop: any) => ({
    closed: !!loop.closed,
    pts: (loop.pts || []).map((p: any) =>
      Array.isArray(p) ? { x: p[0], y: p[1] } : { x: p.x ?? 0, y: p.y ?? 0 }
    ),
  }));
}

// ── Props ─────────────────────────────────────────────────────────────────

export interface Iglo5FixedViewerProps {
  widthMm?:   number;
  heightMm?:  number;
  colorExt?:  string;
  colorInt?:  string;
  sealColor?: string;
}

// ── Assembly (inner 3D group) ─────────────────────────────────────────────

const Iglo5FixedAssembly: React.FC<Iglo5FixedViewerProps> = ({
  widthMm   = 1200,
  heightMm  = 1000,
  colorExt  = '#f2f0ec',
  colorInt  = '#f2f0ec',
  sealColor = '#1a1a1a',
}) => {
  const scale = 0.001;

  const W = widthMm  * scale;
  const H = heightMm * scale;

  // IGLO 5 profile bbox: [0, 0, 75, 70]
  //   X (0-75) = FACE WIDTH  -- matches the "75mm" name
  //   Y (0-70) = SYSTEM DEPTH -- EXT=0, INT=70. Constant for all IGLO 5 frames.
  const FRAME_FACE_MM  = 75;  // bbox-X: face-width axis
  const FRAME_DEPTH_MM = 70;  // bbox-Y: depth axis (= systemDepth)

  // elevation.frameFace = 34mm: the visible overlap used for DLO layout (iglo5.meta.json)
  const FRAME_ELEVATION_FACE = 34;

  // ── Normalized loops ───────────────────────────────────────────────────
  const frmLoops  = useMemo(() => normalizeLoops(frameProfile),  []);
  const beadLoops = useMemo(() => normalizeLoops(beadProfile),   []);
  const glsLoops  = useMemo(() => normalizeLoops(glassProfile),  []);
  const spacLoops = useMemo(() => normalizeLoops(spacerProfile), []);
  const gsk10     = useMemo(() => normalizeLoops(gasket250010),  []);
  const gsk11     = useMemo(() => normalizeLoops(gasket250011),  []);

  // Offsets in profile coords: [X=face-position, Y=depth-position]
  // Glazing pocket from frame geometry: EXT rebate stop at depth~35, INT bead ledge at depth~55
  //
  // Bead 50110 (clips into INT ledge at face=50, depth=55)
  const bzd = useMemo(() =>
    beadLoops.map(l => transformLoop(l, [50, 55], 0)),
  [beadLoops]);

  // Frame gasket 250010 (EXT side of glass, y=0 touches rebate stop at depth=35)
  const gsk10t = useMemo(() =>
    gsk10.map(l => transformLoop(l, [50, 35], 0)),
  [gsk10]);

  // Bead gasket 250011 (INT side of glass, y=0 at bead ledge depth=55)
  const gsk11t = useMemo(() =>
    gsk11.map(l => transformLoop(l, [50, 55], 0)),
  [gsk11]);

  // ── Materials ──────────────────────────────────────────────────────────
  const extMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: colorExt, roughness: 0.36, metalness: 0.06 }), [colorExt]);
  const intMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: colorInt, roughness: 0.36, metalness: 0.06 }), [colorInt]);
  const sealMat = useMemo(() => new THREE.MeshStandardMaterial({ color: sealColor, roughness: 0.9, metalness: 0 }),    [sealColor]);
  const spacMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4B4B4D', roughness: 0.6, metalness: 0.5 }), []);
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#c8e0f0',
    roughness: 0.02, metalness: 0,
    transmission: 1.0, ior: 1.52,
    thickness: 0.024,
    transparent: true, opacity: 0.35,
  }), []);

  const origin = { x: 0, y: 0 };

  // ── Render helpers ─────────────────────────────────────────────────────

  const renderSide = (lenMm: number, uSign: number, uOff: number) => (
    <>
      <FrameSegment layerName="FRM_EXT" scaleFactor={scale} length={lenMm}
        loops={frmLoops} material={extMat} origin={origin} uSign={uSign} uOffset={uOff} />
      <FrameSegment layerName="BZD" scaleFactor={scale} length={lenMm}
        loops={bzd} material={intMat} origin={origin} uSign={uSign} uOffset={uOff} uvMode="rail" />
      <FrameSegment layerName="GSK_FRM" scaleFactor={scale} length={lenMm}
        loops={gsk10t} material={sealMat} origin={origin} uSign={uSign} uOffset={uOff} />
      <FrameSegment layerName="GSK_BZD" scaleFactor={scale} length={lenMm}
        loops={gsk11t} material={sealMat} origin={origin} uSign={uSign} uOffset={uOff} />
    </>
  );

  // Glass pane: DLO uses elevation.frameFace=34mm (visible overlap), not full face width.
  // Glass depth: rebate runs depth 35-55mm -> glass centre at 45mm from EXT.
  const glassInset   = FRAME_ELEVATION_FACE * scale;
  const paneW        = W - 2 * glassInset;
  const paneH        = H - 2 * glassInset;
  const glassThick   = 24 * scale;
  const glassCenterZ = -45 * scale;  // mid-rebate depth: (35+55)/2 = 45mm

  return (
    <group>
      {/* Bottom rail */}
      <group rotation={[0, 0, 0]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderSide(widthMm, 1, 0)}
        </group>
      </group>

      {/* Right stile */}
      <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderSide(heightMm, -1, W / scale)}
        </group>
      </group>

      {/* Top rail */}
      <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderSide(widthMm, 1, (W - H) / scale)}
        </group>
      </group>

      {/* Left stile */}
      <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderSide(heightMm, -1, (W - H) / scale)}
        </group>
      </group>

      {/* Glass pane */}
      <mesh position={[W / 2, H / 2, glassCenterZ]} material={glassMat} castShadow receiveShadow>
        <boxGeometry args={[paneW, paneH, glassThick]} />
      </mesh>
    </group>
  );
};

// ── Full-page viewer ──────────────────────────────────────────────────────

const EXT_COLORS = [
  { label: 'White',       hex: '#f2f0ec', id: 'white'     },
  { label: 'Anthracite',  hex: '#383e42', id: 'anthracite'},
  { label: 'Grey',        hex: '#9ba0a6', id: 'grey'      },
  { label: 'Dark Green',  hex: '#2c4a34', id: 'dkgreen'   },
  { label: 'Dark Brown',  hex: '#4a2c1a', id: 'brown'     },
  { label: 'Black',       hex: '#1a1a1a', id: 'black'     },
  { label: 'Cream',       hex: '#f4f0e4', id: 'cream'     },
  { label: 'Dune',        hex: '#c4a882', id: 'dune'      },
  { label: 'Steel Blue',  hex: '#3b5278', id: 'steelblue' },
];

const INT_COLORS = [
  { label: 'White',       hex: '#f2f0ec', id: 'white'   },
  { label: 'Anthracite',  hex: '#383e42', id: 'anth'    },
  { label: 'Oak Decor',   hex: '#c8924c', id: 'oak'     },
  { label: 'Walnut',      hex: '#7a4c28', id: 'walnut'  },
  { label: 'Mahogany',    hex: '#6e2a18', id: 'mahog'   },
  { label: 'Cream',       hex: '#f4f0e4', id: 'cream'   },
];

const SEAL_COLORS = [
  { label: 'Black', value: '#1a1a1a' },
  { label: 'Grey',  value: '#808080' },
  { label: 'White', value: '#e0e0e0' },
];

const gold = '#eab676';

function Label({ text }: { text: string }) {
  return (
    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: gold }}>
      {text}
    </div>
  );
}
const divider = <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '6px 0' }} />;

export const Iglo5FixedViewer: React.FC = () => {
  const [width,   setWidth]   = useState(1200);
  const [height,  setHeight]  = useState(1000);
  const [extIdx,  setExtIdx]  = useState(0);
  const [intIdx,  setIntIdx]  = useState(0);
  const [biColor, setBiColor] = useState(false);
  const [sealIdx, setSealIdx] = useState(0);
  const controlsRef = useRef<any>(null);

  const scale  = 0.001;
  const W_M    = width  * scale;
  const H_M    = height * scale;
  const maxDim = Math.max(W_M, H_M);

  const colorExt = EXT_COLORS[extIdx].hex;
  const colorInt = biColor ? INT_COLORS[intIdx].hex : colorExt;

  return (
    <div className="fixed inset-0 flex overflow-hidden" style={{ background: '#f2f2ee' }}>

      {/* ── 3D Canvas ──────────────────────────────────────────────────── */}
      <div className="relative flex-1">
        <Canvas
          shadows
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          camera={{ position: [W_M / 2, H_M / 2, -maxDim * 2.4], fov: 30 }}
          style={{ background: '#eeeee9' }}
        >
          <color attach="background" args={['#eeeee9']} />
          <fog attach="fog" args={['#eeeee9', maxDim * 14, maxDim * 40]} />

          <AdaptiveCamera
            maxDim={maxDim}
            targetX={W_M / 2}
            targetY={H_M / 2}
            targetZ={-(70 * scale) / 2}
            angle={0}
            defaultRadiusMult={2.4}
            fov={30}
            zSign={-1}
            controlsRef={controlsRef}
          />

          {/* Studio lighting */}
          <ambientLight intensity={1.2} />
          <directionalLight
            position={[W_M * 2.5, H_M * 3, -H_M * 2]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0004}
            color="#fff6e8"
          />
          <directionalLight position={[-W_M, H_M * 0.5, -H_M]} intensity={0.7} color="#a8c8ff" />
          <directionalLight position={[W_M * 0.5, -H_M, -H_M * 0.5]} intensity={0.3} />

          <Iglo5FixedAssembly
            widthMm={width}
            heightMm={height}
            colorExt={colorExt}
            colorInt={colorInt}
            sealColor={SEAL_COLORS[sealIdx].value}
          />

          <OrbitControls
            ref={controlsRef}
            enableDamping
            dampingFactor={0.05}
            autoRotate
            autoRotateSpeed={0.45}
            onStart={() => controlsRef.current && (controlsRef.current.autoRotate = false)}
          />
        </Canvas>

        {/* Top-left badge */}
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(255,255,255,0.85)', border: '1px solid rgba(0,0,0,0.1)', color: '#5a3800', backdropFilter: 'blur(12px)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: gold }} />
          IGLO 5 · F1T0 · Okno stałe
        </div>

        {/* Profile tag */}
        <div className="absolute top-4 right-4 flex flex-col gap-1.5 px-3 py-2.5 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(16px)' }}>
          {([
            ['Frame',        '50003 · Rama 75mm'],
            ['Glazing Bead', '50110 · Listwa H'],
            ['Glass',        'szyba 24mm (DGU)'],
          ] as const).map(([role, name]) => (
            <div key={role} className="flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-wider w-16" style={{ color: '#b07000' }}>{role}</span>
              <span className="text-[10px]" style={{ color: 'rgba(0,0,0,0.5)' }}>{name}</span>
            </div>
          ))}
        </div>

        {/* Bottom-left: fixed window info */}
        <div className="absolute bottom-4 left-4 flex flex-col gap-1 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(12px)', fontSize: 10, color: 'rgba(0,0,0,0.4)' }}>
          <div className="font-bold uppercase tracking-wider mb-0.5" style={{ color: '#222', fontSize: 10 }}>
            Fixed Window · No Opening
          </div>
          <div>Frame: 70mm depth · 75mm face</div>
          <div>Glazing: 24mm direct-set DGU</div>
        </div>

        {/* Dimension */}
        <div className="absolute bottom-4 right-4 font-mono text-[11px] px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)', color: 'rgba(0,0,0,0.4)' }}>
          {width} × {height} mm
        </div>
      </div>

      {/* ── Control Panel ──────────────────────────────────────────────── */}
      <div
        className="flex flex-col gap-4 p-5 shrink-0 overflow-y-auto"
        style={{
          width: 240,
          background: 'rgba(6,6,16,0.97)',
          borderLeft: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: gold }}>
            IGLO 5 · Fixed Frame
          </div>
          <div className="text-[22px] font-bold text-white mt-0.5 tracking-tight">F1T0</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Okno stałe (fixed light)</div>
          <div className="text-[10px] mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>PVC · 75mm system</div>
        </div>

        {divider}

        {/* Dimensions */}
        <div>
          <Label text="Dimensions" />
          {[
            { lbl: 'Width',  val: width,  min: 300, max: 3000, set: setWidth  },
            { lbl: 'Height', val: height, min: 300, max: 3000, set: setHeight },
          ].map(({ lbl, val, min, max, set }) => (
            <div key={lbl} className="mb-3">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <span>{lbl}</span>
                <span style={{ color: gold, fontWeight: 700 }}>{val} mm</span>
              </div>
              <input type="range" min={min} max={max} step={10} value={val}
                onChange={e => set(Number(e.target.value))}
                className="w-full cursor-pointer" style={{ accentColor: gold }} />
            </div>
          ))}
        </div>

        {divider}

        {/* Exterior colour */}
        <div>
          <Label text="Exterior Colour" />
          <div className="flex flex-col gap-1">
            {EXT_COLORS.map((c, i) => (
              <button key={c.id} onClick={() => setExtIdx(i)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left cursor-pointer transition-all"
                style={{
                  background: extIdx === i ? 'rgba(234,182,118,0.10)' : 'transparent',
                  border: `1px solid ${extIdx === i ? 'rgba(234,182,118,0.38)' : 'rgba(255,255,255,0.05)'}`,
                }}>
                <div className="w-4 h-4 rounded-full shrink-0"
                  style={{ background: c.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {divider}

        {/* Bi-colour */}
        <div>
          <button onClick={() => setBiColor(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all"
            style={{
              background: biColor ? 'rgba(234,182,118,0.10)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${biColor ? 'rgba(234,182,118,0.38)' : 'rgba(255,255,255,0.06)'}`,
            }}>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>Bi-Colour Interior</span>
            <div className="w-8 h-4 rounded-full relative" style={{ background: biColor ? gold : 'rgba(255,255,255,0.15)' }}>
              <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all"
                style={{ left: biColor ? '18px' : '2px' }} />
            </div>
          </button>
          {biColor && (
            <div className="flex flex-col gap-1 mt-2">
              <Label text="Interior Colour" />
              {INT_COLORS.map((c, i) => (
                <button key={c.id} onClick={() => setIntIdx(i)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left cursor-pointer transition-all"
                  style={{
                    background: intIdx === i ? 'rgba(234,182,118,0.10)' : 'transparent',
                    border: `1px solid ${intIdx === i ? 'rgba(234,182,118,0.38)' : 'rgba(255,255,255,0.05)'}`,
                  }}>
                  <div className="w-4 h-4 rounded-full shrink-0"
                    style={{ background: c.hex, border: '1px solid rgba(255,255,255,0.2)' }} />
                  <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.65)' }}>{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {divider}

        {/* Seal */}
        <div>
          <Label text="Seal Colour" />
          <div className="flex gap-2">
            {SEAL_COLORS.map((s, i) => (
              <button key={s.label} title={s.label} onClick={() => setSealIdx(i)}
                className="w-8 h-8 rounded-full cursor-pointer transition-all"
                style={{
                  background: s.value,
                  border: sealIdx === i ? `2px solid ${gold}` : '2px solid rgba(255,255,255,0.15)',
                  boxShadow: sealIdx === i ? `0 0 0 1px rgba(234,182,118,0.35)` : 'none',
                }} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="text-[9px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.18)' }}>
            Geometry: seed/data/profiles/<br />
            50003 · 50110 · szyba 24mm<br />
            Auto-rotates · drag to orbit
          </div>
        </div>
      </div>
    </div>
  );
};

export default Iglo5FixedViewer;
