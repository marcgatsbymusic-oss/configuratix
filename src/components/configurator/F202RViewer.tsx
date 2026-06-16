/**
 * F202RViewer.tsx
 * Double Window with Movable Post (Iglo Edge series) - Active Right Sash
 * Built using IGE_WINDOW_MOVABLE_POST.json:
 * - Frame from IGE_F104.json
 * - Active Right Sash (Tilt & Turn, handle)
 * - Inactive Left Sash (Turn only, no handle, holds Movable Post)
 * - Sequence lock: passive left sash opens only when active right sash is already open.
 * - Integrated Roller Blind box on top (No Mosquito).
 */

import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html, useGLTF } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { FrameSegment, SegmentMaterial, applyUVs } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import f104DataRaw from '../../data/profiles/IgloEdge/IGE_F104.json';
import movableDataRaw from '../../data/profiles/IgloEdge/IGE_WINDOW_MOVABLE_POST.json';
import blindProfileDataRaw from '../../data/profiles/ROLLER_BLIND_BOX_225.json';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}

interface Command { cmd: string; x: number; y: number; cpx?: number; cpy?: number }
interface ShapeData { id: string; svgPath: string; threeShape: Command[] }
interface BlindProfileData {
  meta: {
    boxWidth: number;
    boxHeight: number;
    slatThickness: number;
    slatHeight: number;
    bottomBarThickness: number;
    bottomBarHeight: number;
    slotX: number;
  };
  boxProfiles: Record<string, ShapeData[]>;
  slatProfile: ShapeData[];
  bottomBarProfile: ShapeData[];
}

const MM = 0.001; // mm → meters

export type SashState = 'closed' | 'open_side' | 'open_tilt';

// Helper to compile bezier path commands to a 3D Shape
function createThreeShape(commands: Command[]) {
  const shape = new THREE.Shape();
  commands.forEach((c, idx) => {
    if (idx === 0 || c.cmd === 'moveTo') {
      shape.moveTo(c.x, c.y);
    } else if (c.cmd === 'lineTo') {
      shape.lineTo(c.x, c.y);
    } else if (c.cmd === 'quadraticCurveTo' && c.cpx !== undefined && c.cpy !== undefined) {
      shape.quadraticCurveTo(c.cpx, c.cpy, c.x, c.y);
    }
  });
  shape.closePath();
  return shape;
}

function splitGeometryByNormal(geometry: THREE.BufferGeometry, rotationMatrix: THREE.Matrix4) {
  const nonIndexed = geometry.toNonIndexed();
  const posAttr = nonIndexed.attributes.position;
  const normAttr = nonIndexed.attributes.normal;
  const uvAttr = nonIndexed.attributes.uv;

  if (!posAttr || !normAttr) return { ext: geometry, int: geometry };

  const extPositions: number[] = [];
  const extNormals: number[] = [];
  const extUvs: number[] = [];

  const intPositions: number[] = [];
  const intNormals: number[] = [];
  const intUvs: number[] = [];

  const tempNormal = new THREE.Vector3();

  for (let i = 0; i < posAttr.count; i += 3) {
    let nx = 0, ny = 0, nz = 0;
    for (let j = 0; j < 3; j++) {
      nx += normAttr.getX(i + j);
      ny += normAttr.getY(i + j);
      nz += normAttr.getZ(i + j);
    }
    tempNormal.set(nx / 3, ny / 3, nz / 3).normalize();
    tempNormal.applyMatrix4(rotationMatrix);

    const isExt = tempNormal.z > 0.001;

    for (let j = 0; j < 3; j++) {
      const px = posAttr.getX(i + j);
      const py = posAttr.getY(i + j);
      const pz = posAttr.getZ(i + j);

      const nX = normAttr.getX(i + j);
      const nY = normAttr.getY(i + j);
      const nZ = normAttr.getZ(i + j);

      if (isExt) {
        extPositions.push(px, py, pz);
        extNormals.push(nX, nY, nZ);
        if (uvAttr) {
          extUvs.push(uvAttr.getX(i + j), uvAttr.getY(i + j));
        }
      } else {
        intPositions.push(px, py, pz);
        intNormals.push(nX, nY, nZ);
        if (uvAttr) {
          intUvs.push(uvAttr.getX(i + j), uvAttr.getY(i + j));
        }
      }
    }
  }

  const extGeo = new THREE.BufferGeometry();
  extGeo.setAttribute('position', new THREE.Float32BufferAttribute(extPositions, 3));
  extGeo.setAttribute('normal', new THREE.Float32BufferAttribute(extNormals, 3));
  if (uvAttr && extUvs.length > 0) {
    extGeo.setAttribute('uv', new THREE.Float32BufferAttribute(extUvs, 2));
    extGeo.setAttribute('uv2', new THREE.Float32BufferAttribute(extUvs, 2));
  }
  extGeo.computeBoundingBox();
  extGeo.computeBoundingSphere();

  const intGeo = new THREE.BufferGeometry();
  intGeo.setAttribute('position', new THREE.Float32BufferAttribute(intPositions, 3));
  intGeo.setAttribute('normal', new THREE.Float32BufferAttribute(intNormals, 3));
  if (uvAttr && intUvs.length > 0) {
    intGeo.setAttribute('uv', new THREE.Float32BufferAttribute(intUvs, 2));
    intGeo.setAttribute('uv2', new THREE.Float32BufferAttribute(intUvs, 2));
  }
  intGeo.computeBoundingBox();
  intGeo.computeBoundingSphere();

  return { ext: extGeo, int: intGeo };
}

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
  for (const layerKey in processed.layers) {
    const layer = processed.layers[layerKey];
    const isLeftSash = layerKey.startsWith('L_');
    const isPost = layerKey.startsWith('PST') || layerKey === 'IGE_GSK_MD_MOVABLE_POST' || layerKey.startsWith('GSK_PST');
    const offset = (isLeftSash || isPost) ? 24.00 : 146.00;

    for (const contour of layer.contours) {
      contour.points = contour.points.map((p: any) => ({
        x: 103.0 - p.y, // Swap depth to match frame depth axis
        y: p.x - offset  // Swap width and shift relative to sash start
      }));
    }
  }
  return processed;
};

// ─── Assembly Component ───────────────────────────────────────────────────────

interface AssemblyProps {
  widthMm: number;
  heightMm: number;
  splitRatio: number;
  colorExt: string;
  colorInt: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
  colorBlind?: string;
  leftState: SashState;
  rightState: SashState;
  onLeftStateChange: (state: SashState) => void;
  onRightStateChange: (state: SashState) => void;
  onSceneReady?: (group: THREE.Group) => void;
  isColorPaletteOpen?: boolean;
  showBlindBox: boolean;
  blindOpen: number;
  onBlindOpenChange: (open: number) => void;
}

function F202RAssembly({
  widthMm, heightMm, splitRatio,
  colorExt, colorInt,
  colorExtTexture, colorIntTexture,
  colorGsk = '#1c1c1c',
  colorSpacer = '#4B4B4D',
  colorBlind = '#383e42',
  leftState, rightState,
  onLeftStateChange, onRightStateChange,
  onSceneReady,
  isColorPaletteOpen = false,
  showBlindBox,
  blindOpen,
  onBlindOpenChange,
}: AssemblyProps) {
  const leftSashPivotRef = useRef<THREE.Group>(null!);
  const rightSashPivotRef = useRef<THREE.Group>(null!);
  const rightHandleGroupRef = useRef<THREE.Group>(null!);

  // Blind refs
  const slatsGroupRef = useRef<THREE.Group>(null!);
  const blindProgress = useRef(0);

  const { clock } = useThree();
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  // Process data sources
  const f104Data = f104DataRaw as unknown as ProfileData;
  const movableData = useMemo(() => transformMovableData(movableDataRaw), []);
  const bpd = blindProfileDataRaw as unknown as BlindProfileData;

  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const reportedKey = useRef<string>('');

  useEffect(() => {
    if (groupObj) {
      (window as any).assemblyGroup = groupObj;
      if (onSceneReady) {
        onSceneReady(groupObj);
      }
    }
  }, [groupObj, onSceneReady, widthMm, heightMm, splitRatio, colorExt, colorInt, colorExtTexture, colorIntTexture, colorGsk, colorSpacer]);

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

  // 2. Left Sash Profiles (Passive sash: standard frame-facing profiles & meeting stile + post)
  const leftSshExtOuter  = useMemo(() => getContours(f104Data, 'SSH_EXT'),     []);
  const leftSshIntOuter  = useMemo(() => getContours(f104Data, 'SSH_INT'),     []);
  const leftGskSshExtStd = useMemo(() => getContours(f104Data, 'GSK_SSH_EXT'), []);
  const leftGskSshIntStd = useMemo(() => getContours(f104Data, 'GSK_SSH_INT'), []);
  const leftBzdStd       = useMemo(() => getContours(f104Data, 'BZD'),         []);
  const leftGskBzdStd    = useMemo(() => getContours(f104Data, 'GSK_BZD'),     []);
  const leftSpacerStd    = useMemo(() => getContours(f104Data, 'SPACER'),      []);

  // Left Sash meeting stile profiles (Sourced from new JSON file transformed)
  const leftSshExtMtg    = useMemo(() => getContours(movableData, 'L_SSH_EXT'),     []);
  const leftSshIntMtg    = useMemo(() => getContours(movableData, 'L_SSH_INT'),     []);
  const leftGskSshExtMtg = useMemo(() => getContours(movableData, 'L_GSK_SSH_EXT'), []);
  const leftGskSshIntMtg = useMemo(() => getContours(movableData, 'L_GSK_SSH_INT'), []);
  const leftBzdMtg       = useMemo(() => getContours(movableData, 'L_BZD'),         []);
  const leftGskBzdMtg    = useMemo(() => getContours(movableData, 'L_GSK_BZD'),     []);
  const leftSpacerMtg    = useMemo(() => getContours(movableData, 'L_SPACER'),      []);

  // 3. Right Sash Profiles (Active sash: standard frame-facing profiles & meeting stile)
  const rightSshExtOuter  = useMemo(() => getContours(f104Data, 'SSH_EXT'),     []);
  const rightSshIntOuter  = useMemo(() => getContours(f104Data, 'SSH_INT'),     []);
  const rightGskSshExtStd = useMemo(() => getContours(f104Data, 'GSK_SSH_EXT'), []);
  const rightGskSshIntStd = useMemo(() => getContours(f104Data, 'GSK_SSH_INT'), []);
  const rightBzdStd       = useMemo(() => getContours(f104Data, 'BZD'),         []);
  const rightGskBzdStd    = useMemo(() => getContours(f104Data, 'GSK_BZD'),     []);
  const rightSpacerStd    = useMemo(() => getContours(f104Data, 'SPACER'),      []);

  // Right Sash meeting stile profiles (Sourced from new JSON file transformed)
  const rightSshExtMtg    = useMemo(() => getContours(movableData, 'SSH_EXT'),     []);
  const rightSshIntMtg    = useMemo(() => getContours(movableData, 'SSH_INT'),     []);
  const rightGskSshExtMtg = useMemo(() => getContours(movableData, 'GSK_SSH_EXT'), []);
  const rightGskSshIntMtg = useMemo(() => getContours(movableData, 'GSK_SSH_INT'), []);
  const rightBzdMtg       = useMemo(() => getContours(movableData, 'BZD'),         []);
  const rightGskBzdMtg    = useMemo(() => getContours(movableData, 'GSK_BZD'),     []);
  const rightSpacerMtg    = useMemo(() => getContours(movableData, 'SPACER'),      []);

  // 4. Movable Post profiles (Sourced from new JSON file transformed)
  const pstExt   = useMemo(() => getContours(movableData, 'PST_EXT'),     []);
  const pstInt   = useMemo(() => getContours(movableData, 'PST_INT'),     []);
  const gskPstL  = useMemo(() => getContours(movableData, 'GSK_PST_L'),   []);
  const gskPstR  = useMemo(() => getContours(movableData, 'GSK_PST_R'),   []);
  const gskMd    = useMemo(() => getContours(movableData, 'IGE_GSK_MD_MOVABLE_POST'), []);

  // Glass profile layers
  const glsExtLayerLeft  = useMemo(() => getContours(movableData, 'L_GLS_EXT'), []);
  const glsIntLayerLeft  = useMemo(() => getContours(movableData, 'L_GLS_INT'), []);
  const glsExtLayerRight = useMemo(() => getContours(movableData, 'GLS_EXT'),   []);
  const glsIntLayerRight = useMemo(() => getContours(movableData, 'GLS_INT'),   []);

  // Shared origin: bottom-left corner of the profile (x=0, y=0)
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

  const slatMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    roughness: 0.15,
    metalness: 0.9,
  }), []);

  // Sync colors
  slatMaterial.color.set(colorBlind || colorExt || '#383e42');

  // Extrude settings for box (width of the blind)
  const boxExtrudeSettings = useMemo(() => ({
    depth: W,
    bevelEnabled: false
  }), [W]);

  // Extrude settings for slats (slat length fits inside side rails)
  const slatLength = useMemo(() => W - 0.035, [W]);
  const slatExtrudeSettings = useMemo(() => ({
    depth: slatLength,
    bevelEnabled: false
  }), [slatLength]);

  // Extrude settings for side rails (vertical height)
  const railExtrudeSettings = useMemo(() => ({
    depth: H + 0.005,
    bevelEnabled: false
  }), [H]);

  // 1. Box casing profiles
  const boxGeometries = useMemo(() => {
    const list: THREE.BufferGeometry[] = [];
    Object.entries(bpd.boxProfiles).forEach(([profileName, shapes]) => {
      shapes.forEach(s => {
        const shape = createThreeShape(s.threeShape);
        const points = shape.getPoints();
        const scaledPoints = points.map(p => new THREE.Vector2(p.x * scale, p.y * scale));
        const scaledShape = new THREE.Shape(scaledPoints);
        const geo = new THREE.ExtrudeGeometry(scaledShape, boxExtrudeSettings);
        list.push(geo);
      });
    });
    return list;
  }, [boxExtrudeSettings, scale]);

  // 2. Slat shape
  const slatGeometry = useMemo(() => {
    if (!bpd.slatProfile || bpd.slatProfile.length === 0) return null;
    const s = bpd.slatProfile[0];
    const shape = createThreeShape(s.threeShape);
    const points = shape.getPoints();
    const scaledPoints = points.map(p => new THREE.Vector2(p.x * scale, p.y * scale));
    const scaledShape = new THREE.Shape(scaledPoints);
    return new THREE.ExtrudeGeometry(scaledShape, slatExtrudeSettings);
  }, [slatExtrudeSettings, scale]);

  // 3. Bottom bar shape
  const bottomBarGeometry = useMemo(() => {
    if (!bpd.bottomBarProfile || bpd.bottomBarProfile.length === 0) return null;
    const s = bpd.bottomBarProfile[0];
    const shape = createThreeShape(s.threeShape);
    const points = shape.getPoints();
    const scaledPoints = points.map(p => new THREE.Vector2(p.x * scale, p.y * scale));
    const scaledShape = new THREE.Shape(scaledPoints);
    return new THREE.ExtrudeGeometry(scaledShape, slatExtrudeSettings);
  }, [slatExtrudeSettings, scale]);

  // 4. Side Guide Rails (U-Channel)
  const railGeometry = useMemo(() => {
    const railShape = new THREE.Shape();
    railShape.moveTo(25, 0.8);
    railShape.lineTo(0.0, 0.8);
    railShape.lineTo(0.0, 42.3);
    railShape.lineTo(25, 42.3);
    railShape.lineTo(25, 24.3);
    railShape.lineTo(10, 24.3);
    railShape.lineTo(10, 11.3);
    railShape.lineTo(25, 11.3);
    railShape.closePath();
    const points = railShape.getPoints();
    const scaledPoints = points.map(p => new THREE.Vector2(p.x * scale, p.y * scale));
    const scaledShape = new THREE.Shape(scaledPoints);
    return new THREE.ExtrudeGeometry(scaledShape, railExtrudeSettings);
  }, [railExtrudeSettings, scale]);

  // End cap geometry to close the sides of the box casing
  const capGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(240 * scale, 0);
    shape.lineTo(240 * scale, 245.5 * scale);
    shape.lineTo(0, 245.5 * scale);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.002, // 2mm thickness
      bevelEnabled: false
    });
  }, [scale]);

  const slotZ = -bpd.meta.slotX * scale; // slot depth

  const boxMatrix = useMemo(() => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, Math.PI / 2, 0)), []);
  const railMatrix = useMemo(() => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0)), []);

  const splitBoxGeometries = useMemo(() => {
    return boxGeometries.map(geo => {
      applyUVs(geo, 1, 0, 'triplanar');
      return splitGeometryByNormal(geo, boxMatrix);
    });
  }, [boxGeometries, boxMatrix]);

  const splitRailGeometry = useMemo(() => {
    applyUVs(railGeometry, 1, 0, 'rail');
    return splitGeometryByNormal(railGeometry, railMatrix);
  }, [railGeometry, railMatrix]);

  // Glass pane rendering helper
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

  // Asymmetric glass pane rendering for passive/stulp sash
  const renderAsymmetricGlassPane = (sashWidthMm: number, sashHeightMm: number, glsLayer: Point[][], leftOffset: number, rightOffset: number) => {
    if (glsLayer.length === 0) return null;
    const pts = glsLayer[0];
    let minX = Infinity, maxX = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
    }
    const paneW = sashWidthMm * scale - (leftOffset + rightOffset) * scale;
    const paneH = sashHeightMm * scale - 2 * 99 * scale;
    const thickness = (maxX - minX) * scale;
    const centerDepth = -(((minX + maxX) / 2) - commonOrigin.x) * scale;
    const posX = leftOffset * scale + paneW / 2;

    return (
      <mesh position={[posX, sashHeightMm * scale / 2, centerDepth]} material={glassMat} castShadow={false} receiveShadow={false}>
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
    {leftSshExtOuter.map((c, i) => (
      <FrameSegment key={`stdSshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftSshIntOuter.map((c, i) => (
      <FrameSegment key={`stdSshInt_${i}`} layerName="SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftBzdStd.map((c, i) => (
      <FrameSegment key={`stdBzd_${i}`} layerName="BZD" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        uvMode="rail"
      />
    ))}
    {leftGskBzdStd.map((c, i) => (
      <FrameSegment key={`stdGskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftGskSshIntStd.map((c, i) => (
      <FrameSegment key={`stdGskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftSpacerStd.map((c, i) => (
      <FrameSegment key={`stdSpacer_${i}`} layerName="SPACER" scaleFactor={scale}
        length={len} vertices={c} matType="spacer"
        color={colorSpacer}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftGskSshExtStd.map((c, i) => (
      <FrameSegment key={`stdGskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
  </>);

  // Render left sash meeting stile (Sourced from transformed L_SSH group)
  const renderLeftSashMeetingStile = (len: number, uSign: number, uOff: number) => (<>
    {leftSshExtMtg.map((c, i) => (
      <FrameSegment key={`lMvSshExt_${i}`} layerName="L_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
    {leftSshIntMtg.map((c, i) => (
      <FrameSegment key={`lMvSshInt_${i}`} layerName="L_SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
    {leftBzdMtg.map((c, i) => (
      <FrameSegment key={`lMvBzd_${i}`} layerName="L_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        uvMode="rail"
      />
    ))}
    {leftGskBzdMtg.map((c, i) => (
      <FrameSegment key={`lMvGskBzd_${i}`} layerName="L_GSK_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {leftGskSshIntMtg.map((c, i) => (
      <FrameSegment key={`lMvGskSI_${i}`} layerName="L_GSK_SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
    {leftGskSshExtMtg.map((c, i) => (
      <FrameSegment key={`lMvGskSE_${i}`} layerName="L_GSK_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
    {leftSpacerMtg.map((c, i) => (
      <FrameSegment key={`lMvSpacer_${i}`} layerName="L_SPACER" scaleFactor={scale}
        length={len} vertices={c} matType="spacer"
        color={colorSpacer}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
  </>);

  // Render left sash top/bottom horizontal rails (supports asymmetric shortening for meeting stile)
  const renderLeftSashHorizontalSide = (
    len: number,
    uSign: number,
    uOff: number,
    isTop: boolean
  ) => {
    const shExtGsk  = 142.32;
    const shIntGsk  = 124.42;
    const shSpacer  = 141.5;
    const shBzd     = 126.26;

    const getParams = (shVal: number) => {
      if (isTop) {
        return {
          length: len - shVal,
          posZ: 0,
          skipLeft: false,
          skipRight: true,
        };
      } else {
        return {
          length: len - shVal,
          posZ: shVal * scale,
          skipLeft: true,
          skipRight: false,
        };
      }
    };

    const pExtGsk = getParams(shExtGsk);
    const pIntGsk = getParams(shIntGsk);
    const pSpacer = getParams(shSpacer);
    const pBzd    = getParams(shBzd);

    return (<>
      {leftSshExtOuter.map((c, i) => (
        <FrameSegment key={`lHorSshExt_${isTop ? 'T' : 'B'}_${i}`} layerName="SSH_EXT" scaleFactor={scale}
          length={len} vertices={c} matType="ext"
          color={colorExt} textureUrl={colorExtTexture}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
        />
      ))}
      {leftSshIntOuter.map((c, i) => (
        <FrameSegment key={`lHorSshInt_${isTop ? 'T' : 'B'}_${i}`} layerName="SSH_INT" scaleFactor={scale}
          length={len} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
        />
      ))}
      {leftBzdStd.map((c, i) => (
        <FrameSegment key={`lHorBzd_${isTop ? 'T' : 'B'}_${i}`} layerName="BZD" scaleFactor={scale}
          length={pBzd.length} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          uvMode="rail"
          skipLeftCut={pBzd.skipLeft} skipRightCut={pBzd.skipRight}
          position={[0, 0, pBzd.posZ]}
        />
      ))}
      {leftGskBzdStd.map((c, i) => (
        <FrameSegment key={`lHorGskBzd_${isTop ? 'T' : 'B'}_${i}`} layerName="GSK_BZD" scaleFactor={scale}
          length={pBzd.length} vertices={c} matType="gsk"
          color={colorGsk}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          skipLeftCut={pBzd.skipLeft} skipRightCut={pBzd.skipRight}
          position={[0, 0, pBzd.posZ]}
        />
      ))}
      {leftGskSshIntStd.map((c, i) => (
        <FrameSegment key={`lHorGskSI_${isTop ? 'T' : 'B'}_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale}
          length={pIntGsk.length} vertices={c} matType="gsk"
          color={colorGsk}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          skipLeftCut={pIntGsk.skipLeft} skipRightCut={pIntGsk.skipRight}
          position={[0, 0, pIntGsk.posZ]}
        />
      ))}
      {leftGskSshExtStd.map((c, i) => (
        <FrameSegment key={`lHorGskSE_${isTop ? 'T' : 'B'}_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale}
          length={pExtGsk.length} vertices={c} matType="gsk"
          color={colorGsk}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          skipLeftCut={pExtGsk.skipLeft} skipRightCut={pExtGsk.skipRight}
          position={[0, 0, pExtGsk.posZ]}
        />
      ))}
      {leftSpacerStd.map((c, i) => (
        <FrameSegment key={`lHorSpacer_${isTop ? 'T' : 'B'}_${i}`} layerName="SPACER" scaleFactor={scale}
          length={pSpacer.length} vertices={c} matType="spacer"
          color={colorSpacer}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          skipLeftCut={pSpacer.skipLeft} skipRightCut={pSpacer.skipRight}
          position={[0, 0, pSpacer.posZ]}
        />
      ))}
    </>);
  };

  // Render right sash meeting stile (Sourced from transformed SSH group)
  const renderRightSashMeetingStile = (len: number, uSign: number, uOff: number) => (<>
    {rightSshExtMtg.map((c, i) => (
      <FrameSegment key={`rMvSshExt_${i}`} layerName="SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="ext"
        color={colorExt} textureUrl={colorExtTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
    {rightSshIntMtg.map((c, i) => (
      <FrameSegment key={`rMvSshInt_${i}`} layerName="SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
    {rightBzdMtg.map((c, i) => (
      <FrameSegment key={`rMvBzd_${i}`} layerName="BZD" scaleFactor={scale}
        length={len} vertices={c} matType="int"
        color={colorInt} textureUrl={colorIntTexture}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        uvMode="rail"
      />
    ))}
    {rightGskBzdMtg.map((c, i) => (
      <FrameSegment key={`rMvGskBzd_${i}`} layerName="GSK_BZD" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
      />
    ))}
    {rightGskSshIntMtg.map((c, i) => (
      <FrameSegment key={`rMvGskSI_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
    {rightGskSshExtMtg.map((c, i) => (
      <FrameSegment key={`rMvGskSE_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale}
        length={len} vertices={c} matType="gsk"
        color={colorGsk}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
    {rightSpacerMtg.map((c, i) => (
      <FrameSegment key={`rMvSpacer_${i}`} layerName="SPACER" scaleFactor={scale}
        length={len} vertices={c} matType="spacer"
        color={colorSpacer}
        origin={commonOrigin} uSign={uSign} uOffset={uOff}
        compositeCut={true}
      />
    ))}
  </>);

  // Render right sash top/bottom horizontal rails (supports asymmetric shortening for stulp meeting stile)
  const renderRightSashHorizontalSide = (
    len: number,
    uSign: number,
    uOff: number,
    isTop: boolean
  ) => {
    const shExtGsk  = 142.32;
    const shIntGsk  = 124.42;
    const shSpacer  = 141.5;
    const shBzd     = 126.26;

    const getParams = (shVal: number) => {
      if (isTop) {
        return {
          length: len - shVal,
          posZ: 0,
          skipLeft: false,
          skipRight: true,
        };
      } else {
        return {
          length: len - shVal,
          posZ: shVal * scale,
          skipLeft: true,
          skipRight: false,
        };
      }
    };

    const pExtGsk = getParams(shExtGsk);
    const pIntGsk = getParams(shIntGsk);
    const pSpacer = getParams(shSpacer);
    const pBzd    = getParams(shBzd);

    return (<>
      {rightSshExtOuter.map((c, i) => (
        <FrameSegment key={`rHorSshExt_${isTop ? 'T' : 'B'}_${i}`} layerName="SSH_EXT" scaleFactor={scale}
          length={len} vertices={c} matType="ext"
          color={colorExt} textureUrl={colorExtTexture}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
        />
      ))}
      {rightSshIntOuter.map((c, i) => (
        <FrameSegment key={`rHorSshInt_${isTop ? 'T' : 'B'}_${i}`} layerName="SSH_INT" scaleFactor={scale}
          length={len} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
        />
      ))}
      {rightBzdStd.map((c, i) => (
        <FrameSegment key={`rHorBzd_${isTop ? 'T' : 'B'}_${i}`} layerName="BZD" scaleFactor={scale}
          length={pBzd.length} vertices={c} matType="int"
          color={colorInt} textureUrl={colorIntTexture}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          uvMode="rail"
          skipLeftCut={pBzd.skipLeft} skipRightCut={pBzd.skipRight}
          position={[0, 0, pBzd.posZ]}
        />
      ))}
      {rightGskBzdStd.map((c, i) => (
        <FrameSegment key={`rHorGskBzd_${isTop ? 'T' : 'B'}_${i}`} layerName="GSK_BZD" scaleFactor={scale}
          length={pBzd.length} vertices={c} matType="gsk"
          color={colorGsk}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          skipLeftCut={pBzd.skipLeft} skipRightCut={pBzd.skipRight}
          position={[0, 0, pBzd.posZ]}
        />
      ))}
      {rightGskSshIntStd.map((c, i) => (
        <FrameSegment key={`rHorGskSI_${isTop ? 'T' : 'B'}_${i}`} layerName="GSK_SSH_INT" scaleFactor={scale}
          length={pIntGsk.length} vertices={c} matType="gsk"
          color={colorGsk}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          skipLeftCut={pIntGsk.skipLeft} skipRightCut={pIntGsk.skipRight}
          position={[0, 0, pIntGsk.posZ]}
        />
      ))}
      {rightGskSshExtStd.map((c, i) => (
        <FrameSegment key={`rHorGskSE_${isTop ? 'T' : 'B'}_${i}`} layerName="GSK_SSH_EXT" scaleFactor={scale}
          length={pExtGsk.length} vertices={c} matType="gsk"
          color={colorGsk}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          skipLeftCut={pExtGsk.skipLeft} skipRightCut={pExtGsk.skipRight}
          position={[0, 0, pExtGsk.posZ]}
        />
      ))}
      {rightSpacerStd.map((c, i) => (
        <FrameSegment key={`rHorSpacer_${isTop ? 'T' : 'B'}_${i}`} layerName="SPACER" scaleFactor={scale}
          length={pSpacer.length} vertices={c} matType="spacer"
          color={colorSpacer}
          origin={commonOrigin} uSign={uSign} uOffset={uOff}
          skipLeftCut={pSpacer.skipLeft} skipRightCut={pSpacer.skipRight}
          position={[0, 0, pSpacer.posZ]}
        />
      ))}
    </>);
  };

  // Render Movable Post profiles
  const renderMovablePost = (sashHeightMm: number) => {
    // PST_EXT: trimmed 75 mm shorter on top and bottom (150 mm total)
    const extLenMm = sashHeightMm - 150;
    const extPos: [number, number, number] = [0, 0, 75 * scale];

    // PST_INT: trimmed 48 mm shorter on top and bottom (96 mm total)
    const intLenMm = sashHeightMm - 96;
    const intPos: [number, number, number] = [0, 0, 48 * scale];

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
      {gskMd.map((c, i) => (
        <FrameSegment key={`gskMd_${i}`} layerName="IGE_GSK_MD_MOVABLE_POST" scaleFactor={scale}
          length={extLenMm} vertices={c} matType="gsk"
          color={colorGsk}
          origin={commonOrigin} skipCuts={true} position={extPos}
        />
      ))}
    </>);
  };

  // Dimensions & Overlap calculations (Right Sash is Active, Left Sash is Passive holding Movable Post)
  const splitX = widthMm * splitRatio;

  // Horizontal rail length for passive Left Sash (minus overlap stile width)
  const W_sash_left = (splitX - 118) * scale;

  // Right Sash group starts at splitX + 4mm
  const rightSashX = (splitX + 4) * scale;

  // Left Sash width (Active/Passive equal width sashes)
  const Ww_left = W_sash_left + 114 * scale;
  // Right Sash width
  const Ww_right = W - rightSashX; 

  // Hinge/pivot settings (sash outer boundaries start at 50mm, depth at 82.0mm)
  // pivotZ = -82.0 * scale exactly as mandated by GEMINI.md
  const leftPivotX = 50 * scale;
  const leftPivotY = 50 * scale;
  const leftPivotZ = -82.0 * scale;

  const rightPivotX = Ww_right - 50 * scale; // Pivot 50mm from the right stile in local coordinates
  const rightPivotY = 50 * scale;
  const rightPivotZ = -82.0 * scale;

  // Handle position on active (right) sash meeting stile (X is 83mm from its left edge)
  const handleHeightMm = getHandleHeight(heightMm);
  const handleY = handleHeightMm * scale;

  const sshIntMaxX = useMemo(() => {
    if (rightSshIntOuter.length === 0) return 90;
    return Math.max(...rightSshIntOuter.map(c => Math.max(...c.map(p => p.x))));
  }, [rightSshIntOuter]);

  const handleX = 83 * scale; // Placed on left meeting stile of active right sash
  const handleZ = - sshIntMaxX * scale - 60 * scale;

  // Animation values refs
  const currentLeftSide = useRef(0);
  const currentRightSide = useRef(0);
  const currentRightTilt = useRef(0);
  const currentHandle = useRef(0);

  const leftAnimStateRef = useRef({ startSide: 0, targetSide: 0, startTime: 0, duration: 1.2 });
  const rightAnimStateRef = useRef({ startSide: 0, targetSide: 0, startTilt: 0, targetTilt: 0, startHandle: 0, targetHandle: 0, startTime: 0, duration: 1.2 });

  // Update Left Sash Animation Targets (Passive)
  useEffect(() => {
    const s = leftAnimStateRef.current;
    s.startSide = currentLeftSide.current;
    s.targetSide = leftState === 'open_side' ? (110 * Math.PI / 180) : 0; // Rotates positive Y
    s.startTime = clock.getElapsedTime();
    s.duration = leftState === 'open_side' ? 2.4 : 1.2;
  }, [leftState, clock]);

  // Update Right Sash Animation Targets (Active)
  useEffect(() => {
    const s = rightAnimStateRef.current;
    s.startSide = currentRightSide.current;
    s.targetSide = rightState === 'open_side' ? (-110 * Math.PI / 180) : 0; // Rotates negative Y
    s.startTilt = currentRightTilt.current;
    s.targetTilt = rightState === 'open_tilt' ? -Math.asin(150 / heightMm) : 0; // Dynamic tilt scissor clamp Math.asin(150 / height)
    s.startHandle = currentHandle.current;
    s.targetHandle = rightState === 'open_side' ? -Math.PI / 2 : (rightState === 'open_tilt' ? -Math.PI : 0);
    s.startTime = clock.getElapsedTime();
    s.duration = rightState !== 'closed' ? 2.4 : 1.2;
  }, [rightState, clock, heightMm]);

  // Calculate number of slats needed to fill the height
  const slatsArray = useMemo(() => {
    const bottomBarH = bpd.meta.bottomBarHeight * scale;
    const slatExposureH = 0.037;
    const count = Math.ceil((H - bottomBarH) / slatExposureH) + 1;
    return Array.from({ length: count }, (_, i) => i);
  }, [H, scale]);

  useFrame((state) => {
    if (groupObj && onSceneReady) {
      const currentKey = `${groupObj.children.length}_${widthMm}_${heightMm}_${splitRatio}_${colorExt}_${colorInt}_${colorExtTexture}_${colorIntTexture}_${colorGsk}_${colorSpacer}`;
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

    // ── Roller Blinds Animation Update ────────────────────────
    if (showBlindBox) {
      const blindTarget = blindOpen;
      blindProgress.current += (blindTarget - blindProgress.current) * 0.001;
      if (Math.abs(blindProgress.current - blindTarget) < 0.001) {
        blindProgress.current = blindTarget;
      }

      const t = blindProgress.current;

      if (slatsGroupRef.current) {
        const bottomBarH = bpd.meta.bottomBarHeight * scale;
        const slatExposureH = 0.037;
        const startY = -bottomBarH;
        const bottomBarPos = -H * (1 - t) + startY * t;

        // Update bottom bar position
        const bottomBarMesh = slatsGroupRef.current.getObjectByName('bottomBar');
        if (bottomBarMesh) {
          bottomBarMesh.position.y = bottomBarPos;
        }

        // Update slats positions
        const children = slatsGroupRef.current.children;
        let slatIndex = 0;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.name.startsWith('slat_')) {
            const y_closed = -H + bottomBarH + slatIndex * slatExposureH;
            const y_open = startY + slatIndex * 0.002;
            const currY = y_closed * (1 - t) + y_open * t;
            child.position.y = currY;
            child.visible = currY < 0.02;
            slatIndex++;
          }
        }
      }
    }

    // ── Left Sash Update (Passive) ────────────────────────
    if (leftSashPivotRef.current) {
      const s = leftAnimStateRef.current;
      const elapsed = state.clock.getElapsedTime() - s.startTime;
      let t = Math.min(elapsed / s.duration, 1.0);
      let p = ease(t);
      if (s.targetSide !== 0) {
        p = openAnimationProgress(t);
      }

      currentLeftSide.current = s.startSide + (s.targetSide - s.startSide) * p;
      leftSashPivotRef.current.rotation.y = currentLeftSide.current;
      leftSashPivotRef.current.rotation.x = 0;
    }

    // ── Right Sash Update (Active) ────────────────────────
    if (rightSashPivotRef.current) {
      const s = rightAnimStateRef.current;
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

      currentRightSide.current = s.startSide + (s.targetSide - s.startSide) * t_sash;
      currentRightTilt.current = s.startTilt + (s.targetTilt - s.startTilt) * t_sash;
      currentHandle.current = s.startHandle + (s.targetHandle - s.startHandle) * t_handle;
      
      rightSashPivotRef.current.rotation.y = currentRightSide.current;
      rightSashPivotRef.current.rotation.x = currentRightTilt.current;

      if (rightHandleGroupRef.current) {
        let handleObj = rightHandleGroupRef.current.getObjectByName('Handle') || 
                        rightHandleGroupRef.current.getObjectByName('handle') || 
                        rightHandleGroupRef.current.getObjectByName('Pencere_Kulbu');
        
        if (!handleObj) {
          rightHandleGroupRef.current.traverse((child: any) => {
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

      {/* ── Inactive Left Sash (Holds Movable Post, Turn only) ── */}
      <group position={[0, 0, 0]}>
        <group position={[leftPivotX, leftPivotY, leftPivotZ]} name="leftPivotGroup">
          <group ref={leftSashPivotRef} name="leftSashPivot">
            <group position={[-leftPivotX, -leftPivotY, -leftPivotZ]}>
              {/* Bottom rail (shortened on the right for meeting stile) */}
              <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderLeftSashHorizontalSide(W_sash_left / scale, 1, 0, false)}</group></group>
              {/* Left stile (meets left frame, standard F104) */}
              <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderStandardSashSide(heightMm, -1, Ww_left / scale - heightMm)}
                </group>
              </group>
              {/* Top rail */}
              <group position={[W_sash_left, H, 0]} rotation={[0, 0, Math.PI]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderLeftSashHorizontalSide(W_sash_left / scale, 1, (W_sash_left / scale) - heightMm, true)}
                </group>
              </group>
              {/* Right meeting stile (L_SSH from new JSON, runs down) */}
              <group position={[Ww_left, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderLeftSashMeetingStile(heightMm, -1, Ww_left / scale)}
                  {renderMovablePost(heightMm)}
                </group>
              </group>
              
              {/* Glass Pane */}
              {renderAsymmetricGlassPane(Ww_left / scale, heightMm, glsExtLayerLeft, 99, 137)}
              {renderAsymmetricGlassPane(Ww_left / scale, heightMm, glsIntLayerLeft, 99, 137)}

              {/* Click hotspot to trigger Inactive Left Sash state changes */}
              {!isColorPaletteOpen && (
                <Html position={[Ww_left - 80 * scale, handleY, -89.0 * scale]} center>
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
              )}

              {/* Large L Indicator */}
              <Html position={[Ww_left / 2, heightMm * scale / 2, 5 * scale]} center>
                <div style={{
                  fontSize: '96px',
                  color: 'rgba(234, 182, 118, 0.85)',
                  textShadow: '0 0 16px rgba(0, 0, 0, 0.9)',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900
                }}>
                  L
                </div>
              </Html>
            </group>
          </group>
        </group>
      </group>

      {/* ── Active Right Sash (Opens & Tilts, handle, standard outer + meeting stile) ── */}
      <group position={[rightSashX, 0, 0]}>
        <group position={[rightPivotX, rightPivotY, rightPivotZ]} name="rightPivotGroup">
          <group ref={rightSashPivotRef} name="rightSashPivot">
            <group position={[-rightPivotX, -rightPivotY, -rightPivotZ]}>
              {/* Bottom rail (shortened on left for meeting stile) */}
              <group rotation={[0, 0, 0]}><group rotation={[0, Math.PI / 2, 0]}>{renderRightSashHorizontalSide(Ww_right / scale, 1, 108, false)}</group></group>
              {/* Right stile (meets right frame, standard F104) */}
              <group position={[Ww_right, 0, 0]} rotation={[0, 0, Math.PI / 2]}><group rotation={[0, Math.PI / 2, 0]}>{renderStandardSashSide(heightMm, -1, Ww_right / scale)}</group></group>
              {/* Top rail */}
              <group position={[Ww_right, H, 0]} rotation={[0, 0, Math.PI]}><group rotation={[0, Math.PI / 2, 0]}>{renderRightSashHorizontalSide(Ww_right / scale, 1, (Ww_right / scale) - heightMm, true)}</group></group>
              {/* Left meeting stile (SSH from new JSON, runs down) */}
              <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
                <group rotation={[0, Math.PI / 2, 0]}>
                  {renderRightSashMeetingStile(heightMm, -1, Ww_right / scale)}
                </group>
              </group>
              
              {renderAsymmetricGlassPane(Ww_right / scale, heightMm, glsExtLayerRight, 137, 99)}
              {renderAsymmetricGlassPane(Ww_right / scale, heightMm, glsIntLayerRight, 137, 99)}

              {/* Click hotspots to trigger Right Sash state changes */}
              {!isColorPaletteOpen && (
                <>
                  {/* Turn hotspot */}
                  <Html position={[handleX, handleY, handleZ]} center>
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

                  {/* Tilt hotspot */}
                  <Html position={[handleX, H - 75 * scale, handleZ]} center>
                    <div
                      className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                      style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                      onClick={(e) => { e.stopPropagation(); onRightStateChange(rightState === 'open_tilt' ? 'closed' : 'open_tilt'); }}
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
                ref={rightHandleGroupRef} 
                name="rightHandleGroup"
                position={[handleX, handleY, handleZ]} 
                rotation={[Math.PI / 2, Math.PI, 0]}
                scale={[0.025, 0.025, 0.025]}
              >
                <primitive object={clonedHandle} />
              </group>

              {/* Large R Indicator */}
              <Html position={[Ww_right / 2, heightMm * scale / 2, 5 * scale]} center>
                <div style={{
                  fontSize: '96px',
                  color: 'rgba(234, 182, 118, 0.85)',
                  textShadow: '0 0 16px rgba(0, 0, 0, 0.9)',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900
                }}>
                  R
                </div>
              </Html>
            </group>
          </group>
        </group>
      </group>

      {/* ── Roller Blind Box Casing, Guide Rails, and rolling slats ── */}
      {showBlindBox && (
        <group position={[0, H, 0]}>
          {/* 1. Box casing profiles (extruded horizontally) */}
          <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            {splitBoxGeometries.map((split, idx) => (
              <group key={idx}>
                <mesh geometry={split.ext} castShadow receiveShadow>
                  <SegmentMaterial matType="ext" color={colorExt} textureUrl={colorExtTexture} />
                </mesh>
                <mesh geometry={split.int} castShadow receiveShadow>
                  <SegmentMaterial matType="int" color={colorInt} textureUrl={colorIntTexture} />
                </mesh>
              </group>
            ))}
            {/* Left End Cap */}
            <mesh geometry={capGeometry} position={[0, 0, -0.0021]} castShadow receiveShadow>
              <SegmentMaterial matType="int" color={colorInt} textureUrl={colorIntTexture} />
            </mesh>
            {/* Right End Cap */}
            <mesh geometry={capGeometry} position={[0, 0, W + 0.0001]} castShadow receiveShadow>
              <SegmentMaterial matType="int" color={colorInt} textureUrl={colorIntTexture} />
            </mesh>
          </group>

          {/* 2. Side Guide Rails */}
          <group position={[0, -H, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <mesh geometry={splitRailGeometry.ext} castShadow receiveShadow>
              <SegmentMaterial matType="ext" color={colorExt} textureUrl={colorExtTexture} />
            </mesh>
            <mesh geometry={splitRailGeometry.int} castShadow receiveShadow>
              <SegmentMaterial matType="int" color={colorInt} textureUrl={colorIntTexture} />
            </mesh>
          </group>
          <group position={[W, -H, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[-1, 1, 1]}>
            <mesh geometry={splitRailGeometry.ext} castShadow receiveShadow>
              <SegmentMaterial matType="ext" color={colorExt} textureUrl={colorExtTexture} />
            </mesh>
            <mesh geometry={splitRailGeometry.int} castShadow receiveShadow>
              <SegmentMaterial matType="int" color={colorInt} textureUrl={colorIntTexture} />
            </mesh>
          </group>

          {/* 3. Slats stack & bottom bar */}
          <group ref={slatsGroupRef}>
            {/* Slats */}
            {slatGeometry && slatsArray.map((idx) => (
              <group 
                key={idx} 
                name={`slat_${idx}`}
                position={[0.0175, 0, slotZ]} 
                rotation={[0, Math.PI / 2, 0]}
              >
                <mesh geometry={slatGeometry} material={slatMaterial} castShadow receiveShadow />
              </group>
            ))}

            {/* Bottom bar */}
            {bottomBarGeometry && (
              <group 
                name="bottomBar"
                position={[0.0175, 0, slotZ]} 
                rotation={[0, Math.PI / 2, 0]}
              >
                <mesh geometry={bottomBarGeometry} material={slatMaterial} castShadow receiveShadow />
              </group>
            )}
          </group>

          {/* 4. Blinds control hotspot */}
          {!isColorPaletteOpen && (
            <Html position={[W / 2, -0.12, slotZ - 20 * scale]} center>
              <div
                onClick={() => onBlindOpenChange(blindOpen > 0.5 ? 0.0 : 1.0)}
                title={blindOpen > 0.5 ? 'Close blinds' : 'Open blinds'}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'rgba(7,7,18,0.88)',
                  border: '1px solid rgba(234,182,118,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                  color: '#eab676',
                }}
                className="transition-all hover:scale-105"
              >
                <span style={{ fontSize: '12px', transform: `rotate(${blindOpen > 0.5 ? 180 : 0}deg)`, transition: 'transform 0.3s' }}>
                  ▼
                </span>
              </div>
            </Html>
          )}
        </group>
      )}
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
  splitRatio = 0.5,
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
  hasRollerShutter = true,
  showBlindBox: showBlindBoxProp,
  onShowBlindBoxChange,
  blindOpen: blindOpenProp,
  onBlindOpenChange,
}) => {
  const { t } = useTranslation();
  const [widthText,  setWidthText]  = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());
  const [mountHeavy, setMountHeavy] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [leftState, setLeftState] = useState<SashState>('closed');
  const [rightState, setRightState] = useState<SashState>('closed');

  // Internal state fallbacks if not controlled
  const [showBlindBoxInternal, setShowBlindBoxInternal] = useState(hasRollerShutter);
  const [blindOpenInternal, setBlindOpenInternal] = useState(0.0);

  const showBlindBox = showBlindBoxProp !== undefined ? showBlindBoxProp : showBlindBoxInternal;
  const blindOpen = blindOpenProp !== undefined ? blindOpenProp : blindOpenInternal;

  const setShowBlindBox = (val: boolean) => {
    if (onShowBlindBoxChange) onShowBlindBoxChange(val);
    else setShowBlindBoxInternal(val);
  };
  const setBlindOpen = (val: number) => {
    if (onBlindOpenChange) onBlindOpenChange(val);
    else setBlindOpenInternal(val);
  };

  const controlsRef = useRef<any>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const minW = activeLimits?.minWidth  || 600; 
  const maxW = activeLimits?.maxWidth  || 3000; 
  const minH = activeLimits?.minHeight || 400; 
  const maxH = activeLimits?.maxHeight || 2400; 

  useEffect(() => {
    setMountHeavy(false);
    const t = setTimeout(() => setMountHeavy(true), 80);
    return () => clearTimeout(t);
  }, [width, height, splitRatio]);

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
    if (state === 'open_side' && rightState !== 'open_side') {
      return; 
    }
    setLeftState(state);
    setAutoRotate(false);
  }, [rightState]);

  const handleRightInteraction = useCallback((state: SashState) => {
    if (state === 'closed' || state === 'open_tilt') {
      setLeftState('closed'); 
    }
    setRightState(state);
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
              splitRatio={splitRatio}
              colorExt={colorExt}
              colorInt={colorInt}
              colorExtTexture={colorExtTexture}
              colorIntTexture={colorIntTexture}
              colorGsk={colorGsk}
              colorSpacer={colorSpacer}
              colorBlind={colorExt}
              leftState={leftState}
              rightState={rightState}
              onLeftStateChange={handleLeftInteraction}
              onRightStateChange={handleRightInteraction}
              onSceneReady={onSceneReady}
              isColorPaletteOpen={isColorPaletteOpen}
              showBlindBox={showBlindBox}
              blindOpen={blindOpen}
              onBlindOpenChange={setBlindOpen}
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
              Double Sash Active Right
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
