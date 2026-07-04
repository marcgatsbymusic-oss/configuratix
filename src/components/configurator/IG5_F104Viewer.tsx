import React, { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import { IG5_F104_Component } from './IG5_F104/IG5_F104_Component';
import { BBox225BlindBox } from './BBox225Component';

const LoadingOverlay = () => (
  <Html center>
    <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-mammut-gold/20">
      <div className="w-5 h-5 border-4 border-mammut-gold border-t-transparent rounded-full animate-spin"></div>
      <span className="font-bold text-gray-700 tracking-wider">Building IG5-F104 Engine...</span>
    </div>
  </Html>
);

interface IG5_F104ViewerProps {
  width?: number;
  height?: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  isColorPaletteOpen?: boolean;
  isThumbnail?: boolean;
  solarTreatment?: boolean;
  thermalTreatment?: boolean;
  hasBlind?: boolean;
  hasMosquito?: boolean;
  blindDeployed?: boolean;
  mosquitoDeployed?: boolean;
  colorGuides?: string;
  colorSlats?: string;
}

export const IG5_F104Viewer: React.FC<IG5_F104ViewerProps> = ({
  width = 1000,
  height = 1000,
  colorExt = '#333333',
  colorInt = '#ffffff',
  colorExtTexture,
  colorIntTexture,
  isColorPaletteOpen = false,
  isThumbnail = false,
  solarTreatment = false,
  thermalTreatment = false,
  hasBlind = false,
  hasMosquito = false,
  blindDeployed = false,
  mosquitoDeployed = false,
  colorGuides = '#383e42',
  colorSlats = '#eab676'
}) => {
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

  const W_M = width / 1000;
  const H_M = height / 1000;
  const maxDim = Math.max(W_M, H_M);

  const cameraZ = isThumbnail ? maxDim * 1.35 : maxDim * 2.2;

  return (
    <div className="relative w-full h-full" style={{ minHeight: isThumbnail ? '200px' : '400px' }}>
      <Canvas shadows camera={{ position: [W_M / 2, H_M / 2, cameraZ], fov: 45 }} gl={{ antialias: true }} onPointerDown={isThumbnail ? undefined : resetAutoRotate}>
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
              <IG5_F104_Component 
                W={width}
                H={height}
                EXT_Color={colorExt}
                INT_Color={colorInt}
                EXT_Texture={colorExtTexture}
                INT_Texture={colorIntTexture}
                solarTreatment={solarTreatment}
                thermalTreatment={thermalTreatment}
              />
              <BBox225BlindBox 
                width={width}
                height={height}
                blindDeployed={blindDeployed}
                mosquitoDeployed={mosquitoDeployed}
                colorExt={colorExt}
                colorInt={colorInt}
                colorGuides={colorGuides}
                colorSlats={colorSlats}
                hasBlind={hasBlind}
                hasMosquito={hasMosquito}
                isThumbnail={isThumbnail}
              />
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
            IGLO 5 – F104
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
export default IG5_F104Viewer;
