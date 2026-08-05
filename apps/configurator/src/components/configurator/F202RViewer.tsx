/**
 * F202RViewer.tsx
 * Frame-Only Window Viewer (Iglo Edge series)
 * Built using IGE_F104.json:
 * - Renders only the outer Frame (FRM) with its external EPDM gaskets (GSK_FRM_EXT)
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import f104DataRaw from '../../data/profiles/IgloEdge/IGE_F104.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}

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
  onSceneReady?: (group: THREE.Group) => void;
}

function F202RAssembly({
  widthMm, heightMm,
  colorExt, colorInt,
  colorExtTexture, colorIntTexture,
  colorGsk = '#1c1c1c',
  onSceneReady,
}: AssemblyProps) {
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  const f104Data = f104DataRaw as unknown as ProfileData;

  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const reportedKey = useRef<string>('');

  useEffect(() => {
    if (groupObj) {
      (window as any).assemblyGroup = groupObj;
      if (onSceneReady) {
        onSceneReady(groupObj);
      }
    }
  }, [groupObj, onSceneReady, widthMm, heightMm, colorExt, colorInt, colorExtTexture, colorIntTexture, colorGsk]);

  // Helper: get contour points for a layer from profile dataset
  const getContours = (data: ProfileData, layerName: string): Point[][] => {
    const layer = data.layers[layerName];
    if (!layer) return [];
    return layer.contours.map(c => c.points);
  };

  // 1. Frame Profiles
  const frmExt    = useMemo(() => getContours(f104Data, 'FRM_EXT'),     []);
  const frmInt    = useMemo(() => getContours(f104Data, 'FRM_INT'),     []);
  const gskFrmExt = useMemo(() => getContours(f104Data, 'GSK_FRM_EXT'), []);

  const commonOrigin = { x: 0, y: 0 };

  // Render static outer frame segments (Sourced from F104)
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
    {gskFrmExt.map((c, i) => (
      <FrameSegment key={`gskFE_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
  </>);

  useFrame(() => {
    if (groupObj && onSceneReady) {
      const currentKey = `${groupObj.children.length}_${widthMm}_${heightMm}_${colorExt}_${colorInt}_${colorExtTexture}_${colorIntTexture}_${colorGsk}`;
      if (reportedKey.current !== currentKey) {
        reportedKey.current = currentKey;
        onSceneReady(groupObj);
      }
    }
  });

  return (
    <group ref={setGroupObj}>
      {/* ── Outer Frame (Sourced from F104) ── */}
      <group>
        <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(widthMm, 1, 0)}</group></group>
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(heightMm, -1, W)}</group></group>
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(widthMm, 1, W - H)}</group></group>
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(heightMm, -1, W - H)}</group></group>
      </group>
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

export interface F202RViewerProps {
  width?: number;
  height?: number;
  splitRatio?: number;
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
  hasRollerShutter?: boolean;
  showBlindBox?: boolean;
  onShowBlindBoxChange?: (show: boolean) => void;
  blindOpen?: number;
  onBlindOpenChange?: (open: number) => void;
}

// ─── Main Exported Component ──────────────────────────────────────────────────

export const F202RViewer: React.FC<F202RViewerProps> = ({
  width = 1200,
  height = 2000,
  colorExt = '#e8e0d4',
  colorInt = '#f0ece6',
  colorExtTexture,
  colorIntTexture,
  colorGsk = '#1c1c1c',
  onSceneReady,
  hidePill = false,
}) => {
  const [mountHeavy, setMountHeavy] = useState(false);

  const controlsRef = useRef<any>(null);

  useEffect(() => {
    setMountHeavy(false);
    const t = setTimeout(() => setMountHeavy(true), 80);
    return () => clearTimeout(t);
  }, [width, height]);

  // Camera / orbit setup
  const W_M = width  * MM;
  const H_M = height * MM;
  const maxDim = Math.max(W_M, H_M);
  const frameDepthMm = 82.0; 
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
        <directionalLight
          position={[-W_M, H_M * 0.5, -H_M]}
          intensity={0.7}
          color="#a8c8ff"
        />
        <directionalLight
          position={[W_M * 0.5, -H_M, -H_M * 0.5]}
          intensity={0.2}
          color="#ffe0a0"
        />

        <Suspense fallback={<LoadingOverlay />}>
          <Environment files="/assets/hdri/monochrome_studio_02_1k.exr" />
        </Suspense>

        {mountHeavy && (
          <Suspense fallback={null}>
            <F202RAssembly
              widthMm={width}
              heightMm={height}
              colorExt={colorExt}
              colorInt={colorInt}
              colorExtTexture={colorExtTexture}
              colorIntTexture={colorIntTexture}
              colorGsk={colorGsk}
              onSceneReady={onSceneReady}
            />
          </Suspense>
        )}

        <ContactShadows
          position={[targetX, -0.005, targetZ]}
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
          autoRotate={false}
        />
      </Canvas>

      {/* Floating Badge (Bi-Color / System name) */}
      {!hidePill && (
        <div 
          className="absolute top-4 right-4 z-10 p-3 rounded-2xl flex flex-col gap-1.5 select-none"
          style={{
            background: 'rgba(8, 8, 22, 0.75)',
            border: '1px solid rgba(234, 182, 118, 0.22)',
            backdropFilter: 'blur(16px)',
            width: 220
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-widest text-[#eab676] uppercase">
              IGE F202R
            </span>
            <div className="flex gap-1">
              <div 
                className="w-3.5 h-3.5 rounded-full border border-white/25" 
                style={{ background: colorExt }} 
                title="Exterior"
              />
              <div 
                className="w-3.5 h-3.5 rounded-full border border-white/25" 
                style={{ background: colorInt }} 
                title="Interior"
              />
            </div>
          </div>
          
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

          <div className="flex justify-between items-center text-[11px] text-white/70">
            <span>{width} × {height} mm</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-white">
              Frame-Only
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
