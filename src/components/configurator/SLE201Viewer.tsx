import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { FrameSegment } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import profileDataRaw from '../../data/profiles/IgloEdge/SLE201.json';
import doorPostDataRaw from '../../data/profiles/IgloEdge/SLE201_DoorPost.json';

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}

const pd = profileDataRaw as unknown as ProfileData;
const dpd = doorPostDataRaw as unknown as ProfileData;
const MM = 0.001;

// ── Layer registry ────────────────────────────────────────────────────────────
const layerConfigs: {
  name: string;
  matType: 'ext' | 'int' | 'gsk' | 'spacer';
  colorType: 'ext' | 'int' | 'gsk' | 'spacer' | 'rail' | 'hidden' | 'steel';
  uvMode?: 'triplanar' | 'rail';
}[] = [
  { name: 'BottomTop_EXT',               matType: 'ext',    colorType: 'ext'    },
  { name: 'BottomTop_INT',               matType: 'int',    colorType: 'int'    },
  { name: 'DOOR_FRM_EXT',               matType: 'ext',    colorType: 'ext'    },
  { name: 'DOOR_FRM_INT',               matType: 'int',    colorType: 'int'    },
  { name: 'Profile cover exterior',     matType: 'ext',    colorType: 'ext'    },
  { name: 'BZD',                        matType: 'int',    colorType: 'int',   uvMode: 'rail' },
  { name: 'Aluminium Rail',             matType: 'spacer', colorType: 'rail'   },
  { name: 'Spacer',                     matType: 'spacer', colorType: 'spacer' },
  { name: 'GSK_BZD',                   matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_SEAL_DOOR',             matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_EXT_DOOR_GLS',          matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_LARGE_UNDERNEATH_DOOR', matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_HIDDEN_PIECE_EXT',      matType: 'gsk',    colorType: 'gsk'    },
];

// Child1 = active sliding sash layers
const CHILD1_LAYERS = new Set([
  'DOOR_FRM_EXT', 'DOOR_FRM_INT', 'BZD', 'GSK_BZD',
  'GSK_SEAL_DOOR', 'Spacer', 'GSK_EXT_DOOR_GLS', 'Profil stal',
]);
const isChild1 = (name: string) => CHILD1_LAYERS.has(name);
const isChild2 = (name: string) => !CHILD1_LAYERS.has(name);

const doorPostLayerConfigs: {
  name: string;
  matType: 'ext' | 'int' | 'gsk' | 'spacer';
  colorType: 'ext' | 'int' | 'gsk' | 'spacer' | 'rail' | 'hidden' | 'steel';
  uvMode?: 'triplanar' | 'rail';
}[] = [
  { name: 'DOOR_POST_FRM_EXT',          matType: 'ext',    colorType: 'ext'    },
  { name: 'PROFILE FOR EXTERNAL GASKET',matType: 'ext',    colorType: 'ext'    },
  { name: 'DOOR_POST_FRM_INT',          matType: 'int',    colorType: 'int'    },
  { name: 'Cover_panel_Door_INT',       matType: 'int',    colorType: 'int'    },
  { name: 'BZD',                        matType: 'int',    colorType: 'int', uvMode: 'rail' },
  { name: 'GSK_BZD',                    matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_DOOR_POST_EXT_GLS_EXT',  matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_DOOR_VERTICAL_EXTERIOR', matType: 'gsk',    colorType: 'gsk'    },
  { name: 'SPACER',                     matType: 'spacer', colorType: 'spacer' },
];

export interface SLE201ViewerProps {
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
  hasRollerShutter?: boolean;
}

// ─── Animation state ──────────────────────────────────────────────────────────
type SlidingState = 'closed' | 'opening' | 'open' | 'closing';

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

interface SlidingSceneProps extends Required<Omit<SLE201ViewerProps, 'onSceneReady' | 'onDimensionChange' | 'activeLimits' | 'hidePill' | 'isColorPaletteOpen' | 'hasRollerShutter'>> {
  onSceneReady?: (group: THREE.Group) => void;
  isColorPaletteOpen?: boolean;
  showBlindBox?: boolean;
  blindTilt?: number;
}

// ─── Inner scene (must live inside <Canvas> for useFrame / useGLTF) ──────────
function SlidingScene({
  width, height,
  colorExt, colorInt,
  colorExtTexture, colorIntTexture,
  colorGsk, colorSpacer,
  onSceneReady,
  isColorPaletteOpen = false,
  showBlindBox = false,
  blindTilt = 0.4,
}: SlidingSceneProps) {
  const scale = MM;
  const W = width  * scale;
  const H = height * scale;

  const CAD_HEIGHT = 324.7586;
  const deltaY     = (height - CAD_HEIGHT) * scale;
  const origin     = { x: 0, y: 0 };

  // Geometry analysis (from profile data — World_Z = -x_prof * MM):
  //   Child1 x_prof: 98–180 mm. Camera is at Z ≈ -2000mm (negative Z).
  //   INTERIOR face (visible from inside room) = MAXIMUM x_prof = 180mm → World_Z = -180mm
  //   EXTERIOR face = minimum x_prof = 98mm → World_Z = -98mm
  const SASH_INTERIOR_Z = -180 * scale;  // interior face (facing camera / room)

  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const reportedKey = useRef<string>('');

  useEffect(() => {
    if (groupObj && onSceneReady) {
      onSceneReady(groupObj);
    }
  }, [groupObj, onSceneReady, width, height, colorExt, colorInt, colorExtTexture, colorIntTexture, colorGsk, colorSpacer]);

  // ── Animation state ─────────────────────────────────────────────────────────
  const [slidingState, setSlidingState] = useState<SlidingState>('closed');
  const handleAngle = useRef(0);   // 0 → Math.PI  (lever rotates 180°)
  const sashFwd     = useRef(0);   // 0 → -10 MM   (toward camera = −Z, camera is at negative Z)
  const sashLeft    = useRef(0);   // 0 → -1000 MM (slide left = −X)

  const sashGroupRef  = useRef<THREE.Group>(null!);
  const handleRef     = useRef<THREE.Group>(null!);

  const anim = useRef({ dir: 1 as 1 | -1, phase: 0 as 0|1|2|3, t0: 0, dur: 1 });

  // ── Roller blinds states & refs ─────────────────────────────────────────────
  const [blindOpen, setBlindOpen] = useState(false);
  const blindProgress = useRef(0);
  const slatsGroupRef = useRef<THREE.Group>(null);
  const cordsGroupRef = useRef<THREE.Group>(null);

  // ── Roller blinds materials ──────────────────────────────────────────────────
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

  // ── Handle GLB ──────────────────────────────────────────────────────────────
  const { scene: handleScene } = useGLTF('/sliding_door_handle_IGLS.glb');
  const clonedHandle = useMemo(() => {
    const c = handleScene.clone(true);
    // Center the handle nodes relative to the baseplate/washer center.
    // The baseplate/washer center in the GLB is at X ≈ 16.5038, Y ≈ -0.0775, Z ≈ 0.
    c.children.forEach((node: any) => {
      node.position.x -= 16.503816604614258;
      node.position.y -= -0.07755661010742188;
    });
    c.traverse((o: any) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return c;
  }, [handleScene]);

  // ── Kick animation when state changes ───────────────────────────────────────
  useEffect(() => {
    const a = anim.current;
    if (slidingState === 'opening') { a.dir = 1;  a.phase = 1; a.t0 = 0; a.dur = 0.8; }
    if (slidingState === 'closing') { a.dir = -1; a.phase = 3; a.t0 = 0; a.dur = 1.8; }
  }, [slidingState]);

  const ease = (x: number) => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2, 2)/2;

  useFrame((state) => {
    if (groupObj && onSceneReady) {
      const currentKey = `${groupObj.children.length}_${width}_${height}_${colorExt}_${colorInt}_${colorExtTexture}_${colorIntTexture}_${colorGsk}_${colorSpacer}`;
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

    const a = anim.current;
    if (a.phase === 0) return;

    if (a.t0 === 0) a.t0 = state.clock.getElapsedTime();
    const raw = Math.min((state.clock.getElapsedTime() - a.t0) / a.dur, 1);
    const t   = ease(raw);

    const next = (ph: 0|1|2|3, dur: number) => {
      a.phase = ph; a.t0 = 0; a.dur = dur;
      if (ph === 0) setSlidingState(a.dir === 1 ? 'open' : 'closed');
    };

    if (a.dir === 1) {
      // OPENING: Phase1=handle CW, Phase2=sash toward camera (−Z), Phase3=slide LEFT (+X, toward X=W)
      if      (a.phase === 1) { handleAngle.current = Math.PI * t;                                                  if (raw>=1) next(2, 1.2); }
      else if (a.phase === 2) { handleAngle.current = Math.PI; sashFwd.current = -10*MM*t;                     if (raw>=1) next(3, 2.8); }
      else if (a.phase === 3) { handleAngle.current = Math.PI; sashFwd.current = -10*MM; sashLeft.current = +1000*MM*t; if (raw>=1) next(0,0); }
    } else {
      // CLOSING: Phase3=slide back to X=0, Phase2=retract from camera, Phase1=handle back
      if      (a.phase === 3) { sashLeft.current = +1000*MM*(1-t); sashFwd.current = -10*MM;                   if (raw>=1) next(2, 1.2); }
      else if (a.phase === 2) { sashLeft.current = 0; sashFwd.current = -10*MM*(1-t);                          if (raw>=1) next(1, 0.8); }
      else if (a.phase === 1) { sashLeft.current = 0; sashFwd.current = 0; handleAngle.current = Math.PI*(1-t); if (raw>=1) { handleAngle.current=0; next(0,0); } }
    }

    // Apply sash group transform
    if (sashGroupRef.current) {
      sashGroupRef.current.position.set(sashLeft.current, 0, sashFwd.current);
    }

    // Apply handle lever rotation
    if (handleRef.current) {
      let lever: THREE.Object3D | undefined =
        handleRef.current.getObjectByName('Handle') ??
        handleRef.current.getObjectByName('handle') ??
        handleRef.current.getObjectByName('Pencere_Kulbu');
      if (!lever) {
        handleRef.current.traverse((c: any) => {
          if (!lever && c.isMesh && !c.name.toLowerCase().includes('base')) lever = c;
        });
      }
      if (lever) (lever as any).rotation.z = -handleAngle.current;
    }
  });

  // ── Color helpers ─────────────────────────────────────────────────────────
  const getCentY = (pts: Point[]) => pts.reduce((s, p) => s + p.y, 0) / (pts.length || 1);

  const getColor = (ct: string) => {
    switch (ct) {
      case 'ext': return colorExt; case 'int': return colorInt;
      case 'gsk': return colorGsk; case 'spacer': return colorSpacer;
      case 'rail': return '#d0d5dd'; case 'hidden': return '#555'; case 'steel': return '#888';
      default: return '#fff';
    }
  };
  const getTex = (ct: string) => ct === 'ext' ? colorExtTexture : ct === 'int' ? colorIntTexture : undefined;

  const glassMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#ffffff',
    metalness: 0.0,
    roughness: 0.0,
    transmission: 1.0,
    ior: 1.5,
    thickness: 5 * MM,
    transparent: true,
    opacity: 0.05,
  }), []);

  // ── Shared FrameSegment builder ───────────────────────────────────────────
  const makeSegment = (cfg: typeof layerConfigs[0], contour: Contour, i: number, keyPfx: string, extra?: any) => {
    const isSkipCutLayer = false;
    return (
      <FrameSegment
        key={`${keyPfx}_${cfg.name}_${i}`}
        layerName={cfg.name}      scaleFactor={scale}
        length={width}            vertices={contour.points}
        matType={cfg.matType}     color={getColor(cfg.colorType)}
        textureUrl={getTex(cfg.colorType)} origin={origin}
        skipCuts={isSkipCutLayer}
        {...extra}
      />
    );
  };

  // ── CHILD2 (fixed outer frame) renderers ──────────────────────────────────
  /** Child2 bottom horizontal rail — fixed */
  const renderFrameBottom = () => layerConfigs.flatMap(cfg => {
    if (!isChild2(cfg.name)) return [];
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    return layer.contours
      .filter(c => getCentY(c.points) < 150)
      .map((c, i) => makeSegment(cfg, c, i, 'fb', { skipLeftCut: false, skipRightCut: true }));
  });

  /** Child2 top horizontal rail — fixed */
  const renderFrameTop = () => layerConfigs.flatMap(cfg => {
    if (!isChild2(cfg.name)) return [];
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    return layer.contours
      .filter(c => getCentY(c.points) > 180)
      .map((c, i) => makeSegment(cfg, c, i, 'ft', {
        skipLeftCut: false, skipRightCut: true,
        invertCuts: true, leftCutYOffset: CAD_HEIGHT * scale,
      }));
  });

  /** Child2 right vertical jamb — fixed */
  const renderFrameVertical = () => layerConfigs.flatMap(cfg => {
    if (!isChild2(cfg.name)) return [];
    if (cfg.name === 'Aluminium Rail') return [];
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours.filter(c => getCentY(c.points) < 150);
    const isSkipCutLayer = false;
    return contours.length === 0 ? [] : [(
      <group key={`fv_${cfg.name}`} position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
        {contours.map((c, i) => (
          <FrameSegment
            key={`fv_seg_${cfg.name}_${i}`}
            layerName={cfg.name}   scaleFactor={scale}
            length={height}        vertices={c.points}
            matType={cfg.matType}  color={getColor(cfg.colorType)}
            textureUrl={getTex(cfg.colorType)} origin={origin}
            rotation={[0, Math.PI / 2, 0]}
            skipCuts={isSkipCutLayer}
            skipLeftCut={false} skipRightCut={false}
            invertCuts={false}  uSign={-1} uOffset={0}
          />
        ))}
      </group>
    )];
  });

  // ── CHILD1 (sliding sash) renderers ───────────────────────────────────────
  /** Child1 bottom rail — rides with sash */
  const renderSashBottom = () => layerConfigs.flatMap(cfg => {
    if (!isChild1(cfg.name)) return [];
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    return layer.contours
      .filter(c => getCentY(c.points) < 150)
      .map((c, i) => makeSegment(cfg, c, i, 'sb', { skipLeftCut: false, skipRightCut: false }));
  });

  /** Child1 top rail — rides with sash */
  const renderSashTop = () => layerConfigs.flatMap(cfg => {
    if (!isChild1(cfg.name)) return [];
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    return layer.contours
      .filter(c => getCentY(c.points) > 180)
      .map((c, i) => makeSegment(cfg, c, i, 'st', {
        skipLeftCut: false, skipRightCut: false,
        invertCuts: true, leftCutYOffset: CAD_HEIGHT * scale,
      }));
  });

  /** Child1 right vertical stile — rides with sash */
  const renderSashVertical = () => layerConfigs.flatMap(cfg => {
    if (!isChild1(cfg.name)) return [];
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours.filter(c => getCentY(c.points) < 150);
    const isSkipCutLayer = false;
    return contours.length === 0 ? [] : [(
      <group key={`sv_${cfg.name}`} position={[0, H, 10 * scale]} rotation={[0, 0, -Math.PI / 2]}>
        {contours.map((c, i) => (
          <FrameSegment
            key={`sv_seg_${cfg.name}_${i}`}
            layerName={cfg.name}   scaleFactor={scale}
            length={height}        vertices={c.points}
            matType={cfg.matType}  color={getColor(cfg.colorType)}
            textureUrl={getTex(cfg.colorType)} origin={origin}
            rotation={[0, Math.PI / 2, 0]}
            skipCuts={isSkipCutLayer}
            skipLeftCut={false} skipRightCut={false}
            invertCuts={false}  uSign={-1} uOffset={0}
          />
        ))}
      </group>
    )];
  });


  /** Child1 left vertical stile (Doorpost) — full height with mitre cuts */
  const renderSashVerticalLeftDoorpost = () => doorPostLayerConfigs.flatMap(cfg => {
    const layer = dpd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours;

    // Use the same rotation as the working left sash stile:
    //   rotation={[0, Math.PI/2, 0]} → profile-X maps to world -Z (depth into screen)
    //                                 → extrusion goes world -Y (downward from H to 0) ✓
    // zOffset shifts the profile in Z so the doorpost glazing aligns with the sash glazing.
    // The sash glass sits at approximately -((sashGlassMinX + sashGlassMaxX)/2) * scale.
    // The doorpost glass position (in profile-X) needs to be shifted to match.
    // For now, no Z shift — exterior face of doorpost aligns with exterior of sash at Z=0.

    return contours.length === 0 ? [] : [(
      <group key={`svldp_${cfg.name}`} position={[0, H, 10 * scale]} rotation={[0, 0, -Math.PI / 2]}>
        {contours.map((c, i) => (
          <FrameSegment
            key={`svldp_seg_${cfg.name}_${i}`}
            layerName={cfg.name}   scaleFactor={scale}
            length={height}        vertices={c.points}
            matType={cfg.matType}  color={getColor(cfg.colorType)}
            textureUrl={getTex(cfg.colorType)} origin={origin}
            rotation={[0, Math.PI / 2, 0]}
            skipCuts={false}
            skipLeftCut={false} skipRightCut={false}
            invertCuts={true}  uSign={-1} uOffset={0}
          />
        ))}
      </group>
    )];
  });

  const renderSashVerticalRight = () => doorPostLayerConfigs.flatMap(cfg => {
    const layer = dpd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours;
    const isSkipCutLayer = false;
    return contours.length === 0 ? [] : [(
      <group key={`svr_${cfg.name}`} position={[W, 0, 10 * scale]} rotation={[0, 0, Math.PI / 2]}>
        {contours.map((c, i) => (
          <FrameSegment
            key={`svr_seg_${cfg.name}_${i}`}
            layerName={cfg.name}   scaleFactor={scale}
            length={height}        vertices={c.points}
            matType={cfg.matType}  color={getColor(cfg.colorType)}
            textureUrl={getTex(cfg.colorType)} origin={origin}
            rotation={[0, Math.PI / 2, 0]}
            skipCuts={isSkipCutLayer}
            skipLeftCut={false} skipRightCut={false}
            invertCuts={true}  uSign={-1} uOffset={0}
          />
        ))}
      </group>
    )];
  });

  /** Triple glazing — rides with sash */
  const renderGlass = () => {
    return ['GLS_EXT', 'GLS_INT', 'GLS_MDL'].map(ln => {
      const layer = pd.layers[ln];
      if (!layer || layer.contours.length === 0) return null;
      const pts = layer.contours[0].points;
      let minX = Infinity, maxX = -Infinity;
      for (const p of pts) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; }
      const pocketOffset = 123.38;
      const glassW = W - 2 * pocketOffset * scale;
      const glassH = H - 2 * pocketOffset * scale;
      const thickness = (maxX - minX) * scale;
      const centerZ   = -((minX + maxX) / 2) * scale;
      const hasLogo   = false;
      return (
        <group key={ln}>
          <mesh position={[W/2, H/2, centerZ]} material={glassMat} castShadow receiveShadow>
            <boxGeometry args={[glassW, glassH, thickness]} />
          </mesh>
          {hasLogo && (() => {
            const logoX = W/2 - glassW/2 + 0.09;
            const logoY = H/2 - glassH/2 + 0.09;
            const logoZ = centerZ - thickness/2 - 0.001;
            return (
              <React.Suspense fallback={null}>
                <MammothLogo x={logoX} y={logoY} z={logoZ} />
              </React.Suspense>
            );
          })()}
        </group>
      );
    });
  };

  // ── Hotspot & animation control ──────────────────────────────────────────
  const isOpen   = slidingState === 'open';
  const isMoving = slidingState === 'opening' || slidingState === 'closing';
  const onHotspot = () => { if (!isMoving) setSlidingState(isOpen ? 'closing' : 'opening'); };

  // Handle X = 60mm (mid-stile width). Handle Z = interior face (-180mm).
  const hY = 1050 * MM; // Rotation point height: exactly 1050 mm from ground
  const hZ = SASH_INTERIOR_Z;

  return (
    <group ref={setGroupObj}>
      {/* ── FIXED outer frame (Child2 only) ─────────────────────────── */}
      <group>
        <group rotation={[0, Math.PI / 2, 0]}>{renderFrameBottom()}</group>
      </group>
      <group position={[0, deltaY, 0]}>
        <group rotation={[0, Math.PI / 2, 0]}>{renderFrameTop()}</group>
      </group>
      {renderFrameVertical()}

      {/* ── SLIDING sash (Child1 only) ───────────────────────────────── */}
      <group ref={sashGroupRef}>
        {/* Sash horizontal rails */}
        <group>
          <group rotation={[0, Math.PI / 2, 0]}>{renderSashBottom()}</group>
        </group>
        <group position={[0, deltaY, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>{renderSashTop()}</group>
        </group>

        {/* Sash left vertical stile */}
        {renderSashVertical()}
        {renderSashVerticalLeftDoorpost()}

        {/* Sash right vertical stile (Doorpost) */}
        {renderSashVerticalRight()}

        {/* Triple glazing */}
        {renderGlass()}

        {/* Handle on the interior face of the right stile. */}
        <group
          ref={handleRef}
          position={[75*scale, hY, hZ - 16*scale]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[0.001, 0.001, 0.001]}
        >
          <primitive object={clonedHandle} />
        </group>

        {/* Hotspot — near handle position */}
        {!isColorPaletteOpen && (
          <Html position={[-20*scale, hY, hZ - 20*scale]} center>
            <div
              onClick={onHotspot}
              title={isOpen ? 'Close sash' : 'Open sash'}
              style={{
                width: 40, height: 40, borderRadius: '50%',
                border: `2px solid ${isOpen ? 'rgba(251,191,36,.7)' : 'rgba(255,255,255,.5)'}`,
                background: isOpen ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: isMoving ? 'not-allowed' : 'pointer',
                opacity: isMoving ? 0.5 : 1,
                animation: isMoving ? 'none' : 'pulse 2.5s cubic-bezier(.4,0,.6,1) infinite',
                transition: 'background .3s, border-color .3s',
              }}
            >
              <div style={{
                width: 12, height: 12, borderRadius: '50%',
                background: isOpen ? 'rgba(251,191,36,.9)' : 'rgba(255,255,255,.85)',
              }} />
            </div>
          </Html>
        )}

        {/* ── Roller Blind Box and Slats ────────────────────────────────── */}
        {showBlindBox && (() => {
          const boxHeight = 0.24;
          const boxDepth = 0.22;
          const frameCenterZ = -90 * scale;

          // Realistic C-curve slat count calculation
          const startY = H - 0.04;
          const endY = 0.5;
          const slatSpacing = 0.07;
          const numSlats = Math.floor((startY - endY) / slatSpacing) + 1;
          const slatsArray = Array.from({ length: numSlats }, (_, i) => i);

          // Cord X and Z positions
          const cordXs = [0.15 * W, 0.5 * W, 0.85 * W];
          const slatZ = -40 * scale;
          const frontCordZ = slatZ + 38 * scale;
          const backCordZ = slatZ - 38 * scale;

          return (
            <group>
              {/* 1. Blind Box Casing (Bi-Color support) */}
              <mesh position={[W / 2, H + boxHeight / 2, frameCenterZ + boxDepth / 4]} material={boxIntMat} castShadow receiveShadow>
                <boxGeometry args={[W, boxHeight, boxDepth / 2]} />
              </mesh>
              <mesh position={[W / 2, H + boxHeight / 2, frameCenterZ - boxDepth / 4]} material={boxExtMat} castShadow receiveShadow>
                <boxGeometry args={[W, boxHeight, boxDepth / 2]} />
              </mesh>
              <mesh position={[0.001, H + boxHeight / 2, frameCenterZ]} material={boxSideMat} castShadow receiveShadow>
                <boxGeometry args={[0.002, boxHeight, boxDepth]} />
              </mesh>
              <mesh position={[W - 0.001, H + boxHeight / 2, frameCenterZ]} material={boxSideMat} castShadow receiveShadow>
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
                      width: 36, height: 36, borderRadius: '50%',
                      border: '2px solid rgba(234,182,118,0.7)',
                      background: 'rgba(8,8,22,0.85)',
                      color: '#eab676',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
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
    </group>
  );
}

useGLTF.preload('/sliding_door_handle_IGLS.glb');

// ─── Outer viewer — creates Canvas ────────────────────────────────────────────
export const SLE201Viewer: React.FC<SLE201ViewerProps> = ({
  width  = 1100, height = 2100,
  colorExt = '#e8e0d4', colorInt = '#f0ece6',
  colorExtTexture, colorIntTexture,
  colorGsk = '#1c1c1c', colorSpacer = '#4B4B4D',
  onSceneReady,
  onDimensionChange,
  activeLimits,
  hidePill,
  isColorPaletteOpen = false,
  hasRollerShutter = false,
}) => {
  const { t } = useTranslation();
  const [widthText, setWidthText] = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());
  const [showBlindBox, setShowBlindBox] = useState(hasRollerShutter || false);
  const [blindTilt, setBlindTilt] = useState(0.4);

  useEffect(() => {
    if (hasRollerShutter) {
      setShowBlindBox(true);
    }
  }, [hasRollerShutter]);

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
  const scale = MM;
  const W = width * scale, H = height * scale;
  const controlsRef = useRef<any>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const maxDim  = Math.max(W, H);
  const targetX = W * 0.5, targetY = H * 0.5, targetZ = -90 * scale;
  const radius  = maxDim * 1.8;
  const angle   = -25 * Math.PI / 180;
  const camPos: [number,number,number] = [targetX + radius * Math.sin(angle), targetY, -radius * Math.cos(angle)];
  const orbitTarget: [number,number,number] = [targetX, targetY, targetZ];

  return (
    <div className="absolute inset-0 bg-[#e2e8f0]" onPointerDown={() => setAutoRotate(false)}>
      <Canvas
        onDoubleClick={(e) => { e.stopPropagation(); controlsRef.current?.reset(); }}
        shadows gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: camPos, fov: 35 }}
      >
        <AdaptiveCamera maxDim={maxDim} targetX={targetX} targetY={targetY} targetZ={targetZ} angle={angle} defaultRadiusMult={1.8} fov={35} zSign={-1} controlsRef={controlsRef} />
        <color attach="background" args={['#e2e8f0']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[W*2.5, H*3, -H*2]} intensity={2.5} castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} />
        <directionalLight position={[-W, H*.5, -H]}   intensity={0.8} color="#a8c8ff" />
        <directionalLight position={[W*.5, -H, -H*.5]} intensity={0.2} color="#ffe0a0" />

        <React.Suspense fallback={null}><Environment files="/assets/hdri/monochrome_studio_02_1k.exr" /></React.Suspense>
        <React.Suspense fallback={null}>
          <SlidingScene
            width={width} height={height}
            colorExt={colorExt}   colorInt={colorInt}
            colorExtTexture={colorExtTexture ?? ''} colorIntTexture={colorIntTexture ?? ''}
            colorGsk={colorGsk}   colorSpacer={colorSpacer}
            onSceneReady={onSceneReady}
            isColorPaletteOpen={isColorPaletteOpen}
            showBlindBox={showBlindBox}
            blindTilt={blindTilt}
          />
        </React.Suspense>

        <ContactShadows position={[W/2, -0.01, targetZ]} opacity={0.125} scale={maxDim*4} blur={2} far={maxDim*1.5} />
        <OrbitControls ref={controlsRef} makeDefault enablePan enableZoom
          target={orbitTarget} minDistance={maxDim*.3} maxDistance={maxDim*5}
          autoRotate={autoRotate} autoRotateSpeed={0.5} onStart={() => setAutoRotate(false)} />
      </Canvas>

      <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none"
        style={{ background: 'rgba(8,8,22,.78)', border: '1px solid rgba(234,182,118,.22)', color: '#eab676', backdropFilter: 'blur(10px)' }}>
        IGLO EDGE SLE201
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
    </div>
  );
};
