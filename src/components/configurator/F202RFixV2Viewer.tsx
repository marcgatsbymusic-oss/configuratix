/**
 * F202RFixV2Viewer.tsx
 * Overwritten config - Double Window with Movable Post (Iglo Edge series)
 * Built using assemblyRules.json:
 * - Frame from IGE_F104.json
 * - Active Left Sash (Tilt & Turn, handle)
 * - Inactive Right Sash (Turn only, no handle, holds Movable Post)
 * - Sequence lock: passive right sash opens only when active left sash is already open.
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html, useGLTF } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import f104DataRaw from '../../data/profiles/IgloEdge/IGE_F104.json';
import movableDataRaw from '../../data/profiles/IgloEdge/IGE_MOVABLE_POST_LEFT_OPENING.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}

const MM = 0.001; // mm → meters

export type SashState = 'closed' | 'open_side' | 'open_tilt';

// ─── Dynamic Handle Height Helper ──────────────────────────────────────────────

const getHandleHeight = (hMm: number): number => {
  if (hMm > 1800) return 1050;
  if (hMm >= 380 && hMm <= 550) return 170;
  if (hMm > 550 && hMm <= 800) return 260;
  if (hMm > 800 && hMm <= 1200) return 410;
  if (hMm > 1200 && hMm <= 1600) return 560;
  if (hMm > 1600 && hMm <= 1800) return 710;
  return hMm / 2;
};

// ─── Transform Helper for Movable Post JSON ──────────────────────────────────
// Maps swapped coordinates to align with standard F104
const transformMovableData = (raw: any): ProfileData => {
  const processed = JSON.parse(JSON.stringify(raw));
  const toMirror = ['SSH_INT', 'GSK_SSH_INT', 'BZD', 'GSK_BZD'];
  for (const layerKey in processed.layers) {
    const layer = processed.layers[layerKey];
    const mirror = toMirror.includes(layerKey);
    for (const contour of layer.contours) {
      contour.points = contour.points.map((p: any) => ({
        x: 103 - p.y,
        y: mirror ? (177.6 - p.x) : (p.x - 5.6)
      }));
    }
  }
  return processed;
};

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
  leftState: SashState;
  rightState: SashState;
  onLeftStateChange: (state: SashState) => void;
  onRightStateChange: (state: SashState) => void;
  onSceneReady?: (group: THREE.Group) => void;
  isColorPaletteOpen?: boolean;
}

function F202RFixV2Assembly({
  widthMm, heightMm,
  colorExt, colorInt,
  colorExtTexture, colorIntTexture,
  colorGsk = '#1c1c1c',
  colorSpacer = '#4B4B4D',
  leftState, rightState,
  onLeftStateChange, onRightStateChange,
  onSceneReady,
  isColorPaletteOpen = false,
}: AssemblyProps) {
  const leftSashPivotRef = useRef<THREE.Group>(null!);
  const rightSashPivotRef = useRef<THREE.Group>(null!);
  const leftHandleGroupRef = useRef<THREE.Group>(null!);

  const { clock } = useThree();
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  // Process data sources
  const f104Data = f104DataRaw as unknown as ProfileData;
  const movableData = useMemo(() => transformMovableData(movableDataRaw), []);

  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const reportedKey = useRef<string>('');

  useEffect(() => {
    if (groupObj) {
      (window as any).assemblyGroup = groupObj;
      if (onSceneReady) {
        onSceneReady(groupObj);
      }
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

  // 2. Left Sash Profiles (Active sash, standard F104)
  const leftSshExt    = useMemo(() => getContours(f104Data, 'SSH_EXT'),     []);
  const leftSshInt    = useMemo(() => getContours(f104Data, 'SSH_INT'),     []);
  const leftGskSshExt = useMemo(() => getContours(f104Data, 'GSK_SSH_EXT'), []);
  const leftGskSshInt = useMemo(() => getContours(f104Data, 'GSK_SSH_INT'), []);
  const leftBzd       = useMemo(() => getContours(f104Data, 'BZD'),         []);
  const leftGskBzd    = useMemo(() => getContours(f104Data, 'GSK_BZD'),     []);
  const leftSpacer    = useMemo(() => getContours(f104Data, 'SPACER'),      []);
  const leftGlsExt    = useMemo(() => getContours(f104Data, 'GLS_EXT'),     []);
  const leftGlsInt    = useMemo(() => getContours(f104Data, 'GLS_INT'),     []);

  // 3. Right Sash Special Left Stile & Post Profiles
  const rightSshExt    = useMemo(() => getContours(movableData, 'SSH_EXT'),     []);
  const rightSshInt    = useMemo(() => getContours(movableData, 'SSH_INT'),     []);
  const rightGskSshExt = useMemo(() => getContours(movableData, 'GSK_SSH_EXT'), []);
  const rightGskSshInt = useMemo(() => getContours(movableData, 'GSK_SSH_INT'), []);
  const rightBzd       = useMemo(() => getContours(movableData, 'BZD'),         []);
  const rightGskBzd    = useMemo(() => getContours(movableData, 'GSK_BZD'),     []);
  const rightSpacer    = useMemo(() => getContours(movableData, 'SPACER'),      []);

  // 4. Movable Post profiles & gaskets
  const pstExt   = useMemo(() => getContours(movableData, 'PST_EXT'),     []);
  const pstInt   = useMemo(() => getContours(movableData, 'PST_INT'),     []);
  const gskPstL  = useMemo(() => getContours(movableData, 'GSK_PST_L'),   []);
  const gskPstR  = useMemo(() => getContours(movableData, 'IGE_GSK_MD_MOVABLE_POST'), []);

  // Shared origin: bottom-left corner of the F104 profile (x=0, y=0)
  const commonOrigin = { x: 0, y: 0 };

  // Glass material (shared)
  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    roughness: 0.1,
    metalness: 0.0,
    transmission: 1.0,
    ior: 1.5,
    thickness: 0.01,
    transparent: true,
    opacity: 0.6,
    envMapIntensity: 0.3,
  }), []);

  // Glass pane rendering
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

  // Render standard sash segments (Sourced from F104)
  const renderStandardSashSide = (len: number, uSign: number, uOff: number) => (<>
    {leftSshExt.map((c, i) => (
      <FrameSegment key={`stdSshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftSshInt.map((c, i) => (
      <FrameSegment key={`stdSshInt_${i}`} layerName="SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftBzd.map((c, i) => (
      <FrameSegment key={`stdBzd_${i}`} layerName="BZD" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        uvMode="rail"
      />
    ))}
    {leftGskBzd.map((c, i) => (
      <FrameSegment key={`stdGskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftGskSshInt.map((c, i) => (
      <FrameSegment key={`stdGskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftSpacer.map((c, i) => (
      <FrameSegment key={`stdSpacer_${i}`} layerName="SPACER" scaleFactor={scale}
        length={len} vertices={c} matType="spacer"
        color={colorSpacer}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftGskSshExt.map((c, i) => (
      <FrameSegment key={`stdGskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
  </>);

  // Render right sash special meeting stile (Sourced from transformed Movable Post)
  const renderRightSashMeetingStile = (len: number, uSign: number, uOff: number) => (<>
    {rightSshExt.map((c, i) => (
      <FrameSegment key={`rMvSshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightSshInt.map((c, i) => (
      <FrameSegment key={`rMvSshInt_${i}`} layerName="SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightBzd.map((c, i) => (
      <FrameSegment key={`rMvBzd_${i}`} layerName="BZD" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        uvMode="rail"
      />
    ))}
    {rightGskBzd.map((c, i) => (
      <FrameSegment key={`rMvGskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightGskSshInt.map((c, i) => (
      <FrameSegment key={`rMvGskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightGskSshExt.map((c, i) => (
      <FrameSegment key={`rMvGskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightSpacer.map((c, i) => (
      <FrameSegment key={`rMvSpacer_${i}`} layerName="SPACER" scaleFactor={scale}
        length={len} vertices={c} matType="spacer"
        color={colorSpacer}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
  </>);

  // Render Movable Post profiles (Square butt joint cut)
  const renderMovablePost = (sashHeightMm: number) => {
    // PST_EXT (exterior): 48mm shorter from bottom and top frame lines (96mm total)
    const extLenMm = sashHeightMm - 96;
    const extPos: [number, number, number] = [0, 0, 48 * scale];

    // PST_INT (interior): 75mm shorter from bottom and top frame lines (150mm total)
    const intLenMm = sashHeightMm - 150;
    const intPos: [number, number, number] = [0, 0, 75 * scale];

    return (<>
      {pstExt.map((c, i) => (
        <FrameSegment key={`pstExt_${i}`} layerName="PST_EXT" scaleFactor={scale}
          length={extLenMm} vertices={c} matType="ext"
          color={colorExt} textureUrl={colorExtTexture}
          origin={commonOrigin} skipCuts={true} position={extPos}
        />
      ))}
      {pstInt.map((c, i) => (
        <FrameSegment key={`pstInt_${i}`} layerName="PST_INT" scaleFactor={scale}
          length={intLenMm} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={commonOrigin} skipCuts={true} position={intPos}
        />
      ))}
      {gskPstL.map((c, i) => (
        <FrameSegment key={`gskPstL_${i}`} layerName="GSK_PST_L" scaleFactor={scale}
          length={extLenMm} vertices={c} matType="gsk"
          color={colorGsk}
          origin={commonOrigin} skipCuts={true} position={extPos}
        />
      ))}
      {gskPstR.map((c, i) => (
        <FrameSegment key={`gskPstR_${i}`} layerName="GSK_PST_R" scaleFactor={scale}
          length={extLenMm} vertices={c} matType="gsk"
          color={colorGsk}
          origin={commonOrigin} skipCuts={true} position={extPos}
        />
      ))}
    </>);
  };

  // Dimensions & Overlap calculations (Based on split centerline)
  const SW = widthMm / 2;
  const Ww_left = (SW + 54) * scale;  // Left sash width: SW + 54mm overlap
  const Ww_right = (SW + 54) * scale; // Right sash width: SW + 54mm overlap
  const rightSashX = W - Ww_right;

  // Hinge/pivot settings (sash outer boundaries start at 50mm, depth at 82.0mm)
  // pivotZ = -82.0 * scale exactly as mandated by GEMINI.md
  const leftPivotX = 50 * scale;
  const leftPivotY = 50 * scale;
  const leftPivotZ = -82.0 * scale;

  const rightPivotX = Ww_right - 50 * scale;
  const rightPivotY = 50 * scale;
  const rightPivotZ = -82.0 * scale;

  // Handle position on active (left) sash meeting stile
  const handleHeightMm = getHandleHeight(heightMm);
  const handleY = handleHeightMm * scale;

  const sshIntMaxX = useMemo(() => {
    if (leftSshInt.length === 0) return 90;
    return Math.max(...leftSshInt.map(c => Math.max(...c.map(p => p.x))));
  }, [leftSshInt]);

  const handleX = Ww_left - 83 * scale; // Placed on right meeting stile of active left sash
  const handleZ = - sshIntMaxX * scale - 60 * scale;

  // Animation values refs
  const currentLeftSide = useRef(0);
  const currentLeftTilt = useRef(0);
  const currentRightSide = useRef(0);
  const currentHandle = useRef(0);

  const leftAnimStateRef = useRef({ startSide: 0, targetSide: 0, startTilt: 0, targetTilt: 0, startHandle: 0, targetHandle: 0, startTime: 0, duration: 1.2 });
  const rightAnimStateRef = useRef({ startSide: 0, targetSide: 0, startTime: 0, duration: 1.2 });

  // Update Left Sash Animation Targets (Active)
  useEffect(() => {
    const s = leftAnimStateRef.current;
    s.startSide = currentLeftSide.current;
    s.targetSide = leftState === 'open_side' ? (110 * Math.PI / 180) : 0; 
    s.startTilt = currentLeftTilt.current;
    s.targetTilt = leftState === 'open_tilt' ? -Math.asin(150 / heightMm) : 0; // Dynamic tilt scissor clamp Math.asin(150 / height)
    s.startHandle = currentHandle.current;
    s.targetHandle = leftState === 'open_side' ? -Math.PI / 2 : (leftState === 'open_tilt' ? -Math.PI : 0);
    s.startTime = clock.getElapsedTime();
    s.duration = leftState !== 'closed' ? 2.4 : 1.2;
  }, [leftState, clock, heightMm]);

  // Update Right Sash Animation Targets (Passive)
  useEffect(() => {
    const s = rightAnimStateRef.current;
    s.startSide = currentRightSide.current;
    s.targetSide = rightState === 'open_side' ? (-110 * Math.PI / 180) : 0; 
    s.startTime = clock.getElapsedTime();
    s.duration = rightState === 'open_side' ? 2.4 : 1.2;
  }, [rightState, clock]);

  useFrame((state) => {
    if (groupObj && onSceneReady) {
      const currentKey = `${groupObj.children.length}_${widthMm}_${heightMm}_${colorExt}_${colorInt}_${colorExtTexture}_${colorIntTexture}_${colorGsk}_${colorSpacer}`;
      if (reportedKey.current !== currentKey) {
        reportedKey.current = currentKey;
        onSceneReady(groupObj);
      }
    }

    const ease = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

    const openAnimationProgress = (x: number) => {
      if (x <= 0.5) {
        const t = x * 2;
        return (-7 * Math.pow(t, 3) + 16 * Math.pow(t, 2)) / 22;
      } else {
        const t = (x - 0.5) * 2;
        return (-15 * Math.pow(t, 3) + 17 * Math.pow(t, 2) + 11 * t + 9) / 22;
      }
    };

    // ── Left Sash Update ──────────────────────────────────
    if (leftSashPivotRef.current) {
      const s = leftAnimStateRef.current;
      const elapsed = state.clock.getElapsedTime() - s.startTime;
      let t = Math.min(elapsed / s.duration, 1.0);
      
      const isClosing = s.targetSide === 0 && s.targetTilt === 0;
      let t_sash = t;
      let t_handle = t;

      if (!isClosing) {
        t_handle = Math.min(t / 0.3, 1.0);
        t_sash = Math.max((t - 0.3) / 0.7, 0.0);
        t_sash = openAnimationProgress(t_sash);
        t_handle = ease(t_handle);
      } else {
        t_sash = Math.min(t / 0.7, 1.0);
        t_handle = Math.max((t - 0.7) / 0.3, 0.0);
        t_sash = ease(t_sash);
        t_handle = ease(t_handle);
      }

      currentLeftSide.current = s.startSide + (s.targetSide - s.startSide) * t_sash;
      currentLeftTilt.current = s.startTilt + (s.targetTilt - s.startTilt) * t_sash;
      currentHandle.current = s.startHandle + (s.targetHandle - s.startHandle) * t_handle;
      
      leftSashPivotRef.current.rotation.y = currentLeftSide.current;
      leftSashPivotRef.current.rotation.x = currentLeftTilt.current;

      if (leftHandleGroupRef.current) {
        let handleObj = leftHandleGroupRef.current.getObjectByName('Handle') || 
                        leftHandleGroupRef.current.getObjectByName('handle') || 
                        leftHandleGroupRef.current.getObjectByName('Pencere_Kulbu');
        
        if (!handleObj) {
          leftHandleGroupRef.current.traverse((child: any) => {
            if (!handleObj && child.isMesh && !child.name.toLowerCase().includes('base')) {
              handleObj = child;
            }
          });
        }
        
        if (handleObj) {
          handleObj.rotation.z = currentHandle.current;
        }
      }
    }

    // ── Right Sash Update ────────────────────────────────
    if (rightSashPivotRef.current) {
      const s = rightAnimStateRef.current;
      const elapsed = state.clock.getElapsedTime() - s.startTime;
      let t = Math.min(elapsed / s.duration, 1.0);
      let p = ease(t);
      if (s.targetSide !== 0) {
        p = openAnimationProgress(t);
      }

      currentRightSide.current = s.startSide + (s.targetSide - s.startSide) * p;
      rightSashPivotRef.current.rotation.y = currentRightSide.current;
      rightSashPivotRef.current.rotation.x = 0;
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

      {/* ── Active Left Sash (Opens & Tilts, handle, standard profiles) ── */}
      <group position={[0, 0, 0]}>
        <group position={[leftPivotX, leftPivotY, leftPivotZ]} name="leftPivotGroup">
          <group ref={leftSashPivotRef} name="leftSashPivot">
            <group position={[-leftPivotX, -leftPivotY, -leftPivotZ]}>
              {/* Bottom rail */}
              <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderStandardSashSide(Ww_left / scale, 1, 0)}</group></group>
              {/* Right meeting stile (standard F104 sash stile) */}
              <group position={[Ww_left, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderStandardSashSide(heightMm, -1, Ww_left / scale)}</group></group>
              {/* Top rail */}
              <group position={[Ww_left, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderStandardSashSide(Ww_left / scale, 1, (Ww_left / scale) - heightMm)}</group></group>
              {/* Left stile (meets frame) */}
              <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderStandardSashSide(heightMm, -1, (Ww_left / scale) - heightMm)}</group></group>
              
              {renderGlassPane(Ww_left / scale, heightMm, leftGlsExt)}
              {renderGlassPane(Ww_left / scale, heightMm, leftGlsInt)}

              {/* Click hotspots to trigger Left Sash state changes */}
              {!isColorPaletteOpen && (
                <>
                  {/* Turn hotspot */}
                  <Html position={[handleX, handleY, handleZ]} center>
                    <div
                      className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                      style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                      onClick={(e) => { e.stopPropagation(); onLeftStateChange(leftState === 'open_side' ? 'closed' : 'open_side'); }}
                    >
                      <div className="relative w-4 h-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                      </div>
                    </div>
                  </Html>

                  {/* Tilt hotspot */}
                  <Html position={[handleX, H - 75 * scale, handleZ]} center>
                    <div
                      className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                      style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                      onClick={(e) => { e.stopPropagation(); onLeftStateChange(leftState === 'open_tilt' ? 'closed' : 'open_tilt'); }}
                    >
                      <div className="relative w-4 h-4 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                      </div>
                    </div>
                  </Html>
                </>
              )}

              {/* Active Single Handle Model */}
              <group 
                ref={leftHandleGroupRef} 
                name="leftHandleGroup"
                position={[handleX, handleY, handleZ]} 
                rotation={[Math.PI / 2, Math.PI, 0]}
                scale={[0.025, 0.025, 0.025]}
              >
                <primitive object={clonedHandle} />
              </group>
            </group>
          </group>
        </group>
      </group>

      {/* ── Inactive Right Sash (Holds Movable Post) ── */}
      <group position={[rightSashX, 0, 0]}>
        <group position={[rightPivotX, rightPivotY, rightPivotZ]} name="rightPivotGroup">
          <group ref={rightSashPivotRef} name="rightSashPivot">
            <group position={[-rightPivotX, -rightPivotY, -rightPivotZ]}>
              {/* Bottom rail */}
              <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderStandardSashSide(Ww_right / scale, 1, 0)}</group></group>
              {/* Right stile (meets frame) */}
              <group position={[Ww_right, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderStandardSashSide(heightMm, -1, Ww_right / scale)}</group></group>
              {/* Top rail */}
              <group position={[Ww_right, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderStandardSashSide(Ww_right / scale, 1, (Ww_right / scale) - heightMm)}</group></group>
              {/* Left meeting stile (Sourced from transformed Movable Post) */}
              <group position={[108 * scale, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderRightSashMeetingStile(heightMm, -1, Ww_right / scale)}
                  {renderMovablePost(heightMm)}
                </group>
              </group>
              
              {renderGlassPane(Ww_right / scale, heightMm, leftGlsExt)}
              {renderGlassPane(Ww_right / scale, heightMm, leftGlsInt)}

              {/* Click hotspot to trigger Inactive Right Sash state changes */}
              {!isColorPaletteOpen && (
                <Html position={[80 * scale, handleY, -89.0 * scale]} center>
                  <div
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                    onClick={(e) => { e.stopPropagation(); onRightStateChange(rightState === 'open_side' ? 'closed' : 'open_side'); }}
                  >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                    </div>
                  </div>
                </Html>
              )}
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

export interface F202RFixV2ViewerProps {
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

export const F202RFixV2Viewer: React.FC<F202RFixV2ViewerProps> = ({
  width = 1400,
  height = 1200,
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
  const { t } = useTranslation();
  const [widthText,  setWidthText]  = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());
  const [mountHeavy, setMountHeavy] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [leftState, setLeftState] = useState<SashState>('closed');
  const [rightState, setRightState] = useState<SashState>('closed');

  const controlsRef = useRef<any>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const minW = activeLimits?.minWidth  || 800; 
  const maxW = activeLimits?.maxWidth  || 2400; 
  const minH = activeLimits?.minHeight || 500; 
  const maxH = activeLimits?.maxHeight || 2200; 

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

  const handleLeftInteraction = useCallback((state: SashState) => {
    if (state === 'closed' || state === 'open_tilt') {
      setRightState('closed'); 
    }
    setLeftState(state);
    setAutoRotate(false);
  }, []);

  const handleRightInteraction = useCallback((state: SashState) => {
    if (state === 'open_side' && leftState !== 'open_side') {
      return; 
    }
    setRightState(state);
    setAutoRotate(false);
  }, [leftState]);

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
            <F202RFixV2Assembly
              widthMm={width}
              heightMm={height}
              colorExt={colorExt}
              colorInt={colorInt}
              colorExtTexture={colorExtTexture}
              colorIntTexture={colorIntTexture}
              colorGsk={colorGsk}
              colorSpacer={colorSpacer}
              leftState={leftState}
              rightState={rightState}
              onLeftStateChange={handleLeftInteraction}
              onRightStateChange={handleRightInteraction}
              onSceneReady={onSceneReady}
              isColorPaletteOpen={isColorPaletteOpen}
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
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>

      {/* Floating Badge (Bi-Color / System name) */}
      {!hidePill && (
        <div 
          ref={pillRef}
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
              IGE F202_R_FIXV2
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
              Double Sash
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
