import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { EffectComposer, N8AO } from '@react-three/postprocessing';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { IG5_F252_Component } from './IG5_F252/IG5_F252_Component';
import { BBox225BlindBox } from './BBox225Component';

const RoomEnv = () => {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmremGenerator = new THREE.PMREMGenerator(gl);
    const envTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTexture;
    return () => {
      scene.environment = null;
      envTexture.dispose();
      pmremGenerator.dispose();
    };
  }, [gl, scene]);
  return null;
};

const LoadingOverlay = () => (
  <Html center>
    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-mammut-gold/20">
      <div className="w-5 h-5 border-4 border-mammut-gold border-t-transparent rounded-full animate-spin"></div>
      <span className="font-bold text-gray-700 tracking-wider">Building IG5-F252 Engine...</span>
    </div>
  </Html>
);

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
  isMirrored?: boolean;
  onMirroredChange?: (val: boolean) => void;
  onSceneReady?: (group: THREE.Group) => void;
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
  onToggleMosquito,
  isMirrored,
  onMirroredChange,
  onSceneReady,
}) => {
  const [windowState, setWindowState] = useState<'Closed' | 'Open' | 'Tilt'>('Closed');

  const [autoRotate, setAutoRotate] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetAutoRotate = useCallback(() => {
    setAutoRotate(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setAutoRotate(true), 5000);
  }, []);

  const groupRef = useRef<THREE.Group>(null);



  useEffect(() => {
    resetAutoRotate();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [resetAutoRotate]);

  const [internalMirrored, setInternalMirrored] = useState(false);
  const mirrored = isMirrored !== undefined ? isMirrored : internalMirrored;

  useEffect(() => {
    if (groupRef.current && onSceneReady) {
      onSceneReady(groupRef.current);
    }
  }, [groupRef.current, onSceneReady, width, height, colorExt, colorInt, mirrored]);
  
  const toggleMirrored = () => {
    if (onMirroredChange) onMirroredChange(!mirrored);
    else setInternalMirrored(!mirrored);
  };

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
    <div className="relative w-full h-full" style={{ minHeight: isThumbnail ? '200px' : '400px', background: 'radial-gradient(circle, #ffffff 0%, #e6e4e0 100%)' }}>
      <Canvas dpr={[1, 2]} shadows camera={{ position: [W_M / 2, H_M / 2, cameraZ], fov: 45 }} gl={{ antialias: true, localClippingEnabled: false, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, outputColorSpace: THREE.SRGBColorSpace }} onPointerDown={isThumbnail ? undefined : resetAutoRotate}>
        <color attach="background" args={['#e8e8e8']} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.4}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0005}
          shadow-normalBias={0.02}
          shadow-camera-near={0.1}
          shadow-camera-far={20}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
          shadow-radius={15}
          color="#ffffff"
        />
        <hemisphereLight args={['#ffffff', '#b0b0b0', 0.4]} />
        
        <Suspense fallback={<LoadingOverlay />}>
          <Environment preset="city" background={false} />
          
          <EffectComposer>
            <N8AO aoRadius={2} intensity={1} color="#000000" />
          </EffectComposer>
          
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[W_M / 2, 0, 0]}>
            <planeGeometry args={[20, 20]} />
            <shadowMaterial opacity={0.25} />
          </mesh>
          
          <group ref={groupRef} position={[0, 0, 0]} rotation={[0, 0, 0]}>
            <group scale={0.001}>
              <IG5_F252_Component 
                W={width}
                TopSectionHeight={engineTopHeight}
                BottomSectionHeight={engineBottomHeight}
                isMirrored={mirrored}
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
                <BBox225BlindBox 
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
                />
              )}
            </group>

          </group>
        </Suspense>


        <OrbitControls 
          makeDefault 
          enablePan={!isThumbnail}
          enableZoom={true}
          target={[W_M / 2, H_M / 2, -0.04]} 
          minDistance={maxDim * 0.4} 
          maxDistance={maxDim * 6} 
          autoRotate={false}
          autoRotateSpeed={1.5}
          onStart={undefined}
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
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${mirrored ? 'bg-mammut-gold text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
            onClick={toggleMirrored}
          >
            {mirrored ? 'Hinge Left' : 'Hinge Right'}
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
