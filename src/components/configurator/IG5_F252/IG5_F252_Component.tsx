import React, { useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, MeshTransmissionMaterial } from '@react-three/drei';
import { buildF252Geometries, type F252Geometries } from './IG5_F252_Engine';

const SolarSun: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const [hovered, setHovered] = useState(false);

  const rays = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * Math.PI) / 4;
    const rayLength = 10;
    const x = Math.cos(angle) * 18;
    const y = Math.sin(angle) * 18;
    return (
      <mesh 
        key={i} 
        position={[x, y, 0]} 
        rotation={[0, 0, angle + Math.PI / 2]}
      >
        <cylinderGeometry args={[1.5, 1.5, rayLength, 8]} />
        <meshStandardMaterial color="#fbbf24" roughness={0.3} metalness={0.2} emissive="#fbbf24" emissiveIntensity={0.2} />
      </mesh>
    );
  });

  return (
    <group 
      position={position}
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
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[11, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.2} emissive="#f59e0b" emissiveIntensity={0.2} />
      </mesh>
      {rays}

      {hovered && (
        <Html position={[0, 26, 0]} center pointerEvents="none">
          <div className="bg-black/90 text-white border border-yellow-400/40 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide shadow-xl flex items-center gap-2 pointer-events-none select-none">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0" />
            <span>Solar Treatment: Reflective UV/Heat Shield</span>
          </div>
        </Html>
      )}
    </group>
  );
};

const ThermalIceIcon: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const [hovered, setHovered] = useState(false);

  const arms = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i * Math.PI) / 3;
    const armLength = 22;
    const armRadius = 1.0;
    
    return (
      <group key={i} rotation={[0, 0, angle]}>
        <mesh position={[0, armLength / 2, 0]}>
          <cylinderGeometry args={[armRadius, armRadius, armLength, 6]} />
          <meshStandardMaterial color="#67e8f9" roughness={0.1} metalness={0.5} emissive="#06b6d4" emissiveIntensity={0.4} />
        </mesh>
        
        <group position={[0, 9, 0]}>
          <mesh position={[-3, 2, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.7, 0.7, 8, 6]} />
            <meshStandardMaterial color="#67e8f9" roughness={0.1} metalness={0.5} emissive="#06b6d4" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[3, 2, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.7, 0.7, 8, 6]} />
            <meshStandardMaterial color="#67e8f9" roughness={0.1} metalness={0.5} emissive="#06b6d4" emissiveIntensity={0.4} />
          </mesh>
        </group>

        <group position={[0, 16, 0]}>
          <mesh position={[-2, 1.5, 0]} rotation={[0, 0, Math.PI / 6]}>
            <cylinderGeometry args={[0.6, 0.6, 5, 6]} />
            <meshStandardMaterial color="#67e8f9" roughness={0.1} metalness={0.5} emissive="#06b6d4" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[2, 1.5, 0]} rotation={[0, 0, -Math.PI / 6]}>
            <cylinderGeometry args={[0.6, 0.6, 5, 6]} />
            <meshStandardMaterial color="#67e8f9" roughness={0.1} metalness={0.5} emissive="#06b6d4" emissiveIntensity={0.4} />
          </mesh>
        </group>
      </group>
    );
  });

  return (
    <group 
      position={position}
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
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[5, 5, 3, 6]} />
        <meshStandardMaterial color="#22d3ee" roughness={0.1} metalness={0.5} emissive="#0891b2" emissiveIntensity={0.5} />
      </mesh>
      
      {arms}

      {hovered && (
        <Html position={[0, 26, 0]} center pointerEvents="none">
          <div className="bg-black/90 text-white border border-cyan-400/40 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide shadow-xl flex items-center gap-2 pointer-events-none select-none">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span>Thermal Treatment: Insulating Ice Crystal Shield</span>
          </div>
        </Html>
      )}
    </group>
  );
};

export interface IG5_F252Props {
  TopSectionHeight: number;
  BottomSectionHeight: number;
  W?: number;
  isMirrored?: boolean;
  OperableSection?: 'Top' | 'Bottom';
  EXT_Color?: string;
  INT_Color?: string;
  EXT_Texture?: string;
  INT_Texture?: string;
  windowState?: 'Closed' | 'Open' | 'Tilt';
  isColorPaletteOpen?: boolean;
  onToggleOpen?: () => void;
  onToggleTilt?: () => void;
  solarTreatment?: boolean;
  thermalTreatment?: boolean;
  handleColor?: string;
  isThumbnail?: boolean;
}

export const IG5_F252_Component: React.FC<IG5_F252Props> = ({
  TopSectionHeight,
  BottomSectionHeight,
  W = 1200,
  isMirrored = false,
  OperableSection = 'Top',
  EXT_Color = '#373f43',
  INT_Color = '#ffffff',
  EXT_Texture,
  INT_Texture,
  windowState = 'Closed',
  isColorPaletteOpen = false,
  onToggleOpen,
  onToggleTilt,
  solarTreatment = false,
  thermalTreatment = false,
  handleColor = '#aaaaaa',
  isThumbnail = false,
}) => {
  
  const materials = useMemo(() => {
    return {
      ext: new THREE.MeshStandardMaterial({ color: EXT_Color, roughness: 0.45, metalness: 0.0, envMapIntensity: 1.0, side: THREE.DoubleSide }),
      int: new THREE.MeshStandardMaterial({ color: INT_Color, roughness: 0.45, metalness: 0.0, envMapIntensity: 1.0, side: THREE.DoubleSide }),
      gsk: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }),
      glass: isThumbnail ? new THREE.MeshStandardMaterial({
        color: 0xeaf2f0,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
        metalness: 0.3,
        side: THREE.DoubleSide
      }) : new THREE.MeshPhysicalMaterial({ 
        color: 0xeaf2f0, 
        transmission: 1.0, 
        roughness: 0.03,
        metalness: 0,
        thickness: 24, // Assuming 24mm unit based on tips
        ior: 1.5,
        specularIntensity: 1,
        envMapIntensity: 1.2,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        transparent: true,
        side: THREE.DoubleSide 
      }),
      spacer: new THREE.MeshStandardMaterial({ color: 0x999999, roughness: 0.5, metalness: 0.6, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }),
      hardware: new THREE.MeshStandardMaterial({ color: handleColor, roughness: 0.4, metalness: 0.8, side: THREE.DoubleSide }),
    };
  }, [EXT_Color, INT_Color, handleColor, isThumbnail]);

  // Update dynamic colors and textures
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    
    if (EXT_Texture) {
      loader.load(EXT_Texture, (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.002, 0.002);
        tex.colorSpace = THREE.SRGBColorSpace;
        materials.ext.map = tex;
        materials.ext.color.set(0xffffff);
        materials.ext.needsUpdate = true;
      });
    } else {
      materials.ext.map = null;
      materials.ext.color.set(EXT_Color || '#ffffff');
      materials.ext.needsUpdate = true;
    }
    
    if (INT_Texture) {
      loader.load(INT_Texture, (tex) => {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.002, 0.002);
        tex.colorSpace = THREE.SRGBColorSpace;
        materials.int.map = tex;
        materials.int.color.set(0xffffff);
        materials.int.needsUpdate = true;
      });
    } else {
      materials.int.map = null;
      materials.int.color.set(INT_Color || '#ffffff');
      materials.int.needsUpdate = true;
    }

    if (handleColor) {
      materials.hardware.color.set(handleColor);
      
      // If the handle is explicitly white or black, treat it as a painted/powder-coated finish
      const hex = handleColor.toLowerCase();
      const isPainted = hex === '#ffffff' || hex === '#fff' || hex === '#000000' || hex === '#000' || hex === '#111111';
      
      materials.hardware.metalness = isPainted ? 0.05 : 0.8;
      materials.hardware.roughness = isPainted ? 0.4 : 0.4;
      
      materials.hardware.needsUpdate = true;
    }
  }, [EXT_Color, INT_Color, EXT_Texture, INT_Texture, handleColor, materials]);

  const geoms = useMemo<F252Geometries | null>(() => {
    try {
      return buildF252Geometries({
        TopSectionHeight,
        BottomSectionHeight,
        W,
        isMirrored,
        OperableSection
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [TopSectionHeight, BottomSectionHeight, W, isMirrored, OperableSection]);

  const bottomGlassLocalBounds = useMemo(() => {
    if (!geoms) return null;
    const mesh = geoms.fixedMeshes.find(m => m.matKey === 'glass');
    if (!mesh) return null;
    if (!mesh.geom.boundingBox) mesh.geom.computeBoundingBox();
    return mesh.geom.boundingBox;
  }, [geoms]);

  const topGlassLocalBounds = useMemo(() => {
    if (!geoms) return null;
    const mesh = geoms.sashMeshes.find(m => m.matKey === 'glass');
    if (!mesh) return null;
    if (!mesh.geom.boundingBox) mesh.geom.computeBoundingBox();
    return mesh.geom.boundingBox;
  }, [geoms]);

  const bottomSunPos = useMemo<[number, number, number] | null>(() => {
    if (!bottomGlassLocalBounds) return null;
    return [
      bottomGlassLocalBounds.min.x + 50,
      bottomGlassLocalBounds.min.y + 50,
      bottomGlassLocalBounds.min.z - 3
    ];
  }, [bottomGlassLocalBounds]);

  const bottomThermalPos = useMemo<[number, number, number] | null>(() => {
    if (!bottomGlassLocalBounds) return null;
    return [
      bottomGlassLocalBounds.max.x - 50,
      bottomGlassLocalBounds.min.y + 50,
      bottomGlassLocalBounds.max.z + 3
    ];
  }, [bottomGlassLocalBounds]);

  const topSunPos = useMemo<[number, number, number] | null>(() => {
    if (!topGlassLocalBounds) return null;
    return [
      topGlassLocalBounds.min.x + 50,
      topGlassLocalBounds.min.y + 50,
      topGlassLocalBounds.min.z - 3
    ];
  }, [topGlassLocalBounds]);

  const topThermalPos = useMemo<[number, number, number] | null>(() => {
    if (!topGlassLocalBounds) return null;
    return [
      topGlassLocalBounds.max.x - 50,
      topGlassLocalBounds.min.y + 50,
      topGlassLocalBounds.max.z + 3
    ];
  }, [topGlassLocalBounds]);

  const sashRef = useRef<THREE.Group>(null);
  const handleRef = useRef<THREE.Mesh>(null);

  const animState = useRef({
    startTime: 0,
    prevState: windowState || 'Closed',
    lastHandleZ: 0
  });

  useFrame((state, delta) => {
    if (!sashRef.current || !handleRef.current) return;

    if (animState.current.prevState !== windowState) {
      animState.current.startTime = state.clock.getElapsedTime();
      animState.current.prevState = windowState || 'Closed';
      animState.current.lastHandleZ = handleRef.current.rotation.z;
    }

    const elapsed = state.clock.getElapsedTime() - animState.current.startTime;
    const ease = (x: number) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;

    let targetRotY = 0;
    let targetRotX = 0;
    let handleRotZ = 0; 
    
    // Smooth staged lerp targets
    if (windowState === 'Open') {
      const maxSide = isMirrored ? -(110 * Math.PI / 180) : (110 * Math.PI / 180);
      handleRotZ = isMirrored ? -Math.PI / 2 : Math.PI / 2;
      
      if (elapsed < 0.4) {
        targetRotY = 0;
      } else if (elapsed < 1.6) {
        targetRotY = maxSide * 0.4 * ease((elapsed - 0.4) / 1.2);
      } else if (elapsed < 4.0) {
        targetRotY = maxSide * 0.4;
      } else if (elapsed < 7.0) {
        targetRotY = maxSide * 0.4 + maxSide * 0.6 * ease((elapsed - 4.0) / 3.0);
      } else {
        targetRotY = maxSide;
      }
    } else if (windowState === 'Tilt') {
      const operableHeight = OperableSection === 'Top' ? TopSectionHeight : BottomSectionHeight;
      targetRotX = Math.asin(150 / operableHeight);
      handleRotZ = Math.PI; 
    } else {
      // Closed
      targetRotX = 0;
      targetRotY = 0;
      // When closing, wait for sash to close before rotating handle back
      const isSashClosed = Math.abs(sashRef.current.rotation.y) < 0.05 && Math.abs(sashRef.current.rotation.x) < 0.05;
      if (!isSashClosed) {
        handleRotZ = animState.current.lastHandleZ;
      } else {
        handleRotZ = 0;
      }
    }

    let lerpSpeedY = 10;
    let lerpSpeedX = 10;
    let lerpSpeedZ = 15;

    if (windowState === 'Tilt') {
      lerpSpeedX = 1.0; // Slow tilt opening (extremely smooth)
    } else if (windowState === 'Closed') {
      lerpSpeedX = 2.5; // Gentle closing
      lerpSpeedY = 2.5; // Gentle closing
      lerpSpeedZ = 8.0; // Gentle handle turn
    } else if (windowState === 'Open') {
      lerpSpeedY = 6.0; // Smooth open
    }

    sashRef.current.rotation.y = THREE.MathUtils.lerp(sashRef.current.rotation.y, targetRotY, delta * lerpSpeedY);
    sashRef.current.rotation.x = THREE.MathUtils.lerp(sashRef.current.rotation.x, targetRotX, delta * lerpSpeedX);
    handleRef.current.rotation.z = THREE.MathUtils.lerp(handleRef.current.rotation.z, handleRotZ, delta * lerpSpeedZ);
  });

  if (!geoms) {
    return null;
  }

  const getMat = (key: string) => materials[key as keyof typeof materials] || materials.int;

  return (
    <group>
      {/* FRAME */}
      {geoms.frameMeshes.map((m, i) => (
        <mesh key={`f-${i}`} geometry={m.geom} material={m.matKey === 'glass' ? undefined : getMat(m.matKey)} castShadow={!isThumbnail} receiveShadow={!isThumbnail} frustumCulled={false}>
          {m.matKey === 'glass' && !isThumbnail && <MeshTransmissionMaterial color="#ffffff" transmission={1.0} thickness={0.015} roughness={0.02} ior={1.52} resolution={1024} samples={16} chromaticAberration={0.02} background={new THREE.Color('#d4d4d8')} polygonOffset={true} polygonOffsetFactor={1} polygonOffsetUnits={1} />}
        </mesh>
      ))}
      
      {/* TRANSOM */}
      {geoms.transomMeshes.map((m, i) => (
        <mesh key={`t-${i}`} geometry={m.geom} material={m.matKey === 'glass' ? undefined : getMat(m.matKey)} castShadow={!isThumbnail} receiveShadow={!isThumbnail} frustumCulled={false}>
          {m.matKey === 'glass' && !isThumbnail && <MeshTransmissionMaterial color="#ffffff" transmission={1.0} thickness={0.015} roughness={0.02} ior={1.52} resolution={1024} samples={16} chromaticAberration={0.02} background={new THREE.Color('#d4d4d8')} polygonOffset={true} polygonOffsetFactor={1} polygonOffsetUnits={1} />}
        </mesh>
      ))}

      {/* FIXED GLAZING */}
      {geoms.fixedMeshes.map((m, i) => (
        <mesh key={`fix-${i}`} geometry={m.geom} material={m.matKey === 'glass' ? undefined : getMat(m.matKey)} castShadow={!isThumbnail} receiveShadow={!isThumbnail} frustumCulled={false}>
          {m.matKey === 'glass' && !isThumbnail && <MeshTransmissionMaterial color="#ffffff" transmission={1.0} thickness={0.015} roughness={0.02} ior={1.52} resolution={1024} samples={16} chromaticAberration={0.02} background={new THREE.Color('#d4d4d8')} polygonOffset={true} polygonOffsetFactor={1} polygonOffsetUnits={1} />}
        </mesh>
      ))}

      {/* SOLAR TREATMENT (Bottom Fixed Glazing) */}
      {solarTreatment && bottomSunPos && (
        <SolarSun position={bottomSunPos} />
      )}

      {/* THERMAL TREATMENT (Bottom Fixed Glazing) */}
      {thermalTreatment && bottomThermalPos && (
        <ThermalIceIcon position={bottomThermalPos} />
      )}

      {/* SASH GROUP */}
      <group ref={sashRef} position={geoms.sashGroupOrigin}>
        {geoms.sashMeshes.map((m, i) => (
          <mesh key={`s-${i}`} geometry={m.geom} material={m.matKey === 'glass' ? undefined : getMat(m.matKey)} castShadow={!isThumbnail} receiveShadow={!isThumbnail} frustumCulled={false}>
            {m.matKey === 'glass' && !isThumbnail && <MeshTransmissionMaterial color="#ffffff" transmission={1.0} thickness={0.015} roughness={0.02} ior={1.52} resolution={1024} samples={16} chromaticAberration={0.02} background={new THREE.Color('#d4d4d8')} polygonOffset={true} polygonOffsetFactor={1} polygonOffsetUnits={1} />}
          </mesh>
        ))}

        {/* SOLAR TREATMENT (Top Sash Glazing) */}
        {solarTreatment && topSunPos && (
          <SolarSun position={topSunPos} />
        )}

        {/* THERMAL TREATMENT (Top Sash Glazing) */}
        {thermalTreatment && topThermalPos && (
          <ThermalIceIcon position={topThermalPos} />
        )}

        {/* HANDLE */}
        {geoms.handleGripMesh && geoms.handleBaseMesh && (
          <group position={geoms.handlePos}>
            <mesh geometry={geoms.handleBaseMesh} material={getMat('hardware')} castShadow={!isThumbnail} receiveShadow={!isThumbnail} />
            <mesh ref={handleRef} geometry={geoms.handleGripMesh} material={getMat('hardware')} castShadow={!isThumbnail} receiveShadow={!isThumbnail} />
          </group>
        )}

        {/* HOTSPOTS */}
        {!isColorPaletteOpen && (
          <>
            {/* Open/Side Hotspot near the handle */}
            <Html position={[geoms.handlePos[0], geoms.handlePos[1], geoms.handlePos[2] + 40]} center>
              <div
                className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                onClick={(e) => { e.stopPropagation(); onToggleOpen?.(); }}
              >
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                </div>
              </div>
            </Html>

            {/* Tilt Hotspot at the top center of the sash */}
            <Html position={[(geoms.W / 2) - geoms.sashGroupOrigin[0], geoms.H - geoms.sashGroupOrigin[1] - 50, geoms.handlePos[2] + 40]} center>
              <div
                className="w-10 h-10 flex items-center justify-center cursor-pointer transition-all hover:scale-110"
                style={{ animation: 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                onClick={(e) => { e.stopPropagation(); onToggleTilt?.(); }}
              >
                <div className="relative w-4 h-4 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-[#d4d4d8] opacity-40 blur-[2px]" />
                  <div className="absolute w-2.5 h-2.5 rounded-full bg-[#d4d4d8] border-[1.5px] border-white shadow-sm" />
                </div>
              </div>
            </Html>
          </>
        )}
      </group>
    </group>
  );
};
