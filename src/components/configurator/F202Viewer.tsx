/**
 * F202Viewer.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * F202 — "Okno 2 kw. słupek ruchomy"
 * 2-field double casement window with MOVABLE MULLION (stulp ruchomy 50029).
 *
 * Sourced from: saturday_27_14_37 seed package (profiles.json)
 *   Frame:        50001 · rama 66mm       [FRAME] — 66mm depth, 70mm face
 *   Sash Left:    50034 · skrzydło 120mm N_Z [SASH]  — passive, hinge=LEFT
 *   Sash Right:   50031 · skrzydło 105mm D_W [SASH]  — active, TiltTurn, hinge=RIGHT, handle=LEFT
 *   Movable Post: 50029 · słupek ruchomy  [MOVABLE_POST] — floats with left sash
 *
 * Layout (F202 window_types.json spec):
 *   Field 1 (L): TURN,      side=L, active=false  → passive/stationary leaf
 *   Field 2 (R): TILT_TURN, side=R, active=true   → operating leaf (handle left)
 *
 * Data format: split.ext / split.int — [[x,y], ...] loop arrays (local mm coords)
 *   depth axis = X (0→66mm for frame 50001), face/height axis = Y
 *   EXT = low-X half (exterior), INT = high-X half (interior)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useRef, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';

// ─── New-format seed data ────────────────────────────────────────────────────
import profileData from '../../data/profiles/IGLO5/IG5_F202.json';

// ─── Constants ───────────────────────────────────────────────────────────────
const MM = 0.001; // mm → three.js world units (metres)

// ─── Types ───────────────────────────────────────────────────────────────────
interface Point { x: number; y: number }

export type SashState = 'closed' | 'open_side' | 'open_tilt';

// ─── Dynamic handle height helper (per GEMINI.md rule) ────────────────────────
const getHandleHeight = (hMm: number): number => {
  if (hMm > 1800)             return 1050;
  if (hMm >= 1600)            return 710;
  if (hMm >= 1200)            return 560;
  if (hMm >= 800)             return 410;
  if (hMm >= 550)             return 260;
  if (hMm >= 380)             return 170;
  return hMm / 2;
};

// ─── Adapt seed loop format → FrameSegment Point[] ──────────────────────────
// Seed stores loops as [[x,y], ...]; FrameSegment wants { x, y }
function seedLoopsToPoints(loops: number[][][]): Point[][] {
  return (loops ?? []).map(loop =>
    loop.map(([x, y]) => ({ x, y }))
  );
}

// ─── Handle sub-component — calls useGLTF unconditionally (Rules of Hooks) ────
interface HandleGLBProps {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}
function HandleGLB({ position, rotation, color }: HandleGLBProps) {
  const { scene } = useGLTF('/testhandle.glb');
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child: any) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color.set(color);
        child.material.roughness = 0.3;
        child.material.metalness = 0.8;
      }
    });
    // normalise: lever ≈150mm, raw z-extent = 5.6831 units → 26.394 mm/unit
    const s = 150 / (5.6831 * 26.39425);
    c.scale.set(s, s, s);
    return c;
  }, [scene, color]);
  return <group position={position} rotation={rotation}><primitive object={cloned} /></group>;
}

// ─── Assembly inner component ─────────────────────────────────────────────────
interface AssemblyProps {
  widthMm: number;
  heightMm: number;
  splitRatio: number;      // 0..1 — left:right width ratio
  colorExt: string;
  colorInt: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
  leftState: SashState;
  rightState: SashState;
  onLeftStateChange:  (s: SashState) => void;
  onRightStateChange: (s: SashState) => void;
  onSceneReady?: (g: THREE.Group) => void;
}

function F202Assembly({
  widthMm, heightMm, splitRatio = 0.5,
  colorExt, colorInt,
  colorExtTexture, colorIntTexture,
  colorGsk = '#1c1c1c',
  colorSpacer = '#4B4B4D',
  leftState, rightState,
  onLeftStateChange, onRightStateChange,
  onSceneReady,
}: AssemblyProps) {
  const scale = MM;
  const W = widthMm  * scale;
  const H = heightMm * scale;

  // ── Extract profiles from the bundled seed JSON ───────────────────────────
  const components = (profileData as any).components;

  // Frame 50001 — 66mm depth, 70mm face
  const FRAME_FACE_MM = components.frame.face_mm as number;   // 70
  const FRAME_DEPTH   = components.frame.depth_mm as number;  // 66

  const frmExt  = useMemo(() => seedLoopsToPoints(components.frame.split.ext),  []);
  const frmInt  = useMemo(() => seedLoopsToPoints(components.frame.split.int),  []);
  const frmFull = useMemo(() => seedLoopsToPoints(components.frame.outline),     []);

  // Sash 50034 (left, passive: N_Z flush) — 120mm depth, 70mm face
  const SASH_L_FACE_MM = components.sash_left.face_mm as number; // 70
  const sashLExt  = useMemo(() => seedLoopsToPoints(components.sash_left.split.ext),  []);
  const sashLInt  = useMemo(() => seedLoopsToPoints(components.sash_left.split.int),  []);
  const sashLFull = useMemo(() => seedLoopsToPoints(components.sash_left.outline),     []);

  // Sash 50031 (right, active: D_W) — 105mm depth, 80mm face
  const SASH_R_FACE_MM = components.sash_right.face_mm as number; // 80
  const sashRExt  = useMemo(() => seedLoopsToPoints(components.sash_right.split.ext),  []);
  const sashRInt  = useMemo(() => seedLoopsToPoints(components.sash_right.split.int),  []);
  const sashRFull = useMemo(() => seedLoopsToPoints(components.sash_right.outline),     []);

  // Movable post 50029 — 64mm depth, 74mm face
  const POST_FACE_MM = components.movable_post.face_mm as number; // 74
  const pstExt  = useMemo(() => seedLoopsToPoints(components.movable_post.split.ext),  []);
  const pstInt  = useMemo(() => seedLoopsToPoints(components.movable_post.split.int),  []);

  // ── Layout geometry ───────────────────────────────────────────────────────
  const frameFace  = FRAME_FACE_MM * scale;
  const postFace   = POST_FACE_MM  * scale;

  // Inner aperture
  const innerW = W - 2 * frameFace;
  const innerH = H - 2 * frameFace;

  // Each leaf gets its share minus the post
  const leftW  = (innerW - postFace) * splitRatio;
  const rightW = innerW - postFace - leftW;

  // ── Pivot depth per GEMINI.md — 82mm from EXT face ────────────────────────
  const pivotZ = -82.0 * scale;

  // ── Tilt angle — top opens max 150mm regardless of height ─────────────────
  const tiltAngle = Math.asin(Math.min(150, heightMm * 0.15) / heightMm);

  // ── Animation state ───────────────────────────────────────────────────────
  const leftPivotRef  = useRef<THREE.Group>(null!);
  const rightPivotRef = useRef<THREE.Group>(null!);
  const curL = useRef(0);
  const curR = useRef(0);

  const targetL = leftState  === 'open_side' ? (90 * Math.PI) / 180 : 0;
  const targetR = rightState === 'open_tilt' ? -tiltAngle
               : rightState === 'open_side' ? -(90 * Math.PI) / 180
               : 0;

  useFrame((_s, dt) => {
    const spd = 4;
    curL.current += (targetL - curL.current) * spd * dt;
    curR.current += (targetR - curR.current) * spd * dt;
    if (leftPivotRef.current)  leftPivotRef.current.rotation.y  = curL.current;
    if (rightPivotRef.current) {
      if (rightState === 'open_tilt') {
        rightPivotRef.current.rotation.x = curR.current;
        rightPivotRef.current.rotation.y = 0;
      } else {
        rightPivotRef.current.rotation.x = 0;
        rightPivotRef.current.rotation.y = curR.current;
      }
    }
  });

  // ── Group ref for AR export ───────────────────────────────────────────────
  const groupRef = useRef<THREE.Group>(null!);
  useEffect(() => {
    if (groupRef.current && onSceneReady) onSceneReady(groupRef.current);
  }, [onSceneReady, widthMm, heightMm]);

  // ── Handle model — height driven by GEMINI.md constant-gear rule ─────────
  const handleHeightMm = getHandleHeight(heightMm);

  // ── Materials ─────────────────────────────────────────────────────────────
  const matExt = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorExt, roughness: 0.38, metalness: 0.06,
  }), [colorExt]);
  const matInt = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorInt, roughness: 0.38, metalness: 0.06,
  }), [colorInt]);
  const matGsk = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorGsk, roughness: 0.9, metalness: 0.0,
  }), [colorGsk]);
  const matSpc = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorSpacer, roughness: 0.6, metalness: 0.5,
  }), [colorSpacer]);
  const matGls = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#d0e8ff',
    roughness: 0.04, metalness: 0.0,
    transmission: 0.92, ior: 1.52, thickness: 0.006,
    transparent: true, opacity: 0.35,
    envMapIntensity: 1.2,
  }), []);

  const origin = { x: 0, y: 0 };

  // ── Render helpers ────────────────────────────────────────────────────────

  /** Render 4 frame segments (ext + int split) for one edge */
  const renderFrameSide = useCallback((lenMm: number, uSign: number, uOff: number) => (
    <>
      {frmExt.map((c, i) => (
        <FrameSegment key={`frmE${i}`} layerName="FRM_EXT" scaleFactor={scale}
          length={lenMm} vertices={c} matType="ext"
          color={colorExt} textureUrl={colorExtTexture}
          origin={origin} uSign={uSign} uOffset={uOff} />
      ))}
      {frmInt.map((c, i) => (
        <FrameSegment key={`frmI${i}`} layerName="FRM_INT" scaleFactor={scale}
          length={lenMm} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={origin} uSign={uSign} uOffset={uOff} />
      ))}
    </>
  ), [frmExt, frmInt, scale, colorExt, colorInt, colorExtTexture, colorIntTexture]);

  /** Render sash stile/rail from given split contours */
  const renderSashSide = useCallback((
    lenMm: number, uSign: number, uOff: number,
    extLoops: Point[][], intLoops: Point[][],
  ) => (
    <>
      {extLoops.map((c, i) => (
        <FrameSegment key={`sE${i}`} layerName="SSH_EXT" scaleFactor={scale}
          length={lenMm} vertices={c} matType="ext"
          color={colorExt} textureUrl={colorExtTexture}
          origin={origin} uSign={uSign} uOffset={uOff} />
      ))}
      {intLoops.map((c, i) => (
        <FrameSegment key={`sI${i}`} layerName="SSH_INT" scaleFactor={scale}
          length={lenMm} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={origin} uSign={uSign} uOffset={uOff} />
      ))}
    </>
  ), [scale, colorExt, colorInt, colorExtTexture, colorIntTexture]);

  /** Movable post (vertical only — no mitre cuts) */
  const renderPost = useCallback((lenMm: number) => (
    <>
      {pstExt.map((c, i) => (
        <FrameSegment key={`pE${i}`} layerName="PST_EXT" scaleFactor={scale}
          length={lenMm} vertices={c} matType="ext"
          color={colorExt} textureUrl={colorExtTexture}
          origin={origin} uSign={1} uOffset={0} skipCuts />
      ))}
      {pstInt.map((c, i) => (
        <FrameSegment key={`pI${i}`} layerName="PST_INT" scaleFactor={scale}
          length={lenMm} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={origin} uSign={1} uOffset={0} skipCuts />
      ))}
    </>
  ), [pstExt, pstInt, scale, colorExt, colorInt, colorExtTexture, colorIntTexture]);

  /** Glass pane */
  const renderGlass = useCallback((sw: number, sh: number) => {
    const GLAZE_DEPTH_MM = 24;
    const GLAZE_OFFSET_MM = SASH_L_FACE_MM;
    return (
      <mesh
        position={[sw / 2, sh / 2, -(GLAZE_OFFSET_MM + GLAZE_DEPTH_MM / 2) * scale]}
        material={matGls}
        castShadow={false}
      >
        <boxGeometry args={[
          sw - 2 * SASH_L_FACE_MM * scale,
          sh - 2 * SASH_L_FACE_MM * scale,
          GLAZE_DEPTH_MM * scale,
        ]} />
      </mesh>
    );
  }, [matGls, scale, SASH_L_FACE_MM]);

  // ── Left sash dimensions ───────────────────────────────────────────────────
  const lW = leftW;
  const lH = innerH;

  // ── Right sash dimensions ──────────────────────────────────────────────────
  const rW = rightW;
  const rH = innerH;

  // ── Left sash pivot — hinge at left stile (EXT face, bottom) ─────────────
  const lPivX = frameFace;
  const lPivY = frameFace;

  // ── Right sash pivot — for tilt: pivots about top rail; for turn: about right jamb ─
  const rPivX_tilt = frameFace + leftW + postFace + rW / 2;
  const rPivY_tilt = frameFace + rH;
  const rPivX_side = frameFace + leftW + postFace + rW;
  const rPivY_side = frameFace;

  // Use tilt pivot (switch in useFrame above)
  const rPivX = rightState === 'open_side' ? rPivX_side : rPivX_tilt;
  const rPivY = rightState === 'open_side' ? rPivY_side : rPivY_tilt;

  // ── Right handle position (left side of right sash) ───────────────────────
  const handleY = handleHeightMm * scale;
  const handleX = 5 * scale; // from latch stile interior face

  return (
    <group ref={groupRef}>

      {/* ── Outer Frame (4 sides) ─────────────────────────────────────────── */}
      {/* Bottom sill */}
      <group rotation={[0, Math.PI / 2, 0]}>
        {renderFrameSide(widthMm, 1, 0)}
      </group>
      {/* Top head — flip via nested -Y scale so mitre cuts stay correct */}
      <group position={[W, H, 0]} rotation={[Math.PI, 0, 0]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderFrameSide(widthMm, 1, 0)}
        </group>
      </group>
      {/* Left jamb */}
      <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderFrameSide(heightMm, -1, (W - H) / scale)}
        </group>
      </group>
      {/* Right jamb */}
      <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {renderFrameSide(heightMm, -1, W / scale)}
        </group>
      </group>

      {/* ── Left Sash (passive TURN leaf) ───────────────────────────────────
           Hinge: LEFT stile. Movable post floats on the right stile.          */}
      <group position={[lPivX, lPivY, pivotZ]}>
        <group ref={leftPivotRef}>
          <group position={[-lPivX, -lPivY, -pivotZ]}>
            <group position={[frameFace, frameFace, 0]}>
              {/* Bottom rail */}
              <group rotation={[0, Math.PI / 2, 0]}>
                {renderSashSide(lW / scale, 1, 0, sashLExt, sashLInt)}
              </group>
              {/* Top rail */}
              <group position={[lW, lH, 0]} rotation={[0, Math.PI / 2, 0]} scale={[-1, -1, 1]}>
                {renderSashSide(lW / scale, 1, 0, sashLExt, sashLInt)}
              </group>
              {/* Left stile (hinge) */}
              <group position={[0, lH, 0]} rotation-z={-Math.PI / 2} rotation-y={Math.PI / 2}>
                {renderSashSide(lH / scale, -1, (lW - lH) / scale, sashLExt, sashLInt)}
              </group>
              {/* Right stile (latch side / holds post) */}
              <group position={[lW, 0, 0]} rotation-z={Math.PI / 2} rotation-y={Math.PI / 2}>
                {renderSashSide(lH / scale, -1, lW / scale, sashLExt, sashLInt)}
              </group>

              {/* Glass */}
              {renderGlass(lW, lH)}

              {/* Movable post floats on right stile of left sash */}
              <group position={[lW, lH, 0]} rotation-z={-Math.PI / 2} rotation-y={Math.PI / 2}>
                {renderPost(lH / scale)}
              </group>

              {/* Hotspot — left sash toggle */}
              <Html position={[lW - 50 * scale, lH / 2, -120 * scale]} center>
                <button
                  className="w-8 h-8 rounded-full bg-sky-500/20 border-2 border-sky-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-sky-500/30 cursor-pointer"
                  onClick={e => { e.stopPropagation(); onLeftStateChange(leftState === 'closed' ? 'open_side' : 'closed'); }}
                  title={`Left sash: ${leftState}`}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                </button>
              </Html>
            </group>
          </group>
        </group>
      </group>

      {/* ── Right Sash (active TILT-TURN leaf) ──────────────────────────────
           Hinge: RIGHT stile, tilt-turn hardware (hinge_side=R, handle_side=L) */}
      <group position={[rPivX, rPivY, pivotZ]}>
        <group ref={rightPivotRef}>
          <group position={[-rPivX, -rPivY, -pivotZ]}>
            <group position={[frameFace + leftW + postFace, frameFace, 0]}>
              {/* Bottom rail */}
              <group rotation={[0, Math.PI / 2, 0]}>
                {renderSashSide(rW / scale, 1, 0, sashRExt, sashRInt)}
              </group>
              {/* Top rail */}
              <group position={[rW, rH, 0]} rotation={[0, Math.PI / 2, 0]} scale={[-1, -1, 1]}>
                {renderSashSide(rW / scale, 1, 0, sashRExt, sashRInt)}
              </group>
              {/* Left stile (latch side — meets post) */}
              <group position={[0, rH, 0]} rotation-z={-Math.PI / 2} rotation-y={Math.PI / 2}>
                {renderSashSide(rH / scale, -1, (rW - rH) / scale, sashRExt, sashRInt)}
              </group>
              {/* Right stile (hinge side) */}
              <group position={[rW, 0, 0]} rotation-z={Math.PI / 2} rotation-y={Math.PI / 2}>
                {renderSashSide(rH / scale, -1, rW / scale, sashRExt, sashRInt)}
              </group>

              {/* Glass */}
              {renderGlass(rW, rH)}

              {/* Handle — separate component so useGLTF is called unconditionally */}
              <Suspense fallback={null}>
                <HandleGLB
                  position={[handleX, handleY, -FRAME_DEPTH * scale]}
                  rotation={[0, Math.PI, 0]}
                  color={colorInt}
                />
              </Suspense>

              {/* Hotspot — right sash toggle (side / tilt / close) */}
              <Html position={[50 * scale, rH / 2, -120 * scale]} center>
                <button
                  className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-400 hover:scale-110 active:scale-95 transition-all flex items-center justify-center shadow-lg shadow-amber-500/30 cursor-pointer"
                  onClick={e => {
                    e.stopPropagation();
                    onRightStateChange(
                      rightState === 'closed'    ? 'open_tilt'
                    : rightState === 'open_tilt' ? 'open_side'
                    :                              'closed'
                    );
                  }}
                  title={`Right sash: ${rightState}`}
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

// ─── Full-page viewer with Canvas + controls ──────────────────────────────────

interface F202ViewerProps {
  width?: number;
  height?: number;
  splitRatio?: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  onSceneReady?: (g: THREE.Group) => void;
}

export const F202Viewer: React.FC<F202ViewerProps> = ({
  width = 1350, height = 1245, splitRatio = 0.5,
  colorExt = '#f2f0ec', colorInt = '#f2f0ec',
  colorExtTexture, colorIntTexture,
  colorGsk = '#1c1c1c',
  onSceneReady,
}) => {
  const [leftState,  setLeftState]  = React.useState<SashState>('closed');
  const [rightState, setRightState] = React.useState<SashState>('closed');

  const scale = MM;
  const maxDim = Math.max(width, height) * scale;

  return (
    <Canvas
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['#0d0f14']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 6]} intensity={1.8} castShadow
        shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-3, 4, -4]} intensity={0.7} />

      <Suspense fallback={null}>
        <Environment preset="studio" environmentIntensity={0.5} />

        <group position={[-width * scale / 2, -height * scale / 2, 0]}>
          <F202Assembly
            widthMm={width} heightMm={height} splitRatio={splitRatio}
            colorExt={colorExt} colorInt={colorInt}
            colorExtTexture={colorExtTexture} colorIntTexture={colorIntTexture}
            colorGsk={colorGsk}
            leftState={leftState}   onLeftStateChange={setLeftState}
            rightState={rightState} onRightStateChange={setRightState}
            onSceneReady={onSceneReady}
          />
        </group>

        <ContactShadows
          position={[0, -height * scale / 2 - 0.01, 0]}
          opacity={0.45} scale={maxDim * 3} blur={2.2} far={maxDim * 2}
        />
      </Suspense>

      <AdaptiveCamera
        maxDim={maxDim}
        targetX={0}
        targetY={0}
        targetZ={0}
        defaultRadiusMult={1.5}
        fov={30}
      />
      <OrbitControls enablePan enableZoom enableRotate makeDefault />
    </Canvas>
  );
};

export default F202Viewer;
