/**
 * F1XXXViewer.tsx
 * Parametric 3D viewer for the IGLO 5 F1XXX Sash and Frame Window profile.
 * Geometry sourced from 2_IGLO 5 FRAME_AND_ SASH_FUSION PROCESSED.dxf.
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html, useGLTF } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import profileDataRaw from '../../data/profiles/IGLO5/IG5_F1XXX_1FRM_1SSH.json';

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

export type WindowState = 'closed' | 'open_side' | 'open_tilt';

// ─── Assembly Component ───────────────────────────────────────────────────────

const getHandleHeight = (hMm: number): number => {
  if (hMm > 1800) return 1050;
  if (hMm >= 380 && hMm <= 550) return 170;
  if (hMm > 550 && hMm <= 800) return 260;
  if (hMm > 800 && hMm <= 1200) return 410;
  if (hMm > 1200 && hMm <= 1600) return 560;
  if (hMm > 1600 && hMm <= 1800) return 710;
  return hMm / 2;
};

interface AssemblyProps {
  widthMm: number;
  heightMm: number;
  colorExt: string;
  colorInt: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
  windowState: WindowState;
  isAuto: React.MutableRefObject<boolean>;
  onUserInteraction: (state: WindowState) => void;
  onSceneReady?: (group: THREE.Group) => void;
  isColorPaletteOpen?: boolean;
}

function F1XXXAssembly({
  widthMm, heightMm,
  colorExt, colorInt,
  colorExtTexture, colorIntTexture,
  colorGsk = '#1c1c1c',
  colorSpacer = '#4B4B4D',
  windowState,
  isAuto,
  onUserInteraction,
  onSceneReady,
  isColorPaletteOpen = false,
}: AssemblyProps) {
  const sashPivotRef = useRef<THREE.Group>(null!);
  const handleGroupRef = useRef<THREE.Group>(null!);
  const { clock } = useThree();
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;
  const handleHeightMm = getHandleHeight(heightMm);
  const handleY = handleHeightMm * scale;

  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const reportedKey = useRef<string>('');

  useEffect(() => {
    if (groupObj && onSceneReady) {
      onSceneReady(groupObj);
    }
  }, [groupObj, onSceneReady, widthMm, heightMm, colorExt, colorInt, colorExtTexture, colorIntTexture, colorGsk, colorSpacer]);

  // Load handle model
  const { scene: handleScene } = useGLTF('/testhandle.glb');
  const clonedHandle = useMemo(() => {
    const clone = handleScene.clone(true);
    clone.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color.set(colorIntTexture ? '#f0f0f0' : (colorInt || '#f0ece6'));
        child.material.roughness = 0.3;
        child.material.metalness = 0.8;
      }
    });
    return clone;
  }, [handleScene, colorInt, colorIntTexture]);

  // Helper: get contour points for a layer
  const getContours = (layerName: string): Point[][] => {
    const layer = pd.layers[layerName];
    if (!layer) return [];
    return layer.contours.map(c => c.points);
  };

  // Profile layer contours
  const frmExt    = useMemo(() => getContours('FRM_EXT'),     []);
  const frmInt    = useMemo(() => getContours('FRM_INT'),     []);
  const gskFrmExt = useMemo(() => getContours('GSK_FRM_EXT'), []);
  const gskSshExt = useMemo(() => getContours('GSK_SSH_EXT'), []);
  const sshExt    = useMemo(() => getContours('SSH_EXT'),     []);
  const sshInt    = useMemo(() => getContours('SSH_INT'),     []);
  const gskSshInt = useMemo(() => getContours('GSK_SSH_INT'), []);
  const bzd       = useMemo(() => getContours('BZD'),         []);
  const gskBzd    = useMemo(() => getContours('GSK_BZD'),     []);
  const spacer    = useMemo(() => getContours('SPACER'),      []);
  const glsExt    = useMemo(() => getContours('GLS_EXT'),     []);
  const glsInt    = useMemo(() => getContours('GLS_INT'),     []);

  // Shared origin: bottom-left corner of the entire cross-section
  const commonOrigin = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    const all = [frmExt, frmInt, gskFrmExt, gskSshExt, sshExt, sshInt, gskSshInt, bzd, gskBzd, spacer, glsExt, glsInt];
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
    color: '#ffffff',
    roughness: 0.1, // slightly rough to blur sharp reflections
    metalness: 0.0,
    transmission: 1.0,
    ior: 1.5,
    thickness: 0.01,
    transparent: true,
    opacity: 0.6,
    envMapIntensity: 0.3, // reduce environment reflection intensity on the glass
  }), []);

  // Glass pane rendering (similar to F100TViewer)
  const renderGlassPane = (sashWidthMm: number, sashHeightMm: number, glsLayer: Point[][]) => {
    if (glsLayer.length === 0) return null;
    const pts = glsLayer[0];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const offset = minY - commonOrigin.y;
    const paneW = sashWidthMm * scale - 2 * offset * scale;
    const paneH = sashHeightMm * scale - 2 * offset * scale;
    const thickness = (maxX - minX) * scale;
    const centerDepth = -(((minX + maxX) / 2) - commonOrigin.x) * scale;

    return (
      <mesh position={[sashWidthMm * scale / 2, sashHeightMm * scale / 2, centerDepth]} material={glassMat} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  // Render static frame segments
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

  // Render moving sash segments (CHILD1)
  const renderSashSide = (len: number, uSign: number, uOff: number) => (<>
    {sshExt.map((c, i) => (
      <FrameSegment key={`sshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {sshInt.map((c, i) => (
      <FrameSegment key={`sshInt_${i}`} layerName="SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
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
    {gskSshInt.map((c, i) => (
      <FrameSegment key={`gskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale}
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
    {gskSshExt.map((c, i) => (
      <FrameSegment key={`gskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
  </>);

  // Hinge/pivot settings (sash outer boundaries start at 50mm, depth at 82.0mm)
  const pivotX = W - 50 * scale;
  const pivotY = 50 * scale;
  const pivotZ = -82.0 * scale;

  // Animation values
  const currentSide = useRef(0);
  const currentTilt = useRef(0);
  const currentHandle = useRef(0);
  const animStateRef = useRef({ startSide: 0, targetSide: 0, startTilt: 0, targetTilt: 0, startHandle: 0, targetHandle: 0, startTime: 0, duration: 1.2 });

  useEffect(() => {
    const s = animStateRef.current;
    s.startSide = currentSide.current;
    s.targetSide = windowState === 'open_side' ? -Math.PI / 4 : 0;
    s.startTilt = currentTilt.current;
    s.targetTilt = windowState === 'open_tilt' ? -Math.asin(150 / heightMm) : 0;
    s.startHandle = currentHandle.current;
    s.targetHandle = windowState === 'open_side' ? Math.PI / 2 : (windowState === 'open_tilt' ? Math.PI : 0);
    s.startTime = clock.getElapsedTime();
    s.duration = isAuto.current ? 10.0 : 1.2;
  }, [windowState, clock, isAuto]);

  useFrame((state) => {
    if (groupObj && onSceneReady) {
      const currentKey = `${groupObj.children.length}_${widthMm}_${heightMm}_${colorExt}_${colorInt}_${colorExtTexture}_${colorIntTexture}_${colorGsk}_${colorSpacer}`;
      if (reportedKey.current !== currentKey) {
        reportedKey.current = currentKey;
        onSceneReady(groupObj);
      }
    }

    if (!sashPivotRef.current) return;
    const s = animStateRef.current;
    const elapsed = state.clock.getElapsedTime() - s.startTime;
    let t = Math.min(elapsed / s.duration, 1.0);
    
    const isClosing = s.targetSide === 0 && s.targetTilt === 0;
    let t_sash = t;
    let t_handle = t;

    if (!isClosing) {
      t_handle = Math.min(t / 0.3, 1.0);
      t_sash = Math.max((t - 0.3) / 0.7, 0.0);
    } else {
      t_sash = Math.min(t / 0.7, 1.0);
      t_handle = Math.max((t - 0.7) / 0.3, 0.0);
    }

    const ease = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    t_sash = ease(t_sash);
    t_handle = ease(t_handle);

    currentSide.current = s.startSide + (s.targetSide - s.startSide) * t_sash;
    currentTilt.current = s.startTilt + (s.targetTilt - s.startTilt) * t_sash;
    currentHandle.current = s.startHandle + (s.targetHandle - s.startHandle) * t_handle;
    
    sashPivotRef.current.rotation.y = currentSide.current;
    sashPivotRef.current.rotation.x = currentTilt.current;

    if (handleGroupRef.current) {
      let handleObj = handleGroupRef.current.getObjectByName('Handle') || 
                      handleGroupRef.current.getObjectByName('handle') || 
                      handleGroupRef.current.getObjectByName('Pencere_Kulbu');
      
      if (!handleObj) {
        handleGroupRef.current.traverse((child: any) => {
          if (!handleObj && child.isMesh && !child.name.toLowerCase().includes('base')) {
            handleObj = child;
          }
        });
      }
      
      if (handleObj) {
        handleObj.rotation.z = currentHandle.current;
      }
    }
  });

  return (
    <group ref={setGroupObj}>
      {/* CHILD2: Frame */}
      <group>
        <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(widthMm, 1, 0)}</group></group>
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(heightMm, -1, W)}</group></group>
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(widthMm, 1, W - H)}</group></group>
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(heightMm, -1, W - H)}</group></group>
      </group>

      {/* CHILD1: Sash + Glass Pivot Group */}
      <group position={[pivotX, pivotY, pivotZ]} name="pivotGroup">
        <group ref={sashPivotRef} name="sashPivot">
          <group position={[-pivotX, -pivotY, -pivotZ]}>
            <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSide(widthMm, 1, 0)}</group></group>
            <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSide(heightMm, -1, W)}</group></group>
            <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSide(widthMm, 1, W - H)}</group></group>
            <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSide(heightMm, -1, W - H)}</group></group>
            
            {renderGlassPane(widthMm, heightMm, glsExt)}
            {renderGlassPane(widthMm, heightMm, glsInt)}

            {/* Click indicators to trigger state changes */}
            {!isColorPaletteOpen && (
              <>
                <Html position={[80 * scale, handleY, -89.0 * scale]} center>
                  <div
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                    onClick={(e) => { e.stopPropagation(); onUserInteraction(windowState === 'open_side' ? 'closed' : 'open_side'); }}
                  >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                    </div>
                  </div>
                </Html>

                <Html position={[80 * scale, H - 75 * scale, -89.0 * scale]} center>
                  <div
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                    onClick={(e) => { e.stopPropagation(); onUserInteraction(windowState === 'open_tilt' ? 'closed' : 'open_tilt'); }}
                  >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                    </div>
                  </div>
                </Html>
              </>
            )}

            {/* Handle Model */}
            <group 
              ref={handleGroupRef} 
              name="handleGroup"
              position={[80 * scale, handleY, -89.0 * scale]} 
              rotation={[0, 0, 0]}
              scale={[0.025, 0.025, 0.025]}
            >
              <primitive object={clonedHandle} />
            </group>
          </group>
        </group>
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

export interface F1XXXViewerProps {
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

export const F1XXXViewer: React.FC<F1XXXViewerProps> = ({
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
  const [windowState, setWindowState] = useState<WindowState>('closed');
  const isAutoRef = useRef(true);
  const lastActionTime = useRef(Date.now());
  const controlsRef = useRef<any>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const minW = activeLimits?.minWidth  || 500;
  const maxW = activeLimits?.maxWidth  || 3000;
  const minH = activeLimits?.minHeight || 500;
  const maxH = activeLimits?.maxHeight || 3000;

  useEffect(() => {
    setMountHeavy(false);
    const t = setTimeout(() => setMountHeavy(true), 80);
    return () => clearTimeout(t);
  }, [width, height]);

  useEffect(() => {
    setWidthText(width.toString());
    setHeightText(height.toString());
  }, [width, height]);

  // Prevent OrbitControls interaction on the pill
  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const stop = (e: Event) => e.stopPropagation();
    const evts = ['pointerdown', 'mousedown', 'touchstart', 'click'];
    evts.forEach(ev => el.addEventListener(ev, stop, { capture: true }));
    return () => evts.forEach(ev => el.removeEventListener(ev, stop, { capture: true }));
  }, []);

  // Idle timer to automatically open/tilt the sash
  useEffect(() => {
    const tick = setInterval(() => {
      if (!isAutoRef.current) return;
      const idleSecs = (Date.now() - lastActionTime.current) / 1000;
      if (windowState === 'closed' && idleSecs > 15) {
        setWindowState('open_side');
        lastActionTime.current = Date.now();
      } else if (windowState === 'open_side' && idleSecs > 15) {
        setWindowState('closed');
        lastActionTime.current = Date.now();
        setTimeout(() => {
          if (isAutoRef.current) {
            setWindowState('open_tilt');
            lastActionTime.current = Date.now();
          }
        }, 11000);
      } else if (windowState === 'open_tilt' && idleSecs > 15) {
        setWindowState('closed');
        lastActionTime.current = Date.now();
      }
    }, 1000);
    return () => clearInterval(tick);
  }, [windowState]);

  // Camera / orbit setup
  const W_M = width  * MM;
  const H_M = height * MM;
  const maxDim = Math.max(W_M, H_M);
  const frameDepthMm = 70.0; 
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

  const handleUserInteraction = useCallback((state: WindowState) => {
    isAutoRef.current = false;
    setWindowState(state);
    setAutoRotate(false);
  }, []);

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
            <F1XXXAssembly
              widthMm={width}
              heightMm={height}
              colorExt={colorExt}
              colorInt={colorInt}
              colorExtTexture={colorExtTexture}
              colorIntTexture={colorIntTexture}
              colorGsk={colorGsk}
              colorSpacer={colorSpacer}
              windowState={windowState}
              isAuto={isAutoRef}
              onUserInteraction={handleUserInteraction}
              onSceneReady={onSceneReady}
              isColorPaletteOpen={isColorPaletteOpen}
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

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.1)} }`}</style>

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
        IGLO 5 · F1XXX
      </div>

      {/* Window type badge */}
      <div
        className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none"
        style={{
          background: 'rgba(8,8,22,0.55)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        Tilt & Turn Window
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

useGLTF.preload('/testhandle.glb');
