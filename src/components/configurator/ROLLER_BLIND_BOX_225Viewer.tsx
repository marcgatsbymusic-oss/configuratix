import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { AdaptiveCamera } from './AdaptiveCamera';
import profileDataRaw from '../../data/profiles/ROLLER_BLIND_BOX_225.json';

interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface Command { cmd: string; x: number; y: number; cpx?: number; cpy?: number }
interface ShapeData { id: string; svgPath: string; threeShape: Command[] }
interface ProfileData {
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

const pd = profileDataRaw as unknown as ProfileData;
const MM = 0.001;

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

interface BlindAssemblyProps {
  widthMm: number;
  heightMm: number;
  colorExt: string;
  colorInt?: string;
  colorBlind?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  blindOpen: boolean;
  onSceneReady?: (group: THREE.Group) => void;
}

function BlindAssembly({
  widthMm,
  heightMm,
  colorExt,
  colorInt,
  colorBlind,
  colorExtTexture,
  colorIntTexture,
  blindOpen,
  onSceneReady
}: BlindAssemblyProps) {
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const reportedKey = useRef<string>('');

  useEffect(() => {
    if (groupObj && onSceneReady) {
      onSceneReady(groupObj);
    }
  }, [groupObj, onSceneReady, widthMm, heightMm, colorExt, colorInt, colorBlind, colorExtTexture, colorIntTexture]);

  // Stable uniforms for bi-color rendering (eliminates WebGL stutters)
  const uniformsRef = useRef({
    uColorExt: { value: new THREE.Color() },
    uColorInt: { value: new THREE.Color() }
  });

  // Update uniform values and materials directly in the render phase
  // to avoid 1-frame lags and WebGL compilation/flicker issues.
  uniformsRef.current.uColorExt.value.set(colorExt || '#383e42');
  uniformsRef.current.uColorInt.value.set(colorInt || colorExt || '#f3f4f6');

  const mainMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.8,
    });

    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uColorExt = uniformsRef.current.uColorExt;
      shader.uniforms.uColorInt = uniformsRef.current.uColorInt;

      shader.fragmentShader = `
        uniform vec3 uColorExt;
        uniform vec3 uColorInt;
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        'vec4 diffuseColor = vec4( diffuse, opacity );',
        `
        vec3 worldNormal = inverseTransformDirection( vNormal, viewMatrix );
        vec3 col = (worldNormal.z > 0.0) ? uColorExt : uColorInt;
        vec4 diffuseColor = vec4( col, opacity );
        `
      );
    };

    return mat;
  }, []);

  const slatMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.15,
      metalness: 0.9,
    });
  }, []);

  const endCapMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.4,
      metalness: 0.8,
    });
  }, []);

  const railMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.45,
      metalness: 0.75,
    });
  }, []);

  // Update colors directly in render phase to avoid frame stutters/flickers
  railMaterial.color.set(colorExt || '#383e42');
  slatMaterial.color.set(colorBlind || colorExt || '#383e42');
  endCapMaterial.color.set(colorInt || colorExt || '#f3f4f6');

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
    depth: H + 0.005, // Extend 5mm into the box casing to prevent Z-fighting / flickering
    bevelEnabled: false
  }), [H]);

  // 1. Box casing shapes
  const boxGeometries = useMemo(() => {
    const list: THREE.BufferGeometry[] = [];
    Object.entries(pd.boxProfiles).forEach(([profileName, shapes]) => {
      shapes.forEach(s => {
        const shape = createThreeShape(s.threeShape);
        // Scale shape points from mm to meters
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
    if (!pd.slatProfile || pd.slatProfile.length === 0) return null;
    const s = pd.slatProfile[0];
    const shape = createThreeShape(s.threeShape);
    const points = shape.getPoints();
    const scaledPoints = points.map(p => new THREE.Vector2(p.x * scale, p.y * scale));
    const scaledShape = new THREE.Shape(scaledPoints);
    return new THREE.ExtrudeGeometry(scaledShape, slatExtrudeSettings);
  }, [slatExtrudeSettings, scale]);

  // 3. Bottom bar shape
  const bottomBarGeometry = useMemo(() => {
    if (!pd.bottomBarProfile || pd.bottomBarProfile.length === 0) return null;
    const s = pd.bottomBarProfile[0];
    const shape = createThreeShape(s.threeShape);
    const points = shape.getPoints();
    const scaledPoints = points.map(p => new THREE.Vector2(p.x * scale, p.y * scale));
    const scaledShape = new THREE.Shape(scaledPoints);
    return new THREE.ExtrudeGeometry(scaledShape, slatExtrudeSettings);
  }, [slatExtrudeSettings, scale]);

  // 4. Side Guide Rails (U-Channel pointing inwards)
  const railGeometry = useMemo(() => {
    const railShape = new THREE.Shape();
    // Drawn in mm: depth is X, width is Y
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

  // 5. Blinds state & animations
  const blindProgress = useRef(0);
  const slatsGroupRef = useRef<THREE.Group>(null);
  const slotZ = -pd.meta.slotX * scale; // slot depth (e.g. -17.8mm)

  useFrame(() => {
    const target = blindOpen ? 1.0 : 0.0;
    blindProgress.current += (target - blindProgress.current) * 0.015;
    if (Math.abs(blindProgress.current - target) < 0.001) {
      blindProgress.current = target;
    }

    const t = blindProgress.current;

    if (slatsGroupRef.current) {
      const bottomBarH = pd.meta.bottomBarHeight * scale; // 0.0555m
      const slatExposureH = 0.037; // 37mm overlap height
      const startY = -bottomBarH; // bottom bar sits below box (Y=0 bottom)
      
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
          const y_open = startY + slatIndex * 0.002; // stacked very tightly inside box when open
          
          // Interpolate position based on open progress
          const currY = y_closed * (1 - t) + y_open * t;
          child.position.y = currY;

          // Only render/show slats that are visible below the box casing (Y <= 0)
          child.visible = currY < 0.02;
          slatIndex++;
        }
      }
    }
  });

  // Calculate number of slats needed to fill the height
  const slatsArray = useMemo(() => {
    const bottomBarH = pd.meta.bottomBarHeight * scale;
    const slatExposureH = 0.037;
    const count = Math.ceil((H - bottomBarH) / slatExposureH) + 1;
    return Array.from({ length: count }, (_, i) => i);
  }, [H, scale]);

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

  return (
    <group ref={setGroupObj}>
      {/* 1. Box casing profiles (extruded horizontally) */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {boxGeometries.map((geo, idx) => (
          <mesh key={idx} geometry={geo} material={mainMaterial} castShadow receiveShadow />
        ))}
        {/* Left End Cap - offset by 0.1mm epsilon to prevent Z-fighting with casing side face */}
        <mesh geometry={capGeometry} material={endCapMaterial} position={[0, 0, -0.0021]} castShadow receiveShadow />
        {/* Right End Cap - offset by 0.1mm epsilon to prevent Z-fighting with casing side face */}
        <mesh geometry={capGeometry} material={endCapMaterial} position={[0, 0, W + 0.0001]} castShadow receiveShadow />
      </group>

      {/* 2. Side Guide Rails */}
      {/* Left guide rail: open facing right (+X) */}
      <group position={[0, -H, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={railGeometry} material={railMaterial} castShadow receiveShadow />
      </group>
      {/* Right guide rail: open facing left (-X) - mirrored at X=W */}
      <group position={[W, -H, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[-1, 1, 1]}>
        <mesh geometry={railGeometry} material={railMaterial} castShadow receiveShadow />
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
    </group>
  );
}

function DelayedLoader({ mountHeavy }: { mountHeavy: boolean }) {
  const { active, progress } = useProgress();
  if (!mountHeavy || !active) return null;
  return (
    <div 
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0e0e1a]/90 backdrop-blur-sm text-[#eab676] pointer-events-none"
      style={{ animation: 'fadeIn 0.5s ease-in-out 2s forwards', opacity: 0 }}
    >
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="font-bold tracking-widest text-sm uppercase">Preparing your custom roller blinds...</p>
      {active && <p className="text-xs opacity-50 mt-2">{progress.toFixed(0)}%</p>}
      <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
    </div>
  );
}

export interface ROLLER_BLIND_BOX_225ViewerProps {
  width?: number;
  height?: number;
  colorExt?: string;
  colorInt?: string; // fallback matching colorExt
  colorBlind?: string; // separate color for slats
  colorExtTexture?: string;
  colorIntTexture?: string;
  onSceneReady?: (group: THREE.Group) => void;
  onDimensionChange?: (width: number, height: number) => void;
  activeLimits?: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
  hidePill?: boolean;
  isColorPaletteOpen?: boolean;
}

const GL_CONFIG = { antialias: true, preserveDrawingBuffer: true };

export const ROLLER_BLIND_BOX_225Viewer: React.FC<ROLLER_BLIND_BOX_225ViewerProps> = ({
  width = 1200,
  height = 1500,
  colorExt = '#383e42', // default anthracite
  colorInt,
  colorBlind,
  colorExtTexture,
  colorIntTexture,
  onSceneReady,
  onDimensionChange,
  activeLimits,
  hidePill,
  isColorPaletteOpen = false,
}) => {
  const { t } = useTranslation();
  const [widthText, setWidthText] = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());
  const pillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = pillRef.current;
    if (!el) return;
    const stopPropagation = (e: Event) => e.stopPropagation();
    const events = ['pointerdown', 'mousedown', 'touchstart', 'click', 'dblclick'];
    events.forEach(evt => el.addEventListener(evt, stopPropagation, { capture: true }));
    return () => events.forEach(evt => el.removeEventListener(evt, stopPropagation, { capture: true }));
  }, []);

  useEffect(() => {
    setWidthText(width.toString());
    setHeightText(height.toString());
  }, [width, height]);

  const minW = activeLimits?.minWidth || 500;
  const maxW = activeLimits?.maxWidth || 3000;
  const minH = activeLimits?.minHeight || 500;
  const maxH = activeLimits?.maxHeight || 2500;

  const [mountHeavy, setMountHeavy] = useState(false);
  const [blindOpen, setBlindOpen] = useState(false);

  useEffect(() => {
    setMountHeavy(false);
    const t = setTimeout(() => setMountHeavy(true), 50);
    return () => clearTimeout(t);
  }, [width, height]);

  const W_M = width * MM;
  const H_M = height * MM;
  const maxDim = Math.max(W_M, H_M);

  const targetX = W_M * 0.5;
  const targetY = -H_M * 0.5; // box bottom is Y=0, rails go down to -H
  const targetZ = -0.12; // center of the 240mm box depth

  const camPos = useMemo<[number, number, number]>(() => [
    targetX,
    targetY,
    maxDim * 2.0
  ], [targetX, targetY, maxDim]);
  
  const cameraConfig = useMemo(() => ({
    position: camPos,
    fov: 35
  }), [camPos]);

  const orbitTarget: [number, number, number] = [targetX, targetY, targetZ];

  return (
    <div className="absolute inset-0" style={{ background: '#e2e8f0' }}>
      <Canvas shadows gl={GL_CONFIG} camera={cameraConfig}>
        <AdaptiveCamera maxDim={maxDim} targetX={targetX} targetY={targetY} targetZ={targetZ} angle={0} defaultRadiusMult={2.0} fov={35} zSign={1} />
        <color attach="background" args={['#e2e8f0']} />
        <fog attach="fog" args={['#ffffff', maxDim * 10, maxDim * 30]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[W_M * 2.5, H_M * 3, H_M * 4]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0004} color="#fff6e8" />
        <directionalLight position={[-W_M, H_M * 0.5, H_M * 2]} intensity={0.8} color="#a8c8ff" />
        <directionalLight position={[W_M * 0.5, -H_M * 2, -H_M]} intensity={0.25} color="#ffe0a0" />
        <pointLight position={[W_M * 0.5, -H_M * 0.5, H_M * 2]} intensity={0.4} color="#ffffff" />
        <Suspense fallback={null}><Environment files="/assets/hdri/monochrome_studio_02_1k.exr" /></Suspense>
        
        {mountHeavy && (
          <BlindAssembly 
            widthMm={width} 
            heightMm={height} 
            colorExt={colorExt} 
            colorInt={colorInt}
            colorBlind={colorBlind}
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            blindOpen={blindOpen}
            onSceneReady={onSceneReady}
          />
        )}

        <ContactShadows position={[W_M / 2, -H_M - 0.05, targetZ]} opacity={0.15} scale={maxDim * 5} blur={2.0} far={maxDim * 3} />
        
        <OrbitControls 
          makeDefault 
          enablePan 
          enableZoom 
          target={orbitTarget} 
          minDistance={maxDim * 0.4} 
          maxDistance={maxDim * 6} 
        />
      </Canvas>

      <div 
        className="absolute top-3 right-3 Z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none" 
        style={{ 
          background: 'rgba(8,8,22,0.78)', 
          border: '1px solid rgba(234,182,118,0.22)', 
          color: '#eab676', 
          backdropFilter: 'blur(10px)' 
        }}
      >
        ROLLER BLIND BOX 225
      </div>

      {/* Blind Open/Close Hotspot */}
      {!isColorPaletteOpen && (
        <div className="absolute bottom-3 right-3 z-20 flex items-center justify-center">
          <button
            onClick={() => setBlindOpen(!blindOpen)}
            className="flex items-center justify-center w-12 h-12 rounded-full font-black text-lg transition-all shadow-lg select-none"
            style={{
              background: 'rgba(8,8,22,0.75)',
              border: '2px solid rgba(234,182,118,0.7)',
              color: '#eab676',
              backdropFilter: 'blur(8px)',
              cursor: 'pointer'
            }}
          >
            <span style={{ transform: `rotate(${blindOpen ? 180 : 0}deg)`, transition: 'transform 0.3s' }}>
              ▲
            </span>
          </button>
        </div>
      )}

      {/* Dimensions Pill Input */}
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
            className="w-12 bg-transparent text-[#eab676] text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
            style={{ border: 'none', padding: 0 }}
          />
          <span className="text-[#eab676] text-[10px] font-black ml-0.5 select-none pointer-events-none">mm</span>
        </div>
      ) : (
        <div 
          className="absolute bottom-3 left-3 z-20 flex flex-col gap-0.5 px-2.5 py-1.5 rounded-lg pointer-events-none" 
          style={{ 
            background: 'rgba(8,8,22,0.65)', 
            border: '1px solid rgba(255,255,255,0.07)', 
            backdropFilter: 'blur(8px)' 
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#eab676' }}>{width} x {height} mm</div>
        </div>
      ))}

      <DelayedLoader mountHeavy={mountHeavy} />
    </div>
  );
};
