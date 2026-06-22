/**
 * F2MPXViewer.tsx
 * Step-by-step parametric 3D viewer for the F2MPX Double Window with Movable Post.
 * Sourced from IGE_F104.json and IGE_WINDOW_MOVABLE_POST.json.
 * 
 * Step 3: Render Frame + double Sashes with GLS, BZD, GSK_BZD, and interactive opening hotspots.
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useProgress, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import f104DataRaw from '../../data/profiles/IgloEdge/IGE_F104.json';
import movableDataRaw from '../../data/profiles/IgloEdge/IGE_WINDOW_MOVABLE_POST.json';

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}

const MM = 0.001; // mm → meters
export type SashState = 'closed' | 'open_side' | 'open_tilt';

interface AssemblyProps {
  widthMm: number;
  heightMm: number;
  colorExt: string;
  colorInt: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
  leftState: SashState;
  rightState: SashState;
  onLeftStateChange: (state: SashState) => void;
  onRightStateChange: (state: SashState) => void;
}

function F2MPXAssembly({
  widthMm,
  heightMm,
  colorExt,
  colorInt,
  colorExtTexture,
  colorIntTexture,
  colorGsk = '#1c1c1c',
  colorSpacer = '#4B4B4D',
  leftState,
  rightState,
  onLeftStateChange,
  onRightStateChange,
}: AssemblyProps) {
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  const leftSashPivotRef = useRef<THREE.Group>(null!);
  const rightSashPivotRef = useRef<THREE.Group>(null!);

  // Process data sources
  const f104Data = f104DataRaw as unknown as ProfileData;

  // Helper: get contour points for a layer from profile dataset
  const getContours = (data: ProfileData, layerName: string): Point[][] => {
    const layer = data.layers[layerName];
    if (!layer) return [];
    return layer.contours.map(c => c.points);
  };

  // 1. Frame Profiles (Sourced from F104)
  const frmExt    = useMemo(() => getContours(f104Data, 'FRM_EXT'),     []);
  const frmInt    = useMemo(() => getContours(f104Data, 'FRM_INT'),     []);
  const gskFrmExt = useMemo(() => getContours(f104Data, 'GSK_FRM_EXT'), []);

  // 2. Left Sash Profiles (Pre-transformed from IGE_WINDOW_MOVABLE_POST)
  const leftSshExt    = useMemo(() => getContours(movableDataRaw as any, 'L_SSH_EXT').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: p.x - 24 }))), []);
  const leftSshInt    = useMemo(() => getContours(movableDataRaw as any, 'L_SSH_INT').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: p.x - 24 }))), []);
  const leftBzd       = useMemo(() => getContours(movableDataRaw as any, 'L_BZD').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: p.x - 24 }))), []);
  const leftGskBzd    = useMemo(() => getContours(movableDataRaw as any, 'L_GSK_BZD').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: p.x - 24 }))), []);
  const leftGskSshExt = useMemo(() => getContours(movableDataRaw as any, 'L_GSK_SSH_EXT').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: p.x - 24 }))), []);
  const leftGskSshInt = useMemo(() => getContours(movableDataRaw as any, 'L_GSK_SSH_INT').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: p.x - 24 }))), []);
  const leftSpacer    = useMemo(() => getContours(movableDataRaw as any, 'L_SPACER').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: p.x - 24 }))), []);

  // 3. Right Sash Profiles (Pre-transformed & Mirrored from IGE_WINDOW_MOVABLE_POST)
  const rightSshExt    = useMemo(() => getContours(movableDataRaw as any, 'SSH_EXT').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: 260 - p.x }))), []);
  const rightSshInt    = useMemo(() => getContours(movableDataRaw as any, 'SSH_INT').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: 260 - p.x }))), []);
  const rightBzd       = useMemo(() => getContours(movableDataRaw as any, 'BZD').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: 260 - p.x }))), []);
  const rightGskBzd    = useMemo(() => getContours(movableDataRaw as any, 'GSK_BZD').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: 260 - p.x }))), []);
  const rightGskSshExt = useMemo(() => getContours(movableDataRaw as any, 'GSK_SSH_EXT').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: 260 - p.x }))), []);
  const rightGskSshInt = useMemo(() => getContours(movableDataRaw as any, 'GSK_SSH_INT').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: 260 - p.x }))), []);
  const rightSpacer    = useMemo(() => getContours(movableDataRaw as any, 'SPACER').map(cnt => cnt.map(p => ({ x: 103 - p.y, y: 260 - p.x }))), []);

  // Shared origin: bottom-left corner of the F104 profile (x=0, y=0)
  const commonOrigin = { x: 0, y: 0 };

  // Glass Material
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.05,
    metalness: 0.0,
    transmission: 1.0,
    ior: 1.5,
    thickness: 0.01,
    transparent: true,
    opacity: 0.35,
    envMapIntensity: 0.3,
  }), []);

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

  // Render Left Sash sides (using transformed Left Sash layers)
  const renderLeftSashSide = (len: number, uSign: number, uOff: number) => (<>
    {leftSshExt.map((c, i) => (
      <FrameSegment key={`lSshExt_${i}`} layerName="L_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftSshInt.map((c, i) => (
      <FrameSegment key={`lSshInt_${i}`} layerName="L_SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftBzd.map((c, i) => (
      <FrameSegment key={`lBzd_${i}`} layerName="L_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        uvMode="rail"
      />
    ))}
    {leftGskBzd.map((c, i) => (
      <FrameSegment key={`lGskBzd_${i}`} layerName="L_GSK_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftGskSshExt.map((c, i) => (
      <FrameSegment key={`lGskSE_${i}`} layerName="L_GSK_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftGskSshInt.map((c, i) => (
      <FrameSegment key={`lGskSI_${i}`} layerName="L_GSK_SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftSpacer.map((c, i) => (
      <FrameSegment key={`lSpacer_${i}`} layerName="L_SPACER" scaleFactor={scale}
        length={len} vertices={c} matType="spacer"
        color={colorSpacer}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
  </>);

  // Render Right Sash sides (using transformed Right Sash layers)
  const renderRightSashSide = (len: number, uSign: number, uOff: number) => (<>
    {rightSshExt.map((c, i) => (
      <FrameSegment key={`rSshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightSshInt.map((c, i) => (
      <FrameSegment key={`rSshInt_${i}`} layerName="SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightBzd.map((c, i) => (
      <FrameSegment key={`rBzd_${i}`} layerName="BZD" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        uvMode="rail"
      />
    ))}
    {rightGskBzd.map((c, i) => (
      <FrameSegment key={`rGskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightGskSshExt.map((c, i) => (
      <FrameSegment key={`rGskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightGskSshInt.map((c, i) => (
      <FrameSegment key={`rGskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightSpacer.map((c, i) => (
      <FrameSegment key={`rSpacer_${i}`} layerName="SPACER" scaleFactor={scale}
        length={len} vertices={c} matType="spacer"
        color={colorSpacer}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
  </>);

  const renderGlassPane = (sashWidthMm: number, sashHeightMm: number) => {
    // Triple glazing: glass offset 49mm on the sash perimeter, glass thickness 4mm
    const paneW = sashWidthMm * scale - 98 * scale;
    const paneH = sashHeightMm * scale - 98 * scale;
    const thickness = 4 * scale;

    // Center depths calculated relative to 103mm inside face:
    const zInt = -(103 - 23) * scale; // Center of 21..25
    const zMd  = -(103 - 45) * scale; // Center of 43..47
    const zExt = -(103 - 67) * scale; // Center of 65..69

    return (<>
      {/* Interior glass pane */}
      <mesh position={[sashWidthMm * scale / 2, sashHeightMm * scale / 2, zInt]} material={glassMat}>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
      {/* Middle glass pane */}
      <mesh position={[sashWidthMm * scale / 2, sashHeightMm * scale / 2, zMd]} material={glassMat}>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
      {/* Exterior glass pane */}
      <mesh position={[sashWidthMm * scale / 2, sashHeightMm * scale / 2, zExt]} material={glassMat}>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    </>);
  };

  // Sash calculations: Ww_left and Ww_right meet in the middle, 8mm apart.
  // Overlaps: Left edge of left sash at 24mm. Right edge of left sash at W/2 - 4mm.
  const Ww_left = W / 2 - 28 * scale;
  const Ww_right = W / 2 - 28 * scale;
  const Hw = H - 48 * scale;

  // Hinge/pivot settings
  // Left pivot: hinge at x = 50mm, depth = -82.0mm. Relative to sash bottom-left (24, 24):
  const leftPivotX = 26 * scale;
  const leftPivotY = 26 * scale;
  const leftPivotZ = -82.0 * scale;

  // Right pivot: hinge at x = W - 50mm, depth = -82.0mm. Relative to sash bottom-left:
  const rightPivotX = Ww_right - 26 * scale;
  const rightPivotY = 26 * scale;
  const rightPivotZ = -82.0 * scale;

  // Target animation values
  const leftTurnTarget = leftState === 'open_side' ? (110 * Math.PI / 180) : 0;
  const rightTurnTarget = rightState === 'open_side' ? (-110 * Math.PI / 180) : 0;
  const rightTiltTarget = rightState === 'open_tilt' ? -Math.asin(Math.min(150 / heightMm, 1.0)) : 0;

  const currentLeftTurn = useRef(0);
  const currentRightTurn = useRef(0);
  const currentRightTilt = useRef(0);

  // Animation interpolation inside useFrame
  useFrame((state, delta) => {
    const speed = 5.5; // Smooth interpolation speed factor
    currentLeftTurn.current += (leftTurnTarget - currentLeftTurn.current) * speed * delta;
    currentRightTurn.current += (rightTurnTarget - currentRightTurn.current) * speed * delta;
    currentRightTilt.current += (rightTiltTarget - currentRightTilt.current) * speed * delta;

    if (leftSashPivotRef.current) {
      leftSashPivotRef.current.rotation.y = currentLeftTurn.current;
    }

    if (rightSashPivotRef.current) {
      rightSashPivotRef.current.rotation.y = currentRightTurn.current;
      rightSashPivotRef.current.rotation.x = currentRightTilt.current;
    }
  });

  return (
    <group>
      {/* ── Outer Frame ── */}
      <group>
        {/* Bottom side (horizontal) */}
        <group rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSide(widthMm, 1, 0)}
          </group>
        </group>

        {/* Right side (vertical) */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSide(heightMm, -1, W)}
          </group>
        </group>

        {/* Top side (horizontal) */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSide(widthMm, 1, W - H)}
          </group>
        </group>

        {/* Left side (vertical) */}
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSide(heightMm, -1, W - H)}
          </group>
        </group>
      </group>

      {/* ── Left Sash ── */}
      <group position={[24 * scale, 24 * scale, 0]}>
        <group position={[leftPivotX, leftPivotY, leftPivotZ]} name="leftPivotGroup">
          <group ref={leftSashPivotRef} name="leftSashPivot">
            <group position={[-leftPivotX, -leftPivotY, -leftPivotZ]}>
              {/* Bottom rail */}
              <group rotation={[0, 0, 0]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderLeftSashSide(Ww_left / scale, 1, 0)}
                </group>
              </group>
              {/* Right stile (meeting stile) */}
              <group position={[Ww_left, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderLeftSashSide(Hw / scale, -1, Ww_left / scale)}
                </group>
              </group>
              {/* Top rail */}
              <group position={[Ww_left, Hw, 0]} rotation={[0, 0, Math.PI]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderLeftSashSide(Ww_left / scale, 1, (Ww_left - Hw) / scale)}
                </group>
              </group>
              {/* Left stile */}
              <group position={[0, Hw, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderLeftSashSide(Hw / scale, -1, (Ww_left - Hw) / scale)}
                </group>
              </group>

              {renderGlassPane(Ww_left / scale, Hw / scale)}

              {/* Left turn hotspot */}
              <Html position={[Ww_left - 40 * scale, Hw / 2, -103 * scale]} center>
                <button
                  className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-emerald-500/30"
                  style={{ animation: 'pulse 2s infinite' }}
                  onClick={(e) => { e.stopPropagation(); onLeftStateChange(leftState === 'open_side' ? 'closed' : 'open_side'); }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                </button>
              </Html>
            </group>
          </group>
        </group>
      </group>

      {/* ── Right Sash ── */}
      <group position={[W / 2 + 4 * scale, 24 * scale, 0]}>
        <group position={[rightPivotX, rightPivotY, rightPivotZ]} name="rightPivotGroup">
          <group ref={rightSashPivotRef} name="rightSashPivot">
            <group position={[-rightPivotX, -rightPivotY, -rightPivotZ]}>
              {/* Bottom rail */}
              <group rotation={[0, 0, 0]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderRightSashSide(Ww_right / scale, 1, 0)}
                </group>
              </group>
              {/* Right stile */}
              <group position={[Ww_right, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderRightSashSide(Hw / scale, -1, Ww_right / scale)}
                </group>
              </group>
              {/* Top rail */}
              <group position={[Ww_right, Hw, 0]} rotation={[0, 0, Math.PI]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderRightSashSide(Ww_right / scale, 1, (Ww_right - Hw) / scale)}
                </group>
              </group>
              {/* Left stile (meeting stile) */}
              <group position={[0, Hw, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderRightSashSide(Hw / scale, -1, (Ww_right - Hw) / scale)}
                </group>
              </group>

              {renderGlassPane(Ww_right / scale, Hw / scale)}

              {/* Right turn hotspot */}
              <Html position={[40 * scale, Hw / 2, -103 * scale]} center>
                <button
                  className="w-8 h-8 rounded-full bg-rose-500/20 border-2 border-rose-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-rose-500/30"
                  style={{ animation: 'pulse 2s infinite' }}
                  onClick={(e) => { e.stopPropagation(); onRightStateChange(rightState === 'open_side' ? 'closed' : 'open_side'); }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                </button>
              </Html>

              {/* Right tilt hotspot */}
              <Html position={[40 * scale, Hw - 80 * scale, -103 * scale]} center>
                <button
                  className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-amber-500/30"
                  style={{ animation: 'pulse 2s infinite' }}
                  onClick={(e) => { e.stopPropagation(); onRightStateChange(rightState === 'open_tilt' ? 'closed' : 'open_tilt'); }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                </button>
              </Html>
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}

function LoadingOverlay() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3 px-4 py-3 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md text-white">
        <Loader2 className="w-6 h-6 animate-spin text-[#eab676]" />
        <span className="text-[11px] font-bold uppercase tracking-widest">{Math.round(progress)}% Loaded</span>
      </div>
    </Html>
  );
}

interface F2MPXViewerProps {
  width: number;
  height: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  sealColor?: string;
}

export const F2MPXViewer: React.FC<F2MPXViewerProps> = ({
  width,
  height,
  colorExt = '#f0ece6',
  colorInt = '#f0ece6',
  colorExtTexture,
  colorIntTexture,
  sealColor = '#1c1c1c',
}) => {
  const controlsRef = useRef<any>(null);

  const [leftState, setLeftState] = useState<SashState>('closed');
  const [rightState, setRightState] = useState<SashState>('closed');

  const W_M = width * MM;
  const H_M = height * MM;

  // Hardcode frame depth to 82mm for scaling calculations
  const frameDepthMm = 82;
  const maxDim = Math.max(W_M, H_M);
  const targetX = W_M / 2;
  const targetY = H_M / 2;
  const targetZ = -(frameDepthMm * MM) / 2;

  const camPos: [number, number, number] = [
    targetX,
    targetY,
    -maxDim * 2.2,
  ];

  return (
    <div className="absolute inset-0" style={{ background: '#0d0d14' }}>
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
          angle={0}
          defaultRadiusMult={2.2}
          fov={30}
          zSign={-1}
          controlsRef={controlsRef}
        />

        <color attach="background" args={['#0d0d14']} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[W_M * 2.5, H_M * 3, -H_M * 2]}
          intensity={2.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0004}
          color="#fff6e8"
        />
        <directionalLight position={[-W_M, H_M * 0.5, -H_M]} intensity={0.9} color="#a8c8ff" />
        <directionalLight position={[W_M * 0.5, -H_M, -H_M * 0.5]} intensity={0.3} color="#ffe0a0" />
        <pointLight position={[W_M * 0.5, H_M * 0.5, -H_M * 1.5]} intensity={0.4} />

        <Suspense fallback={<LoadingOverlay />}>
          <F2MPXAssembly
            widthMm={width}
            heightMm={height}
            colorExt={colorExt}
            colorInt={colorInt}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={sealColor}
            leftState={leftState}
            rightState={rightState}
            onLeftStateChange={setLeftState}
            onRightStateChange={setRightState}
          />
        </Suspense>

        {/* Front / Back 3D labels */}
        <Html position={[targetX, targetY, 0.4]} center>
          <div className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-[#0c1c12]/90 backdrop-blur-sm text-emerald-400 text-xs font-black tracking-widest shadow-lg shadow-emerald-500/5 select-none pointer-events-none whitespace-nowrap">
            F (Front / Exterior)
          </div>
        </Html>

        <Html position={[targetX, targetY, -0.4]} center>
          <div className="px-3 py-1.5 rounded-lg border border-rose-500/30 bg-[#1c0c0f]/90 backdrop-blur-sm text-rose-400 text-xs font-black tracking-widest shadow-lg shadow-rose-500/5 select-none pointer-events-none whitespace-nowrap">
            B (Back / Interior)
          </div>
        </Html>

        <ContactShadows
          position={[W_M / 2, -0.005, targetZ]}
          opacity={0.25}
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
        />
      </Canvas>

      <style>{`@keyframes pulse { 0%,100%{transform:scale(1);opacity:0.9} 50%{transform:scale(1.1);opacity:0.4} }`}</style>

      {/* Info labels */}
      <div
        className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none"
        style={{
          background: 'rgba(8,8,22,0.78)',
          border: '1px solid rgba(234,182,118,0.22)',
          color: '#eab676',
          backdropFilter: 'blur(10px)',
        }}
      >
        1600-IGLO EDGE · STEP 3
      </div>

      <div
        className="absolute top-3 left-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none"
        style={{
          background: 'rgba(8,8,22,0.55)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(8px)',
        }}
      >
        Frame, Sashes &amp; Interactive Hotspots
      </div>
    </div>
  );
};
