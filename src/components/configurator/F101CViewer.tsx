import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { usePBRMaterial } from '../../hooks/usePBRMaterial';

// Outer frame profiles
import pdOuterRaw from '../../data/profiles/IGLO5/IG5_F101B.json';
// Mullion profiles
import f101cRaw from '../../data/profiles/IGLO5/IG5_F101C.json';

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
  animation?: any;
}

const pdOuter = pdOuterRaw as unknown as ProfileData;
const pdMullion = f101cRaw as unknown as ProfileData;

const MM = 0.001;

export type WindowState = 'closed' | 'open_side' | 'open_tilt';

interface AssemblyProps {
  widthMm: number;
  heightMm: number;
  mullionPos?: number;
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

function WindowAssembly({ widthMm, heightMm, mullionPos, colorExt, colorInt, colorExtTexture, colorIntTexture, colorGsk, colorSpacer, windowState, isAuto }: AssemblyProps) {
  const sashPivotRef = useRef<THREE.Group>(null!);
  const { clock } = useThree();
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  // -- Outer Frame Layers (from f100t) --
  const getOuterContours = (layerName: string) => {
    const layer = pdOuter.layers[layerName];
    if (!layer || layer.contours.length === 0) return [];
    return layer.contours.map((c: any) => c.points);
  };
  const frmExt = useMemo(() => getOuterContours('FRM_EXT'), []);
  const frmInt = useMemo(() => getOuterContours('FRM_INT'), []);
  const gskFrmExt = useMemo(() => getOuterContours('GSK_FRM_EXT'), []);
  
  // -- Sash Layers (from f100t) --
  const sshExt = useMemo(() => getOuterContours('SSH_EXT'), []);
  const sshInt = useMemo(() => getOuterContours('SSH_INT'), []);
  const bzd    = useMemo(() => getOuterContours('BZD'), []);
  const gskSshExt = useMemo(() => getOuterContours('GSK_SSH_EXT'), []);
  const gskSshInt = useMemo(() => getOuterContours('GSK_SSH_INT'), []);
  const gskBzd    = useMemo(() => getOuterContours('GSK_BZD'), []);
  const glsExt = useMemo(() => getOuterContours('GLS_EXT'), []);
  const glsInt = useMemo(() => getOuterContours('GLS_INT'), []);
  const spacer = useMemo(() => getOuterContours('SPACER'), []);

  // -- Mullion Layers (from f101c) --
  const getMullionContours = (layerName: string) => {
    const layer = pdMullion.layers[layerName];
    if (!layer || layer.contours.length === 0) return [];
    return layer.contours.map((c: any) => c.points);
  };
  const mulExt = useMemo(() => getMullionContours('FRM_EXT'), []);
  const mulInt = useMemo(() => getMullionContours('FRM_INT'), []);
  const mulGskExt = useMemo(() => getMullionContours('GSK_FRM_EXT'), []);

  // Use common origin for outer frame
  const commonOriginOuter = useMemo(() => {
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

  // Use common origin for mullion
  const commonOriginMullion = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    const allLayers = [mulExt, mulInt, mulGskExt];
    for (const layer of allLayers) {
      for (const c of layer) {
        for (const v of c) {
          if (v.x < minX) minX = v.x;
          if (v.y < minY) minY = v.y;
        }
      }
    }
    return { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY };
  }, [mulExt, mulInt, mulGskExt]);

  // -- Use Shared PBR Material Loader Hook --
  const finalFrmExtMat = usePBRMaterial(colorExtTexture, colorExt, widthMm, heightMm, false, false); // Horizontal Exterior
  const finalFrmIntMat = usePBRMaterial(colorIntTexture, colorInt, widthMm, heightMm, false, false); // Horizontal Interior (was using 'true' which actually meant vertical!)
  
  const finalMullionExtMat = usePBRMaterial(colorExtTexture, colorExt, widthMm, heightMm, true, false); // Vertical Exterior
  const finalMullionIntMat = usePBRMaterial(colorIntTexture, colorInt, widthMm, heightMm, true, false); // Vertical Interior
  
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

  const renderFrameSegment = (len: number, uSign: number, uOff: number, splitMm?: number) => (<>
    {frmExt.map((c, i) => <FrameSegment key={`frmExt_${i}`} layerName="FRM_EXT" scaleFactor={scale} length={len} vertices={c} material={finalFrmExtMat} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />)}
    {frmInt.map((c, i) => <FrameSegment key={`frmInt_${i}`} layerName="FRM_INT" scaleFactor={scale} length={len} vertices={c} material={finalFrmIntMat} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />)}
    {splitMm ? (
      gskFrmExt.map((c, i) => (
        <React.Fragment key={`gskFE_split_${i}`}>
          <FrameSegment layerName="GSK_FRM_EXT" scaleFactor={scale} length={splitMm} vertices={c} material={gskMaterial} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />
          <group position={[0, 0, splitMm * scale]}>
            <FrameSegment layerName="GSK_FRM_EXT" scaleFactor={scale} length={len - splitMm} vertices={c} material={gskMaterial} origin={commonOriginOuter} uSign={uSign} uOffset={uOff + splitMm * scale} />
          </group>
        </React.Fragment>
      ))
    ) : (
      gskFrmExt.map((c, i) => <FrameSegment key={`gskFE_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />)
    )}
  </>);

  const renderMullionSegment = (len: number, uSign: number, uOff: number) => (<>
    {mulExt.map((c, i) => <FrameSegment key={`mulExt_${i}`} layerName="F101C_EXT" skipCuts scaleFactor={scale} length={len} vertices={c} material={finalMullionExtMat} origin={commonOriginMullion} uSign={uSign} uOffset={uOff} />)}
    {mulInt.map((c, i) => <FrameSegment key={`mulInt_${i}`} layerName="F101C_INT" skipCuts scaleFactor={scale} length={len} vertices={c} material={finalMullionIntMat} origin={commonOriginMullion} uSign={uSign} uOffset={uOff} />)}
    {mulGskExt.map((c, i) => <FrameSegment key={`mulGskFE_${i}`} layerName="F101C_GSK_EXT" skipCuts scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOriginMullion} uSign={uSign} uOffset={uOff} />)}
  </>);

  const renderSashSegment = (len: number, uSign: number, uOff: number) => (<>
    {sshExt.map((c, i) => <FrameSegment key={`sshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale} length={len} vertices={c} material={finalFrmExtMat} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />)}
    {sshInt.map((c, i) => <FrameSegment key={`sshInt_${i}`} layerName="SSH_INT" scaleFactor={scale} length={len} vertices={c} material={finalFrmIntMat} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />)}
    {bzd.map((c, i) => <FrameSegment key={`bzd_${i}`} layerName="BZD" scaleFactor={scale} length={len} vertices={c} material={finalBzdMat} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} uvMode="rail" />)}
    {spacer.map((c, i) => <FrameSegment key={`spacer_${i}`} layerName="SPACER" scaleFactor={scale} length={len} vertices={c} material={spacerMaterial} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />)}
    {gskSshExt.map((c, i) => <FrameSegment key={`gskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />)}
    {gskSshInt.map((c, i) => <FrameSegment key={`gskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />)}
    {gskBzd.map((c, i) => <FrameSegment key={`gskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale} length={len} vertices={c} material={gskMaterial} origin={commonOriginOuter} uSign={uSign} uOffset={uOff} />)}
  </>);

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
    const offset = minY - commonOriginOuter.y;
    const paneW = sashWidthMm * scale - 2 * offset * scale;
    const paneH = sashHeightMm * scale - 2 * offset * scale;
    const thickness = (maxX - minX) * scale;
    const centerDepth = -(((minX + maxX) / 2) - commonOriginOuter.x) * scale;
    
    // Add extra thickness to the glass pane slightly to avoid z-fighting with spacer edges
    // But keep it inside the spacer.
    return (
      <mesh position={[sashWidthMm * scale / 2, sashHeightMm * scale / 2, centerDepth]} material={glassMaterial} castShadow receiveShadow>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  const mullionWidth = 66 * scale; // Width is Y in DXF (66mm), Depth is X (70mm)
  const frameThicknessInt = 46 * scale; // Exact IG5_F101B frame profile width (interior)
  
  // Custom mullion position (center by default)
  const mPosMm = mullionPos ?? (widthMm / 2);
  const mullionX = mPosMm * scale;
  const sashOverlapMm = 13;

  const leftSashSide = useRef(0);
  const rightSashSide = useRef(0);
  const currentTilt = useRef(0);
  const animStateRef = useRef({ startSide: 0, targetSide: 0, startTilt: 0, targetTilt: 0, startTime: 0, duration: 1.2 });

  useEffect(() => {
    const s = animStateRef.current;
    s.startSide = rightSashSide.current;
    s.targetSide = windowState === 'open_side' ? -Math.PI / 4 : 0;
    s.startTilt = currentTilt.current;
    s.targetTilt = windowState === 'open_tilt' ? -Math.PI * (15 / 180) : 0;
    s.startTime = clock.getElapsedTime();
    s.duration = isAuto.current ? 10.0 : 1.2;
  }, [windowState, clock, isAuto]);

  useFrame((state) => {
    const s = animStateRef.current;
    const elapsed = state.clock.getElapsedTime() - s.startTime;
    let t = Math.min(elapsed / s.duration, 1.0);
    t = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    
    rightSashSide.current = s.startSide + (s.targetSide - s.startSide) * t;
    leftSashSide.current = -rightSashSide.current; // Left sash mirrors right sash
    currentTilt.current = s.startTilt + (s.targetTilt - s.startTilt) * t;
    
    if (sashPivotRef.current) {
      sashPivotRef.current.rotation.y = rightSashSide.current;
      sashPivotRef.current.rotation.x = currentTilt.current;
    }
    if (leftSashPivotRef.current) {
      leftSashPivotRef.current.rotation.y = leftSashSide.current;
      leftSashPivotRef.current.rotation.x = currentTilt.current;
    }
  });

  const leftSashPivotRef = useRef<THREE.Group>(null!);

  return (
    <group>
      <group>
        <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(widthMm, 1, 0, mullionPos ?? (widthMm / 2))}</group></group>
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(heightMm, -1, W)}</group></group>
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(widthMm, 1, W - H, widthMm - (mullionPos ?? (widthMm / 2)))}</group></group>
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSegment(heightMm, -1, W - H)}</group></group>
      </group>

      {/* The F101C Fixed Post (Mullion) */}
      <group position={[mullionX - mullionWidth / 2, frameThicknessInt + (heightMm - 92) * scale, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderMullionSegment(heightMm - 92, -1, mullionX)}
        </group>
      </group>

      <group position={[0, 0, 0]}>
        <group ref={leftSashPivotRef}>
          <group position={[0, 0, 0]}>
            <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(mPosMm + sashOverlapMm, 1, 0)}</group></group>
            <group position={[(mPosMm + sashOverlapMm) * scale, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(heightMm, -1, (mPosMm + sashOverlapMm) * scale)}</group></group>
            <group position={[(mPosMm + sashOverlapMm) * scale, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(mPosMm + sashOverlapMm, 1, (mPosMm + sashOverlapMm) * scale - heightMm)}</group></group>
            <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(heightMm, -1, (mPosMm + sashOverlapMm) * scale - heightMm)}</group></group>
            {renderGlassPane(mPosMm + sashOverlapMm, heightMm, glsExt)}
            {renderGlassPane(mPosMm + sashOverlapMm, heightMm, glsInt)}
          </group>
        </group>
      </group>
      
      <group position={[W, 0, 0]}>
        <group ref={sashPivotRef}>
          <group position={[-W, 0, 0]}>
            <group position={[(mPosMm - sashOverlapMm) * scale, 0, 0]}>
              <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(widthMm - mPosMm + sashOverlapMm, 1, (mPosMm - sashOverlapMm) * scale)}</group></group>
              <group position={[(widthMm - mPosMm + sashOverlapMm) * scale, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(heightMm, -1, W)}</group></group>
              <group position={[(widthMm - mPosMm + sashOverlapMm) * scale, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(widthMm - mPosMm + sashOverlapMm, 1, W - H)}</group></group>
              <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderSashSegment(heightMm, -1, W - H)}</group></group>
              {renderGlassPane(widthMm - mPosMm + sashOverlapMm, heightMm, glsExt)}
              {renderGlassPane(widthMm - mPosMm + sashOverlapMm, heightMm, glsInt)}
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
      <p className="font-bold tracking-widest text-sm uppercase">We are preparing your F101C geometry...</p>
      {active && <p className="text-xs opacity-50 mt-2">{progress.toFixed(0)}%</p>}
      <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
    </div>
  );
}

export interface F101CViewerProps {
  width?: number;
  height?: number;
  mullionPos?: number; // Distance in mm from the left frame edge to the center of the mullion
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
}

export const F101CViewer: React.FC<F101CViewerProps> = ({
  width = 1500,
  height = 1200,
  mullionPos,
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
          <WindowAssembly 
            widthMm={width} 
            heightMm={height} 
            mullionPos={mullionPos}
            colorExt={colorExt} 
            colorInt={colorInt} 
            colorExtTexture={colorExtTexture} 
            colorIntTexture={colorIntTexture} 
            colorGsk={colorGsk} 
            colorSpacer={colorSpacer} 
            windowState={windowState} 
            isAuto={isAutoRef} 
            onUserInteraction={handleUserInteraction} 
          />
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

      <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none" style={{ background: 'rgba(8,8,22,0.78)', border: '1px solid rgba(234,182,118,0.22)', color: '#eab676', backdropFilter: 'blur(10px)' }}>IGLO 5 F101C</div>
      <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-0.5 px-2.5 py-1.5 rounded-lg pointer-events-none" style={{ background: 'rgba(8,8,22,0.65)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: '9px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Dimensions</div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#eab676' }}>{width} x {height} mm</div>
      </div>

      <DelayedLoader mountHeavy={mountHeavy} />
    </div>
  );
};