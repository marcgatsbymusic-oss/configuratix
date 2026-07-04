import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { ArrowUp, ArrowDown, Pause } from 'lucide-react';
import { buildBBox225WMsqto } from './bbox_225_w_msqto';

interface BBoxModelProps {
  width: number;
  drop: number;
  blindDeployed: boolean;
  mosquitoDeployed: boolean;
  colours: {
    boxExterior: string;
    boxInterior: string;
    guides: string;
    blind: string;
    mosquitoNet: string;
  };
  onBoundingBoxChange?: (size: THREE.Vector3) => void;
}

const BBoxModel: React.FC<BBoxModelProps> = ({
  width,
  drop,
  blindDeployed,
  mosquitoDeployed,
  colours,
  onBoundingBoxChange
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const bboxRef = useRef<any>(null);

  // Smooth animation tracking variables
  const blindVal = useRef(blindDeployed ? 1.0 : 0.045);
  const mosquitoVal = useRef(mosquitoDeployed ? 1.0 : 0.045);

  const [bAnimating, setBAnimating] = useState(false);
  const [bDirection, setBDirection] = useState<'up' | 'down'>(blindDeployed ? 'down' : 'up');
  const lastBProp = useRef(blindDeployed);

  const [mAnimating, setMAnimating] = useState(false);
  const [mDirection, setMDirection] = useState<'up' | 'down'>(mosquitoDeployed ? 'down' : 'up');
  const lastMProp = useRef(mosquitoDeployed);

  useEffect(() => {
    if (lastBProp.current !== blindDeployed) {
       setBDirection(blindDeployed ? 'down' : 'up');
       setBAnimating(true);
       lastBProp.current = blindDeployed;
    }
  }, [blindDeployed]);

  useEffect(() => {
    if (lastMProp.current !== mosquitoDeployed) {
       setMDirection(mosquitoDeployed ? 'down' : 'up');
       setMAnimating(true);
       lastMProp.current = mosquitoDeployed;
    }
  }, [mosquitoDeployed]);

  useEffect(() => {
    // build parametric group using raw millimeters
    const bbox = buildBBox225WMsqto({
      width: width,
      drop: drop,
      blindDeployed: blindDeployed,
      mosquitoDeployed: mosquitoDeployed,
      colours: {
        boxExterior: colours.boxExterior,
        boxInterior: colours.boxInterior,
        guides: colours.guides,
        blind: colours.blind,
        mosquitoNet: colours.mosquitoNet,
      }
    });

    bboxRef.current = bbox;

    // Apply a tileable grid texture to the mosquito net to make it look like mesh
    let netTexture: THREE.CanvasTexture | null = null;
    const netMaterial = bbox.materials.mosquitoNet;
    if (netMaterial) {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, 16, 16);
        // Draw very thin dark grid lines
        ctx.strokeStyle = 'rgba(20, 20, 22, 0.85)';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, 16, 16);
      }
      netTexture = new THREE.CanvasTexture(canvas);
      netTexture.wrapS = THREE.RepeatWrapping;
      netTexture.wrapT = THREE.RepeatWrapping;
      
      // Approximately 1 repeat every 2mm for high fidelity
      netTexture.repeat.set(width * 0.5, drop * 0.5);
      
      netMaterial.map = netTexture;
      netMaterial.transparent = true;
      netMaterial.opacity = 0.45; // somewhat transparent
      netMaterial.roughness = 0.9;
      netMaterial.metalness = 0.05;
      netMaterial.needsUpdate = true;
    }

    // Scale group to meters
    bbox.group.scale.set(0.001, 0.001, 0.001);

    // Center the group at the origin (0, 0, 0)
    const whole = new THREE.Box3().setFromObject(bbox.group);
    const ctr = whole.getCenter(new THREE.Vector3());
    bbox.group.position.sub(ctr);

    const size = whole.getSize(new THREE.Vector3());
    if (onBoundingBoxChange) {
      onBoundingBoxChange(size);
    }

    if (groupRef.current) {
      groupRef.current.add(bbox.group);
    }

    return () => {
      if (groupRef.current && bbox.group) {
        groupRef.current.remove(bbox.group);
      }
      if (netTexture) {
        netTexture.dispose();
      }
      bbox.dispose();
      bboxRef.current = null;
    };
  }, [width, drop, onBoundingBoxChange]);

  // Update colors live without rebuilding the geometry
  useEffect(() => {
    if (bboxRef.current) {
      const mats = bboxRef.current.materials;
      if (mats.boxExterior) mats.boxExterior.color.set(colours.boxExterior);
      if (mats.boxInterior) mats.boxInterior.color.set(colours.boxInterior);
      if (mats.guides) mats.guides.color.set(colours.guides);
      if (mats.blind) mats.blind.color.set(colours.blind);
      if (mats.mosquitoNet) mats.mosquitoNet.color.set(colours.mosquitoNet);
    }
  }, [colours]);

  useFrame(() => {
    if (bboxRef.current) {
      if (bAnimating) {
        const step = bDirection === 'down' ? 0.003 : -0.003;
        blindVal.current = THREE.MathUtils.clamp(blindVal.current + step, 0.045, 1.0);
        if (blindVal.current === 0.045 || blindVal.current === 1.0) setBAnimating(false);
      }
      if (mAnimating) {
        const step = mDirection === 'down' ? 0.003 : -0.003;
        mosquitoVal.current = THREE.MathUtils.clamp(mosquitoVal.current + step, 0.045, 1.0);
        if (mosquitoVal.current === 0.045 || mosquitoVal.current === 1.0) setMAnimating(false);
      }

      bboxRef.current.setBlind(blindVal.current);
      bboxRef.current.setMosquito(mosquitoVal.current);
    }
  });

  // Calculate box front center for UI
  const boxZ = (247 * 0.001) / 2 + 0.02; // Front of box + slight offset
  const boxY = (drop * 0.001) / 2; // Center Y of the top box part

  return (
    <group ref={groupRef}>
      {/* Mosquito Net Controls (Left) */}
      <Html position={[-0.25, boxY, boxZ]} center zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center gap-1 p-1.5 bg-[#0c0c16]/80 backdrop-blur-md rounded-[10px] border border-white/10 shadow-2xl pointer-events-auto">
          <div className="text-[7px] font-black uppercase tracking-widest text-[#eab676] mb-0.5">Mosquito</div>
          <div className="flex gap-1">
            <button
              onClick={() => { setMDirection('up'); setMAnimating(true); }}
              className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                mAnimating && mDirection === 'up' ? 'bg-mammut-gold text-mammut-black animate-pulse shadow-[0_0_8px_rgba(234,182,118,0.5)]' : 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110'
              }`}
            ><ArrowUp className="w-3 h-3" strokeWidth={2.5} /></button>
            <button
              onClick={() => setMAnimating(false)}
              className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                mAnimating ? 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110' : 'bg-white/5 text-white/20'
              }`}
            ><Pause className="w-3 h-3" strokeWidth={2.5} /></button>
            <button
              onClick={() => { setMDirection('down'); setMAnimating(true); }}
              className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                mAnimating && mDirection === 'down' ? 'bg-mammut-gold text-mammut-black animate-pulse shadow-[0_0_8px_rgba(234,182,118,0.5)]' : 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110'
              }`}
            ><ArrowDown className="w-3 h-3" strokeWidth={2.5} /></button>
          </div>
        </div>
      </Html>

      {/* Blinds Controls (Right) */}
      <Html position={[0.25, boxY, boxZ]} center zIndexRange={[100, 0]}>
        <div className="flex flex-col items-center gap-1 p-1.5 bg-[#0c0c16]/80 backdrop-blur-md rounded-[10px] border border-white/10 shadow-2xl pointer-events-auto">
          <div className="text-[7px] font-black uppercase tracking-widest text-[#eab676] mb-0.5">Blinds</div>
          <div className="flex gap-1">
            <button
              onClick={() => { setBDirection('up'); setBAnimating(true); }}
              className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                bAnimating && bDirection === 'up' ? 'bg-mammut-gold text-mammut-black animate-pulse shadow-[0_0_8px_rgba(234,182,118,0.5)]' : 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110'
              }`}
            ><ArrowUp className="w-3 h-3" strokeWidth={2.5} /></button>
            <button
              onClick={() => setBAnimating(false)}
              className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                bAnimating ? 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110' : 'bg-white/5 text-white/20'
              }`}
            ><Pause className="w-3 h-3" strokeWidth={2.5} /></button>
            <button
              onClick={() => { setBDirection('down'); setBAnimating(true); }}
              className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
                bAnimating && bDirection === 'down' ? 'bg-mammut-gold text-mammut-black animate-pulse shadow-[0_0_8px_rgba(234,182,118,0.5)]' : 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110'
              }`}
            ><ArrowDown className="w-3 h-3" strokeWidth={2.5} /></button>
          </div>
        </div>
      </Html>
    </group>
  );
};

const CameraController: React.FC<{ maxDim: number }> = ({ maxDim }) => {
  const { camera } = useThree();

  useEffect(() => {
    const aspect = window.innerWidth / window.innerHeight;
    const fovRad = (38 * Math.PI) / 180;
    const vFov = 2 * Math.tan(fovRad / 2);
    const radiusForHeight = (maxDim / vFov) * 1.15;
    const radiusForWidth = (maxDim / (vFov * aspect)) * 1.15;
    let radius = Math.max(radiusForHeight, radiusForWidth);

    // Apply minimum distance to avoid clipping
    radius = Math.max(radius, 1.2);

    // Beautiful isometric-style default camera angle: (phi, theta)
    const phi = 1.12;
    const theta = 0.85;

    const posX = radius * Math.sin(phi) * Math.cos(theta);
    const posY = radius * Math.cos(phi);
    const posZ = radius * Math.sin(phi) * Math.sin(theta);

    camera.position.set(posX, posY, posZ);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }, [maxDim, camera]);

  return null;
};

export interface BBox225MosquitoViewerProps {
  width: number;
  height: number; // corresponds to drop in the builder
  blindDeployed: boolean;
  mosquitoDeployed: boolean;
  colours: {
    boxExterior: string;
    boxInterior: string;
    guides: string;
    blind: string;
    mosquitoNet: string;
  };
}

export const BBox225MosquitoViewer: React.FC<BBox225MosquitoViewerProps> = ({
  width,
  height,
  blindDeployed,
  mosquitoDeployed,
  colours
}) => {
  const [maxDim, setMaxDim] = useState(1.5);

  const handleBoundingBoxChange = useCallback((size: THREE.Vector3) => {
    setMaxDim(size.length());
  }, []);

  const shadowY = - (height * 0.001) / 2 - 0.015;

  return (
    <div className="absolute inset-0 bg-white">
      <Canvas
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ fov: 38, near: 0.1, far: 30 }}
      >
        <color attach="background" args={['#ffffff']} />
        <CameraController maxDim={maxDim} />
        
        {/* Pure white ambient fog */}
        <fog attach="fog" args={['#ffffff', 3.5, 10]} />
        
        {/* Lights */}
        <ambientLight intensity={0.4} />
        
        {/* Premium Studio Key Light */}
        <directionalLight
          position={[2.0, 3.5, 3.0]}
          intensity={2.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0002}
          shadow-camera-left={-1.5}
          shadow-camera-right={1.5}
          shadow-camera-top={1.5}
          shadow-camera-bottom={-1.5}
          shadow-camera-near={0.5}
          shadow-camera-far={10}
          color="#fffaee"
        />
        
        {/* Cool Fill Light */}
        <directionalLight
          position={[-2.5, 1.5, -2.5]}
          intensity={0.8}
          color="#adc8ff"
        />

        {/* Bottom bounce light */}
        <directionalLight
          position={[0, -3.0, 0]}
          intensity={0.3}
          color="#ffeedd"
        />

        {/* Parametric model */}
        <BBoxModel
          width={width}
          drop={height}
          blindDeployed={blindDeployed}
          mosquitoDeployed={mosquitoDeployed}
          colours={colours}
          onBoundingBoxChange={handleBoundingBoxChange}
        />

        {/* Orbit Controls */}
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          target={[0, 0, 0]}
          minDistance={maxDim * 0.35}
          maxDistance={maxDim * 3.5}
        />
        
        {/* Dynamic Contact Shadow aligned to the bottom of the guides */}
        <ContactShadows
          position={[0, shadowY, 0]}
          opacity={0.32}
          scale={maxDim * 2.0}
          blur={1.6}
          far={1.5}
        />
      </Canvas>
    </div>
  );
};
