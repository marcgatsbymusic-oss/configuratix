/**
 * F104_FIX_BOTViewer.tsx
 * Parametric 3D viewer for the 1600-IGLO EDGE F104_FIX_BOT Sash and Frame Window profile (with bottom fixed light).
 * Geometry sourced from IGE_F104.json.
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html, useGLTF } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import profileDataRaw from '../../data/profiles/IgloEdge/IGE_F104.json';

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
  showBlindBox?: boolean;
  blindTilt?: number;
}

function F104_FIX_BOTAssembly({
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
  showBlindBox = false,
  blindTilt = 0.4,
}: AssemblyProps) {
  const sashPivotRef = useRef<THREE.Group>(null!);
  const handleGroupRef = useRef<THREE.Group>(null!);
  const { clock } = useThree();
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  // ── Dimensions & Positions according to PDF (Item No. 1: 720x1450, bottom fixed 280) ──
  // Bottom fixed section height is 280mm. 
  // Transom center is at bottomHMm = 280mm.
  const bottomHMm = Math.min(280, heightMm * 0.4); // protect against extremely small heights
  const transomCenterY = bottomHMm * scale;
  
  // Outer frame has a 50mm inner edge profile height overlap
  // Transom (stable post 50021) has a height of 84mm (meaning +- 42mm from center)
  // So the top sash pivot starts at bottomHMm + 42 - 50 = 272mm
  const sashPivotY = (bottomHMm + 42 - 50) * scale;
  const topSashHeight = heightMm - (bottomHMm + 42 - 50); // H - 272mm

  // ── Roller blinds states & refs ─────────────────────────────────────────────
  const [blindOpen, setBlindOpen] = useState(false);
  const blindProgress = useRef(0);
  const slatsGroupRef = useRef<THREE.Group>(null);
  const cordsGroupRef = useRef<THREE.Group>(null);

  // ── Roller blinds materials & geometries ──────────────────────────────────────
  const boxExtMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorExt || '#e8e0d4',
    roughness: 0.42,
    metalness: 0.04,
  }), [colorExt]);

  const boxIntMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorInt || '#f0ece6',
    roughness: 0.42,
    metalness: 0.04,
  }), [colorInt]);

  const boxSideMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorExt || '#e8e0d4',
    roughness: 0.42,
    metalness: 0.04,
  }), [colorExt]);

  const slatMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#7c7d80',
    metalness: 0.9,
    roughness: 0.15,
    clearcoat: 0.1,
  }), []);

  const cordMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#333333',
  }), []);

  const guideCableMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: colorExt || '#e8e0d4',
    metalness: 0.9,
    roughness: 0.1,
  }), [colorExt]);

  const slatGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const segments = 12;
    const slatWidthVal = 0.08;
    const slatThickness = 0.0015;
    const curveDepth = 0.008;

    shape.moveTo(0, 0);
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const x = t * slatWidthVal;
      const y = Math.sin(t * Math.PI) * curveDepth;
      shape.lineTo(x, y);
    }
    shape.lineTo(slatWidthVal, -slatThickness);
    for (let i = segments; i >= 0; i--) {
      const t = i / segments;
      const x = t * slatWidthVal;
      const y = Math.sin(t * Math.PI) * curveDepth - slatThickness;
      shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: W - 0.04,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.001,
      bevelThickness: 0.001
    };

    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geo.center();
    return geo;
  }, [W]);

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
    roughness: 0.1,
    metalness: 0.0,
    transmission: 1.0,
    ior: 1.5,
    thickness: 0.01,
    transparent: true,
    opacity: 0.6,
    envMapIntensity: 0.3,
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

  // Render horizontal transom (stable post) segment
  const renderTransomSide = (len: number, uSign: number, uOff: number) => (<>
    {frmExt.map((c, i) => (
      <FrameSegment key={`transomExt_${i}`} layerName="FRM_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {frmInt.map((c, i) => (
      <FrameSegment key={`transomInt_${i}`} layerName="FRM_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
  </>);

  // Render bottom fixed glass pane
  const renderBottomFixedGlass = () => {
    if (glsExt.length === 0) return null;
    const pts = glsExt[0];
    let minX = Infinity, maxX = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
    }
    const thickness = (maxX - minX) * scale;
    const centerDepth = -(((minX + maxX) / 2) - commonOrigin.x) * scale;

    // Glass width fits between left and right outer frame profiles (with overlap)
    const paneW = (widthMm - 2 * 50 + 16) * scale; // 620mm + 16mm = 636mm
    // Glass height fits between bottom outer frame and bottom of transom
    const paneH = (bottomHMm - 50 - 42 + 16) * scale; // 280 - 50 - 42 + 16 = 204mm
    // Center height position
    const paneY = (50 + (bottomHMm - 50 - 42) / 2) * scale; // 50 + 188 / 2 = 144mm

    return (
      <mesh position={[W / 2, paneY, centerDepth]} material={glassMat} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

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
  // pivotZ = -82.0 * scale exactly as mandated by GEMINI.md
  // For the top sash, it sits on top of the transom, so the bottom-left boundary is at pivotY_top
  const pivotX = W - 50 * scale;
  const pivotY = 50 * scale;
  const pivotZ = -82.0 * scale;

  // Sash pivot position Y is shifted up by 222mm relative to bottom pivot (absolute = 322mm)
  const pivotY_top = (bottomHMm + 42) * scale; // 322mm absolute pivot point for hinges

  // Handle height is constant 420mm from bottom edge of top sash
  const handleHeightMm = 420;
  const handleY = handleHeightMm * scale;

  const sshIntMaxX = useMemo(() => {
    if (sshInt.length === 0) return 90;
    let maxVal = -Infinity;
    for (const c of sshInt) {
      for (const v of c) {
        if (v.x > maxVal) maxVal = v.x;
      }
    }
    return maxVal === -Infinity ? 90 : maxVal;
  }, [sshInt]);

  const handleX = 83 * scale;
  const handleZ = - sshIntMaxX * scale - 60 * scale;

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
    // Dynamic tilt angle calculation using Math.asin(150 / topSashHeight) as mandated by GEMINI.md
    s.targetTilt = windowState === 'open_tilt' ? -Math.asin(150 / topSashHeight) : 0;
    s.startHandle = currentHandle.current;
    s.targetHandle = windowState === 'open_side' ? -Math.PI / 2 : (windowState === 'open_tilt' ? -Math.PI : 0);
    s.startTime = clock.getElapsedTime();
    s.duration = isAuto.current ? 10.0 : 1.2;
  }, [windowState, clock, isAuto, topSashHeight]);

  useFrame((state) => {
    if (groupObj && onSceneReady) {
      const currentKey = `${groupObj.children.length}_${widthMm}_${heightMm}_${colorExt}_${colorInt}_${colorExtTexture}_${colorIntTexture}_${colorGsk}_${colorSpacer}`;
      if (reportedKey.current !== currentKey) {
        reportedKey.current = currentKey;
        onSceneReady(groupObj);
      }
    }

    // ── Roller Blinds Animation Update ────────────────────────────────────────
    if (showBlindBox) {
      const blindTarget = blindOpen ? 1.0 : 0.0;
      blindProgress.current += (blindTarget - blindProgress.current) * 0.08;
      if (Math.abs(blindProgress.current - blindTarget) < 0.001) {
        blindProgress.current = blindTarget;
      }

      const t = blindProgress.current;

      // Update slats positions and rotations
      if (slatsGroupRef.current) {
        const startY = H - 0.04;
        const slatSpacing = 0.07;
        const stackSpacing = 0.004;
        const children = slatsGroupRef.current.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i] as THREE.Group;
          const y_closed = startY - i * slatSpacing;
          const y_open = startY - i * stackSpacing;
          child.position.y = y_closed * (1 - t) + y_open * t;

          const mesh = child.children[0] as THREE.Mesh;
          if (mesh) {
            mesh.rotation.z = blindTilt * (1 - t);
          }
        }
      }

      // Update ladder cords length
      if (cordsGroupRef.current) {
        const startY = H - 0.04;
        const slatSpacing = 0.07;
        const stackSpacing = 0.004;
        const numSlats = slatsGroupRef.current ? slatsGroupRef.current.children.length : 0;
        if (numSlats > 0) {
          const lowestSlatY = startY - (numSlats - 1) * (slatSpacing * (1 - t) + stackSpacing * t);
          const cordLength = H - lowestSlatY;
          const cordCenterY = (H + lowestSlatY) / 2;

          const children = cordsGroupRef.current.children;
          for (let i = 0; i < 6; i++) {
            const child = children[i] as THREE.Group;
            if (child) {
              child.position.y = cordCenterY;
              child.scale.y = cordLength;
            }
          }
        }
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
      let handleObj = handleGroupRef.current.getObjectByName('handleLever') || 
                      handleGroupRef.current.getObjectByName('Handle') || 
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

      {/* Horizontal Transom (Stable Post) */}
      <group position={[50 * scale, transomCenterY, 0]} rotation={[0, Math.PI / 2, 0]}>
        {renderTransomSide(widthMm - 100, 1, 50 * scale)}
      </group>

      {/* Bottom Fixed Glazing Glass Pane */}
      {renderBottomFixedGlass()}

      {/* CHILD1: Top Sash + Glass Pivot Group */}
      <group position={[pivotX, pivotY_top, pivotZ]} name="pivotGroup">
        <group ref={sashPivotRef} name="sashPivot">
          <group position={[-pivotX, -pivotY_top, -pivotZ]}>
            {/* Render Sash sides relative to the pivot group */}
            <group position={[0, sashPivotY, 0]} rotation={[0, 0, 0]}>
              <group rotation={[0, Math.PI / 2, 0]}>{renderSashSide(widthMm, 1, 0)}</group>
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
            
            {/* Render Top Sash Glass Pane */}
            <group position={[0, sashPivotY, 0]}>
              {renderGlassPane(widthMm, topSashHeight, glsExt)}
              {renderGlassPane(widthMm, topSashHeight, glsInt)}
            </group>
            
            {/* Click indicators to trigger state changes */}
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

            {/* Handle Model (Window handle) */}
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

      {/* ── Roller Blind Box and Slats ────────────────────────────────── */}
      {showBlindBox && (() => {
        const boxHeight = 0.24;
        const boxDepth = 0.22;
        const boxCenterZ = -10 * scale;

        // Realistic C-curve slat count calculation
        const startY = H - 0.04;
        const endY = 0.08;
        const slatSpacing = 0.07;
        const numSlats = Math.floor((startY - endY) / slatSpacing) + 1;
        const slatsArray = Array.from({ length: numSlats }, (_, i) => i);

        // Cord X and Z positions
        const cordXs = [0.15 * W, 0.5 * W, 0.85 * W];
        const slatZ = 50 * scale;
        const frontCordZ = slatZ + 38 * scale;
        const backCordZ = slatZ - 38 * scale;

        return (
          <group>
            {/* 1. Blind Box Casing (Bi-Color support) */}
            <mesh position={[W / 2, H + boxHeight / 2, boxCenterZ + boxDepth / 4]} material={boxIntMat} castShadow receiveShadow>
              <boxGeometry args={[W, boxHeight, boxDepth / 2]} />
            </mesh>
            <mesh position={[W / 2, H + boxHeight / 2, boxCenterZ - boxDepth / 4]} material={boxExtMat} castShadow receiveShadow>
              <boxGeometry args={[W, boxHeight, boxDepth / 2]} />
            </mesh>
            <mesh position={[0.001, H + boxHeight / 2, boxCenterZ]} material={boxSideMat} castShadow receiveShadow>
              <boxGeometry args={[0.002, boxHeight, boxDepth]} />
            </mesh>
            <mesh position={[W - 0.001, H + boxHeight / 2, boxCenterZ]} material={boxSideMat} castShadow receiveShadow>
              <boxGeometry args={[0.002, boxHeight, boxDepth]} />
            </mesh>

            {/* 2. Side Guide Cables (Static) */}
            <mesh position={[0.02 * W, H / 2, slatZ]} material={guideCableMat}>
              <cylinderGeometry args={[0.0015, 0.0015, H, 8]} />
            </mesh>
            <mesh position={[W - 0.02 * W, H / 2, slatZ]} material={guideCableMat}>
              <cylinderGeometry args={[0.0015, 0.0015, H, 8]} />
            </mesh>

            {/* 3. Ladder Cords (Stretched dynamically in useFrame) */}
            <group ref={cordsGroupRef}>
              {/* Front Cords */}
              <group position={[cordXs[0], H / 2, frontCordZ]}>
                <mesh material={cordMat}>
                  <cylinderGeometry args={[0.001, 0.001, 1, 8]} />
                </mesh>
              </group>
              <group position={[cordXs[1], H / 2, frontCordZ]}>
                <mesh material={cordMat}>
                  <cylinderGeometry args={[0.001, 0.001, 1, 8]} />
                </mesh>
              </group>
              <group position={[cordXs[2], H / 2, frontCordZ]}>
                <mesh material={cordMat}>
                  <cylinderGeometry args={[0.001, 0.001, 1, 8]} />
                </mesh>
              </group>
              {/* Back Cords */}
              <group position={[cordXs[0], H / 2, backCordZ]}>
                <mesh material={cordMat}>
                  <cylinderGeometry args={[0.001, 0.001, 1, 8]} />
                </mesh>
              </group>
              <group position={[cordXs[1], H / 2, backCordZ]}>
                <mesh material={cordMat}>
                  <cylinderGeometry args={[0.001, 0.001, 1, 8]} />
                </mesh>
              </group>
              <group position={[cordXs[2], H / 2, backCordZ]}>
                <mesh material={cordMat}>
                  <cylinderGeometry args={[0.001, 0.001, 1, 8]} />
                </mesh>
              </group>
            </group>

            {/* 4. Curved Slats Group (Position and Tilt updated in useFrame) */}
            <group ref={slatsGroupRef}>
              {slatsArray.map((idx) => {
                const y_closed = startY - idx * slatSpacing;
                return (
                  <group key={idx} position={[W / 2, y_closed, slatZ]} rotation={[0, Math.PI / 2, 0]}>
                    <mesh geometry={slatGeometry} material={slatMat} castShadow receiveShadow />
                  </group>
                );
              })}
            </group>

            {/* 5. Blinds control hotspot */}
            {!isColorPaletteOpen && (
              <Html position={[W / 2, H - 0.12, slatZ - 20 * scale]} center>
                <div
                  onClick={() => setBlindOpen(!blindOpen)}
                  title={blindOpen ? 'Close blinds' : 'Open blinds'}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '2px solid rgba(234,182,118,0.7)',
                    background: 'rgba(8,8,22,0.85)',
                    color: '#eab676',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'black',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                    transition: 'all 0.3s',
                    pointerEvents: 'auto',
                    userSelect: 'none',
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <span style={{ fontSize: '12px', transform: `rotate(${blindOpen ? 180 : 0}deg)`, transition: 'transform 0.3s' }}>
                    ▲
                  </span>
                </div>
              </Html>
            )}
          </group>
        );
      })()}
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

export interface F104_FIX_BOTViewerProps {
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
  activeLimits?: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number };
  isColorPaletteOpen?: boolean;
  hasRollerShutter?: boolean;
  hidePill?: boolean;
}

export const F104_FIX_BOTViewer: React.FC<F104_FIX_BOTViewerProps> = ({
  width = 720,
  height = 1450,
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
  hasRollerShutter = false,
  hidePill = false,
}) => {
  const { t } = useTranslation();
  const [windowState, setWindowState] = useState<WindowState>('closed');
  const isAutoRef = useRef(false);

  const [showBlindBox, setShowBlindBox] = useState(hasRollerShutter);
  const [blindTilt, setBlindTilt] = useState(0.4);

  // Sync state if hasRollerShutter prop updates
  useEffect(() => {
    setShowBlindBox(hasRollerShutter);
  }, [hasRollerShutter]);

  // Dimension limits: transom is at 280mm, so height should be at least 600mm
  const minW = activeLimits?.minWidth  || 400; 
  const maxW = activeLimits?.maxWidth  || 1600;
  const minH = activeLimits?.minHeight || 600; 
  const maxH = activeLimits?.maxHeight || 2500;

  const [widthText, setWidthText] = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());

  useEffect(() => {
    setWidthText(width.toString());
  }, [width]);

  useEffect(() => {
    setHeightText(height.toString());
  }, [height]);

  const handleUserInteraction = useCallback((state: WindowState) => {
    isAutoRef.current = false;
    setWindowState(state);
  }, []);

  // Center alignment offset
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

  // Disable controls autoRotate and hide HTML pill when active color selection
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

        <Suspense fallback={<LoadingOverlay />}>
          <Environment files="/assets/hdri/monochrome_studio_02_1k.exr" />
          <F104_FIX_BOTAssembly
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
            showBlindBox={showBlindBox}
            blindTilt={blindTilt}
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
        1600-IGLO EDGE · F104_FIX_BOT
      </div>

      <button
        onClick={() => setShowBlindBox(!showBlindBox)}
        className="absolute top-12 right-3 z-20 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer border"
        style={{
          background: showBlindBox ? 'rgba(234,182,118,0.2)' : 'rgba(8,8,22,.78)',
          borderColor: showBlindBox ? '#eab676' : 'rgba(234,182,118,.22)',
          color: showBlindBox ? '#eab676' : '#fff',
          backdropFilter: 'blur(10px)',
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        {showBlindBox 
          ? t('configurator.hideBlindBox', 'Hide Roller Blind') 
          : t('configurator.showBlindBox', 'Show Roller Blind')}
      </button>

      {showBlindBox && (
        <div className="absolute top-[86px] right-3 z-20 flex flex-col gap-1 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-auto border"
             style={{
               background: 'rgba(8,8,22,.78)',
               borderColor: 'rgba(234,182,118,.22)',
               color: '#fff',
               backdropFilter: 'blur(10px)',
             }}>
          <div className="flex justify-between mb-1 select-none w-32">
            <span>{t('configurator.blindTilt', 'Slat Tilt')}</span>
            <span className="text-[#eab676]">{Math.round((blindTilt / 1.45) * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1.45"
            step="0.05"
            value={blindTilt}
            onChange={(e) => setBlindTilt(Number(e.target.value))}
            className="w-32 accent-[#eab676] cursor-pointer"
          />
        </div>
      )}

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
