/**
 * F1XXTViewer.tsx
 * Parametric 3D viewer for the IGLO 5 F1XXT fixed window profile.
 * Geometry sourced directly from IGLO5_FIX.step via the STEP extractor.
 * 
 * Assembly:  outer fixed frame (FRM_EXT + FRM_INT + GSK_EXT) wraps a sash
 *            (BZD glazing bead + GSK_BZD bead gasket) around a double-glazed
 *            unit (GLS_EXT + SPACER + GLS_INT).
 *
 * For a 1000×1000mm fixed window all four sides are identical mitre-cut extrusions.
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import profileDataRaw from '../../data/profiles/IGLO5/IG5_F1XXT.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}

const pd = profileDataRaw as unknown as ProfileData;
const MM = 0.001; // mm → meters

// ─── Assembly Component ───────────────────────────────────────────────────────

interface AssemblyProps {
  widthMm: number;
  heightMm: number;
  colorExt: string;
  colorInt: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
}

function F1XXTAssembly({
  widthMm, heightMm,
  colorExt, colorInt,
  colorExtTexture, colorIntTexture,
  colorGsk = '#1c1c1c',
  colorSpacer = '#4B4B4D',
}: AssemblyProps) {
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  // Helper: get contour points for a layer
  const getContours = (layerName: string): Point[][] => {
    const layer = pd.layers[layerName];
    if (!layer) return [];
    return layer.contours.map(c => c.points);
  };

  // Profile layer contours
  const frmExt  = useMemo(() => getContours('FRM_EXT'),  []);
  const frmInt  = useMemo(() => getContours('FRM_INT'),  []);
  const bzd     = useMemo(() => getContours('BZD'),      []);
  const gskBzd  = useMemo(() => getContours('GSK_BZD'),  []);
  const gskExt  = useMemo(() => getContours('GSK_EXT'),  []);
  const spacer  = useMemo(() => getContours('SPACER'),   []);
  const glsExt  = useMemo(() => getContours('GLS_EXT'),  []);
  const glsInt  = useMemo(() => getContours('GLS_INT'),  []);

  // Shared origin: bottom-left corner of the entire cross-section
  const commonOrigin = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    const all = [frmExt, frmInt, bzd, gskBzd, gskExt, spacer, glsExt, glsInt];
    for (const layer of all) {
      for (const c of layer) {
        for (const v of c) {
          if (v.x < minX) minX = v.x;
          if (v.y < minY) minY = v.y;
        }
      }
    }
    return { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY };
  }, []);

  // Glass material (shared)
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#c8dff0',
    roughness: 0.0,
    metalness: 0.0,
    transmission: 1.0,
    ior: 1.52,
    thickness: 0.024,
    transparent: true,
    opacity: 0.55,
    side: THREE.FrontSide,
  }), []);

  // ── Glass pane (box spanning glazing unit area) ────────────────────────────
  const renderGlassPane = (widthMm: number, heightMm: number) => {
    if (glsExt.length === 0 || glsInt.length === 0) return null;
    const ptsE = glsExt[0];
    const ptsI = glsInt[0];
    let minY = Infinity, maxY = -Infinity;
    for (const p of ptsE) { if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
    const glassInset = (minY - commonOrigin.y) * scale;
    const paneW = widthMm * scale - 2 * glassInset;
    const paneH = heightMm * scale - 2 * glassInset;

    // Depth: from GLS_EXT inner x to GLS_INT outer x
    let glsExtMinX = Infinity, glsIntMaxX = -Infinity;
    for (const p of ptsE) if (p.x < glsExtMinX) glsExtMinX = p.x;
    for (const p of ptsI) if (p.x > glsIntMaxX) glsIntMaxX = p.x;
    const thickness = (glsIntMaxX - glsExtMinX) * scale;
    const centerZ = -((glsExtMinX + glsIntMaxX) / 2 - commonOrigin.x) * scale;

    return (
      <mesh
        position={[widthMm * scale / 2, heightMm * scale / 2, centerZ]}
        material={glassMat}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  // ── Render one side of the fixed frame (4 copies, rotated) ────────────────
  const renderFrameSide = (len: number, uSign: number, uOff: number) => (<>
    {frmExt.map((c, i) => (
      <FrameSegment key={`frmExt_${i}`} layerName="FRM_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {frmInt.map((c, i) => (
      <FrameSegment key={`frmInt_${i}`} layerName="FRM_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {gskExt.map((c, i) => (
      <FrameSegment key={`gskExt_${i}`} layerName="GSK_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {bzd.map((c, i) => (
      <FrameSegment key={`bzd_${i}`} layerName="BZD" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        uvMode="rail"
      />
    ))}
    {gskBzd.map((c, i) => (
      <FrameSegment key={`gskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {spacer.map((c, i) => (
      <FrameSegment key={`spacer_${i}`} layerName="SPACER" scaleFactor={scale}
        length={len} vertices={c} matType="spacer"
        color={colorSpacer}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
  </>);

  // ── Four sides: bottom, right, top, left ──────────────────────────────────
  // The STEP profile is extruded along Y in 3D; we rotate to lay it along each edge.
  // In the viewer coordinate system:
  //   Profile X maps to scene Z (depth into wall)
  //   Profile Y maps to scene X (width across window edge)
  //   Extrusion direction = scene Y (up, along the frame rail)
  //
  // FrameSegment extrudes along local Z. We rotate groups so the extrusion
  // runs along each window edge.
  //
  // Bottom:  extrude right (+X), no Z rotation
  // Right:   extrude up (+Y), rotate CCW 90° around Z
  // Top:     extrude left (-X), rotate 180° around Z
  // Left:    extrude down (-Y), rotate CW 90° around Z

  return (
    <group>
      {/* Bottom rail — extrudes along +X from (0,0) */}
      <group rotation={[0, 0, 0]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderFrameSide(widthMm, 1, 0)}
        </group>
      </group>

      {/* Right stile — extrudes along +Y from (W, 0) */}
      <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderFrameSide(heightMm, -1, W)}
        </group>
      </group>

      {/* Top rail — extrudes along -X from (W, H) */}
      <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderFrameSide(widthMm, 1, W - H)}
        </group>
      </group>

      {/* Left stile — extrudes along -Y from (0, H) */}
      <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderFrameSide(heightMm, -1, W - H)}
        </group>
      </group>

      {/* Glass pane */}
      {renderGlassPane(widthMm, heightMm)}
    </group>
  );
}

// ─── Loading overlay ──────────────────────────────────────────────────────────

function LoadingOverlay() {
  const { active, progress } = useProgress();
  if (!active) return null;
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 text-[#eab676]">
        <Loader2 className="w-10 h-10 animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase">
          {progress.toFixed(0)}%
        </span>
      </div>
    </Html>
  );
}

// ─── Public Props ─────────────────────────────────────────────────────────────

export interface F1XXTViewerProps {
  width?: number;
  height?: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
  onSceneReady?: (group: THREE.Group) => void;
  onDimensionChange?: (width: number, height: number) => void;
  activeLimits?: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
  hidePill?: boolean;
  isColorPaletteOpen?: boolean;
}

// ─── Main Exported Component ──────────────────────────────────────────────────

export const F1XXTViewer: React.FC<F1XXTViewerProps> = ({
  width = 1000,
  height = 1000,
  colorExt = '#e8e0d4',
  colorInt = '#f0ece6',
  colorExtTexture,
  colorIntTexture,
  colorGsk = '#1c1c1c',
  colorSpacer = '#4B4B4D',
  onSceneReady,
  onDimensionChange,
  activeLimits,
  hidePill = false,
  isColorPaletteOpen = false,
}) => {
  const [widthText,  setWidthText]  = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());
  const [mountHeavy, setMountHeavy] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const minW = activeLimits?.minWidth  || 500;
  const maxW = activeLimits?.maxWidth  || 3000;
  const minH = activeLimits?.minHeight || 500;
  const maxH = activeLimits?.maxHeight || 3000;

  // Delay heavy canvas mount to allow React to paint the shell first
  useEffect(() => {
    setMountHeavy(false);
    const t = setTimeout(() => setMountHeavy(true), 80);
    return () => clearTimeout(t);
  }, [width, height]);

  useEffect(() => {
    setWidthText(width.toString());
    setHeightText(height.toString());
  }, [width, height]);

  // Prevent OrbitControls from stealing pointer events on the pill
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    const evts = ['pointerdown', 'mousedown', 'touchstart', 'click'];
    evts.forEach(ev => el.addEventListener(ev, stop, { capture: true }));
    return () => evts.forEach(ev => el.removeEventListener(ev, stop, { capture: true }));
  }, []);

  // Camera / orbit setup
  const W_M = width  * MM;
  const H_M = height * MM;
  const maxDim = Math.max(W_M, H_M);
  const frameDepthMm = 70; // FRM_EXT profile depth
  const targetX = W_M / 2;
  const targetY = H_M / 2;
  const targetZ = -(frameDepthMm * MM) / 2;
  const radius  = maxDim * 2.2;
  const angle   = 0;
  const camPos: [number, number, number] = [
    targetX + radius * Math.sin(angle),
    targetY,
    -radius * Math.cos(angle),
  ];

  return (
    <div className="absolute inset-0" style={{ background: '#dde4ed' }}>
      <Canvas
        onDoubleClick={e => { e.stopPropagation(); controlsRef.current?.reset(); }}
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: camPos, fov: 30 }}
      >
        <AdaptiveCamera
          maxDim={maxDim}
          targetX={targetX}
          targetY={targetY}
          targetZ={targetZ}
          angle={angle}
          defaultRadiusMult={2.2}
          fov={30}
          zSign={-1}
          controlsRef={controlsRef}
        />

        <color attach="background" args={['#dde4ed']} />
        <fog attach="fog" args={['#ffffff', maxDim * 12, maxDim * 35]} />

        {/* Lighting */}
        <ambientLight intensity={0.40} />
        <directionalLight
          position={[W_M * 2.5, H_M * 3, -H_M * 2]}
          intensity={2.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0004}
          color="#fff6e8"
        />
        <directionalLight position={[-W_M, H_M * 0.5, -H_M]} intensity={0.7} color="#a8c8ff" />
        <directionalLight position={[W_M * 0.5, -H_M, -H_M * 0.5]} intensity={0.2} color="#ffe0a0" />
        <pointLight position={[W_M * 0.5, H_M * 0.5, -H_M * 1.5]} intensity={0.35} />

        <Suspense fallback={<LoadingOverlay />}>
          <Environment files="/assets/hdri/monochrome_studio_02_1k.exr" />
        </Suspense>

        {mountHeavy && (
          <Suspense fallback={null}>
            <F1XXTAssembly
              widthMm={width}
              heightMm={height}
              colorExt={colorExt}
              colorInt={colorInt}
              colorExtTexture={colorExtTexture}
              colorIntTexture={colorIntTexture}
              colorGsk={colorGsk}
              colorSpacer={colorSpacer}
            />
          </Suspense>
        )}

        <ContactShadows
          position={[W_M / 2, -0.005, targetZ]}
          opacity={0.12}
          scale={maxDim * 5}
          blur={2.5}
          far={maxDim * 2}
        />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enablePan
          enableZoom
          target={[targetX, targetY, targetZ]}
          minDistance={maxDim * 0.4}
          maxDistance={maxDim * 6}
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>

      {/* Profile badge */}
      <div
        className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none"
        style={{
          background: 'rgba(8,8,22,0.78)',
          border: '1px solid rgba(234,182,118,0.22)',
          color: '#eab676',
          backdropFilter: 'blur(10px)',
        }}
      >
        IGLO 5 · F1XXT
      </div>

      {/* Fixed window badge */}
      <div
        className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none"
        style={{
          background: 'rgba(8,8,22,0.55)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        Fixed Window
      </div>

      {/* Dimension pill */}
      {!hidePill && (
        <div
          ref={pillRef}
          className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-auto"
          style={{
            background: 'rgba(8,8,22,0.65)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {onDimensionChange ? (
            <>
              <input
                type="number"
                value={widthText}
                onChange={e => {
                  setWidthText(e.target.value);
                  const n = Number(e.target.value);
                  if (!isNaN(n) && n >= minW && n <= maxW) onDimensionChange(n, height);
                }}
                onBlur={e => {
                  let v = Math.max(minW, Math.min(maxW, Number(e.target.value) || minW));
                  onDimensionChange(v, height);
                  setWidthText(v.toString());
                }}
                onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') e.currentTarget.blur(); }}
                onKeyUp={e => e.stopPropagation()}
                className="w-12 bg-transparent text-[#eab676] text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
                style={{ border: 'none', padding: 0 }}
              />
              <span className="text-[#eab676]/60 text-xs font-black select-none">×</span>
              <input
                type="number"
                value={heightText}
                onChange={e => {
                  setHeightText(e.target.value);
                  const n = Number(e.target.value);
                  if (!isNaN(n) && n >= minH && n <= maxH) onDimensionChange(width, n);
                }}
                onBlur={e => {
                  let v = Math.max(minH, Math.min(maxH, Number(e.target.value) || minH));
                  onDimensionChange(width, v);
                  setHeightText(v.toString());
                }}
                onKeyDown={e => { e.stopPropagation(); if (e.key === 'Enter') e.currentTarget.blur(); }}
                onKeyUp={e => e.stopPropagation()}
                className="w-12 bg-transparent text-[#eab676] text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
                style={{ border: 'none', padding: 0 }}
              />
              <span className="text-[#eab676] text-[10px] font-black ml-0.5 select-none">mm</span>
            </>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 800, color: '#eab676' }}>
              {width} × {height} mm
            </span>
          )}
        </div>
      )}
    </div>
  );
};
