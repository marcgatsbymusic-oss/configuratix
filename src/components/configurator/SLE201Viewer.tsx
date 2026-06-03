import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import profileDataRaw from '../../data/profiles/IgloEdge/SLE201.json';

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}

const pd = profileDataRaw as unknown as ProfileData;
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
  { name: 'Hidden Piece',               matType: 'spacer', colorType: 'hidden' },
  { name: 'Profil stal',                matType: 'spacer', colorType: 'steel'  },
  { name: 'Spacer',                     matType: 'spacer', colorType: 'spacer' },
  { name: 'GSK_BZD',                   matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_SEAL_DOOR',             matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_EXT_DOOR_GLS',          matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_HIDDEN_PIECE_EXT',      matType: 'gsk',    colorType: 'gsk'    },
  { name: 'GSK_LARGE_UNDERNEATH_DOOR', matType: 'gsk',    colorType: 'gsk'    },
];

// Child1 = active sliding sash layers
const CHILD1_LAYERS = new Set([
  'DOOR_FRM_EXT', 'DOOR_FRM_INT', 'BZD', 'GSK_BZD',
  'GSK_SEAL_DOOR', 'Spacer', 'GSK_EXT_DOOR_GLS', 'Profil stal',
]);
const isChild1 = (name: string) => CHILD1_LAYERS.has(name);
const isChild2 = (name: string) => !CHILD1_LAYERS.has(name);

export interface SLE201ViewerProps {
  width?: number;
  height?: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorSpacer?: string;
}

// ─── Animation state ──────────────────────────────────────────────────────────
type SlidingState = 'closed' | 'opening' | 'open' | 'closing';

// ─── Inner scene (must live inside <Canvas> for useFrame / useGLTF) ──────────
function SlidingScene({
  width, height,
  colorExt, colorInt,
  colorExtTexture, colorIntTexture,
  colorGsk, colorSpacer,
}: Required<SLE201ViewerProps>) {
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

  // ── Animation state ─────────────────────────────────────────────────────────
  const [slidingState, setSlidingState] = useState<SlidingState>('closed');
  const handleAngle = useRef(0);   // 0 → Math.PI  (lever rotates 180°)
  const sashFwd     = useRef(0);   // 0 → -10 MM   (toward camera = −Z, camera is at negative Z)
  const sashLeft    = useRef(0);   // 0 → -1000 MM (slide left = −X)

  const sashGroupRef  = useRef<THREE.Group>(null!);
  const handleRef     = useRef<THREE.Group>(null!);

  const anim = useRef({ dir: 1 as 1 | -1, phase: 0 as 0|1|2|3, t0: 0, dur: 1 });

  // ── Handle GLB ──────────────────────────────────────────────────────────────
  const { scene: handleScene } = useGLTF('/testhandle.glb');
  const clonedHandle = useMemo(() => {
    const c = handleScene.clone(true);
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
      if (lever) (lever as any).rotation.z = -handleAngle.current + Math.PI;
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
    color: '#e0e8f0', metalness: 0.1, roughness: 0.05,
    transmission: 0.9, ior: 1.5, thickness: 5*MM, transparent: true, opacity: 0.4,
  }), []);

  // ── Shared FrameSegment builder ───────────────────────────────────────────
  const makeSegment = (cfg: typeof layerConfigs[0], contour: Contour, i: number, keyPfx: string, extra?: object) => (
    <FrameSegment
      key={`${keyPfx}_${cfg.name}_${i}`}
      layerName={cfg.name}      scaleFactor={scale}
      length={width}            vertices={contour.points}
      matType={cfg.matType}     color={getColor(cfg.colorType)}
      textureUrl={getTex(cfg.colorType)} origin={origin}
      {...extra}
    />
  );

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
    const layer = pd.layers[cfg.name]; if (!layer) return [];
    const contours = layer.contours.filter(c => getCentY(c.points) < 150);
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
    return contours.length === 0 ? [] : [(
      <group key={`sv_${cfg.name}`} position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
        {contours.map((c, i) => (
          <FrameSegment
            key={`sv_seg_${cfg.name}_${i}`}
            layerName={cfg.name}   scaleFactor={scale}
            length={height}        vertices={c.points}
            matType={cfg.matType}  color={getColor(cfg.colorType)}
            textureUrl={getTex(cfg.colorType)} origin={origin}
            rotation={[0, Math.PI / 2, 0]}
            skipLeftCut={false} skipRightCut={false}
            invertCuts={false}  uSign={-1} uOffset={0}
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
      return (
        <mesh key={ln} position={[W/2, H/2, centerZ]} material={glassMat} castShadow receiveShadow>
          <boxGeometry args={[glassW, glassH, thickness]} />
        </mesh>
      );
    });
  };

  // ── Hotspot & animation control ──────────────────────────────────────────
  const isOpen   = slidingState === 'open';
  const isMoving = slidingState === 'opening' || slidingState === 'closing';
  const onHotspot = () => { if (!isMoving) setSlidingState(isOpen ? 'closing' : 'opening'); };

  // Handle X = 60mm (mid-stile width). Handle Z = interior face (-180mm).
  const hY = H * 0.50;
  const hZ = SASH_INTERIOR_Z;

  return (
    <group>
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

        {/* Sash right vertical stile */}
        {renderSashVertical()}

        {/* Triple glazing */}
        {renderGlass()}

        {/* Handle on the interior face of the right stile. */}
        <group
          ref={handleRef}
          position={[75*scale, hY, hZ - 50*scale]}
          rotation={[-Math.PI / 2, Math.PI, Math.PI]}
          scale={[0.025, 0.025, 0.025]}
        >
          <primitive object={clonedHandle} />
        </group>

        {/* Hotspot — near handle position */}
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
      </group>
    </group>
  );
}

useGLTF.preload('/testhandle.glb');

// ─── Outer viewer — creates Canvas ────────────────────────────────────────────
export const SLE201Viewer: React.FC<SLE201ViewerProps> = ({
  width  = 1100, height = 2100,
  colorExt = '#e8e0d4', colorInt = '#f0ece6',
  colorExtTexture, colorIntTexture,
  colorGsk = '#1c1c1c', colorSpacer = '#4B4B4D',
}) => {
  const scale = MM;
  const W = width * scale, H = height * scale;
  const controlsRef = useRef<any>(null);

  const maxDim  = Math.max(W, H);
  const targetX = W * 0.5, targetY = H * 0.5, targetZ = -90 * scale;
  const radius  = maxDim * 1.8;
  const angle   = -25 * Math.PI / 180;
  const camPos: [number,number,number] = [targetX + radius * Math.sin(angle), targetY, -radius * Math.cos(angle)];
  const orbitTarget: [number,number,number] = [targetX, targetY, targetZ];

  return (
    <div className="absolute inset-0 bg-[#f1f5f9]">
      <Canvas
        onDoubleClick={(e) => { e.stopPropagation(); controlsRef.current?.reset(); }}
        shadows gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: camPos, fov: 35 }}
      >
        <color attach="background" args={['#f1f5f9']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[W*2.5, H*3, -H*2]} intensity={2.5} castShadow
          shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} />
        <directionalLight position={[-W, H*.5, -H]}   intensity={0.8} color="#a8c8ff" />
        <directionalLight position={[W*.5, -H, -H*.5]} intensity={0.2} color="#ffe0a0" />

        <React.Suspense fallback={null}><Environment preset="studio" /></React.Suspense>
        <React.Suspense fallback={null}>
          <SlidingScene
            width={width} height={height}
            colorExt={colorExt}   colorInt={colorInt}
            colorExtTexture={colorExtTexture ?? ''} colorIntTexture={colorIntTexture ?? ''}
            colorGsk={colorGsk}   colorSpacer={colorSpacer}
          />
        </React.Suspense>

        <ContactShadows position={[W/2, -0.01, targetZ]} opacity={0.25} scale={maxDim*4} blur={2} far={maxDim*1.5} />
        <OrbitControls ref={controlsRef} makeDefault enablePan enableZoom
          target={orbitTarget} minDistance={maxDim*.3} maxDistance={maxDim*5} />
      </Canvas>

      <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none"
        style={{ background: 'rgba(8,8,22,.78)', border: '1px solid rgba(234,182,118,.22)', color: '#eab676', backdropFilter: 'blur(10px)' }}>
        IGLO EDGE SLE201
      </div>
      <div className="absolute bottom-3 left-3 z-20 flex flex-col gap-0.5 px-2.5 py-1.5 rounded-lg pointer-events-none"
        style={{ background: 'rgba(8,8,22,.65)', border: '1px solid rgba(255,255,255,.07)', backdropFilter: 'blur(8px)' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#eab676' }}>{width} x {height} mm</div>
      </div>
    </div>
  );
};
