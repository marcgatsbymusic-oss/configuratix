import React, { useRef, useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress } from '@react-three/drei';
import { Loader2, Grid, Layers } from 'lucide-react';
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
  blindOpen: boolean;
  mosquitoOpen: boolean;
  onSceneReady?: (group: THREE.Group) => void;
}

function BlindAssembly({
  widthMm,
  heightMm,
  colorExt,
  colorInt,
  colorBlind,
  blindOpen,
  mosquitoOpen,
  onSceneReady
}: BlindAssemblyProps) {
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (groupObj && onSceneReady) {
      onSceneReady(groupObj);
    }
  }, [groupObj, onSceneReady, widthMm, heightMm, colorExt, colorInt, colorBlind]);

  // Stable uniforms for bi-color rendering
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

  // Extrude settings for slats
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

  // 1. Box casing shapes
  const boxGeometries = useMemo(() => {
    const list: THREE.BufferGeometry[] = [];
    Object.entries(pd.boxProfiles).forEach(([profileName, shapes]) => {
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

  // 4. Side Guide Rails
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

  // 5. Mosquito Net Material & Texture
  const mosquitoTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Dark transparent charcoal color for the net mesh base
      ctx.fillStyle = 'rgba(25, 25, 28, 0.65)';
      ctx.fillRect(0, 0, 16, 16);
      
      // Fine net grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // High repeat count to create the fine-grid mesh appearance
    texture.repeat.set(widthMm * 0.4, heightMm * 0.4);
    return texture;
  }, [widthMm, heightMm]);

  const mosquitoMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: mosquitoTexture,
      transparent: true,
      opacity: 0.65,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
  }, [mosquitoTexture]);

  const mosquitoBarMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#2a2a2e',
      roughness: 0.5,
      metalness: 0.8,
    });
  }, []);

  // 6. Mosquito Net mesh geometry (1.0m height unit mesh, scaled dynamically)
  const mosquitoNetGeometry = useMemo(() => {
    // Width = slatLength, Height = 1.0, Depth = 0.0005 (0.5mm)
    return new THREE.BoxGeometry(slatLength, 1, 0.0006);
  }, [slatLength]);

  // 7. Mosquito Net bottom bar geometry
  const mosquitoBarGeometry = useMemo(() => {
    // Width = slatLength, Height = 0.025 (25mm), Depth = 0.012 (12mm)
    return new THREE.BoxGeometry(slatLength, 0.025, 0.012);
  }, [slatLength]);

  // 8. Animation states
  const blindProgress = useRef(0);
  const mosquitoProgress = useRef(0);
  const slatsGroupRef = useRef<THREE.Group>(null);
  const mosquitoGroupRef = useRef<THREE.Group>(null);
  
  const slotZ = -pd.meta.slotX * scale; // slot depth (e.g. -17.8mm)
  const mosquitoZ = -0.005; // Placed at -5mm (in front of the blinds which are at -17.8mm)

  useFrame(() => {
    // Blind animation
    const targetBlind = blindOpen ? 1.0 : 0.0;
    blindProgress.current += (targetBlind - blindProgress.current) * 0.025;
    if (Math.abs(blindProgress.current - targetBlind) < 0.001) {
      blindProgress.current = targetBlind;
    }
    const tB = blindProgress.current;

    if (slatsGroupRef.current) {
      const bottomBarH = pd.meta.bottomBarHeight * scale;
      const slatExposureH = 0.037;
      const startY = -bottomBarH;
      const bottomBarPos = -H * (1 - tB) + startY * tB;
      
      const bottomBarMesh = slatsGroupRef.current.getObjectByName('bottomBar');
      if (bottomBarMesh) {
        bottomBarMesh.position.y = bottomBarPos;
      }

      const children = slatsGroupRef.current.children;
      let slatIndex = 0;
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.name.startsWith('slat_')) {
          const y_closed = -H + bottomBarH + slatIndex * slatExposureH;
          const y_open = startY + slatIndex * 0.002;
          const currY = y_closed * (1 - tB) + y_open * tB;
          child.position.y = currY;
          child.visible = currY < 0.02;
          slatIndex++;
        }
      }
    }

    // Mosquito net animation
    const targetMosquito = mosquitoOpen ? 1.0 : 0.0;
    mosquitoProgress.current += (targetMosquito - mosquitoProgress.current) * 0.025;
    if (Math.abs(mosquitoProgress.current - targetMosquito) < 0.001) {
      mosquitoProgress.current = targetMosquito;
    }
    const tM = mosquitoProgress.current;

    if (mosquitoGroupRef.current) {
      const activeHeight = H * (1 - tM);
      
      const netMesh = mosquitoGroupRef.current.getObjectByName('mosquitoNetMesh');
      const netBar = mosquitoGroupRef.current.getObjectByName('mosquitoNetBar');

      if (netMesh && netBar) {
        if (activeHeight < 0.001) {
          netMesh.visible = false;
          netBar.visible = false;
        } else {
          netMesh.visible = true;
          netBar.visible = true;

          // Scale and reposition the 1m mesh to match activeHeight
          netMesh.scale.y = activeHeight;
          netMesh.position.y = -activeHeight / 2;

          // Position bottom bar at the very bottom of the active screen mesh
          netBar.position.y = -activeHeight - 0.0125; // offset by half height of bar
        }
      }
    }
  });

  // Calculate number of slats
  const slatsArray = useMemo(() => {
    const bottomBarH = pd.meta.bottomBarHeight * scale;
    const slatExposureH = 0.037;
    const count = Math.ceil((H - bottomBarH) / slatExposureH) + 1;
    return Array.from({ length: count }, (_, i) => i);
  }, [H, scale]);

  // End cap geometry
  const capGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(240 * scale, 0);
    shape.lineTo(240 * scale, 245.5 * scale);
    shape.lineTo(0, 245.5 * scale);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.002,
      bevelEnabled: false
    });
  }, [scale]);

  return (
    <group ref={setGroupObj}>
      {/* 1. Box casing profiles */}
      <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {boxGeometries.map((geo, idx) => (
          <mesh key={idx} geometry={geo} material={mainMaterial} castShadow receiveShadow />
        ))}
        <mesh geometry={capGeometry} material={endCapMaterial} position={[0, 0, -0.0021]} castShadow receiveShadow />
        <mesh geometry={capGeometry} material={endCapMaterial} position={[0, 0, W + 0.0001]} castShadow receiveShadow />
      </group>

      {/* 2. Side Guide Rails */}
      <group position={[0, -H, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh geometry={railGeometry} material={railMaterial} castShadow receiveShadow />
      </group>
      <group position={[W, -H, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[-1, 1, 1]}>
        <mesh geometry={railGeometry} material={railMaterial} castShadow receiveShadow />
      </group>

      {/* 3. Slats stack & bottom bar */}
      <group ref={slatsGroupRef}>
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

      {/* 4. Mosquito Net Group */}
      <group ref={mosquitoGroupRef} position={[W / 2, 0, mosquitoZ]}>
        {/* Mosquito Net Screen Mesh */}
        <mesh 
          name="mosquitoNetMesh" 
          geometry={mosquitoNetGeometry} 
          material={mosquitoMaterial} 
          castShadow 
          receiveShadow 
        />
        {/* Mosquito Net Bottom Bar */}
        <mesh 
          name="mosquitoNetBar" 
          geometry={mosquitoBarGeometry} 
          material={mosquitoBarMaterial} 
          castShadow 
          receiveShadow 
        />
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

export interface ROLLER_BLIND_BOX_225_MosquitoViewerProps {
  width?: number;
  height?: number;
  colorExt?: string;
  colorInt?: string;
  colorBlind?: string;
  onSceneReady?: (group: THREE.Group) => void;
  onDimensionChange?: (width: number, height: number) => void;
  activeLimits?: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
  hidePill?: boolean;
  isColorPaletteOpen?: boolean;
}

const GL_CONFIG = { antialias: true, preserveDrawingBuffer: true };

export const ROLLER_BLIND_BOX_225_MosquitoViewer: React.FC<ROLLER_BLIND_BOX_225_MosquitoViewerProps> = ({
  width = 1200,
  height = 1500,
  colorExt = '#383e42',
  colorInt,
  colorBlind,
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
  const [mosquitoOpen, setMosquitoOpen] = useState(false);

  useEffect(() => {
    setMountHeavy(false);
    const t = setTimeout(() => setMountHeavy(true), 50);
    return () => clearTimeout(t);
  }, [width, height]);

  const W_M = width * MM;
  const H_M = height * MM;
  const maxDim = Math.max(W_M, H_M);

  const targetX = W_M * 0.5;
  const targetY = -H_M * 0.5;
  const targetZ = -0.12;

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
            blindOpen={blindOpen}
            mosquitoOpen={mosquitoOpen}
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
        className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest pointer-events-none" 
        style={{ 
          background: 'rgba(8,8,22,0.78)', 
          border: '1px solid rgba(234,182,118,0.22)', 
          color: '#eab676', 
          backdropFilter: 'blur(10px)' 
        }}
      >
        ROLLER BLIND + MOSQUITO NET
      </div>

      {/* Control Buttons (Blinds & Mosquito Net) */}
      {!isColorPaletteOpen && (
        <div className="absolute bottom-4 right-4 z-20 flex flex-col sm:flex-row gap-3">
          {/* Blinds Toggle Button */}
          <button
            onClick={() => setBlindOpen(!blindOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-xl font-bold select-none cursor-pointer border backdrop-blur-md text-xs tracking-wider uppercase"
            style={{
              background: blindOpen ? 'rgba(234,182,118,0.15)' : 'rgba(8,8,22,0.85)',
              border: blindOpen ? '1px solid rgba(234,182,118,0.6)' : '1px solid rgba(255,255,255,0.08)',
              color: blindOpen ? '#eab676' : 'rgba(255,255,255,0.75)',
            }}
          >
            <Layers className={`w-4 h-4 transition-transform duration-300 ${blindOpen ? 'rotate-180' : ''}`} />
            <span>Blinds: {blindOpen ? 'Open' : 'Closed'}</span>
          </button>

          {/* Mosquito Net Toggle Button */}
          <button
            onClick={() => setMosquitoOpen(!mosquitoOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all shadow-xl font-bold select-none cursor-pointer border backdrop-blur-md text-xs tracking-wider uppercase"
            style={{
              background: mosquitoOpen ? 'rgba(234,182,118,0.15)' : 'rgba(8,8,22,0.85)',
              border: mosquitoOpen ? '1px solid rgba(234,182,118,0.6)' : '1px solid rgba(255,255,255,0.08)',
              color: mosquitoOpen ? '#eab676' : 'rgba(255,255,255,0.75)',
            }}
          >
            <Grid className={`w-4 h-4 transition-transform duration-300 ${mosquitoOpen ? 'rotate-180' : ''}`} />
            <span>Mosquito: {mosquitoOpen ? 'Open' : 'Closed'}</span>
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
