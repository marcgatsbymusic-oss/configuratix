/**
 * F100TViewer.tsx -- v4 (Reactive Colors)
 * Parametric IGLO 5 / F100T (Tilt-and-Turn) 3D Window Viewer.
 * Materials rendered as R3F JSX children so color props are fully reactive.
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { usePBRMaterial } from '../../hooks/usePBRMaterial';
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
}

function WindowAssembly({ widthMm, heightMm, colorExt, colorInt, colorExtTexture, colorIntTexture, colorGsk, colorSpacer, windowState, isAuto, onUserInteraction }: AssemblyProps) {
  const sashPivotRef = useRef<THREE.Group>(null!);
  const { clock } = useThree();
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

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

  // -- Use Shared PBR Material Loader Hook --
  const finalFrmExtMat = usePBRMaterial(colorExtTexture, colorExt, widthMm, heightMm, false, false);
  const finalFrmIntMat = usePBRMaterial(colorIntTexture, colorInt, widthMm, heightMm, false, false); // false for vertical to match F101C horizontal interior
  const finalBzdMat = usePBRMaterial(colorIntTexture, colorInt, widthMm, heightMm, false, true);

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

  const spacerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorSpacer || '#4B4B4D',
    roughness: 0.8,
    metalness: 0.6
  }), [colorSpacer]);

  const gskMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorGsk || '#1c1c1c',
    roughness: 0.9,
    metalness: 0.1
  }), [colorGsk]);

  const renderFrameSegment = (len: number, uSign: number, uOff: number) => (<>
    {frmExt.map((c, i) => <FrameSegment key={`frmExt_${i}`} layerName="FRM_EXT" scaleFactor={scale} length={len} vertices={c} material={finalFrmExtMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {frmInt.map((c, i) => <FrameSegment key={`frmInt_${i}`} layerName="FRM_INT" scaleFactor={scale} length={len} vertices={c} material={finalFrmIntMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {gskFrmExt.map((c, i) => <FrameSegment key={`gskFE_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
  </>);

  const renderSashSegment = (len: number, uSign: number, uOff: number) => (<>
    {sshExt.map((c, i) => <FrameSegment key={`sshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale} length={len} vertices={c} material={finalFrmExtMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {sshInt.map((c, i) => <FrameSegment key={`sshInt_${i}`} layerName="SSH_INT" scaleFactor={scale} length={len} vertices={c} material={finalFrmIntMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {bzd.map((c, i) => <FrameSegment key={`bzd_${i}`} layerName="BZD" scaleFactor={scale} length={len} vertices={c} material={finalBzdMat} origin={commonOrigin} uSign={uSign} uOffset={uOff} uvMode="rail" />)}
    {spacer.map((c, i) => <FrameSegment key={`spacer_${i}`} layerName="SPACER" scaleFactor={scale} length={len} vertices={c} material={spacerMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {gskSshExt.map((c, i) => <FrameSegment key={`gskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {gskSshInt.map((c, i) => <FrameSegment key={`gskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {gskBzd.map((c, i) => <FrameSegment key={`gskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {glsExt.map((c, i) => <FrameSegment key={`glsExt_${i}`} layerName="GLS_EXT" scaleFactor={scale} length={len} vertices={c} material={glassMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
    {glsInt.map((c, i) => <FrameSegment key={`glsInt_${i}`} layerName="GLS_INT" scaleFactor={scale} length={len} vertices={c} material={glassMaterial} origin={commonOrigin} uSign={uSign} uOffset={uOff} />)}
  </>);

  const pivotX = W;
  const pivotY = 0;

  const currentSide = useRef(0);
  const currentTilt = useRef(0);
  const animStateRef = useRef({ startSide: 0, targetSide: 0, startTilt: 0, targetTilt: 0, startTime: 0, duration: 1.2 });

  useEffect(() => {
    const s = animStateRef.current;
    s.startSide = currentSide.current;
    s.targetSide = windowState === 'open_side' ? -Math.PI / 4 : 0;
    s.startTilt = currentTilt.current;
    s.targetTilt = windowState === 'open_tilt' ? -Math.PI * (15 / 180) : 0;
    s.startTime = clock.getElapsedTime();
    s.duration = isAuto.current ? 10.0 : 1.2;
  }, [windowState, clock, isAuto]);

  useFrame((state) => {
    if (!sashPivotRef.current) return;
    const s = animStateRef.current;
    const elapsed = state.clock.getElapsedTime() - s.startTime;
    let t = Math.min(elapsed / s.duration, 1.0);
    t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    currentSide.current = s.startSide + (s.targetSide - s.startSide) * t;
    currentTilt.current = s.startTilt + (s.targetTilt - s.startTilt) * t;
    sashPivotRef.current.rotation.y = currentSide.current;
    sashPivotRef.current.rotation.x = currentTilt.current;
  });

  return (
    <group>
      <group>
        <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(widthMm, 1, 0)}</group></group>
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(heightMm, -1, W)}</group></group>
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(widthMm, 1, W - H)}</group></group>
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(heightMm, -1, W - H)}</group></group>
      </group>

      <group position={[pivotX, pivotY, 0]}>
        <group ref={sashPivotRef}>
          <group position={[-pivotX, -pivotY, 0]}>
            <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(widthMm, 1, 0)}</group></group>
            <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(heightMm, -1, W)}</group></group>
            <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(widthMm, 1, W - H)}</group></group>
            <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(heightMm, -1, W - H)}</group></group>

            <Html position={[40 * scale, H / 2, -40 * scale]} center>
              <div
                className={`w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors ${windowState === 'open_side' ? 'bg-amber-500/40' : 'bg-white/10'}`}
                style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                onClick={(e) => { e.stopPropagation(); onUserInteraction(windowState === 'open_side' ? 'closed' : 'open_side'); }}
              >
                <div className="w-3 h-3 bg-white/80 rounded-full" />
              </div>
            </Html>

            <Html position={[40 * scale, H - 40 * scale, -40 * scale]} center>
              <div
                className={`w-10 h-10 rounded-full border-2 border-white/50 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors ${windowState === 'open_tilt' ? 'bg-blue-500/40' : 'bg-white/10'}`}
                style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                onClick={(e) => { e.stopPropagation(); onUserInteraction(windowState === 'open_tilt' ? 'closed' : 'open_tilt'); }}
              >
                <div className="w-3 h-3 bg-white/80 rounded-full" />
              </div>
            </Html>
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
}) => {
  const [mountHeavy, setMountHeavy] = useState(false);
  const [windowState, setWindowState] = useState<WindowState>('closed');
  const isAutoRef = useRef(true);
  const lastActionTime = useRef(Date.now());
  const controlsRef = useRef<any>(null);

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
  const targetZ = 89 * MM / 2;

  const angle = 0; 
  const radius = maxDim * 2.0;
  const camPos: [number, number, number] = [
    targetX + radius * Math.sin(angle), 
    targetY, 
    -radius * Math.cos(angle)
  ];
  const orbitTarget: [number, number, number] = [targetX, targetY, targetZ];

  const handleUserInteraction = useCallback((state: WindowState) => { isAutoRef.current = false; setWindowState(state); }, []);
  const trigger = useCallback(() => { handleUserInteraction(windowState === 'closed' ? 'open_side' : 'closed'); }, [windowState, handleUserInteraction]);


  return (
    <div className="absolute inset-0" style={{ background: '#ffffff' }}>
      <Canvas onDoubleClick={(e) => { e.stopPropagation(); controlsRef.current?.reset(); }} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} camera={{ position: camPos, fov: 30 }}>
        <color attach="background" args={['#ffffff']} />
        <fog attach="fog" args={['#ffffff', maxDim * 10, maxDim * 30]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[W_M * 2.5, H_M * 3, -H_M * 2]} intensity={2.8} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} color="#fff6e8" />
        <directionalLight position={[-W_M, H_M * 0.5, -H_M]} intensity={0.8} color="#a8c8ff" />
        <directionalLight position={[W_M * 0.5, -H_M, -H_M * 0.5]} intensity={0.25} color="#ffe0a0" />
        <pointLight position={[W_M * 0.5, H_M * 0.5, -H_M * 1.5]} intensity={0.4} color="#ffffff" />
        <Suspense fallback={null}><Environment files="/assets/hdri/studio_small_03_1k.hdr" /></Suspense>
        {mountHeavy && (
          <WindowAssembly widthMm={width} heightMm={height} colorExt={colorExt} colorInt={colorInt} colorExtTexture={colorExtTexture} colorIntTexture={colorIntTexture} colorGsk={colorGsk} colorSpacer={colorSpacer} windowState={windowState} isAuto={isAutoRef} onUserInteraction={handleUserInteraction} />
        )}
        <ContactShadows position={[W_M / 2, -0.005, 89 * MM / 2]} opacity={0.25} scale={maxDim * 5} blur={2.5} far={maxDim * 2} />
        <OrbitControls ref={controlsRef} makeDefault enablePan enableZoom target={orbitTarget} minDistance={maxDim * 0.4} maxDistance={maxDim * 6} />
      </Canvas>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.1)} }`}</style>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <button onClick={trigger} className="flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm tracking-wider"
          style={{ background: windowState !== 'closed' ? 'rgba(50,190,110,0.18)' : 'rgba(234,182,118,0.14)', border: windowState !== 'closed' ? '1px solid rgba(50,190,110,0.5)' : '1px solid rgba(234,182,118,0.45)', color: windowState !== 'closed' ? '#5af0a0' : '#eab676', backdropFilter: 'blur(12px)', cursor: 'pointer', transition: 'all 0.3s ease' }}>
          {windowState !== 'closed' ? 'x Close' : '> Open Window'}
        </button>
      </div>

      <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none" style={{ background: 'rgba(8,8,22,0.78)', border: '1px solid rgba(234,182,118,0.22)', color: '#eab676', backdropFilter: 'blur(10px)' }}>IGLO 5 F100T</div>
      <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-0.5 px-2.5 py-1.5 rounded-lg pointer-events-none" style={{ background: 'rgba(8,8,22,0.65)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Dimensions</div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#eab676' }}>{width} x {height} mm</div>
      </div>

      <DelayedLoader mountHeavy={mountHeavy} />
    </div>
  );
};