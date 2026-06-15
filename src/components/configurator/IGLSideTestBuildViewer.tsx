import React, { useRef, useState, useMemo, useEffect, Suspense } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useProgress, useGLTF, Html } from '@react-three/drei';
import { Loader2 } from 'lucide-react';
import * as THREE from 'three';
import { FrameSegment, SegmentMaterial, applyUVs } from './FrameSegment';
import { AdaptiveCamera } from './AdaptiveCamera';
import profileDataRaw from '../../data/profiles/IgloEdge/IGLS_OPENING_DOOR_SECTION_AND_FRAME.json';
import fixedGlazingDataRaw from '../../data/profiles/IgloEdge/Fixed_Glazing.json';
import blindProfileDataRaw from '../../data/profiles/ROLLER_BLIND_BOX_225.json';


interface Point { x: number; y: number }
interface Contour { id: string; points: Point[] }
interface LayerData { group: string; contours: Contour[] }
interface ProfileData {
  meta: { bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } } };
  layers: Record<string, LayerData>;
}
const pd = profileDataRaw as unknown as ProfileData;
const fgd = fixedGlazingDataRaw as unknown as ProfileData;

const MM = 0.001; // mm to meters

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
const bpd = blindProfileDataRaw as unknown as BlindProfileData;

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

interface SingleBlindAssemblyProps {
  widthMm: number;
  heightMm: number;
  colorExt: string;
  colorInt: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorBlind?: string;
  blindOpen: number;
  mosquitoOpen?: number;
  hasMosquito: boolean;
  xOffset: number;
  zOffset: number;
  onBlindOpenChange?: (v: number) => void;
  onMosquitoOpenChange?: (v: number) => void;
  skipLeftCap?: boolean;
  skipRightCap?: boolean;
}

function SingleBlindAssembly({
  widthMm,
  heightMm,
  colorExt,
  colorInt,
  colorExtTexture,
  colorIntTexture,
  colorBlind = '#ffffff',
  blindOpen,
  mosquitoOpen = 0.0,
  hasMosquito,
  xOffset,
  zOffset,
  onBlindOpenChange,
  onMosquitoOpenChange,
  skipLeftCap = false,
  skipRightCap = false
}: SingleBlindAssemblyProps) {
  const scale = MM;
  const W = widthMm * scale;
  const H = heightMm * scale;

  const parentMatrix = useMemo(() => {
    return new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, Math.PI, 0));
  }, []);

  const boxMatrix = useMemo(() => {
    const mat = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(0, Math.PI / 2, 0));
    return parentMatrix.clone().multiply(mat);
  }, [parentMatrix]);

  const railMatrix = useMemo(() => {
    const mat = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));
    return parentMatrix.clone().multiply(mat);
  }, [parentMatrix]);

  const slatMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      roughness: 0.15,
      metalness: 0.9,
    });
  }, []);

  slatMaterial.color.set(colorBlind || colorExt || '#383e42');

  const boxExtrudeSettings = useMemo(() => ({
    depth: W,
    bevelEnabled: false
  }), [W]);

  const slatLength = useMemo(() => W - 0.035, [W]);
  const slatExtrudeSettings = useMemo(() => ({
    depth: slatLength,
    bevelEnabled: false
  }), [slatLength]);

  const railExtrudeSettings = useMemo(() => ({
    depth: H + 0.005,
    bevelEnabled: false
  }), [H]);

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

  const splitBoxGeometries = useMemo(() => {
    const list: { ext: THREE.BufferGeometry; int: THREE.BufferGeometry }[] = [];
    boxGeometries.forEach(geo => {
      applyUVs(geo, 1, 0, 'triplanar');
      const split = splitGeometryByNormal(geo, boxMatrix);
      list.push(split);
    });
    return list;
  }, [boxGeometries, boxMatrix]);

  const slatGeometry = useMemo(() => {
    if (!bpd.slatProfile || bpd.slatProfile.length === 0) return null;
    const s = bpd.slatProfile[0];
    const shape = createThreeShape(s.threeShape);
    const points = shape.getPoints();
    const scaledPoints = points.map(p => new THREE.Vector2(p.x * scale, p.y * scale));
    const scaledShape = new THREE.Shape(scaledPoints);
    return new THREE.ExtrudeGeometry(scaledShape, slatExtrudeSettings);
  }, [slatExtrudeSettings, scale]);

  const bottomBarGeometry = useMemo(() => {
    if (!bpd.bottomBarProfile || bpd.bottomBarProfile.length === 0) return null;
    const s = bpd.bottomBarProfile[0];
    const shape = createThreeShape(s.threeShape);
    const points = shape.getPoints();
    const scaledPoints = points.map(p => new THREE.Vector2(p.x * scale, p.y * scale));
    const scaledShape = new THREE.Shape(scaledPoints);
    return new THREE.ExtrudeGeometry(scaledShape, slatExtrudeSettings);
  }, [slatExtrudeSettings, scale]);

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

  const splitRailGeometry = useMemo(() => {
    applyUVs(railGeometry, 1, 0, 'rail');
    return splitGeometryByNormal(railGeometry, railMatrix);
  }, [railGeometry, railMatrix]);

  const mosquitoTexture = useMemo(() => {
    if (!hasMosquito) return null;
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(25, 25, 28, 0.65)';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, 16, 16);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(widthMm * 0.4, heightMm * 0.4);
    return texture;
  }, [widthMm, heightMm, hasMosquito]);

  const mosquitoMaterial = useMemo(() => {
    if (!hasMosquito) return null;
    return new THREE.MeshStandardMaterial({
      map: mosquitoTexture,
      transparent: true,
      opacity: 0.65,
      roughness: 0.9,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
  }, [mosquitoTexture, hasMosquito]);

  const mosquitoBarMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#2a2a2e',
      roughness: 0.5,
      metalness: 0.8,
    });
  }, []);

  const mosquitoNetGeometry = useMemo(() => {
    return new THREE.BoxGeometry(slatLength, 1, 0.0006);
  }, [slatLength]);

  const mosquitoBarGeometry = useMemo(() => {
    return new THREE.BoxGeometry(slatLength, 0.025, 0.012);
  }, [slatLength]);

  const blindProgress = useRef(0);
  const mosquitoProgress = useRef(0);
  const slatsGroupRef = useRef<THREE.Group>(null);
  const mosquitoGroupRef = useRef<THREE.Group>(null);

  const slotZ = -0.005;
  const mosquitoZ = -bpd.meta.slotX * scale;

  useFrame(() => {
    const targetBlind = blindOpen;
    blindProgress.current += (targetBlind - blindProgress.current) * 0.025;
    if (Math.abs(blindProgress.current - targetBlind) < 0.001) {
      blindProgress.current = targetBlind;
    }
    const tB = blindProgress.current;

    if (slatsGroupRef.current) {
      const bottomBarH = bpd.meta.bottomBarHeight * scale;
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

    if (hasMosquito && mosquitoGroupRef.current) {
      const targetMosquito = mosquitoOpen;
      mosquitoProgress.current += (targetMosquito - mosquitoProgress.current) * 0.025;
      if (Math.abs(mosquitoProgress.current - targetMosquito) < 0.001) {
        mosquitoProgress.current = targetMosquito;
      }
      const tM = mosquitoProgress.current;
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
          netMesh.scale.y = activeHeight;
          netMesh.position.y = -activeHeight / 2;
          netBar.position.y = -activeHeight - 0.0125;
        }
      }
    }
  });

  const slatsArray = useMemo(() => {
    const bottomBarH = bpd.meta.bottomBarHeight * scale;
    const slatExposureH = 0.037;
    const count = Math.ceil((H - bottomBarH) / slatExposureH) + 1;
    return Array.from({ length: count }, (_, i) => i);
  }, [H, scale]);

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
    <group position={[xOffset, H, zOffset]} rotation={[0, Math.PI, 0]}>
      {/* 3D Blinds control hotspot */}
      {onBlindOpenChange && (
        <Html 
          position={[W / 2 - (hasMosquito ? 0.15 : 0), -0.12, slotZ - 20 * scale]} 
          center
        >
          <div
            onClick={() => onBlindOpenChange(blindOpen > 0.5 ? 0.0 : 1.0)}
            title={blindOpen > 0.5 ? 'Close blinds' : 'Open blinds'}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '2px solid rgba(234,182,118,0.7)',
              background: 'rgba(8,8,22,0.85)',
              color: '#eab676',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 'black',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              transition: 'all 0.3s',
              pointerEvents: 'auto',
              userSelect: 'none',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: '10px', transform: `rotate(${blindOpen > 0.5 ? 180 : 0}deg)`, transition: 'transform 0.3s' }}>
              ▲
            </span>
          </div>
        </Html>
      )}

      {/* 3D Mosquito net control hotspot */}
      {hasMosquito && onMosquitoOpenChange && (
        <Html 
          position={[W / 2 + 0.15, -0.12, mosquitoZ - 20 * scale]} 
          center
        >
          <div
            onClick={() => onMosquitoOpenChange(mosquitoOpen > 0.5 ? 0.0 : 1.0)}
            title={mosquitoOpen > 0.5 ? 'Close mosquito net' : 'Open mosquito net'}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '2px solid rgba(56,189,248,0.7)',
              background: 'rgba(8,8,22,0.85)',
              color: '#38bdf8',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '8px',
              fontWeight: 'black',
              boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
              transition: 'all 0.3s',
              pointerEvents: 'auto',
              userSelect: 'none',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            NET
          </div>
        </Html>
      )}
      {/* 1. Box casing profiles */}
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
        {!skipLeftCap && (
          <mesh geometry={capGeometry} position={[0, 0, -0.0021]} castShadow receiveShadow>
            <SegmentMaterial matType="int" color={colorInt} textureUrl={colorIntTexture} />
          </mesh>
        )}
        {!skipRightCap && (
          <mesh geometry={capGeometry} position={[0, 0, W + 0.0001]} castShadow receiveShadow>
            <SegmentMaterial matType="int" color={colorInt} textureUrl={colorIntTexture} />
          </mesh>
        )}
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
      {hasMosquito && mosquitoMaterial && (
        <group ref={mosquitoGroupRef} position={[W / 2, 0, mosquitoZ]}>
          <mesh 
            name="mosquitoNetMesh" 
            geometry={mosquitoNetGeometry} 
            material={mosquitoMaterial} 
            castShadow 
            receiveShadow 
          />
          <mesh 
            name="mosquitoNetBar" 
            geometry={mosquitoBarGeometry} 
            material={mosquitoBarMaterial} 
            castShadow 
            receiveShadow 
          />
        </group>
      )}
    </group>
  );
}

interface AssemblyProps {
  widthMm: number;
  heightMm: number;
  colorExt: string;
  colorInt: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorAlum?: string;
  colorBlind?: string;
  invertSides?: boolean;
  onSceneReady?: (group: THREE.Group) => void;
  blindOpenLeft?: number;
  blindOpenRight?: number;
  mosquitoOpenRight?: number;
  clonedHandle?: THREE.Group;
  onBlindOpenLeftChange?: (v: number) => void;
  onBlindOpenRightChange?: (v: number) => void;
  onMosquitoOpenRightChange?: (v: number) => void;
  isNeedleMode?: boolean;
  needleEngineNode?: HTMLElement | null;
}

type SlidingState = 'closed' | 'opening' | 'open' | 'closing';

function FrameAssembly({ 
  widthMm, heightMm, colorExt, colorInt, colorExtTexture, colorIntTexture, colorGsk = '#1c1c1c', colorAlum = '#a1a1aa',
  colorBlind = '#ffffff',
  invertSides = false,
  onSceneReady,
  blindOpenLeft = 0.0,
  blindOpenRight = 0.0,
  mosquitoOpenRight = 0.0,
  clonedHandle,
  onBlindOpenLeftChange,
  onBlindOpenRightChange,
  onMosquitoOpenRightChange,
  isNeedleMode = false,
  needleEngineNode = null
}: AssemblyProps) {
  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const [isInterior, setIsInterior] = useState(false);
  const reportedKey = useRef<string>('');
  const scale = MM;
  
  const W = widthMm * scale;
  const H = heightMm * scale;

  // Sliding door states & refs
  const [slidingState, setSlidingState] = useState<SlidingState>('closed');
  const handleAngle = useRef(0);
  const sashFwd     = useRef(0);
  const sashLeft    = useRef(0);

  const sashGroupRef  = useRef<THREE.Group>(null!);
  const handleRef     = useRef<THREE.Group>(null!);

  const anim = useRef({ dir: 1 as 1 | -1, phase: 0 as 0|1|2|3, t0: 0, dur: 1 });

  useEffect(() => {
    const a = anim.current;
    if (slidingState === 'opening') { a.dir = 1;  a.phase = 1; a.t0 = 0; a.dur = 0.8; }
    if (slidingState === 'closing') { a.dir = -1; a.phase = 3; a.t0 = 0; a.dur = 1.8; }
  }, [slidingState]);

  const prevSlidingState = useRef<SlidingState>('closed');

  useEffect(() => {
    if (!isNeedleMode || !needleEngineNode) return;
    const runAnimation = async () => {
      try {
        const { Context } = await import('@needle-tools/engine');
        const ctx = (needleEngineNode as any).context || Context.Current;
        if (!ctx) return;
        const { Animation } = await import('@needle-tools/engine');

        // Retry helper to wait for the model to load
        const getAnimationComponent = async (): Promise<any> => {
          for (let i = 0; i < 50; i++) {
            const anim = ctx.scene?.getComponentInChildren(Animation);
            if (anim) return anim;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          return null;
        };

        const anim = await getAnimationComponent();
        if (!anim) {
          console.warn('[Needle Animation] Animation component not found after timeout');
          return;
        }

        const playClip = (clipName: string, forward: boolean) => {
          const action = anim.getAction(clipName);
          if (!action) {
            console.warn(`[Needle Animation] Clip ${clipName} not found. Available:`, anim.animations?.map((c: any) => c.name));
            return;
          }
          action.reset();
          action.loop = THREE.LoopOnce;
          action.clampWhenFinished = true;
          if (forward) {
            action.timeScale = 1;
          } else {
            action.timeScale = -1;
            action.time = action.getClip().duration;
          }
          action.play();
        };

        const prev = prevSlidingState.current;
        prevSlidingState.current = slidingState;

        if (slidingState === 'opening') {
          playClip('OpenSash', true);
        } else if (slidingState === 'closing') {
          playClip('OpenSash', false);
        }
      } catch (err) {
        console.error('[Needle Animation] Error controlling animation:', err);
      }
    };
    runAnimation();
  }, [slidingState, isNeedleMode, needleEngineNode]);

  const ease = (x: number) => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2, 2)/2;

  useFrame((state) => {
    const z = state.camera.position.z;
    const currentIsInterior = z > 0;
    if (currentIsInterior !== isInterior) {
      setIsInterior(currentIsInterior);
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
      // OPENING: Phase1=handle CW, Phase2=sash away from camera (Z increases), Phase3=slide LEFT (−X)
      if      (a.phase === 1) { handleAngle.current = Math.PI * t;                                                            if (raw>=1) next(2, 1.2); }
      else if (a.phase === 2) { handleAngle.current = Math.PI; sashFwd.current = 15.55*scale*t;                               if (raw>=1) next(3, 2.8); }
      else if (a.phase === 3) { handleAngle.current = Math.PI; sashFwd.current = 15.55*scale; sashLeft.current = -(W/2 - 80*scale)*t;  if (raw>=1) next(0,0); }
    } else {
      // CLOSING: Phase3=slide back to X=0, Phase2=pull toward camera (Z decreases), Phase1=handle back
      if      (a.phase === 3) { sashLeft.current = -(W/2 - 80*scale)*(1-t); sashFwd.current = 15.55*scale;                     if (raw>=1) next(2, 1.2); }
      else if (a.phase === 2) { sashLeft.current = 0; sashFwd.current = 15.55*scale*(1-t);                                    if (raw>=1) next(1, 0.8); }
      else if (a.phase === 1) { sashLeft.current = 0; sashFwd.current = 0; handleAngle.current = Math.PI*(1-t);                if (raw>=1) { handleAngle.current=0; next(0,0); } }
    }

    // Apply sash group transform
    if (sashGroupRef.current) {
      sashGroupRef.current.position.set(sashLeft.current, 0, sashFwd.current);
    }

    // Apply handle lever rotation
    if (handleRef.current) {
      let lever: THREE.Object3D | undefined =
        handleRef.current.getObjectByName('handleLever') ??
        handleRef.current.getObjectByName('Sliding_door_handle') ??
        handleRef.current.getObjectByName('Handle') ??
        handleRef.current.getObjectByName('handle') ??
        handleRef.current.getObjectByName('Pencere_Kulbu');
      if (!lever) {
        handleRef.current.traverse((c: any) => {
          if (!lever && c.isMesh && !c.name.toLowerCase().includes('base')) lever = c;
        });
      }
      if (lever) (lever as any).rotation.z = handleAngle.current;
    }
  });

  useEffect(() => {
    if (groupObj) {
      (window as any).assemblyGroup = groupObj;
      if (onSceneReady) {
        onSceneReady(groupObj);
      }
    }
  }, [groupObj, onSceneReady, widthMm, heightMm, colorExt, colorInt, colorExtTexture, colorIntTexture, colorGsk, colorAlum, colorBlind, invertSides]);

  const getLayerContours = (layerName: string) => {
    const layer = pd.layers[layerName];
    if (!layer || layer.contours.length === 0) return [];
    return layer.contours.map((c: any) => c.points);
  };

  // Frame layers
  const frmExt = useMemo(() => getLayerContours('Main_Frame_EXT'), []);
  const frmInt = useMemo(() => getLayerContours('Main_Frame_INT'), []);
  const gskCentral = useMemo(() => getLayerContours('Main_GSK_CENTRAL'), []);
  const fixCover = useMemo(() => getLayerContours('Fix_Cover'), []);
  const alum = useMemo(() => getLayerContours('Aluminium'), []);

  const getFixedLayerContours = (layerName: string) => {
    const layer = fgd.layers[layerName];
    if (!layer || layer.contours.length === 0) return [];
    return layer.contours.map((c: any) => c.points);
  };

  // Fixed Glazing layers
  const fixGskExt = useMemo(() => getFixedLayerContours('Fix_GSK_EXT'), []);
  const fixGskBzd = useMemo(() => getFixedLayerContours('Fix_GSK_BZD'), []);
  const fixBzd = useMemo(() => getFixedLayerContours('Fix_BZD'), []);
  const fixGlsExt = useMemo(() => getFixedLayerContours('Fix_GLS_EXT'), []);
  const fixGlsMd = useMemo(() => getFixedLayerContours('Fix_GLS_MD'), []);
  const fixGlsInt = useMemo(() => getFixedLayerContours('Fix_GLS_INT'), []);
  const fixSpacer = useMemo(() => getFixedLayerContours('Fix_SPACER'), []);

  // Sash / Door panel layers
  const sshExt = useMemo(() => getLayerContours('Door_Frame_EXT'), []);
  const sshInt = useMemo(() => getLayerContours('Door_Frame_INT'), []);
  const bzd = useMemo(() => getLayerContours('Door_BZD'), []);
  const gskSshExt = useMemo(() => getLayerContours('Door_GSK_EXT'), []);
  const gskSshInt = useMemo(() => getLayerContours('Door_GSK_INT'), []);
  const gskBzd = useMemo(() => getLayerContours('Door_GSK_BZD'), []);
  const glsExt = useMemo(() => getLayerContours('Door_GLS_EXT'), []);
  const glsMd = useMemo(() => getLayerContours('Door_GLS_MD'), []);
  const glsInt = useMemo(() => getLayerContours('Door_GLS_INT'), []);
  const spacer = useMemo(() => getLayerContours('Door_SPACER'), []);

  const commonOrigin = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    const allLayers = [
      frmExt, frmInt, gskCentral, fixCover, alum,
      sshExt, sshInt, bzd, gskSshExt, gskSshInt, gskBzd, glsExt, glsMd, glsInt, spacer
    ];
    for (const layer of allLayers) {
      for (const c of layer) {
        for (const v of c) {
          if (v.x < minX) minX = v.x;
          if (v.y < minY) minY = v.y;
        }
      }
    }
    return { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY };
  }, [frmExt, frmInt, gskCentral, fixCover, alum, sshExt, sshInt, bzd, gskSshExt, gskSshInt, gskBzd, glsExt, glsMd, glsInt, spacer]);

  // Calculate sash midpoint horizontally (which corresponds to Y axis in CAD cross-section)
  const sashYBounds = useMemo(() => {
    let minY = Infinity, maxY = -Infinity;
    const allSashLayers = [sshExt, sshInt];
    for (const layer of allSashLayers) {
      for (const c of layer) {
        for (const v of c) {
          if (v.y < minY) minY = v.y;
          if (v.y > maxY) maxY = v.y;
        }
      }
    }
    return { min: minY, max: maxY, mid: (minY + maxY) / 2 };
  }, [sshExt, sshInt]);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
    color: "#e2effa", 
    roughness: 0.0,
    metalness: 0.1,
    transmission: 0.9,
    ior: 1.5,
    thickness: 0.005,
    transparent: true,
    opacity: 0.6,
  }), []);

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
      <mesh position={[sashWidthMm * scale / 2, sashHeightMm * scale / 2, centerDepth]} material={glassMaterial} castShadow receiveShadow>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  // Standard 4-sided PVC frame segment renderer
  const renderFrameSegment = (len: number, uSign: number, uOff: number) => (
    <>
      {frmExt.map((c, i) => (
        <FrameSegment 
          key={`frmExt_${i}`} 
          layerName="Main_Frame_EXT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="ext" 
          color={colorExt}
          textureUrl={colorExtTexture}
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {frmInt.map((c, i) => (
        <FrameSegment 
          key={`frmInt_${i}`} 
          layerName="Main_Frame_INT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="int" 
          color={colorInt}
          textureUrl={colorIntTexture}
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {gskCentral.map((c, i) => (
        <FrameSegment 
          key={`gskC_${i}`} 
          layerName="Main_GSK_CENTRAL" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="gsk" 
          color={colorGsk} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
    </>
  );

  // Custom Fix Cover segment renderer (which only runs along the fixed panel side)
  const renderFixCoverSegment = (
    len: number, 
    uSign: number, 
    uOff: number, 
    skipLeft?: boolean, 
    skipRight?: boolean
  ) => (
    <>
      {fixCover.map((c, i) => (
        <FrameSegment 
          key={`fixCov_${i}`} 
          layerName="Fix_Cover" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="ext" 
          color={colorExt} 
          textureUrl={colorExtTexture}
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
    </>
  );

  // Standard 4-sided PVC sash segment renderer
  const renderSashSegment = (len: number, uSign: number, uOff: number) => (
    <>
      {sshExt.map((c, i) => (
        <FrameSegment 
          key={`sshExt_${i}`} 
          layerName="Door_Frame_EXT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="ext" 
          color={colorExt} 
          textureUrl={colorExtTexture}
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {sshInt.map((c, i) => (
        <FrameSegment 
          key={`sshInt_${i}`} 
          layerName="Door_Frame_INT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="int" 
          color={colorInt} 
          textureUrl={colorIntTexture}
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {bzd.map((c, i) => (
        <FrameSegment 
          key={`bzd_${i}`} 
          layerName="Door_BZD" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="int" 
          color={colorInt} 
          textureUrl={colorIntTexture}
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
          uvMode="rail" 
        />
      ))}
      {spacer.map((c, i) => (
        <FrameSegment 
          key={`spacer_${i}`} 
          layerName="Door_SPACER" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="spacer" 
          color="#333333" 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {gskSshExt.map((c, i) => (
        <FrameSegment 
          key={`gskSE_${i}`} 
          layerName="Door_GSK_EXT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="gsk" 
          color={colorGsk} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {gskSshInt.map((c, i) => (
        <FrameSegment 
          key={`gskSI_${i}`} 
          layerName="Door_GSK_INT" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="gsk" 
          color={colorGsk} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
      {gskBzd.map((c, i) => (
        <FrameSegment 
          key={`gskB_${i}`} 
          layerName="Door_GSK_BZD" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="gsk" 
          color={colorGsk} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
        />
      ))}
    </>
  );

  // Custom 3-sided Aluminium track segment renderer
  const renderAluminiumSegment = (
    len: number, 
    uSign: number, 
    uOff: number, 
    skipLeft: boolean, 
    skipRight: boolean
  ) => (
    <>
      {alum.map((c, i) => (
        <FrameSegment 
          key={`alum_${i}`} 
          layerName="Aluminium" 
          scaleFactor={scale} 
          length={len} 
          vertices={c} 
          matType="spacer" // Anodized metal look
          color={colorAlum} 
          origin={commonOrigin} 
          uSign={uSign} 
          uOffset={uOff} 
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
    </>
  );

  // Fixed Glazing segment renderer
  const renderFixedGlazingSegment = (
    len: number,
    uSign: number,
    uOff: number,
    skipLeft?: boolean,
    skipRight?: boolean
  ) => (
    <>
      {fixBzd.map((c, i) => (
        <FrameSegment
          key={`fixBzd_${i}`}
          layerName="Fix_BZD"
          scaleFactor={scale}
          length={len}
          vertices={c}
          matType="int"
          color={colorInt}
          textureUrl={colorIntTexture}
          origin={commonOrigin}
          uSign={uSign}
          uOffset={uOff}
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
          uvMode="rail"
        />
      ))}
      {fixGskExt.map((c, i) => (
        <FrameSegment
          key={`fixGskExt_${i}`}
          layerName="Fix_GSK_EXT"
          scaleFactor={scale}
          length={len}
          vertices={c}
          matType="gsk"
          color={colorGsk}
          origin={commonOrigin}
          uSign={uSign}
          uOffset={uOff}
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
      {fixGskBzd.map((c, i) => (
        <FrameSegment
          key={`fixGskBzd_${i}`}
          layerName="Fix_GSK_BZD"
          scaleFactor={scale}
          length={len}
          vertices={c}
          matType="gsk"
          color={colorGsk}
          origin={commonOrigin}
          uSign={uSign}
          uOffset={uOff}
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
      {fixSpacer.map((c, i) => (
        <FrameSegment
          key={`fixSpacer_${i}`}
          layerName="Fix_SPACER"
          scaleFactor={scale}
          length={len}
          vertices={c}
          matType="spacer"
          color="#333333"
          origin={commonOrigin}
          uSign={uSign}
          uOffset={uOff}
          skipLeftCut={skipLeft}
          skipRightCut={skipRight}
        />
      ))}
    </>
  );

  const renderFixedGlassPane = (glsLayer: Point[][]) => {
    if (glsLayer.length === 0) return null;
    const pts = glsLayer[0];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const offset = minY;
    const paneW = W / 2;
    const paneH = H - 2 * offset * scale;
    const thickness = (maxX - minX) * scale;
    const centerDepth = -(((minX + maxX) / 2)) * scale;
    const centerX = offset * scale + W / 4;
    const centerY = H / 2;

    return (
      <mesh position={[centerX, centerY, centerDepth]} material={glassMaterial} castShadow receiveShadow>
        <boxGeometry args={[paneW, paneH, thickness]} />
      </mesh>
    );
  };

  // Aluminium offset parameter from left end
  const alumOffsetMm = 34.87;
  const alumOffset = alumOffsetMm * scale;

  // Sash/Door alignment math
  // Local Y midpoint of the sash shape, shifted by commonOrigin.y
  const yMidLocal = sashYBounds.mid - commonOrigin.y;
  const yMidOffset = yMidLocal * scale;
  
  // Left vertical rail X-coordinate in world units to center its midpoint exactly on W/2
  const sashLeftX = W / 2 - yMidOffset;
  // Dynamic sash width spanning from sashLeftX to W (right frame edge)
  const sashWidthMm = widthMm / 2 + yMidLocal;

  const hY = 1050 * scale; // Rotation point height: exactly 1050 mm from ground
  const isOpen   = slidingState === 'open';
  const isMoving = slidingState === 'opening' || slidingState === 'closing';
  const onHotspot = () => { if (!isMoving) setSlidingState(isOpen ? 'closing' : 'opening'); };

  return (
    <group ref={setGroupObj}>
      <group scale={[invertSides ? -1 : 1, 1, 1]} position={[invertSides ? W : 0, 0, 0]}>
        {/* 1. Main PVC Frame (4-sided mitre-cut) */}
        <group name="PVC_Frame">
        {/* Bottom */}
        <group rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSegment(widthMm, 1, 0)}
          </group>
        </group>
        {/* Right */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSegment(heightMm, -1, W)}
          </group>
        </group>
        {/* Top */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSegment(widthMm, 1, W - H)}
          </group>
        </group>
        {/* Left */}
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFrameSegment(heightMm, -1, W - H)}
          </group>
        </group>

        {/* Fixed Covers (only 50% of the way on bottom/top right, 100% on right vertical, 0% on left vertical) */}
        {/* Bottom Fix Cover */}
        <group position={[W / 2, 0, 1.88 * scale]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixCoverSegment(widthMm / 2, 1, W / 2, true, false)}
          </group>
        </group>
        {/* Top Fix Cover */}
        <group position={[W, H, 1.88 * scale]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixCoverSegment(widthMm / 2, 1, W - H, false, true)}
          </group>
        </group>
        {/* Right Fix Cover */}
        <group position={[W, 0, 1.88 * scale]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixCoverSegment(heightMm, -1, W, false, false)}
          </group>
        </group>
      </group>

      {/* 2. Aluminium Tracks (3 pieces following assembly rules) */}
      <group name="Aluminium_Tracks">
        {/* Bottom: stretches from x=34.87 to x=W (length = W - 34.87). Straight left cut, mitred right cut */}
        <group position={[alumOffset, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderAluminiumSegment(widthMm - alumOffsetMm, 1, alumOffset, true, false)}
          </group>
        </group>

        {/* Right: stretches along x=W from y=0 to y=H (length = H). Mitred bottom cut, mitred top cut */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderAluminiumSegment(heightMm, -1, W, false, false)}
          </group>
        </group>

        {/* Top: stretches from x=W to x=34.87 (length = W - 34.87). Mitred right cut (at Z=0), straight left cut (at Z=length) */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderAluminiumSegment(widthMm - alumOffsetMm, 1, W - H, false, true)}
          </group>
        </group>
      </group>

      {/* 3. Fixed Glazing Assembly */}
      <group name="Fixed_Glazing">
        {/* Bottom-Left Fixed Glazing */}
        <group rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixedGlazingSegment(widthMm / 2, 1, 0, false, true)}
          </group>
        </group>
        {/* Top-Left Fixed Glazing */}
        <group position={[W / 2, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixedGlazingSegment(widthMm / 2, 1, W - H, true, false)}
          </group>
        </group>
        {/* Left Vertical Fixed Glazing */}
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderFixedGlazingSegment(heightMm, -1, W - H, false, false)}
          </group>
        </group>

        {/* Fixed Glass Panes */}
        {renderFixedGlassPane(fixGlsExt)}
        {renderFixedGlassPane(fixGlsMd)}
        {renderFixedGlassPane(fixGlsInt)}
      </group>
 
      {/* 4. Opening Door Panel (Sash + Glass) */}
      <group ref={sashGroupRef} name="sashGroup" position={[0, 0, 0]}>
        {/* Handle on the interior face of the right stile */}
        {clonedHandle && (
          <group
            ref={handleRef}
            position={[W - 75 * scale, hY, 16 * scale]}
            rotation={[0, -Math.PI / 2, 0]}
            scale={[0.001, 0.001, 0.001]}
          >
            <primitive object={clonedHandle} />
          </group>
        )}

        {/* Hotspot — near handle position */}
        <Html position={[W - 55 * scale, hY, 22 * scale]} center>
          <div
            onClick={onHotspot}
            title={isOpen ? 'Close sliding door' : 'Open sliding door'}
            style={{
              width: 40, height: 40, borderRadius: '50%',
              border: `2px solid ${isOpen ? 'rgba(251,191,36,.7)' : 'rgba(255,255,255,.5)'}`,
              background: isOpen ? 'rgba(251,191,36,.25)' : 'rgba(255,255,255,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isMoving ? 'not-allowed' : 'pointer',
              opacity: isMoving ? 0.5 : 1,
              animation: isMoving ? 'none' : 'pulse 2.5s cubic-bezier(.4,0,.6,1) infinite',
              transition: 'background .3s, border-color .3s',
              pointerEvents: 'auto',
            }}
          >
            <div style={{
              width: 12, height: 12, borderRadius: '50%',
              background: isOpen ? 'rgba(251,191,36,.9)' : 'rgba(255,255,255,.85)',
            }} />
          </div>
          <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.1)} }`}</style>
        </Html>
        {/* Bottom Sash */}
        <group position={[sashLeftX, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderSashSegment(sashWidthMm, 1, sashLeftX)}
          </group>
        </group>
        {/* Right Sash */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderSashSegment(heightMm, -1, W)}
          </group>
        </group>
        {/* Top Sash */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderSashSegment(sashWidthMm, 1, W - H)}
          </group>
        </group>
        {/* Left Sash: centered exactly on W / 2 */}
        <group position={[sashLeftX, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            {renderSashSegment(heightMm, -1, W - H)}
          </group>
        </group>

        {/* Glass panes inside sash */}
        <group position={[sashLeftX, 0, 0]}>
          {renderGlassPane(sashWidthMm, heightMm, glsExt)}
          {renderGlassPane(sashWidthMm, heightMm, glsMd)}
          {renderGlassPane(sashWidthMm, heightMm, glsInt)}
        </group>
      </group>

      {/* 5. Roller Blind Assemblies (Left: 50% width without mosquito, Right: 50% width with mosquito) */}
      <group name="Roller_Blinds">
        {/* Left Side Blind (Fixed Glazing Side) */}
        <SingleBlindAssembly
          widthMm={widthMm / 2}
          heightMm={heightMm}
          colorExt={colorExt}
          colorInt={colorInt}
          colorExtTexture={colorExtTexture}
          colorIntTexture={colorIntTexture}
          colorBlind={colorBlind}
          blindOpen={blindOpenLeft}
          hasMosquito={false}
          xOffset={W / 2}
          zOffset={-180.46 * scale - 0.005}
          onBlindOpenChange={onBlindOpenLeftChange}
          skipLeftCap={true}
        />
        {/* Right Side Blind (Sliding Door Side) */} 
        <SingleBlindAssembly
          widthMm={widthMm / 2}
          heightMm={heightMm}
          colorExt={colorExt}
          colorInt={colorInt}
          colorExtTexture={colorExtTexture}
          colorIntTexture={colorIntTexture}
          colorBlind={colorBlind}
          blindOpen={blindOpenRight}
          mosquitoOpen={mosquitoOpenRight}
          hasMosquito={true}
          xOffset={W}
          zOffset={-180.46 * scale - 0.005}
          onBlindOpenChange={onBlindOpenRightChange}
          onMosquitoOpenChange={onMosquitoOpenRightChange}
          skipRightCap={true}
        />
      </group>
      </group>
    </group>
  );
}

function DelayedLoader({ mountHeavy }: { mountHeavy: boolean }) {
  const { active, progress } = useProgress();
  if (!mountHeavy || !active) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0e0e1a]/95 backdrop-blur-sm text-[#eab676] pointer-events-none"
      style={{ animation: 'fadeIn 0.5s ease-in-out 1s forwards', opacity: 0 }}>
      <Loader2 className="w-12 h-12 animate-spin mb-4" />
      <p className="font-bold tracking-widest text-xs uppercase">Preparing 3D geometry engine...</p>
      {active && <p className="text-xs opacity-50 mt-2">{progress.toFixed(0)}%</p>}
      <style>{`@keyframes fadeIn { to { opacity: 1; } }`}</style>
    </div>
  );
}

export interface IGLSideTestBuildViewerProps {
  width?: number;
  height?: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  colorGsk?: string;
  colorAlum?: string;
  colorBlind?: string;
  invertSides?: boolean;
  onSceneReady?: (group: THREE.Group) => void;
  onDimensionChange?: (width: number, height: number) => void;
  activeLimits?: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
  blindOpenLeft?: number;
  blindOpenRight?: number;
  mosquitoOpenRight?: number;
  onBlindOpenLeftChange?: (v: number) => void;
  onBlindOpenRightChange?: (v: number) => void;
  onMosquitoOpenRightChange?: (v: number) => void;
  isNeedleMode?: boolean;
  needleEngineNode?: HTMLElement | null;
}

export const IGLSideTestBuildViewer: React.FC<IGLSideTestBuildViewerProps> = ({
  width = 2200,
  height = 2100,
  colorExt = '#ffffff', // standard white default
  colorInt = '#ffffff', // standard white default
  colorExtTexture,
  colorIntTexture,
  colorGsk = '#1c1c1c',
  colorAlum = '#8a8a93', // Silver/Anodized track look
  colorBlind = '#ffffff', // standard white default
  invertSides = false,
  onSceneReady,
  onDimensionChange,
  activeLimits,
  blindOpenLeft = 0.0,
  blindOpenRight = 0.0,
  mosquitoOpenRight = 0.0,
  onBlindOpenLeftChange,
  onBlindOpenRightChange,
  onMosquitoOpenRightChange,
  isNeedleMode = false,
  needleEngineNode = null,
}) => {
  const [widthText, setWidthText] = useState(width.toString());
  const [heightText, setHeightText] = useState(height.toString());
  const controlsRef = useRef<any>(null);
  const [mountHeavy, setMountHeavy] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  const { scene: handleScene } = useGLTF('/sliding_door_handle_IGLS.glb');
  const clonedHandle = useMemo(() => {
    const c = handleScene.clone(true);
    c.children.forEach((node: any) => {
      node.position.x -= 16.503816604614258;
      node.position.y -= -0.07755661010742188;
    });
    let lever: THREE.Object3D | undefined =
      c.getObjectByName('Sliding_door_handle') ??
      c.getObjectByName('Handle') ??
      c.getObjectByName('handle') ??
      c.getObjectByName('Pencere_Kulbu');
    if (!lever) {
      c.traverse((o: any) => {
        if (!lever && o.isMesh && !o.name.toLowerCase().includes('base')) {
          lever = o;
        }
      });
    }
    if (lever) {
      lever.name = 'handleLever';
    }
    c.traverse((o: any) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return c;
  }, [handleScene]);

  useEffect(() => {
    setWidthText(width.toString());
    setHeightText(height.toString());
  }, [width, height]);

  useEffect(() => {
    setMountHeavy(false);
    const t = setTimeout(() => setMountHeavy(true), 50);
    return () => clearTimeout(t);
  }, [width, height]);

  const minW = activeLimits?.minWidth || 1000;
  const maxW = activeLimits?.maxWidth || 3000;
  const minH = activeLimits?.minHeight || 1000;
  const maxH = activeLimits?.maxHeight || 3000;

  const W_M = width * MM;
  const H_M = height * MM;
  const maxDim = Math.max(W_M, H_M);
  
  const targetX = W_M * 0.5; 
  const targetY = H_M * 0.5;
  const targetZ = 0;

  const radius = maxDim * 1.8;
  const camPos: [number, number, number] = [targetX, targetY, -radius];
  const orbitTarget: [number, number, number] = [targetX, targetY, targetZ];

  return (
    <div
      className="absolute inset-0"
      style={{
        background: isNeedleMode ? 'transparent' : '#09090f',
        zIndex: isNeedleMode ? 10 : 'auto',
      }}
    >
      <div className="absolute inset-0">
        {/* In Needle mode: alpha canvas sits transparently on top of needle-engine.
            pointer-events stay enabled so OrbitControls + Html hotspots work. */}
        <Canvas
          shadows
          gl={{ antialias: true, alpha: isNeedleMode, premultipliedAlpha: false }}
          camera={{ position: camPos, fov: 32 }}
          style={{ background: 'transparent' }}
        >
        <AdaptiveCamera maxDim={maxDim} targetX={targetX} targetY={targetY} targetZ={targetZ} angle={0} defaultRadiusMult={1.8} fov={32} zSign={1} controlsRef={controlsRef} />
        {/* Only attach an opaque background colour when NOT in Needle mode */}
        {!isNeedleMode && <color attach="background" args={['#09090f']} />}
        {!isNeedleMode && <fog attach="fog" args={['#09090f', maxDim * 12, maxDim * 35]} />}
        <ambientLight intensity={0.4} />
        <directionalLight position={[W_M * 3, H_M * 3, -H_M * 3]} intensity={2.5} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-bias={-0.0003} color="#ffffff" />
        <directionalLight position={[-W_M * 2, H_M * 0.8, -H_M]} intensity={0.6} color="#38bdf8" />
        <directionalLight position={[W_M * 0.5, -H_M, -H_M * 0.5]} intensity={0.2} color="#f59e0b" />
        
        {!isNeedleMode && (
          <Suspense fallback={null}>
            <Environment files="/assets/hdri/monochrome_studio_02_1k.exr" />
          </Suspense>
        )}

        {mountHeavy && (
          <FrameAssembly 
            widthMm={width} 
            heightMm={height} 
            colorExt={colorExt} 
            colorInt={colorInt} 
            colorExtTexture={colorExtTexture}
            colorIntTexture={colorIntTexture}
            colorGsk={colorGsk} 
            colorAlum={colorAlum}
            colorBlind={colorBlind}
            invertSides={invertSides}
            onSceneReady={onSceneReady} 
            blindOpenLeft={blindOpenLeft}
            blindOpenRight={blindOpenRight}
            mosquitoOpenRight={mosquitoOpenRight}
            clonedHandle={clonedHandle}
            onBlindOpenLeftChange={onBlindOpenLeftChange}
            onBlindOpenRightChange={onBlindOpenRightChange}
            onMosquitoOpenRightChange={onMosquitoOpenRightChange}
            isNeedleMode={isNeedleMode}
            needleEngineNode={needleEngineNode}
          />
        )}

        {!isNeedleMode && <ContactShadows position={[W_M / 2, -0.005, 0]} opacity={0.3} scale={maxDim * 4} blur={2.0} far={maxDim * 1.5} />}
        <OrbitControls 
          ref={controlsRef} 
          makeDefault 
          enablePan 
          enableZoom 
          target={orbitTarget} 
          minDistance={maxDim * 0.5} 
          maxDistance={maxDim * 5} 
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>
    </div>

      {/* Size Pill */}
      {onDimensionChange && (
        <div 
          className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-4 py-2 rounded-full pointer-events-auto shadow-2xl" 
          style={{ 
            background: 'rgba(8, 8, 15, 0.85)', 
            border: '1px solid rgba(255, 255, 255, 0.08)', 
            backdropFilter: 'blur(12px)' 
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
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            onKeyUp={(e) => e.stopPropagation()}
            className="w-12 bg-transparent text-[#eab676] text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
            style={{ border: 'none', padding: 0 }}
          />
          <span className="text-[#eab676]/45 text-xs font-black select-none pointer-events-none">x</span>
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
              if (e.key === 'Enter') e.currentTarget.blur();
            }}
            onKeyUp={(e) => e.stopPropagation()}
            className="w-12 bg-transparent text-[#eab676] text-center text-xs font-black tracking-widest focus:outline-none appearance-none"
            style={{ border: 'none', padding: 0 }}
          />
          <span className="text-[#eab676] text-[10px] font-black ml-0.5 select-none pointer-events-none">mm</span>
        </div>
      )}

      <DelayedLoader mountHeavy={mountHeavy} />
    </div>
  );
};

useGLTF.preload('/sliding_door_handle_IGLS.glb');
