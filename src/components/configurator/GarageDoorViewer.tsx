import React, { useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useTranslation } from 'react-i18next';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useGarageDoorStore } from '../../store/useGarageDoorStore';
import { AdaptiveCamera } from './AdaptiveCamera';

const MM = 0.001; // Scale factor: millimeters to meters

// Helper to compute position and rotation along the track spline
function getTrackPoint(
  d: number, // distance along track in meters
  H: number, // height in meters
  R: number  // curve radius in meters
) {
  const L_vert = H;
  const L_curve = (Math.PI / 2) * R;

  const pos = new THREE.Vector3();
  let rotX = 0;

  if (d <= L_vert) {
    // Vertical track
    pos.set(0, d, 0);
    rotX = 0;
  } else if (d <= L_vert + L_curve) {
    // Curved bend starting at H
    const theta = ((d - L_vert) / L_curve) * (Math.PI / 2);
    pos.set(
      0,
      H + R * Math.sin(theta),
      -R * (1 - Math.cos(theta))
    );
    rotX = -theta;
  } else {
    // Horizontal track at height H + R
    const distHoriz = d - L_vert - L_curve;
    pos.set(0, H + R, -R - distHoriz);
    rotX = -Math.PI / 2;
  }

  return { pos, rotX };
}

// Iterative solver to find the next distance along the track
// such that the straight-line (chord) 3D distance is exactly targetDist
function findNextTrackDistance(
  dStart: number,
  targetDist: number,
  H: number,
  R: number
): number {
  const pStart = getTrackPoint(dStart, H, R).pos;
  let d = dStart + targetDist;
  for (let i = 0; i < 4; i++) {
    const p = getTrackPoint(d, H, R).pos;
    const currentDist = pStart.distanceTo(p);
    const error = currentDist - targetDist;
    d -= error;
  }
  return d;
}

// 3D Garage Door Assembly Component (to be rendered inside Canvas)
function GarageDoorAssembly() {
  const {
    width: w_mm,
    height: h_mm,
    lintelHeight: lh_mm,
    revealLeft: rl_mm,
    revealRight: rr_mm,
    installationDepth: id_mm,
    extColor,
    extTexture,
    casingColor,
    panelThickness: pt_mm,
    embossing,
    driveType,
    springType,
    animationProgress,
  } = useGarageDoorStore();

  // Convert to meters
  const W = w_mm * MM;
  const H = h_mm * MM;
  const LH = lh_mm * MM;
  const RL = rl_mm * MM;
  const RR = rr_mm * MM;
  const D = id_mm * MM;
  const PT = pt_mm * MM;
  const R_curve = 0.35; // 350mm curve radius for tracks

  const panelHeight = H / 4;
  const travelDistance = H + 0.1; // Bottom panel needs to go just above the opening

  // Beveled edge panel Shape & Extrusion Settings
  const panelShape = useMemo(() => {
    const shape = new THREE.Shape();
    const bevel = 0.003; // 3mm bevel
    const halfW = (W - bevel * 2) / 2;
    const halfH = (panelHeight - 0.002 - bevel * 2) / 2;
    shape.moveTo(-halfW, -halfH);
    shape.lineTo(halfW, -halfH);
    shape.lineTo(halfW, halfH);
    shape.lineTo(-halfW, halfH);
    shape.closePath();
    return shape;
  }, [W, panelHeight]);

  const extrudeSettings = useMemo(() => {
    const bevel = 0.003; // 3mm bevel
    return {
      depth: PT / 2 - bevel * 2,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: bevel,
      bevelThickness: bevel,
    };
  }, [PT]);

  // 1. Textures loading (diffuse / normal)
  const textureLoader = useMemo(() => new THREE.TextureLoader(), []);
  
  const extTex = useMemo(() => {
    if (!extTexture) return null;
    const tex = textureLoader.load(extTexture);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 0.5);
    return tex;
  }, [extTexture, textureLoader]);

  const extNormalTex = useMemo(() => {
    let normalPath = null;
    if (extTexture) {
      normalPath = extTexture.replace('diffuse.jpg', 'normal.jpg');
    } else if (embossing === 'woodgrain') {
      normalPath = '/assets/texturesbaked/zaoty-dab_kk/normal.jpg';
    }

    if (!normalPath) return null;

    const tex = textureLoader.load(normalPath);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 0.5);
    return tex;
  }, [extTexture, embossing, textureLoader]);



  // 2. Materials
  const extMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: extColor,
      map: extTex,
      normalMap: extNormalTex || undefined,
      normalScale: extNormalTex ? new THREE.Vector2(0.55, 0.55) : undefined,
      roughness: embossing === 'smooth' ? 0.22 : 0.45,
      metalness: 0.28, // slight metallic sheen of coated steel sheets
    });
  }, [extColor, extTex, extNormalTex, embossing]);



  const steelMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#a3a8a9',
      roughness: 0.25,
      metalness: 0.85,
    });
  }, []);

  const wallMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: casingColor,
      roughness: 0.9,
      metalness: 0.05,
    });
  }, [casingColor]);

  const motorCasingMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#1a1a1a',
      roughness: 0.4,
      metalness: 0.3,
    });
  }, []);

  const rubberMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: '#121212',
      roughness: 0.95,
      metalness: 0.02,
    });
  }, []);

  // Compute 4 panels configuration using hinge-constrained tracking
  const panels = useMemo(() => {
    // Start with the bottom hinge of panel 0 (bottom panel)
    const d0 = animationProgress * travelDistance;
    
    // Find distances along the track for all 5 hinge points
    const hingeDists: number[] = [d0];
    for (let i = 0; i < 4; i++) {
      const nextD = findNextTrackDistance(hingeDists[i], panelHeight, H, R_curve);
      hingeDists.push(nextD);
    }
    
    // Position and rotate the panels between adjacent hinges
    return Array.from({ length: 4 }).map((_, i) => {
      const dStart = hingeDists[i];
      const dEnd = hingeDists[i + 1];
      
      const pStart = getTrackPoint(dStart, H, R_curve).pos;
      const pEnd = getTrackPoint(dEnd, H, R_curve).pos;
      
      // The panel center is the midpoint between its two hinges
      const pos = new THREE.Vector3().addVectors(pStart, pEnd).multiplyScalar(0.5);
      
      // Rotation is determined by the segment direction
      const dir = new THREE.Vector3().subVectors(pEnd, pStart);
      const rotX = Math.atan2(dir.z, dir.y);
      
      return { id: i, pos, rotX };
    });
  }, [animationProgress, H, panelHeight, travelDistance, R_curve]);

  return (
    <group>
      {/* --- Brick / Wall Portal --- */}
      {/* Left Wall Reveal */}
      <mesh position={[-W / 2 - RL / 2, (H + LH) / 2, 0.15]} material={wallMat}>
        <boxGeometry args={[RL, H + LH, 0.3]} />
      </mesh>
      
      {/* Right Wall Reveal */}
      <mesh position={[W / 2 + RR / 2, (H + LH) / 2, 0.15]} material={wallMat}>
        <boxGeometry args={[RR, H + LH, 0.3]} />
      </mesh>

      {/* Lintel (Header) */}
      <mesh position={[0, H + LH / 2, 0.15]} material={wallMat}>
        <boxGeometry args={[W + RL + RR, LH, 0.3]} />
      </mesh>

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.038, -D / 2]} receiveShadow>
        <planeGeometry args={[W + RL + RR + 4, D + 4]} />
        <shadowMaterial opacity={0.4} />
      </mesh>

      {/* --- Side Tracks & Guides --- */}
      {[-W / 2 - 0.02, W / 2 + 0.02].map((xOffset, idx) => (
        <group key={idx} position={[xOffset, 0, -PT]}>
          {/* Vertical Track Channel */}
          <mesh position={[0, H / 2, 0]} material={steelMat}>
            <boxGeometry args={[0.03, H, 0.03]} />
          </mesh>

          {/* Curved Track Bend (Torus quarter segment) */}
          <group position={[0, H, -R_curve]}>
            <mesh rotation={[0, -Math.PI / 2, 0]} material={steelMat}>
              <torusGeometry args={[R_curve, 0.012, 12, 48, Math.PI / 2]} />
            </mesh>
          </group>

          {/* Horizontal Track Running Inwards */}
          <mesh position={[0, H + R_curve, -R_curve - (D - R_curve) / 2]} material={steelMat}>
            <boxGeometry args={[0.03, 0.03, D - R_curve]} />
          </mesh>

          {/* Vertical Track back support/angle bracket */}
          <mesh position={[0, H / 2, 0.03]} material={steelMat}>
            <boxGeometry args={[0.04, H, 0.005]} />
          </mesh>

          {/* Extension Spring (D-Gate-T) inside vertical frames */}
          {springType === 'extension' && (
            <mesh position={[0.015 * (idx === 0 ? 1 : -1), H / 2, 0.015]} material={steelMat}>
              <cylinderGeometry args={[0.008, 0.008, H - 0.2, 12]} />
            </mesh>
          )}
        </group>
      ))}

      {/* --- Overhead Torsion Spring System (above Lintel, inside) --- */}
      {springType === 'torsion' && (
        <group position={[0, H + R_curve + 0.08, -PT - 0.05]}>
          {/* Shaft */}
          <mesh rotation={[0, 0, Math.PI / 2]} material={steelMat}>
            <cylinderGeometry args={[0.015, 0.015, W + 0.1, 16]} />
          </mesh>
          
          {/* Left Torsion Spring Coil */}
          <mesh position={[-W / 3, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={steelMat}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 24]} />
          </mesh>

          {/* Right Torsion Spring Coil */}
          <mesh position={[W / 3, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={steelMat}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 24]} />
          </mesh>
        </group>
      )}

      {/* --- Beninca Jim.3 Center Overhead Drive System --- */}
      {driveType === 'beninca_jim3' && (
        <group position={[0, H + R_curve + 0.12, -PT - 0.1]}>
          {/* Overhead Center Rail */}
          <mesh position={[0, 0, -D / 2]} material={steelMat}>
            <boxGeometry args={[0.04, 0.04, D]} />
          </mesh>

          {/* Beninca Jim.3 Casing */}
          <mesh position={[0, -0.05, -D + 0.15]} material={motorCasingMat}>
            <boxGeometry args={[0.2, 0.12, 0.35]} />
            {/* LED Status Light Indicator on motor */}
            <mesh position={[0, -0.061, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.01, 0.01, 0.005, 16]} />
              <meshBasicMaterial color={animationProgress > 0 && animationProgress < 1 ? '#eab676' : '#10b981'} />
            </mesh>
          </mesh>

          {/* Trolley / Carriage Sliding along Center Rail */}
          <group position={[0, -0.02, -R_curve - animationProgress * travelDistance]}>
            <mesh material={motorCasingMat}>
              <boxGeometry args={[0.06, 0.04, 0.08]} />
            </mesh>
            
            {/* Curved Connection Arm linking to top panel */}
            <mesh 
              position={[0, -0.06, 0.04]} 
              rotation={[-0.4 - (1 - animationProgress) * 0.4, 0, 0]}
              material={steelMat}
            >
              <boxGeometry args={[0.015, 0.12, 0.015]} />
            </mesh>
          </group>
        </group>
      )}

      {/* --- Sectional Panels --- */}
      {panels.map((panel) => {
        // We render each panel segment relative to its computed guide coordinate
        return (
          <group
            key={panel.id}
            position={[0, panel.pos.y, panel.pos.z - PT / 2]}
            rotation={[panel.rotX, 0, 0]}
          >
            {/* Exterior Face Half (Beveled Extrude) */}
            <mesh position={[0, 0, 0]} material={extMat}>
              <extrudeGeometry args={[panelShape, extrudeSettings]} />
            </mesh>

            {/* Interior Face Half (Beveled Extrude) */}
            <mesh position={[0, 0, 0]} rotation={[0, Math.PI, 0]} material={extMat}>
              <extrudeGeometry args={[panelShape, extrudeSettings]} />
            </mesh>

            {/* Bottom black weather-seal (rubber strip) on the bottom panel */}
            {panel.id === 0 && (
              <mesh position={[0, -panelHeight / 2 - 0.02, 0]} material={rubberMat}>
                <boxGeometry args={[W, 0.04, PT]} />
              </mesh>
            )}

            {/* Embossed grooved line details (horizontal ribs) */}
            {embossing === 'grooves' && (
              <group position={[0, 0, PT / 2 + 0.001]}>
                {/* Single center groove line on each panel */}
                <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[W - 0.02, 0.004, 0.002]} />
                  <meshStandardMaterial color="#444444" roughness={0.9} />
                </mesh>
              </group>
            )}

            {/* Dynamic hinges linking sashes at the edges */}
            {[-W / 2 + 0.05, 0, W / 2 - 0.05].map((hx, hIdx) => (
              <group key={hIdx} position={[hx, panelHeight / 2, -PT / 2]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} material={steelMat}>
                  <cylinderGeometry args={[0.006, 0.006, 0.04, 12]} />
                </mesh>
                <mesh position={[0, -0.01, 0]} material={steelMat}>
                  <boxGeometry args={[0.02, 0.03, 0.003]} />
                </mesh>
              </group>
            ))}

            {/* Side guide wheels/rollers (roll inside track channels) */}
            {[-W / 2 - 0.01, W / 2 + 0.01].map((rx, rIdx) => (
              <mesh key={rIdx} position={[rx, panelHeight / 2 - 0.04, -PT / 2]} rotation={[0, 0, Math.PI / 2]} material={steelMat}>
                <cylinderGeometry args={[0.015, 0.015, 0.012, 16]} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}

// Main 3D Canvas wrapper component exported to the page
export function GarageDoorViewer() {
  const isAnimating = useGarageDoorStore((s) => s.isAnimating);
  const animationProgress = useGarageDoorStore((s) => s.animationProgress);
  const animationDirection = useGarageDoorStore((s) => s.animationDirection);
  const setAnimationProgress = useGarageDoorStore((s) => s.setAnimationProgress);
  const setIsAnimating = useGarageDoorStore((s) => s.setIsAnimating);

  // Frame rate independent animation loop
  useFrame((_, delta) => {
    if (isAnimating) {
      // Speed of animation: complete in 4 seconds
      const speed = 0.25;
      if (animationDirection === 'up') {
        let nextProgress = animationProgress + speed * delta;
        if (nextProgress >= 1) {
          nextProgress = 1;
          setIsAnimating(false);
        }
        setAnimationProgress(nextProgress);
      } else {
        let nextProgress = animationProgress - speed * delta;
        if (nextProgress <= 0) {
          nextProgress = 0;
          setIsAnimating(false);
        }
        setAnimationProgress(nextProgress);
      }
    }
  });

  return null; // This sub-component handles the useFrame loop inside Canvas context
}

export function GarageDoorCanvas() {
  const { t } = useTranslation();
  const isAnimating = useGarageDoorStore((s) => s.isAnimating);
  const animationProgress = useGarageDoorStore((s) => s.animationProgress);
  const animationDirection = useGarageDoorStore((s) => s.animationDirection);
  const setAnimationProgress = useGarageDoorStore((s) => s.setAnimationProgress);
  const setIsAnimating = useGarageDoorStore((s) => s.setIsAnimating);
  const setAnimationDirection = useGarageDoorStore((s) => s.setAnimationDirection);
  const width = useGarageDoorStore((s) => s.width);
  const height = useGarageDoorStore((s) => s.height);

  const maxDim = Math.max(width, height) * MM;
  const targetY = (height * MM) / 2;

  // We write an internal component to wrap Canvas-bound hooks
  const FrameLoop = () => {
    useFrame((_, delta) => {
      if (isAnimating) {
        const speed = 0.25; // 4s cycle
        if (animationDirection === 'up') {
          const nextProgress = animationProgress + speed * delta;
          if (nextProgress >= 1) {
            setAnimationProgress(1);
            setIsAnimating(false);
          } else {
            setAnimationProgress(nextProgress);
          }
        } else {
          const nextProgress = animationProgress - speed * delta;
          if (nextProgress <= 0) {
            setAnimationProgress(0);
            setIsAnimating(false);
          } else {
            setAnimationProgress(nextProgress);
          }
        }
      }
    });
    return null;
  };

  return (
    <div className="w-full h-full relative bg-[#f3f4f6] rounded-2xl overflow-hidden border border-black/5 shadow-2xl select-none touch-none">
      <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 50 }} gl={{ antialias: true, preserveDrawingBuffer: true }}>
        <ambientLight intensity={0.22} />
        <directionalLight
          castShadow
          position={[6, 11, 6]}
          intensity={1.8}
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.00015}
        />
        <directionalLight position={[-6, 6, -4]} intensity={0.45} />
        <directionalLight position={[0, 8, -8]} intensity={0.65} color="#eaf2ff" />
        
        <React.Suspense fallback={null}>
          <GarageDoorAssembly />
          <FrameLoop />
          <Environment files="/assets/hdri/suburban_garden_2k.exr" environmentIntensity={0.6} />
        </React.Suspense>

        <Html position={[0, targetY, 0.18]} center>
          <div 
            className="pointer-events-auto flex flex-col gap-3 p-2.5 bg-black/75 backdrop-blur-md border border-white/10 rounded-full shadow-2xl items-center"
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setAnimationDirection('up');
                setIsAnimating(true);
              }}
              disabled={animationProgress === 1 && !isAnimating}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
                isAnimating && animationDirection === 'up'
                  ? 'bg-mammut-gold text-mammut-black animate-pulse shadow-[0_0_15px_rgba(234,182,118,0.5)]'
                  : animationProgress === 1
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110 shadow-lg'
              }`}
              title="Open Door"
            >
              <ArrowUp className="w-5.5 h-5.5" />
            </button>
            <button
              onClick={() => {
                setAnimationDirection('down');
                setIsAnimating(true);
              }}
              disabled={animationProgress === 0 && !isAnimating}
              className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 ${
                isAnimating && animationDirection === 'down'
                  ? 'bg-mammut-gold text-mammut-black animate-pulse shadow-[0_0_15px_rgba(234,182,118,0.5)]'
                  : animationProgress === 0
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-mammut-gold hover:text-mammut-black hover:scale-110 shadow-lg'
              }`}
              title="Close Door"
            >
              <ArrowDown className="w-5.5 h-5.5" />
            </button>
          </div>
        </Html>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          minDistance={0.5}
          maxDistance={25.0}
          maxPolarAngle={Math.PI / 2 - 0.05}
          target={[0, targetY, 0]}
        />
        
        <ContactShadows position={[0, -0.01, 0]} opacity={0.78} scale={14} blur={1.6} far={4} />
        <AdaptiveCamera maxDim={maxDim} targetX={0} targetY={targetY} targetZ={0} fov={50} zSign={1} />
      </Canvas>

      {/* Interactive HUD overlaid on 3D view */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
        <div className="bg-black/60 backdrop-blur px-4 py-2 border border-white/10 rounded-lg text-xs uppercase tracking-widest text-mammut-white flex flex-col justify-center min-h-[40px]">
          <span className="font-black text-mammut-gold">
            {t('garageDoorSim.title', 'Garage Door Simulator')}
          </span>
        </div>
        <div className="bg-black/60 backdrop-blur px-3 py-1.5 border border-white/10 rounded-lg text-[10px] tracking-wider text-mammut-gold pointer-events-auto cursor-help">
          3D INTERACTIVE
        </div>
      </div>
    </div>
  );
}
