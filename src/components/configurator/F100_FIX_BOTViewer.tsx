/**
 * F100_FIX_BOTViewer.tsx
 * Parametric 3D viewer for the IGLO 5 F100_FIX_BOT Sash and Frame Window profile (with bottom fixed light).
 * Geometry sourced from IG5_F100_FIX_BOT.json.
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html, useGLTF } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { FrameSegment, SegmentMaterial } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import z07Raw from '../../data/profiles/IGLO5/zlozenie_07.json';
import z02Raw from '../../data/profiles/IGLO5/zlozenie_02.json';
import z30Raw from '../../data/profiles/IGLO5/zlozenie_30.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}

const z07 = z07Raw as unknown as ProfileData;
const z02 = z02Raw as unknown as ProfileData;
const z30 = z30Raw as unknown as ProfileData;
const MM = 0.001; // mm → meters

export type WindowState = 'closed' | 'open_side' | 'open_tilt';

// ─── Assembly Component ───────────────────────────────────────────────────────

interface AssemblyProps {
  widthMm: number;
  heightMm: number;
  bottomHeightMm: number;
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

function F100_FIX_BOTAssembly({
  widthMm, heightMm, bottomHeightMm,
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

  // Bottom fixed section height is 280mm. 
  // Transom center is at bottomHMm * scale.
  const bottomHMm = bottomHeightMm;
  const transomCenterY = bottomHMm * scale;
  
  // Outer frame has a 50mm inner edge profile height overlap
  // Transom (stable post) has a height of 84mm (meaning +- 42mm from center)
  // So the top sash pivot starts at bottomHMm + 42 - 50 = 272mm
  const sashPivotY = (bottomHMm + 42 - 50) * scale;
  const topSashHeight = heightMm - (bottomHMm + 42 - 50); // H - 272mm



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

  // Helper: get contour points for a layer
  const getContours = (dataset: ProfileData, layerName: string): Point[][] => {
    const layer = dataset.layers[layerName];
    if (!layer) return [];
    return layer.contours.map(c => c.points);
  };

  // Profile layer contours (Outer Frame from 07 or 02, Top Sash from 02)
  const frmExt       = useMemo(() => getContours(z02, 'FRM_EXT'),          []);
  const frmInt       = useMemo(() => getContours(z02, 'FRM_INT'),          []);
  const gskFrmExt    = useMemo(() => getContours(z02, 'GSK_FRM_EXT'),      []);
  const gskFrmInt    = useMemo(() => getContours(z02, 'GSK_FRM_INT'),      []);
  const gskSshExt    = useMemo(() => getContours(z02, 'GSK_SSH_EXT'),      []);
  const sshExt       = useMemo(() => getContours(z02, 'SSH_EXT'),          []);
  const sshInt       = useMemo(() => getContours(z02, 'SSH_INT'),          []);
  const bzd              = useMemo(() => getContours(z02, 'BZD_SSH'),          []);
  const gskBzd           = useMemo(() => getContours(z02, 'GSK_BZD_SSH'),      []);
  const gskSshInt        = useMemo(() => getContours(z02, 'GSK_SSH_INT'),      []);
  const spacer           = useMemo(() => getContours(z02, 'SPACER_SSH'),       []);
  const glsExt       = useMemo(() => getContours(z02, 'GLS_EXT'),          []);
  const glsInt       = useMemo(() => getContours(z02, 'GLS_INT'),          []);

  // Transom and horizontal sash profiles (From 30)
  const transomExt       = useMemo(() => getContours(z30, 'POST_EXT'),         []);
  const transomInt       = useMemo(() => getContours(z30, 'POST_INT'),         []);
  const gskTransomInt    = useMemo(() => getContours(z30, 'GSK_POST_INT'),     []);
  const gskTransomExtAll = useMemo(() => getContours(z30, 'GSK_POST_EXT'),     []);
  const transomGskTop    = useMemo(() => [gskTransomExtAll[0]].filter(Boolean), [gskTransomExtAll]);
  const transomGskBot    = useMemo(() => [gskTransomExtAll[1]].filter(Boolean), [gskTransomExtAll]);
  const sshExtHoriz      = useMemo(() => getContours(z30, 'SSH_EXT'),          []);
  const sshIntHoriz      = useMemo(() => getContours(z30, 'SSH_INT'),          []);
  const gskSshExtHoriz   = useMemo(() => getContours(z30, 'GSK_SSH_EXT'),      []);
  const gskSshIntHoriz   = useMemo(() => getContours(z30, 'GSK_SSH_INT'),      []);
  const spacerHoriz      = useMemo(() => getContours(z30, 'SPACER_SSH'),       []);

  // Glazing beads, gaskets and spacers for bottom fixed glazing (From 07)
  const bzd_frm          = useMemo(() => getContours(z07, 'BZD_FRM'),          []);
  const gskBzd_frm       = useMemo(() => getContours(z07, 'GSK_BZD_FRM'),      []);
  const spacer_frm       = useMemo(() => getContours(z07, 'SPACER_FRM'),       []);
  const glsExt_frm       = useMemo(() => getContours(z07, 'GLS_EXT'),          []);
  const glsInt_frm       = useMemo(() => getContours(z07, 'GLS_INT'),          []);

  // Origin point for all profile geometries (aligned at Y=0 / frame outer edge)
  const profileOrigin = useMemo(() => ({ x: 0, y: 0 }), []);
  const beadOrigin = useMemo(() => ({ x: 0, y: 46 }), []);
  const gskBzdOrigin = useMemo(() => ({ x: 0, y: 46 }), []);
  const spacerOrigin = useMemo(() => ({ x: 0, y: 50 }), []); // Spacer sits at Y=50
  const sashOriginVert = useMemo(() => ({ x: 0, y: 58 }), []);
  const sashOriginHoriz = useMemo(() => ({ x: 0, y: 99 }), []);
  
  // Transom is centered around Y=65 in CAD
  const transomOrigin = useMemo(() => ({ x: 0, y: 65 }), []);

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

  // Glass pane rendering helper
  const renderGlassPane = (sashWidthMm: number, sashHeightMm: number, glsLayer: Point[][]) => {
    if (glsLayer.length === 0) return null;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity;
    for (const contour of glsLayer) {
      for (const p of contour) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
      }
    }
    const offset = minY - profileOrigin.y;
    const paneW = sashWidthMm * scale - 2 * offset * scale;
    const paneH = sashHeightMm * scale - 2 * offset * scale;
    const thickness = (maxX - minX) * scale;
    const centerDepth = -(((minX + maxX) / 2) - profileOrigin.x) * scale;

    return (
      <mesh position={[sashWidthMm * scale / 2, sashHeightMm * scale / 2, centerDepth]} material={glassMat} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  const renderFrameSide = (len: number, uSign: number, uOff: number, isHoriz: boolean) => (<>
    {frmExt.map((c, i) => (
      <FrameSegment key={`frmExt_${i}`} layerName="FRM_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={profileOrigin} uSign={uSign} uOffset={uOff}
        mitredLeft={true} mitredRight={true}
      />
    ))}
    {frmInt.map((c, i) => (
      <FrameSegment key={`frmInt_${i}`} layerName="FRM_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={profileOrigin} uSign={uSign} uOffset={uOff}
        mitredLeft={true} mitredRight={true}
      />
    ))}
    {isHoriz && gskFrmExt.map((c, i) => (
      <FrameSegment key={`gskFE_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={profileOrigin} uSign={uSign} uOffset={uOff}
        mitredLeft={true} mitredRight={true}
      />
    ))}
    {isHoriz && gskFrmInt.map((c, i) => (
      <FrameSegment key={`gskFI_${i}`} layerName="GSK_FRM_INT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={profileOrigin} uSign={uSign} uOffset={uOff}
        mitredLeft={true} mitredRight={true}
      />
    ))}
  </>);

  const renderSplitFrameGaskets = (len: number, uSign: number, uOff: number) => {
    // The vertical side gaskets are split by the transom to avoid intersecting it.
    // Transom is at transomCenterY. Transom height is 84mm (42mm each side of center).
    // So the gap is from Y = (transomCenterY/scale) - 42 to Y = (transomCenterY/scale) + 42.
    const transomBotY = (transomCenterY / scale) - 42;
    const transomTopY = (transomCenterY / scale) + 42;
    const topLen = len - transomTopY;
    const botLen = transomBotY;

    return (<>
      {/* Top Left: Z=0 is top corner (mitred), Z=len is transom (square) */}
      <group position={[0, heightMm * scale, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {gskFrmExt.map((c, i) => (
            <FrameSegment key={`gskTL_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale}
              length={topLen} vertices={c} matType="gsk"
              color={colorGsk}
              origin={profileOrigin} uSign={-1} uOffset={W}
              mitredLeft={true} mitredRight={false}
            />
          ))}
          {gskFrmInt.map((c, i) => (
            <FrameSegment key={`gskIL_${i}`} layerName="GSK_FRM_INT" scaleFactor={scale}
              length={topLen} vertices={c} matType="gsk"
              color={colorGsk}
              origin={profileOrigin} uSign={-1} uOffset={W}
              mitredLeft={true} mitredRight={false}
            />
          ))}
        </group>
      </group>

      {/* Bottom Left: Z=0 is transom (square), Z=len is bottom corner (mitred) */}
      <group position={[0, transomBotY * scale, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {gskFrmExt.map((c, i) => (
            <FrameSegment key={`gskBL_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale}
              length={botLen} vertices={c} matType="gsk"
              color={colorGsk}
              origin={profileOrigin} uSign={-1} uOffset={W - topLen - 84}
              mitredLeft={false} mitredRight={true}
            />
          ))}
          {gskFrmInt.map((c, i) => (
            <FrameSegment key={`gskILB_${i}`} layerName="GSK_FRM_INT" scaleFactor={scale}
              length={botLen} vertices={c} matType="gsk"
              color={colorGsk}
              origin={profileOrigin} uSign={-1} uOffset={W - topLen - 84}
              mitredLeft={false} mitredRight={true}
            />
          ))}
        </group>
      </group>

      {/* Top Right: Z=0 is transom (square), Z=len is top corner (mitred) */}
      <group position={[W, transomTopY * scale, 0]} rotation={[0, 0, Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {gskFrmExt.map((c, i) => (
            <FrameSegment key={`gskTR_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale}
              length={topLen} vertices={c} matType="gsk"
              color={colorGsk}
              origin={profileOrigin} uSign={1} uOffset={0}
              mitredLeft={false} mitredRight={true}
            />
          ))}
          {gskFrmInt.map((c, i) => (
            <FrameSegment key={`gskITR_${i}`} layerName="GSK_FRM_INT" scaleFactor={scale}
              length={topLen} vertices={c} matType="gsk"
              color={colorGsk}
              origin={profileOrigin} uSign={1} uOffset={0}
              mitredLeft={false} mitredRight={true}
            />
          ))}
        </group>
      </group>

      {/* Bottom Right: Z=0 is bottom corner (mitred), Z=len is transom (square) */}
      <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <group rotation={[0, Math.PI / 2, 0]}>
          {gskFrmExt.map((c, i) => (
            <FrameSegment key={`gskBR_${i}`} layerName="GSK_FRM_EXT" scaleFactor={scale}
              length={botLen} vertices={c} matType="gsk"
              color={colorGsk}
              origin={profileOrigin} uSign={1} uOffset={topLen + 84}
              mitredLeft={true} mitredRight={false}
            />
          ))}
          {gskFrmInt.map((c, i) => (
            <FrameSegment key={`gskIBR_${i}`} layerName="GSK_FRM_INT" scaleFactor={scale}
              length={botLen} vertices={c} matType="gsk"
              color={colorGsk}
              origin={profileOrigin} uSign={1} uOffset={topLen + 84}
              mitredLeft={true} mitredRight={false}
            />
          ))}
        </group>
      </group>
    </>);
  };

  const renderTransomSide = (len: number, uSign: number, uOff: number) => (<>
    {transomExt.map((c, i) => (
      <FrameSegment key={`postExt_${i}`} layerName="POST_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={transomOrigin} uSign={uSign} uOffset={uOff}
        skipCuts={true}
      />
    ))}
    {transomInt.map((c, i) => (
      <FrameSegment key={`postInt_${i}`} layerName="POST_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={transomOrigin} uSign={uSign} uOffset={uOff}
        skipCuts={true}
      />
    ))}
    {gskTransomInt.map((c, i) => (
      <FrameSegment key={`postGskInt_${i}`} layerName="GSK_POST_INT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={transomOrigin} uSign={uSign} uOffset={uOff}
        skipCuts={true}
      />
    ))}
  </>);

  const renderFixedGlazingSide = (len: number, originPoint: {x:number,y:number}, layers: {bzd: boolean, spacer: boolean, gsk: boolean}) => (<>
    {layers.bzd && bzd_frm.map((c, i) => (
      <FrameSegment key={`bzdFrm_${i}`} layerName="BZD_FRM" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={originPoint} uSign={1} uOffset={0}
        uvMode="rail"
        mitredLeft={true} mitredRight={true}
      />
    ))}
    {layers.spacer && spacer_frm.map((c, i) => (
      <FrameSegment key={`spcFrm_${i}`} layerName="SPACER_FRM" scaleFactor={scale}
        length={len} vertices={c} matType="spacer"
        color={colorSpacer}
        origin={originPoint} uSign={1} uOffset={0}
        mitredLeft={true} mitredRight={true}
      />
    ))}
    {layers.gsk && gskBzd_frm.map((c, i) => (
      <FrameSegment key={`gskBzdFrm_${i}`} layerName="GSK_BZD_FRM" scaleFactor={scale}
        length={len} vertices={c} matType="gsk" color={colorGsk}
        origin={originPoint} uSign={1} uOffset={0}
        mitredLeft={true} mitredRight={true}
      />
    ))}
  </>);

  const renderSashSide = (len: number, uSign: number, uOff: number, isBottom = false) => {
    return (<>
      {sshExt.map((c, i) => (
        <FrameSegment key={`sshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale}
          length={len} vertices={c} matType="ext"
          color={colorExt} textureUrl={colorExtTexture}
          origin={sashOriginVert} uSign={uSign} uOffset={uOff}
          mitredLeft={true} mitredRight={true}
        />
      ))}
      {sshInt.map((c, i) => (
        <FrameSegment key={`sshInt_${i}`} layerName="SSH_INT" scaleFactor={scale}
          length={len} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={sashOriginVert} uSign={uSign} uOffset={uOff}
          mitredLeft={true} mitredRight={true}
        />
      ))}
      {bzd.map((c, i) => (
        <FrameSegment key={`bzd_${i}`} layerName="BZD" scaleFactor={scale}
          length={len} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={sashOriginVert} uSign={uSign} uOffset={uOff}
          uvMode="rail"
          mitredLeft={true} mitredRight={true}
        />
      ))}
      {gskBzd.map((c, i) => (
        <FrameSegment key={`gskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale}
          length={len} vertices={c} matType="gsk"
          color={colorGsk}
          origin={sashOriginVert} uSign={uSign} uOffset={uOff}
          mitredLeft={true} mitredRight={true}
        />
      ))}
      {gskSshInt.map((c, i) => (
        <FrameSegment key={`gskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale}
          length={len} vertices={c} matType="gsk"
          color={colorGsk}
          origin={sashOriginVert} uSign={uSign} uOffset={uOff}
          mitredLeft={true} mitredRight={true}
        />
      ))}
      {spacer.map((c, i) => (
        <FrameSegment key={`spacer_${i}`} layerName="SPACER" scaleFactor={scale}
          length={len} vertices={c} matType="spacer"
          color={colorSpacer}
          origin={sashOriginVert} uSign={uSign} uOffset={uOff}
          mitredLeft={true} mitredRight={true}
        />
      ))}
      {gskSshExt.map((c, i) => (
        <FrameSegment key={`gskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale}
          length={len} vertices={c} matType="gsk"
          color={colorGsk}
          origin={profileOrigin} uSign={uSign} uOffset={uOff}
          mitredLeft={true} mitredRight={true}
        />
      ))}
    </>);
  };

  const pivotX = W - 50 * scale;
  const pivotY_top = (bottomHMm + 42) * scale;
  const pivotZ = -82.0 * scale;

  const topSashHeightMm = heightMm - (bottomHMm + 42 - 50);
  const handleHeightMm = 410;
  const handleY = handleHeightMm * scale;
  const handleX = 83 * scale;
  const handleZ = - 90 * scale - 60 * scale;

  const animStateRef = useRef({ startTime: 0, duration: 1.2 });
  useEffect(() => { 
    animStateRef.current = { startTime: clock.getElapsedTime(), duration: 1.2 }; 
  }, [windowState, clock]);

  useFrame((state) => {
    if (!sashPivotRef.current) return;
    const s = animStateRef.current;
    const elapsed = state.clock.getElapsedTime() - s.startTime;
    let t = Math.min(elapsed / s.duration, 1.0);
    const ease = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    t = ease(t);
    
    sashPivotRef.current.rotation.y = (windowState === 'open_side' ? -Math.PI / 4 : 0) * t;
    sashPivotRef.current.rotation.x = (windowState === 'open_tilt' ? -Math.asin(150 / topSashHeightMm) : 0) * t;

    if (handleGroupRef.current) {
        const handleObj = handleGroupRef.current.getObjectByName('handleLever');
        if (handleObj) handleObj.rotation.z = (windowState === 'open_side' ? -Math.PI / 2 : (windowState === 'open_tilt' ? -Math.PI : 0)) * t;
    }
  });

  return (
    <group ref={setGroupObj}>
      <group>
        <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(widthMm, 1, 0, true)}</group></group>
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(heightMm, -1, W, false)}</group></group>
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(widthMm, 1, W - H, true)}</group></group>
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderFrameSide(heightMm, -1, W - H, false)}</group></group>
        {renderSplitFrameGaskets()}
      </group>

      {/* --- Transom (Stable Post) --- */}
      {/* Transom length is widthMm - 2*46 to be perfectly flush with interior frame steps (X=46). */}
      <group position={[46 * scale, transomCenterY, 0]} rotation={[0, Math.PI / 2, 0]}>
        {renderTransomSide(widthMm - 92, 1, 46 * scale)}
      </group>

      {/* --- Fixed Bottom Glazing Beads & Spacers --- */}
      {/* The interior aperture for the fixed bottom glass is exactly bounded by:
          Left: X=46, Right: X=W-46, Bottom: Y=46, Top: Y=(transomCenterY/scale)-22
          So width is W-92, height is (transomCenterY/scale)-68. */}
      {(() => {
        const apW = widthMm - 92;
        const apH = (transomCenterY / scale) - 68;
        const place4Sided = (originObj: {x:number, y:number}, flags: {bzd: boolean, spacer: boolean, gsk: boolean}) => (
          <group position={[46 * scale, 46 * scale, 0]}>
            <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              {renderFixedGlazingSide(apW, originObj, flags)}
            </group>
            <group position={[0, apH * scale, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <group rotation={[0, Math.PI / 2, 0]}>
                {renderFixedGlazingSide(apH, originObj, flags)}
              </group>
            </group>
            <group position={[apW * scale, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <group rotation={[0, Math.PI / 2, 0]}>
                {renderFixedGlazingSide(apH, originObj, flags)}
              </group>
            </group>
            <group position={[apW * scale, apH * scale, 0]} rotation={[0, 0, Math.PI]}>
              <group rotation={[0, Math.PI / 2, 0]}>
                {renderFixedGlazingSide(apW, originObj, flags)}
              </group>
            </group>
          </group>
        );
        return (
          <>
            {place4Sided(beadOrigin, {bzd: true, spacer: false, gsk: true})}
            {place4Sided(spacerOrigin, {bzd: false, spacer: true, gsk: false})}
          </>
        );
      })()}

      {/* --- Fixed Bottom Glass Pane --- */}
      {/* Glass sits between the spacers. Spacer rebate is at Y=50. 
          Top spacer is at (transomCenterY / scale) - 26.
          Height is ((transomCenterY / scale) - 26) - 50 = (transomCenterY / scale) - 76.
          Width is (widthMm - 50) - 50 = widthMm - 100. */}
      <mesh position={[(widthMm / 2) * scale, (50 + ((transomCenterY / scale) - 76) / 2) * scale, -31 * scale]}>
        <boxGeometry args={[(widthMm - 100) * scale, ((transomCenterY / scale) - 76) * scale, 24 * scale]} />
        <SegmentMaterial matType="glass" />
      </mesh>

      {/* CHILD1: Top Sash + Glass Pivot Group */}
      <group position={[pivotX, pivotY_top, pivotZ]} name="pivotGroup">
        <group ref={sashPivotRef} name="sashPivot">
          <group position={[-pivotX, -pivotY_top, -pivotZ]}>
            <group position={[0, sashPivotY, 0]} rotation={[0, 0, 0]}>
              <group rotation={[0, Math.PI / 2, 0]}>{renderSashSide(widthMm, 1, 0, true)}</group>
            </group>
            <group position={[W, sashPivotY, 0]} rotation={[0, 0, Math.PI / 2]}>
              <group rotation={[0, Math.PI / 2, 0]}>{renderSashSide(topSashHeight, -1, W)}</group>
            </group>
            <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
              <group rotation={[0, Math.PI / 2, 0]}>{renderSashSide(widthMm, 1, W - H)}</group>
            </group>
            <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <group rotation={[0, Math.PI / 2, 0]}>{renderSashSide(topSashHeight, -1, W - H)}</group>
            </group>
            
            <group position={[0, sashPivotY, 0]}>
              {renderGlassPane(widthMm, topSashHeight, glsExt)}
              {renderGlassPane(widthMm, topSashHeight, glsInt)}
            </group>
            
            {!isColorPaletteOpen && (
              <>
                <Html position={[handleX, sashPivotY + handleY, handleZ]} center>
                  <div
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite', pointerEvents: 'auto' }}
                    onClick={(e) => { e.stopPropagation(); onUserInteraction(windowState === 'open_side' ? 'closed' : 'open_side'); }}
                  >
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                      <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                    </div>
                  </div>
                </Html>
                <Html position={[handleX, H - 75 * scale, handleZ]} center>
                  <div
                    className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                    style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite', pointerEvents: 'auto' }}
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
            <group 
              ref={handleGroupRef} 
              name="handleGroup"
              position={[handleX, sashPivotY + handleY, handleZ]} 
              rotation={[Math.PI / 2, Math.PI, 0]}
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

export interface F100_FIX_BOTViewerProps {
  width?: number;
  height?: number;
  bottomHeight?: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
  onSceneReady?: (group: THREE.Group) => void;
  onDimensionChange?: (width: number, height: number, bottomHeight?: number) => void;
  activeLimits?: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number };
  isColorPaletteOpen?: boolean;
  hidePill?: boolean;
}

export const F100_FIX_BOTViewer: React.FC<F100_FIX_BOTViewerProps> = ({
  width = 850,
  height = 1400,
  bottomHeight = 280,
  colorExt = '#e8e0d4',
  colorInt = '#f0ece6',
  colorExtTexture,
  colorIntTexture,
  colorGsk = '#1c1c1c',
  colorSpacer = '#4B4B4D',
  onSceneReady,
  onDimensionChange,
  activeLimits,
  isColorPaletteOpen = false,
  hidePill = false,
}) => {
  const { t } = useTranslation();
  const [windowState, setWindowState] = useState<WindowState>('closed');
  const isAutoRef = useRef(false);

  // Dimension limits
  const minW = activeLimits?.minWidth  || 400; 
  const maxW = activeLimits?.maxWidth  || 1600;
  const minH = activeLimits?.minHeight || 600; 
  const maxH = activeLimits?.maxHeight || 2500;

  const [widthText, setWidthText] = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());
  const [bottomHeightText, setBottomHeightText] = useState(bottomHeight.toString());

  useEffect(() => {
    setWidthText(width.toString());
  }, [width]);

  useEffect(() => {
    setHeightText(height.toString());
  }, [height]);

  useEffect(() => {
    setBottomHeightText(bottomHeight.toString());
  }, [bottomHeight]);

  const handleUserInteraction = useCallback((state: WindowState) => {
    isAutoRef.current = false;
    setWindowState(state);
  }, []);

  const W_M = width * MM;
  const H_M = height * MM;
  const maxDim = Math.max(W_M, H_M);

  const targetX = W_M / 2;
  const targetY = H_M / 2;
  const targetZ = -0.04;

  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);

  const [hidePillState, setHidePillState] = useState(false);
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isColorPaletteOpen) {
      setAutoRotate(false);
      setHidePillState(true);
    } else {
      setHidePillState(false);
    }
  }, [isColorPaletteOpen]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '400px' }}>
      <Canvas
        shadows
        camera={{ position: [W_M / 2, H_M / 2, maxDim * 2.2], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.78} />
        <directionalLight
          position={[maxDim * 1.5, maxDim * 2, maxDim * 2.5]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
        />
        <directionalLight
          position={[-maxDim * 2, maxDim * 1.5, -maxDim * 2]}
          intensity={0.45}
        />

        <AdaptiveCamera maxDim={maxDim} targetX={targetX} targetY={targetY} targetZ={targetZ} controlsRef={controlsRef} />

        <Suspense fallback={<LoadingOverlay />}>
          <Environment files="/assets/hdri/monochrome_studio_02_1k.exr" />
          <F100_FIX_BOTAssembly
            widthMm={width}
            heightMm={height}
            bottomHeightMm={bottomHeight}
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
        IGLO 5 · F100_FIX_BOT
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
        Tilt & Turn / Fixed Bottom
      </div>

      {/* Dimension pill */}
      {!(hidePill || hidePillState) && (
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
