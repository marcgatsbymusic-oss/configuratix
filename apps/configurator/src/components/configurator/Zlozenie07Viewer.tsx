import React, { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';

import zlozenieData from '../../data/profiles/IGLO5/zlozenie_07_shapes.json';

import { transformLoop } from '../../../engine/assemble.ts';
import type { Loop } from '../../../engine/assemble.ts';

// ── Helpers ──────────────────────────────────────────────────────────────

function normalizeContours(contours: any[]): Loop[] {
  return (contours || []).map((c: any) => ({
    closed: true,
    pts: (c.points || []).map((p: any) => ({ x: p.x ?? 0, y: p.y ?? 0 })),
  }));
}

// ── Props ─────────────────────────────────────────────────────────────────

export interface Zlozenie07ViewerProps {
  widthMm?:   number;
  heightMm?:  number;
  colorExt?:  string;
  colorInt?:  string;
  sealColor?: string;
  spacerColor?: string;
}

// ── Assembly (inner 3D group) ─────────────────────────────────────────────

const Zlozenie07Assembly: React.FC<Zlozenie07ViewerProps> = ({
  widthMm   = 1200,
  heightMm  = 1000,
  colorExt  = '#f2f0ec',
  colorInt  = '#f2f0ec',
  sealColor = '#1a1a1a',
  spacerColor = '#4B4B4D',
}) => {
  const scale = 0.001;

  const W = widthMm  * scale;
  const H = heightMm * scale;

  const FRAME_FACE_MM  = 66; 
  const FRAME_DEPTH_MM = 70; 

  const FRAME_ELEVATION_FACE = 44; 

  // ── Normalized loops ───────────────────────────────────────────────────
  const frmExtLoops  = useMemo(() => normalizeContours(zlozenieData.layers.FRM_EXT?.contours || []), []);
  const frmIntLoops  = useMemo(() => normalizeContours(zlozenieData.layers.FRM_INT?.contours || []), []);
  const frmGskLoops  = useMemo(() => normalizeContours(zlozenieData.layers.GSK_FRM_EXT?.contours || []), []);
  const bzdLoops     = useMemo(() => normalizeContours(zlozenieData.layers.BZD?.contours || []), []);
  const bzdGskLoops  = useMemo(() => normalizeContours(zlozenieData.layers.GSK_BZD?.contours || []), []);
  const spacLoops    = useMemo(() => normalizeContours(zlozenieData.layers.SPACER?.contours || []), []);

  // ── Materials ──────────────────────────────────────────────────────────
  const extMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: colorExt, roughness: 0.36, metalness: 0.06 }), [colorExt]);
  const intMat  = useMemo(() => new THREE.MeshStandardMaterial({ color: colorInt, roughness: 0.36, metalness: 0.06 }), [colorInt]);
  const sealMat = useMemo(() => new THREE.MeshStandardMaterial({ color: sealColor, roughness: 0.9, metalness: 0 }),    [sealColor]);
  const spacMat = useMemo(() => new THREE.MeshStandardMaterial({ color: spacerColor, roughness: 0.6, metalness: 0.5 }), [spacerColor]);
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
        loops={frmExtLoops} material={extMat} origin={origin} uSign={uSign} uOffset={uOff} />
      <FrameSegment layerName="FRM_INT" scaleFactor={scale} length={lenMm}
        loops={frmIntLoops} material={intMat} origin={origin} uSign={uSign} uOffset={uOff} />
      <FrameSegment layerName="GSK_FRM_EXT" scaleFactor={scale} length={lenMm}
        loops={frmGskLoops} material={sealMat} origin={origin} uSign={uSign} uOffset={uOff} />
      <FrameSegment layerName="BZD" scaleFactor={scale} length={lenMm}
        loops={bzdLoops} material={intMat} origin={origin} uSign={uSign} uOffset={uOff} uvMode="rail" />
      <FrameSegment layerName="GSK_BZD" scaleFactor={scale} length={lenMm}
        loops={bzdGskLoops} material={sealMat} origin={origin} uSign={uSign} uOffset={uOff} uvMode="rail" />
      <FrameSegment layerName="SPACER" scaleFactor={scale} length={lenMm}
        loops={spacLoops} material={spacMat} origin={origin} uSign={uSign} uOffset={uOff} uvMode="rail" />
    </>
  );

  const glassInset   = FRAME_ELEVATION_FACE * scale;
  const paneW        = W - 2 * glassInset;
  const paneH        = H - 2 * glassInset;
  const glassThick   = 24 * scale;
  const glassCenterZ = -45 * scale;

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
];

const INT_COLORS = [
  { label: 'White',       hex: '#f2f0ec', id: 'white'   },
  { label: 'Anthracite',  hex: '#383e42', id: 'anth'    },
];

const SEAL_COLORS = [
  { label: 'Black', value: '#1a1a1a' },
];

const SPACER_COLORS = [
  { label: 'Steel', hex: '#b0b5b9', id: 'S' },
  { label: 'Ultimate white (RAL 9016)', hex: '#f4f8f4', id: 'BI' },
  { label: 'Ultimate light grey (RAL 7035)', hex: '#c5c7c4', id: 'JS' },
  { label: 'Ultimate grey (RAL 9023)', hex: '#797b7a', id: 'U' },
  { label: 'Ultimate black (RAL 9005)', hex: '#0a0a0a', id: 'UC' },
  { label: 'Ultimate light brown (RAL 8003)', hex: '#8a5a44', id: 'JB' },
  { label: 'Ultimate brown', hex: '#59351f', id: 'X' },
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

export const Zlozenie07Viewer: React.FC = () => {
  const [width,   setWidth]   = useState(1200);
  const [height,  setHeight]  = useState(1000);
  const [extIdx,  setExtIdx]  = useState(0);
  const [intIdx,  setIntIdx]  = useState(0);
  const [biColor, setBiColor] = useState(false);
  const [sealIdx, setSealIdx] = useState(0);
  const [spacerIdx, setSpacerIdx] = useState(0);
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

          <Zlozenie07Assembly
            widthMm={width}
            heightMm={height}
            colorExt={colorExt}
            colorInt={colorInt}
            sealColor={SEAL_COLORS[sealIdx].value}
            spacerColor={SPACER_COLORS[spacerIdx].hex}
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
          Złożenie 07
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
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: gold }}>
            IGLO 5
          </div>
          <div className="text-[22px] font-bold text-white mt-0.5 tracking-tight">Złożenie 07</div>
          <div className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>No steel frame</div>
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

        {/* Colors */}
        <div>
          <Label text="Colors" />
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-white/70">Exterior</span>
              <span className="text-[10px] font-bold" style={{ color: gold }}>{EXT_COLORS[extIdx].label}</span>
            </div>
            <div className="flex gap-2">
              {EXT_COLORS.map((c, i) => (
                <div key={c.id} onClick={() => setExtIdx(i)}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${i === extIdx ? 'scale-110 ring-2 ring-offset-2 ring-offset-[#060610]' : 'hover:scale-105'}`}
                  style={{ background: c.hex}} title={c.label} />
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 mb-3 cursor-pointer">
            <input type="checkbox" checked={biColor} onChange={e => setBiColor(e.target.checked)} className="accent-[#eab676]" />
            <span className="text-[11px] text-white/70">Bi-Color (Different Interior)</span>
          </label>

          {biColor && (
            <div className="mb-4 pl-4 border-l border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[11px] text-white/70">Interior</span>
                <span className="text-[10px] font-bold" style={{ color: gold }}>{INT_COLORS[intIdx].label}</span>
              </div>
              <div className="flex gap-2">
                {INT_COLORS.map((c, i) => (
                  <div key={c.id} onClick={() => setIntIdx(i)}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${i === intIdx ? 'scale-110 ring-2 ring-offset-2 ring-offset-[#060610]' : 'hover:scale-105'}`}
                    style={{ background: c.hex}} title={c.label} />
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-white/70">Gaskets</span>
              <span className="text-[10px] font-bold" style={{ color: gold }}>{SEAL_COLORS[sealIdx].label}</span>
            </div>
            <div className="flex gap-2">
              {SEAL_COLORS.map((c, i) => (
                <div key={i} onClick={() => setSealIdx(i)}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${i === sealIdx ? 'scale-110 ring-2 ring-offset-2 ring-offset-[#060610]' : 'hover:scale-105'}`}
                  style={{ background: c.value}} title={c.label} />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-white/70">Spacer</span>
              <span className="text-[10px] font-bold" style={{ color: gold }}>{SPACER_COLORS[spacerIdx].label}</span>
            </div>
            <div className="flex gap-2">
              {SPACER_COLORS.map((c, i) => (
                <div key={c.id} onClick={() => setSpacerIdx(i)}
                  className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${i === spacerIdx ? 'scale-110 ring-2 ring-offset-2 ring-offset-[#060610]' : 'hover:scale-105'}`}
                  style={{ background: c.hex}} title={c.label} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Zlozenie07Viewer;
