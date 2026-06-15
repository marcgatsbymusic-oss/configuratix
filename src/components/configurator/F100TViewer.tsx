/**
 * F100TViewer.tsx -- v4 (Reactive Colors)
 * Parametric IGLO 5 / F100T (Tilt-and-Turn) 3D Window Viewer.
 * Materials rendered as R3F JSX children so color props are fully reactive.
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html, useGLTF } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import profileDataRaw from '../../data/profiles/IGLO5/IG5_F100T.json';

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
  animation?: any;
}
const pd = profileDataRaw as unknown as ProfileData;

const MM = 0.001;

export type WindowState = 'closed' | 'open_side' | 'open_tilt';

const MammothLogo = ({ x, y, z }: { x: number; y: number; z: number }) => {
  const texture = useLoader(THREE.TextureLoader, '/assets/mammut-logo-icon.png');
  return (
    <mesh position={[x, y, z]} rotation={[0, Math.PI, 0]}>
      <planeGeometry args={[0.08, 0.08]} />
      <meshBasicMaterial
        map={texture}
        transparent={true}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  );
};

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

function WindowAssembly({ 
  widthMm, heightMm, colorExt, colorInt, colorExtTexture, colorIntTexture, colorGsk, colorSpacer, 
  windowState, isAuto, onUserInteraction, onSceneReady, isColorPaletteOpen = false 
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
  console.log('F100TViewer rendering with color:', colorExt, colorInt);

  const { scene: handleScene } = useGLTF('/testhandle.glb');
  const clonedHandle = useMemo(() => {
    const clone = handleScene.clone(true);
    let lever: THREE.Object3D | undefined =
      clone.getObjectByName('Handle') ??
      clone.getObjectByName('handle') ??
      clone.getObjectByName('Pencere_Kulbu');
    if (!lever) {
      clone.traverse((child: any) => {
        if (!lever && child.isMesh && !child.name.toLowerCase().includes('base')) lever = child;
      });
    }
    if (lever) {
      lever.name = 'handleLever';
    }
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

  const getLayerContours = (layerName: string) => {
    const layer = pd.layers[layerName];
    if (!layer || layer.contours.length === 0) return [];
    return layer.contours.map((c: any) => c.points);
  };

  const frmExt = useMemo(() => getLayerContours('FRM_EXT'), []);
  const frmInt = useMemo(() => getLayerContours('FRM_INT'), []);
  const sshExt = useMemo(() => getLayerContours('SSH_EXT'), []);
  const sshInt = useMemo(() => getLayerContours('SSH_INT'), []);
  const bzd    = useMemo(() => getLayerContours('BZD'), []);
  const gskFrmExt = useMemo(() => getLayerContours('GSK_FRM_EXT'), []);
  const gskSshExt = useMemo(() => getLayerContours('GSK_SSH_EXT'), []);
  const gskSshInt = useMemo(() => getLayerContours('GSK_SSH_INT'), []);
  const gskBzd    = useMemo(() => getLayerContours('GSK_BZD'), []);
  const glsExt = useMemo(() => getLayerContours('GLS_EXT'), []);
  const glsInt = useMemo(() => getLayerContours('GLS_INT'), []);
  const spacer = useMemo(() => getLayerContours('SPACER'), []);

  const commonOrigin = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    const allLayers = [frmExt, frmInt, sshExt, sshInt, bzd, gskFrmExt, gskSshExt, gskSshInt, gskBzd, glsExt, glsInt, spacer];
    for (const layer of allLayers) {
      for (const c of layer) {
        for (const v of c) {
          if (v.x < minX) minX = v.x;
          if (v.y < minY) minY = v.y;
        }
      }
    }
    return { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY };
  }, [frmExt, frmInt, sshExt, sshInt, bzd, gskFrmExt, gskSshExt, gskSshInt, gskBzd, glsExt, glsInt, spacer]);

  // PBR materials are now handled reactively by SegmentMaterial inside FrameSegment.

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: "#ffffff", 
    roughness: 0.0,
    metalness: 0.0,
    transmission: 1.0,
    ior: 1.5,
    thickness: 0.01,
    transparent: true,
    opacity: 0.6,
  }), []);



  const renderFrameSegment = (len: number, uSign: number, uOff: number) => (<>
    {frmExt.map((c, i) => <FrameSegment key={`frmExt_${i}`} layerName="FRM_EXT" scaleFactor={scale} length={len} vertices={c} matType="ext" color={colorExt} textureUrl={colorExtTexture} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {frmInt.map((c, i) => <FrameSegment key={`frmInt_${i}`} layerName="FRM_INT" scaleFactor={scale} length={len} vertices={c} matType="int" color={colorInt} textureUrl={colorIntTexture} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {gskFrmExt.map((c, i) => <FrameSegment key={`gskFE_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale} length={len} vertices={c} matType="gsk" color={colorGsk} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
  </>);

  const renderSashSegment = (len: number, uSign: number, uOff: number) => (<>
    {sshExt.map((c, i) => <FrameSegment key={`sshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale} length={len} vertices={c} matType="ext" color={colorExt} textureUrl={colorExtTexture} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {sshInt.map((c, i) => <FrameSegment key={`sshInt_${i}`} layerName="SSH_INT" scaleFactor={scale} length={len} vertices={c} matType="int" color={colorInt} textureUrl={colorIntTexture} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {bzd.map((c, i) => <FrameSegment key={`bzd_${i}`} layerName="BZD" scaleFactor={scale} length={len} vertices={c} matType="int" color={colorInt} textureUrl={colorIntTexture} origin={commonOrigin} uSign={uSign} uOffset={uOff} uvMode="rail" />)}
    {spacer.map((c, i) => <FrameSegment key={`spacer_${i}`} layerName="SPACER" scaleFactor={scale} length={len} vertices={c} matType="spacer" color={colorSpacer} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {gskSshExt.map((c, i) => <FrameSegment key={`gskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale} length={len} vertices={c} matType="gsk" color={colorGsk} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {gskSshInt.map((c, i) => <FrameSegment key={`gskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale} length={len} vertices={c} matType="gsk" color={colorGsk} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {gskBzd.map((c, i) => <FrameSegment key={`gskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale} length={len} vertices={c} matType="gsk" color={colorGsk} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
  </>);

  const renderGlassPane = (sashWidthMm: number, sashHeightMm: number, glsLayer: Point[][], hasLogo = false) => {
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
      <group>
        <mesh position={[sashWidthMm * scale / 2, sashHeightMm * scale / 2, centerDepth]} material={glassMaterial} castShadow receiveShadow>
          <boxGeometry args={[paneW, paneH, thickness]} />
        </mesh>
        {hasLogo && (() => {
          const logoX = sashWidthMm * scale / 2 - paneW / 2 + 0.09;
          const logoY = sashHeightMm * scale / 2 - paneH / 2 + 0.09;
          const logoZ = centerDepth - thickness / 2 - 0.001;
          return (
            <Suspense fallback={null}>
              <MammothLogo x={logoX} y={logoY} z={logoZ} />
            </Suspense>
          );
        })()}
      </group>
    );
  };

  const pivotX = W - 58 * scale;
  const pivotY = 58 * scale;
  const pivotZ = -82.0 * scale;

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
      // Opening: Handle first, then Sash
      t_handle = Math.min(t / 0.3, 1.0);
      t_sash = Math.max((t - 0.3) / 0.7, 0.0);
    } else {
      // Closing: Sash first, then Handle
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
      let handleObj = handleGroupRef.current.getObjectByName('handleLever') ??
        handleGroupRef.current.getObjectByName('Handle') ??
        handleGroupRef.current.getObjectByName('handle') ??
        handleGroupRef.current.getObjectByName('Pencere_Kulbu');
      
      if (!handleObj) {
        handleGroupRef.current.traverse((child: any) => {
          if (!handleObj && child.isMesh && !child.name.toLowerCase().includes('base')) {
            handleObj = child;
          }
        });
      }
      
      if (handleObj) {
        // The GLTF scene has an X rotation that cancels our group X rotation.
        // Thus, the handle's local Z axis is the normal to the window.
        handleObj.rotation.z = currentHandle.current;
      }
    }
  });

  return (
    <group ref={setGroupObj}>
      <group>
        <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(widthMm, 1, 0)}</group></group>
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(heightMm, -1, W)}</group></group>
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(widthMm, 1, W - H)}</group></group>
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(heightMm, -1, W - H)}</group></group>
      </group>

      <group position={[pivotX, pivotY, pivotZ]} name="pivotGroup">
        <group ref={sashPivotRef} name="sashPivot">
          <group position={[-pivotX, -pivotY, -pivotZ]}>
            <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(widthMm, 1, 0)}</group></group>
            <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(heightMm, -1, W)}</group></group>
            <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(widthMm, 1, W - H)}</group></group>
            <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(heightMm, -1, W - H)}</group></group>
            {renderGlassPane(widthMm, heightMm, glsExt)}
            {renderGlassPane(widthMm, heightMm, glsInt, false)}

            {!isColorPaletteOpen && (
              <>
                <Html position={[85 * scale, handleY, -145 * scale]} center>
                  <div
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ 
                      animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      pointerEvents: 'auto',
                    }}
                    onClick={(e) => { e.stopPropagation(); onUserInteraction(windowState === 'open_side' ? 'closed' : 'open_side'); }}
                  >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                    </div>
                  </div>
                </Html>

                <Html position={[85 * scale, H - 85 * scale, -145 * scale]} center>
                  <div
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ 
                      animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      pointerEvents: 'auto',
                    }}
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

            {/* Handle Model - Placed just where the open button is */}
            <group 
              ref={handleGroupRef} 
              name="handleGroup"
              position={[85 * scale, handleY, -144 * scale]} 
              rotation={[Math.PI / 2, Math.PI + Math.PI / 2, 0]}
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

function DelayedLoader({ mountHeavy }: { mountHeavy: boolean }) {
  const { active, progress } = useProgress();
  if (!mountHeavy || !active) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0e0e1a]/90 backdrop-blur-sm text-[#eab676] pointer-events-none"
      style={{ animation: 'fadeIn 0.5s ease-in-out 2s forwards', opacity: 0 }}>
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="font-bold tracking-widest text-sm uppercase">We are preparing your high quality window...</p>
      {active && <p className="text-xs opacity-50 mt-2">{progress.toFixed(0)}%</p>}
      <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
    </div>
  );
}

export interface F100TViewerProps {
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
  isNeedleMode?: boolean;
  needleEngineNode?: HTMLElement | null;
}

export const F100TViewer: React.FC<F100TViewerProps> = ({
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
  hidePill,
  isColorPaletteOpen = false,
  isNeedleMode = false,
  needleEngineNode = null,
}) => {
  const [widthText, setWidthText] = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());

  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const stopPropagation = (e: Event) => {
      e.stopPropagation();
    };
    const events = ['pointerdown', 'mousedown', 'touchstart', 'click', 'dblclick'];
    events.forEach(evt => {
      el.addEventListener(evt, stopPropagation, { capture: true });
    });
    return () => {
      events.forEach(evt => {
        el.removeEventListener(evt, stopPropagation, { capture: true });
      });
    };
  }, []);

  useEffect(() => {
    setWidthText(width.toString());
    setHeightText(height.toString());
  }, [width, height]);

  const minW = activeLimits?.minWidth || 500;
  const maxW = activeLimits?.maxWidth || 3000;
  const minH = activeLimits?.minHeight || 500;
  const maxH = activeLimits?.maxHeight || 3000;
  const [mountHeavy, setMountHeavy] = useState(false);
  console.log('F100TViewer MOUNTED', colorExt, colorExtTexture);
  const [windowState, setWindowState] = useState<WindowState>('closed');
  const isAutoRef = useRef(true);
  const lastActionTime = useRef(Date.now());
  const controlsRef = useRef<any>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    setMountHeavy(false);
    const t = setTimeout(() => setMountHeavy(true), 50);
    return () => clearTimeout(t);
  }, [width, height]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (!isAutoRef.current) return;
      const idleSecs = (Date.now() - lastActionTime.current) / 1000;
      if (windowState === 'closed' && idleSecs > 15) { setWindowState('open_side'); lastActionTime.current = Date.now(); }
      else if (windowState === 'open_side' && idleSecs > 15) {
        setWindowState('closed'); lastActionTime.current = Date.now();
        setTimeout(() => { if (isAutoRef.current) { setWindowState('open_tilt'); lastActionTime.current = Date.now(); } }, 11000);
      } else if (windowState === 'open_tilt' && idleSecs > 15) { setWindowState('closed'); lastActionTime.current = Date.now(); }
    }, 1000);
    return () => clearInterval(tick);
  }, [windowState]);

  const W_M = width * MM;
  const H_M = height * MM;
  const maxDim = Math.max(W_M, H_M);
  
  const targetX = W_M * 0.5; 
  const targetY = H_M * 0.5;
  const targetZ = 82.0 * MM / 2;

  const angle = 0; 
  const radius = maxDim * 2.0;
  const camPos: [number, number, number] = [
    targetX + radius * Math.sin(angle), 
    targetY, 
    -radius * Math.cos(angle)
  ];
  const orbitTarget: [number, number, number] = [targetX, targetY, targetZ];

  const handleUserInteraction = useCallback((state: WindowState) => { 
    isAutoRef.current = false; 
    setWindowState(state); 
    setAutoRotate(false);
  }, []);



  const prevWindowState = useRef<WindowState>('closed');

  useEffect(() => {
    if (!isNeedleMode || !needleEngineNode) return;
    const runAnimation = async () => {
      try {
        const { Context } = await import('@needle-tools/engine');
        const ctx = (needleEngineNode as any).context || Context.Current;
        if (!ctx) return;
        const { Animation } = await import('@needle-tools/engine');

        // Retry helper to wait for the model to load
        const getAnimationComponent = async (): Promise<any> => {
          for (let i = 0; i < 50; i++) {
            const anim = ctx.scene?.getComponentInChildren(Animation);
            if (anim) return anim;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          return null;
        };

        const anim = await getAnimationComponent();
        if (!anim) {
          console.warn('[Needle Animation] Animation component not found after timeout');
          return;
        }

        const playClip = (clipName: string, forward: boolean) => {
          const action = anim.getAction(clipName);
          if (!action) {
            console.warn(`[Needle Animation] Clip ${clipName} not found. Available:`, anim.animations?.map((c: any) => c.name));
            return;
          }
          action.reset();
          action.loop = THREE.LoopOnce;
          action.clampWhenFinished = true;
          if (forward) {
            action.timeScale = 1;
          } else {
            action.timeScale = -1;
            action.time = action.getClip().duration;
          }
          action.play();
        };

        const prev = prevWindowState.current;
        prevWindowState.current = windowState;

        if (windowState === 'open_side') {
          const tiltAction = anim.getAction('OpenTilt');
          if (tiltAction) tiltAction.stop();
          playClip('OpenSide', true);
        } else if (windowState === 'open_tilt') {
          const sideAction = anim.getAction('OpenSide');
          if (sideAction) sideAction.stop();
          playClip('OpenTilt', true);
        } else if (windowState === 'closed') {
          if (prev === 'open_side') {
            playClip('OpenSide', false);
          } else if (prev === 'open_tilt') {
            playClip('OpenTilt', false);
          }
        }
      } catch (err) {
        console.error('[Needle Animation] Error controlling animation:', err);
      }
    };
    runAnimation();
  }, [windowState, isNeedleMode, needleEngineNode]);

  return (
    <div className={`absolute inset-0 ${isNeedleMode ? 'needle-active z-10 pointer-events-none' : ''}`} style={{ background: isNeedleMode ? 'transparent' : '#e2e8f0' }}>
      <div className="absolute inset-0">
        <Canvas onDoubleClick={(e) => { e.stopPropagation(); controlsRef.current?.reset(); }} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ position: camPos, fov: 30 }}>
        <AdaptiveCamera maxDim={maxDim} targetX={targetX} targetY={targetY} targetZ={targetZ} angle={angle} defaultRadiusMult={2.0} fov={30} zSign={-1} controlsRef={controlsRef} />
        <color attach="background" args={['#e2e8f0']} />
        <fog attach="fog" args={['#ffffff', maxDim * 10, maxDim * 30]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[W_M * 2.5, H_M * 3, -H_M * 2]} intensity={2.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} color="#fff6e8" />
        <directionalLight position={[-W_M, H_M * 0.5, -H_M]} intensity={0.8} color="#a8c8ff" />
        <directionalLight position={[W_M * 0.5, -H_M, -H_M * 0.5]} intensity={0.25} color="#ffe0a0" />
        <pointLight position={[W_M * 0.5, H_M * 0.5, -H_M * 1.5]} intensity={0.4} color="#ffffff" />
        <Suspense fallback={null}><Environment files="/assets/hdri/monochrome_studio_02_1k.exr" /></Suspense>
        {mountHeavy && (
          <WindowAssembly widthMm={width} heightMm={height} colorExt={colorExt} colorInt={colorInt} colorExtTexture={colorExtTexture} colorIntTexture={colorIntTexture} colorGsk={colorGsk} colorSpacer={colorSpacer} windowState={windowState} isAuto={isAutoRef} onUserInteraction={handleUserInteraction} onSceneReady={onSceneReady} isColorPaletteOpen={isColorPaletteOpen} />
        )}
        <ContactShadows position={[W_M / 2, -0.005, 82.0 * MM / 2]} opacity={0.125} scale={maxDim * 5} blur={2.5} far={maxDim * 2} />
        <OrbitControls 
          ref={controlsRef} 
          makeDefault 
          enablePan 
          enableZoom 
          target={orbitTarget} 
          minDistance={maxDim * 0.4} 
          maxDistance={maxDim * 6} 
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.1)} }`}</style>



      <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none" style={{ background: 'rgba(8,8,22,0.78)', border: '1px solid rgba(234,182,118,0.22)', color: '#eab676', backdropFilter: 'blur(10px)' }}>IGLO 5 F100T</div>
      {!hidePill && (onDimensionChange ? (
        <div 
          ref={pillRef}
          className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full pointer-events-auto" 
          style={{ 
            background: 'rgba(8,8,22,0.65)', 
            border: '1px solid rgba(255,255,255,0.07)', 
            backdropFilter: 'blur(8px)' 
          }}
        >
          <input
            type="number"
            value={widthText}
            onChange={(e) => {
              setWidthText(e.target.value);
              const num = Number(e.target.value);
              if (!isNaN(num) && num >= minW && num <= maxW) {
                onDimensionChange(num, height);
              }
            }}
            onBlur={(e) => {
              let val = Number(e.target.value) || minW;
              val = Math.max(minW, Math.min(maxW, val));
              onDimensionChange(val, height);
              setWidthText(val.toString());
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            onKeyUp={(e) => {
              e.stopPropagation();
            }}
            className="w-12 bg-transparent text-[#eab676] text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
            style={{ border: 'none', padding: 0 }}
          />
          <span className="text-[#eab676]/60 text-xs font-black select-none pointer-events-none">x</span>
          <input
            type="number"
            value={heightText}
            onChange={(e) => {
              setHeightText(e.target.value);
              const num = Number(e.target.value);
              if (!isNaN(num) && num >= minH && num <= maxH) {
                onDimensionChange(width, num);
              }
            }}
            onBlur={(e) => {
              let val = Number(e.target.value) || minH;
              val = Math.max(minH, Math.min(maxH, val));
              onDimensionChange(width, val);
              setHeightText(val.toString());
            }}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            onKeyUp={(e) => {
              e.stopPropagation();
            }}
            className="w-12 bg-transparent text-[#eab676] text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
            style={{ border: 'none', padding: 0 }}
          />
          <span className="text-[#eab676] text-[10px] font-black ml-0.5 select-none pointer-events-none">mm</span>
        </div>
      ) : (
        <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-0.5 px-2.5 py-1.5 rounded-lg pointer-events-none" style={{ background: 'rgba(8,8,22,0.65)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#eab676' }}>{width} x {height} mm</div>
        </div>
      ))}

      <DelayedLoader mountHeavy={mountHeavy} />
    </div>
  );
};

useGLTF.preload('/testhandle.glb');