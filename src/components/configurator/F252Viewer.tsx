import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { IG5_F252_Component } from './IG5_F252/IG5_F252_Component';
import { buildBBox225WMsqto } from './bbox_225_w_msqto';

const LoadingOverlay = () => (
  <Html center>
    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-mammut-gold/20">
      <div className="w-5 h-5 border-4 border-mammut-gold border-t-transparent rounded-full animate-spin"></div>
      <span className="font-bold text-gray-700 tracking-wider">Building IG5-F252 Engine...</span>
    </div>
  </Html>
);

const BlindHotspot: React.FC<{
  position: [number, number, number];
  onClick: () => void;
  isDeployed: boolean;
}> = ({ position, onClick, isDeployed }) => {
  const [hovered, setHovered] = useState(false);
  const arrowRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (arrowRef.current) {
      arrowRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 5) * 6;
    }
  });

  return (
    <group 
      position={position}
      onClick={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 3D Icon: Cylinder representing roll + box representing blind */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[20, 20, 45, 16]} />
        <meshStandardMaterial color="#eab676" roughness={0.2} metalness={0.5} emissive="#eab676" emissiveIntensity={hovered ? 0.6 : 0.2} />
      </mesh>
      <mesh position={[0, -25, 0]} castShadow receiveShadow>
        <boxGeometry args={[35, 25, 6]} />
        <meshStandardMaterial color="#eab676" roughness={0.2} metalness={0.5} emissive="#eab676" emissiveIntensity={hovered ? 0.6 : 0.2} />
      </mesh>

      {/* Dynamic Bobbing Arrow */}
      <group ref={arrowRef} position={[0, -60, 0]}>
        {isDeployed ? (
          // Pointing UP
          <>
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[4, 4, 25, 12]} />
              <meshStandardMaterial color="#eab676" roughness={0.2} metalness={0.5} emissive="#eab676" emissiveIntensity={hovered ? 0.8 : 0.4} />
            </mesh>
            <mesh position={[0, 18, 0]} castShadow receiveShadow>
              <coneGeometry args={[10, 15, 12]} />
              <meshStandardMaterial color="#eab676" roughness={0.2} metalness={0.5} emissive="#eab676" emissiveIntensity={hovered ? 0.8 : 0.4} />
            </mesh>
          </>
        ) : (
          // Pointing DOWN
          <>
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[4, 4, 25, 12]} />
              <meshStandardMaterial color="#eab676" roughness={0.2} metalness={0.5} emissive="#eab676" emissiveIntensity={hovered ? 0.8 : 0.4} />
            </mesh>
            <mesh position={[0, -18, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
              <coneGeometry args={[10, 15, 12]} />
              <meshStandardMaterial color="#eab676" roughness={0.2} metalness={0.5} emissive="#eab676" emissiveIntensity={hovered ? 0.8 : 0.4} />
            </mesh>
          </>
        )}
      </group>

      {hovered && (
        <Html position={[0, 45, 0]} center pointerEvents="none">
          <div className="bg-black/90 text-white border border-[#eab676]/40 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide shadow-xl flex items-center gap-2 pointer-events-none select-none whitespace-nowrap z-50">
            <span className="w-2 h-2 rounded-full bg-[#eab676] animate-pulse shrink-0" />
            <span>Roller Blinds: {isDeployed ? 'Retract' : 'Deploy'} (Click to Toggle)</span>
          </div>
        </Html>
      )}
    </group>
  );
};

const MosquitoHotspot: React.FC<{
  position: [number, number, number];
  onClick: () => void;
  isDeployed: boolean;
}> = ({ position, onClick, isDeployed }) => {
  const [hovered, setHovered] = useState(false);
  const arrowRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (arrowRef.current) {
      arrowRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 5) * 6;
    }
  });

  return (
    <group 
      position={position}
      onClick={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e: ThreeEvent<PointerEvent>) => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* 3D Icon: Torus ring with a sphere in center */}
      <mesh castShadow receiveShadow>
        <torusGeometry args={[25, 5, 8, 24]} />
        <meshStandardMaterial color="#10b981" roughness={0.1} metalness={0.6} emissive="#10b981" emissiveIntensity={hovered ? 0.6 : 0.2} />
      </mesh>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[12, 16, 16]} />
        <meshStandardMaterial color="#10b981" roughness={0.1} metalness={0.6} emissive="#10b981" emissiveIntensity={hovered ? 0.6 : 0.2} />
      </mesh>

      {/* Dynamic Bobbing Arrow */}
      <group ref={arrowRef} position={[0, -60, 0]}>
        {isDeployed ? (
          // Pointing UP
          <>
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[4, 4, 25, 12]} />
              <meshStandardMaterial color="#10b981" roughness={0.1} metalness={0.6} emissive="#10b981" emissiveIntensity={hovered ? 0.8 : 0.4} />
            </mesh>
            <mesh position={[0, 18, 0]} castShadow receiveShadow>
              <coneGeometry args={[10, 15, 12]} />
              <meshStandardMaterial color="#10b981" roughness={0.1} metalness={0.6} emissive="#10b981" emissiveIntensity={hovered ? 0.8 : 0.4} />
            </mesh>
          </>
        ) : (
          // Pointing DOWN
          <>
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[4, 4, 25, 12]} />
              <meshStandardMaterial color="#10b981" roughness={0.1} metalness={0.6} emissive="#10b981" emissiveIntensity={hovered ? 0.8 : 0.4} />
            </mesh>
            <mesh position={[0, -18, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
              <coneGeometry args={[10, 15, 12]} />
              <meshStandardMaterial color="#10b981" roughness={0.1} metalness={0.6} emissive="#10b981" emissiveIntensity={hovered ? 0.8 : 0.4} />
            </mesh>
          </>
        )}
      </group>

      {hovered && (
        <Html position={[0, 45, 0]} center pointerEvents="none">
          <div className="bg-black/90 text-white border border-[#10b981]/40 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide shadow-xl flex items-center gap-2 pointer-events-none select-none whitespace-nowrap z-50">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse shrink-0" />
            <span>Mosquito Net: {isDeployed ? 'Retract' : 'Deploy'} (Click to Toggle)</span>
          </div>
        </Html>
      )}
    </group>
  );
};

interface F252BlindBoxProps {
  width: number;
  height: number;
  blindDeployed: boolean;
  mosquitoDeployed: boolean;
  colorExt: string;
  colorInt: string;
  colorGuides: string;
  colorSlats: string;
  hasBlind: boolean;
  hasMosquito: boolean;
  isThumbnail?: boolean;
  onToggleBlind?: () => void;
  onToggleMosquito?: () => void;
}

const F252BlindBox: React.FC<F252BlindBoxProps> = ({
  width,
  height,
  blindDeployed,
  mosquitoDeployed,
  colorExt,
  colorInt,
  colorGuides,
  colorSlats,
  hasBlind,
  hasMosquito,
  isThumbnail = false,
  onToggleBlind,
  onToggleMosquito
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bboxRef = useRef<any>(null);

  // Animation values
  const blindVal = useRef(blindDeployed ? 1.0 : 0.045);
  const mosquitoVal = useRef(mosquitoDeployed ? 1.0 : 0.045);

  const blindDeployedRef = useRef(blindDeployed);
  const mosquitoDeployedRef = useRef(mosquitoDeployed);

  useEffect(() => {
    blindDeployedRef.current = blindDeployed;
  }, [blindDeployed]);

  useEffect(() => {
    mosquitoDeployedRef.current = mosquitoDeployed;
  }, [mosquitoDeployed]);

  useEffect(() => {
    if (groupRef.current) {
      // Clear any orphaned HMR duplicates
      const oldBboxes = groupRef.current.children.filter(c => c.name && c.name.includes("BBOX"));
      oldBboxes.forEach(c => groupRef.current!.remove(c));
    }

    const bbox = buildBBox225WMsqto({
      width: width,
      drop: height,
      blindDeployed: blindDeployed,
      mosquitoDeployed: mosquitoDeployed,
      colours: {
        boxExterior: colorExt,
        boxInterior: colorInt,
        guides: colorGuides,
        blind: colorSlats,
        mosquitoNet: '#1c1c1c'
      }
    });

    bbox.group.name = "BBOX";
    bboxRef.current = bbox;
    
    // Apply grid texture for mosquito net mesh if present
    const netMaterial = bbox.materials.mosquitoNet;
    if (netMaterial) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 16, 16);
        ctx.strokeStyle = 'rgba(20, 20, 22, 0.85)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 16, 16);
      }
      const netTexture = new THREE.CanvasTexture(canvas);
      netTexture.wrapS = THREE.RepeatWrapping;
      netTexture.wrapT = THREE.RepeatWrapping;
      netTexture.repeat.set(width * 0.5, height * 0.5);
      
      netMaterial.map = netTexture;
      netMaterial.transparent = true;
      netMaterial.opacity = 0.45;
      netMaterial.roughness = 0.9;
      netMaterial.metalness = 0.05;
      netMaterial.needsUpdate = true;
    }

    if (groupRef.current) {
      groupRef.current.add(bbox.group);
    }

    return () => {
      if (groupRef.current && bbox.group) {
        groupRef.current.remove(bbox.group);
      }
      bbox.dispose();
      bboxRef.current = null;
    };
  }, [width, height]);

  // Update deployment heights smoothly
  useFrame((state, delta) => {
    if (bboxRef.current) {
      const targetB = blindDeployedRef.current ? 1.0 : 0.0;
      const targetM = mosquitoDeployedRef.current ? 1.0 : 0.0;
      
      const d = Math.min(delta, 0.1);
      blindVal.current += (targetB - blindVal.current) * d * 0.4;
      mosquitoVal.current += (targetM - mosquitoVal.current) * d * 0.4;
      
      bboxRef.current.setBlind(blindVal.current);
      bboxRef.current.setMosquito(mosquitoVal.current);

      // Toggle mesh visibility
      const blindMesh = bboxRef.current.group.getObjectByName("blind");
      if (blindMesh) {
        blindMesh.visible = hasBlind;
      }
      const netMesh = bboxRef.current.group.getObjectByName("mosquitoNet");
      if (netMesh) {
        netMesh.visible = hasMosquito;
      }
    }
  });

  // Update colors live
  useEffect(() => {
    if (bboxRef.current) {
      const mats = bboxRef.current.materials;
      if (mats.boxExterior) mats.boxExterior.color.set(colorExt);
      if (mats.boxInterior) mats.boxInterior.color.set(colorInt);
      if (mats.guides) mats.guides.color.set(colorGuides);
      if (mats.blind) mats.blind.color.set(colorSlats);
    }
  }, [colorExt, colorInt, colorGuides, colorSlats]);

  return (
    <group 
      ref={groupRef} 
      rotation={[0, Math.PI / 2, 0]} 
      position={[0, height - 23.5, 60.84]} 
    >
      {!isThumbnail && hasBlind && (
        <BlindHotspot 
          position={[135, -45, width - 80]} 
          onClick={onToggleBlind || (() => {})}
          isDeployed={blindDeployed}
        />
      )}
      {!isThumbnail && hasMosquito && (
        <MosquitoHotspot 
          position={[135, -45, 80]} 
          onClick={onToggleMosquito || (() => {})}
          isDeployed={mosquitoDeployed}
        />
      )}
    </group>
  );
};

interface F252ViewerProps {
  width?: number;
  height?: number;
  bottomHeight?: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  isColorPaletteOpen?: boolean;
  isThumbnail?: boolean;
  solarTreatment?: boolean;
  thermalTreatment?: boolean;
  handleColor?: string;
  blindBox?: boolean;
  mosquito?: boolean;
  blindDeployed?: boolean;
  mosquitoDeployed?: boolean;
  blindColorExt?: string;
  blindColorInt?: string;
  blindColorGuides?: string;
  blindColorSlats?: string;
  onToggleBlind?: () => void;
  onToggleMosquito?: () => void;
}

export const F252Viewer: React.FC<F252ViewerProps> = ({
  width = 1000,
  height = 1400,
  bottomHeight = 430,
  colorExt = '#333333',
  colorInt = '#ffffff',
  colorExtTexture,
  colorIntTexture,
  isColorPaletteOpen = false,
  isThumbnail = false,
  solarTreatment = false,
  thermalTreatment = false,
  handleColor = '#aaaaaa',
  blindBox = false,
  mosquito = false,
  blindDeployed = false,
  mosquitoDeployed = false,
  blindColorExt,
  blindColorInt,
  blindColorGuides,
  blindColorSlats,
  onToggleBlind,
  onToggleMosquito
}) => {
  const [windowState, setWindowState] = useState<'Closed' | 'Open' | 'Tilt'>('Closed');

  const [autoRotate, setAutoRotate] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetAutoRotate = useCallback(() => {
    setAutoRotate(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAutoRotate(true), 5000);
  }, []);

  useEffect(() => {
    resetAutoRotate();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetAutoRotate]);

  const [isMirrored, setIsMirrored] = useState(false);
  const [fixedPartPosition, setFixedPartPosition] = useState<'Bottom' | 'Top'>('Bottom');

  const W_M = width / 1000;
  const boxHeightOffset = (blindBox || mosquito) ? 0.2467 : 0;
  const H_M = height / 1000 + boxHeightOffset;
  const maxDim = Math.max(W_M, H_M);

  const MIN_SECTION = 250;
  let safeBottom = Math.max(MIN_SECTION, bottomHeight);
  if (safeBottom > height - MIN_SECTION) {
    safeBottom = Math.max(MIN_SECTION, height - MIN_SECTION);
  }
  const safeTop = height - safeBottom;

  const isEngineFlipped = fixedPartPosition === 'Top';
  const engineTopHeight = !isEngineFlipped ? safeTop : safeBottom;
  const engineBottomHeight = !isEngineFlipped ? safeBottom : safeTop;
  const engineOperableSection = !isEngineFlipped ? 'Top' : 'Bottom';

  const cameraZ = isThumbnail ? maxDim * 1.35 : maxDim * 2.2;

  return (
    <div className="relative w-full h-full" style={{ minHeight: isThumbnail ? '200px' : '400px' }}>
      <Canvas shadows camera={{ position: [W_M / 2, H_M / 2, cameraZ], fov: 45 }} gl={{ antialias: true, localClippingEnabled: true }} onPointerDown={isThumbnail ? undefined : resetAutoRotate}>
        <color attach="background" args={['#ffffff']} />
        <ambientLight intensity={0.40} />
        <directionalLight
          position={[W_M * 2.5, H_M * 3, H_M * 2]}
          intensity={2.6}
          castShadow
          shadow-mapSize={[4096, 4096]}
          shadow-bias={-0.0004}
          color="#fff6e8"
        />
        <directionalLight position={[-W_M, H_M * 0.5, H_M]} intensity={0.7} color="#a8c8ff" />
        <directionalLight position={[W_M * 0.5, -H_M, H_M * 0.5]} intensity={0.2} color="#ffe0a0" />
        <pointLight position={[W_M * 0.5, H_M * 0.5, H_M * 1.5]} intensity={0.35} />
        
        <Suspense fallback={<LoadingOverlay />}>
          <Environment files="/assets/hdri/monochrome_studio_02_1k.exr" />
          
          <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <group scale={0.001}>
              <IG5_F252_Component 
                W={width}
                TopSectionHeight={engineTopHeight}
                BottomSectionHeight={engineBottomHeight}
                isMirrored={isMirrored}
                OperableSection={engineOperableSection}
                EXT_Color={colorExt}
                INT_Color={colorInt}
                EXT_Texture={colorExtTexture}
                INT_Texture={colorIntTexture}
                windowState={windowState}
                isColorPaletteOpen={isColorPaletteOpen}
                onToggleOpen={() => setWindowState(prev => prev === 'Open' ? 'Closed' : 'Open')}
                onToggleTilt={() => setWindowState(prev => prev === 'Tilt' ? 'Closed' : 'Tilt')}
                solarTreatment={solarTreatment}
                thermalTreatment={thermalTreatment}
                handleColor={handleColor}
              />
              {(blindBox || mosquito) && (
                <F252BlindBox 
                  width={width}
                  height={height}
                  blindDeployed={blindDeployed}
                  mosquitoDeployed={mosquitoDeployed}
                  colorExt={blindColorExt || colorExt}
                  colorInt={blindColorInt || colorInt}
                  colorGuides={blindColorGuides || colorExt}
                  colorSlats={blindColorSlats || colorExt}
                  hasBlind={blindBox}
                  hasMosquito={mosquito}
                  isThumbnail={isThumbnail}
                  onToggleBlind={onToggleBlind}
                  onToggleMosquito={onToggleMosquito}
                />
              )}
            </group>
          </group>
        </Suspense>

        <ContactShadows position={[W_M / 2, -0.005, -0.04]} opacity={0.12} scale={maxDim * 5} blur={2.5} far={maxDim * 2} />
        <OrbitControls 
          makeDefault 
          enablePan={!isThumbnail}
          enableZoom={true}
          target={[W_M / 2, H_M / 2, -0.04]} 
          minDistance={maxDim * 0.4} 
          maxDistance={maxDim * 6} 
          autoRotate={!isThumbnail && autoRotate}
          autoRotateSpeed={1.5}
          onStart={isThumbnail ? undefined : resetAutoRotate}
          minPolarAngle={isThumbnail ? Math.PI / 2 : 0}
          maxPolarAngle={isThumbnail ? Math.PI / 2 : Math.PI}
        />
      </Canvas>

      {!isColorPaletteOpen && !isThumbnail && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4 z-40 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <button 
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${windowState === 'Closed' ? 'bg-mammut-gold text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            onClick={() => setWindowState('Closed')}
          >
            Closed
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${windowState === 'Open' ? 'bg-mammut-gold text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            onClick={() => setWindowState('Open')}
          >
            Open
          </button>
          <button 
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${windowState === 'Tilt' ? 'bg-mammut-gold text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            onClick={() => setWindowState('Tilt')}
          >
            Tilt
          </button>
        </div>
      )}

      {!isColorPaletteOpen && !isThumbnail && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-40 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10">
          <button 
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isMirrored ? 'bg-mammut-gold text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            onClick={() => setIsMirrored(!isMirrored)}
          >
            {isMirrored ? 'Hinge Left' : 'Hinge Right'}
          </button>
          
          <button 
            className="px-4 py-2 rounded-lg font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
            onClick={() => setFixedPartPosition(f => f === 'Bottom' ? 'Top' : 'Bottom')}
          >
            Fixed: {fixedPartPosition}
          </button>
        </div>
      )}
      
      {!isThumbnail && (
        <>
          <div 
            className="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-mono rounded pointer-events-none"
            style={{
              background: 'rgba(8,8,22,0.78)',
              border: '1px solid rgba(234,182,118,0.22)',
              color: '#eab676',
              backdropFilter: 'blur(10px)',
            }}
          >
            IGLO 5 – F252
          </div>
          
          <div 
            className="absolute bottom-4 right-4 z-10 px-4 py-2 rounded-lg shadow-lg flex flex-col items-end dimension-badge pointer-events-none"
            style={{
              background: 'rgba(8,8,22,0.85)',
              border: '1px solid rgba(234,182,118,0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 800, color: '#eab676' }}>
              {width} × {height} mm
            </span>
          </div>
        </>
      )}
    </div>
  );
};
