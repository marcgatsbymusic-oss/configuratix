import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Html } from '@react-three/drei';
import { 
  Play, Pause, RotateCcw, Eye, EyeOff, Info, 
  Layers, AlertTriangle, CheckCircle, RefreshCw, Compass
} from 'lucide-react';
import * as THREE from 'three';

// ─── Constants ────────────────────────────────────────────────────────────────

// Center axis of the bottom pin from bounds analysis
const PIN_AXIS_X = 0.89225;
const PIN_AXIS_Z = 1.05911;
const PIN_BASE_Y = 0.33;
const HINGE_CENTER_Y = 5.57; // Average Y center of the hinge system

const HINGE_GLB_PATH = '/models/Bottom_hinge_right.glb';

// Preset colors for the hinge covers
const COLOR_PRESETS = [
  { name: 'Satin White', hex: '#f6f6f2', text: '#000000', metallic: 0.05, roughness: 0.45 },
  { name: 'Matte Anthracite', hex: '#2d2d2d', text: '#ffffff', metallic: 0.1, roughness: 0.5 },
  { name: 'Metallic Silver', hex: '#b0b3b8', text: '#000000', metallic: 0.8, roughness: 0.35 },
  { name: 'Anodized Gold', hex: '#cca43b', text: '#ffffff', metallic: 0.75, roughness: 0.4 },
];

// ─── Sub-Component: 3D Window Mockup ─────────────────────────────────────────

function WindowMockup({ swing, tilt }: { swing: number; tilt: number }) {
  // Scaled up window mockup to match the size of the hinge
  const w = 4.0;
  const h = 6.0;
  const d = 0.2;

  const sashPivotRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    if (sashPivotRef.current) {
      // Swing Y, Tilt X
      sashPivotRef.current.rotation.y = swing;
      sashPivotRef.current.rotation.x = tilt;
    }
  });

  return (
    <group position={[-5.5, 0, 0]}>
      {/* Static Outer Frame (Wireframe box) */}
      <mesh>
        <boxGeometry args={[w + 0.2, h + 0.2, d]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.12} />
      </mesh>
      
      {/* Visual frame borders */}
      <gridHelper args={[w, 1, 0xffffff, 0x333333]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]} />

      {/* Sash Pivot Group - placed at bottom right corner [w/2, -h/2, 0] */}
      <group position={[w / 2, -h / 2, 0]} ref={sashPivotRef}>
        <group position={[-w / 2, h / 2, 0]}>
          {/* Sash Frame (Box) */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshPhysicalMaterial 
              color="#eab676" 
              roughness={0.4} 
              metalness={0.1}
              transparent
              opacity={0.65}
            />
          </mesh>
          
          {/* Glass Pane */}
          <mesh>
            <boxGeometry args={[w - 0.4, h - 0.4, 0.02]} />
            <meshPhysicalMaterial 
              color="#a5f3fc" 
              transmission={0.9} 
              transparent 
              opacity={0.25} 
              roughness={0.08} 
              thickness={0.05} 
            />
          </mesh>
        </group>

        {/* Hinge Joint Indicator Sphere */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshBasicMaterial color="#eab676" />
        </mesh>
        
        {/* Label to indicate bottom-right placement */}
        <Html position={[0.4, 0.4, 0]} center>
          <div className="px-2 py-0.5 rounded bg-black/85 border border-white/20 text-[9px] font-bold text-white uppercase whitespace-nowrap">
            Bottom Right Joint
          </div>
        </Html>
      </group>
    </group>
  );
}

// ─── Sub-Component: Headless Model Loader to Extract Nodes ──────────────────

interface ModelLoaderProps {
  onLoaded: (nodes: any[]) => void;
}

import { useGLTF } from '@react-three/drei';

function ModelLoader({ onLoaded }: ModelLoaderProps) {
  const { scene } = useGLTF(HINGE_GLB_PATH);

  useEffect(() => {
    if (scene) {
      const nodeList: any[] = [];
      scene.traverse((child: any) => {
        if (child.isMesh) {
          nodeList.push({
            name: child.name,
            parent: child.parent ? child.parent.name : 'root',
            meshRef: child,
          });
        }
      });
      onLoaded(nodeList);
    }
  }, [scene, onLoaded]);

  return null;
}

// ─── Sub-Component: Hinge Rigging & Rotation Assembly ───────────────────────

interface HingeAssemblyProps {
  correctRigging: boolean;
  swingAngle: number;
  tiltAngle: number;
  visibility: Record<string, boolean>;
  hoveredNode: string | null;
  coverColor: string;
}

function HingeAssembly({
  correctRigging,
  swingAngle,
  tiltAngle,
  visibility,
  hoveredNode,
  coverColor,
}: HingeAssemblyProps) {
  const { scene } = useGLTF(HINGE_GLB_PATH);
  const [assemblyRoot, setAssemblyRoot] = useState<THREE.Group | null>(null);

  // Re-parent / rig the scene graph whenever correctRigging changes
  useEffect(() => {
    if (!scene) return;

    const rootGroup = new THREE.Group();
    // Clone scene to avoid polluting cache
    const clone = scene.clone(true);

    const bottomCover = clone.getObjectByName('Bottom cover');
    const bottomCover001 = clone.getObjectByName('Bottom cover.001');
    const anchorPlate = clone.getObjectByName('Bottom anchor plate for frame');
    const bottomPin = clone.getObjectByName('Bottom Pin');
    const topCover = clone.getObjectByName('Top cover');
    const topCover001 = clone.getObjectByName('Top cover.001');

    if (correctRigging) {
      // Corrected Parent-Child Rigging Structure:
      // staticGroup holds bottom cover and anchor plate
      const staticGroup = new THREE.Group();
      staticGroup.name = "staticGroup";
      rootGroup.add(staticGroup);

      // tiltGroup rotates around bottom pin horizontal hinge (X-axis)
      const tiltGroup = new THREE.Group();
      tiltGroup.name = "tiltGroup";
      tiltGroup.position.set(PIN_AXIS_X, PIN_BASE_Y, PIN_AXIS_Z);
      rootGroup.add(tiltGroup);

      // swingGroup is nested under tiltGroup, pivots around Y-axis of the pin
      const swingGroup = new THREE.Group();
      swingGroup.name = "swingGroup";
      tiltGroup.add(swingGroup);

      // Set positions manually and add (avoiding attach bug on disconnected trees)
      if (bottomCover) {
        bottomCover.position.set(0.05680328235030174, 0.07784152776002884, 0.19986337423324585);
        staticGroup.add(bottomCover);
      }
      if (bottomCover001) {
        bottomCover001.position.set(0.09225225448608398, 0.07953260838985443, 0.2092621922492981);
        staticGroup.add(bottomCover001);
      }
      if (anchorPlate) {
        anchorPlate.position.set(0.09225225448608398, 0.07953260838985443, 0.2092621922492981);
        staticGroup.add(anchorPlate);
      }
      if (bottomPin) {
        bottomPin.position.set(0.09225225448608398 - PIN_AXIS_X, 0.07953260838985443 - PIN_BASE_Y, 0.2092621922492981 - PIN_AXIS_Z);
        tiltGroup.add(bottomPin);
      }
      if (topCover) {
        topCover.position.set(1.3400503396987915 - PIN_AXIS_X, 0.8063958883285522 - PIN_BASE_Y, 1.0549733638763428 - PIN_AXIS_Z);
        swingGroup.add(topCover);
      }
      if (topCover001) {
        topCover001.position.set(0.09225225448608398 - PIN_AXIS_X, 0.07953260838985443 - PIN_BASE_Y, 0.2092621922492981 - PIN_AXIS_Z);
        swingGroup.add(topCover001);
      }
    } else {
      // Default CAD Parenting:
      // Node 2 ("Top cover") is the parent of Node 1 ("Bottom Pin") in the raw file.
      rootGroup.add(clone);
    }

    // Centering the assembly on screen by translating the root.
    // The main pivot is located around [PIN_AXIS_X, HINGE_CENTER_Y, PIN_AXIS_Z].
    // We offset the whole root group so the pivot Y-axis aligns with [0,0,0] world.
    rootGroup.position.set(-PIN_AXIS_X, -HINGE_CENTER_Y, -PIN_AXIS_Z);

    setAssemblyRoot(rootGroup);

    return () => {
      // Clean up meshes
      rootGroup.clear();
    };
  }, [scene, correctRigging]);

  // Apply real-time rotations and styles in loop
  useFrame(() => {
    if (!assemblyRoot) return;

    // Apply rotations
    if (correctRigging) {
      const tiltGroup = assemblyRoot.getObjectByName('tiltGroup');
      const swingGroup = assemblyRoot.getObjectByName('swingGroup');
      if (tiltGroup) {
        // Tilt around X-axis
        tiltGroup.rotation.x = tiltAngle;
      }
      if (swingGroup) {
        // Swing around Y-axis
        swingGroup.rotation.y = swingAngle;
      }
    } else {
      // Incorrect CAD Parenting: rotate Node 2 ("Top cover") directly.
      const topCover = assemblyRoot.getObjectByName('Top cover');
      if (topCover) {
        topCover.rotation.y = swingAngle;
        topCover.rotation.x = tiltAngle;
      }
    }

    // Traverse and apply visibility, highlight, and customized PBR colors
    assemblyRoot.traverse((child: any) => {
      if (child.isMesh) {
        // 1. Visibility toggle
        child.visible = visibility[child.name] !== false;

        // 2. High Quality Material overrides
        if (child.material) {
          if (!child.material.__isCloned) {
            child.material = child.material.clone();
            child.material.__isCloned = true;
            child.material.__originalColor = child.material.color.clone();
            child.material.__originalEmissive = child.material.emissive?.clone() || new THREE.Color(0,0,0);
          }

          // Apply cover color preset
          const isCover = child.name.toLowerCase().includes('cover');
          if (isCover) {
            const preset = COLOR_PRESETS.find(p => p.hex === coverColor) || COLOR_PRESETS[0];
            child.material.color.set(preset.hex);
            child.material.metalness = preset.metallic;
            child.material.roughness = preset.roughness;
          } else if (child.name.toLowerCase().includes('pin')) {
            // Shiny metallic pin
            child.material.color.set('#d1d5db');
            child.material.metalness = 0.95;
            child.material.roughness = 0.15;
          } else {
            // Anchor plate
            child.material.color.set('#8e9299');
            child.material.metalness = 0.8;
            child.material.roughness = 0.3;
          }

          // Apply hover emission glow
          if (hoveredNode === child.name) {
            child.material.emissive.setHex(0x3b2c15); // Warm gold glow
          } else {
            child.material.emissive.copy(child.material.__originalEmissive);
          }
        }
      }
    });
  });

  return assemblyRoot ? <primitive object={assemblyRoot} /> : null;
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const HingeTester: React.FC = () => {
  // Settings & Interactivity States
  const [correctRigging, setCorrectRigging] = useState(true);
  const [swingVal, setSwingVal] = useState(0); // 0 to 90 degrees
  const [tiltVal, setTiltVal] = useState(0);   // 0 to 15 degrees
  const [coverColor, setCoverColor] = useState(COLOR_PRESETS[0].hex); // Default Satin White
  
  // Animation states
  const [isPlaying, setIsPlaying] = useState(false);
  const [animMode, setAnimMode] = useState<'swing' | 'tilt' | 'both'>('swing');
  const animTime = useRef(0);

  // Inspector States
  const [nodes, setNodes] = useState<any[]>([]);
  const [visibility, setVisibility] = useState<Record<string, boolean>>({});
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState<'controls' | 'hierarchy' | 'explainer'>('controls');

  // Convert degrees to radians
  const swingRad = useMemo(() => (swingVal * Math.PI) / 180, [swingVal]);
  const tiltRad = useMemo(() => (tiltVal * Math.PI) / 180, [tiltVal]);

  // Handle auto-animations
  useEffect(() => {
    if (!isPlaying) return;

    let frameId: number;
    const update = (time: number) => {
      animTime.current = time / 1500; // time scaler

      if (animMode === 'swing') {
        const cycle = (Math.sin(animTime.current) + 1) / 2; // 0 to 1
        setSwingVal(Math.round(cycle * 90));
        setTiltVal(0);
      } else if (animMode === 'tilt') {
        const cycle = (Math.sin(animTime.current) + 1) / 2; // 0 to 1
        setSwingVal(0);
        setTiltVal(Math.round(cycle * 12));
      } else {
        // Combined cycle
        const swingCycle = (Math.sin(animTime.current) + 1) / 2;
        const tiltCycle = (Math.cos(animTime.current * 1.5) + 1) / 2;
        setSwingVal(Math.round(swingCycle * 75));
        setTiltVal(Math.round(tiltCycle * 10));
      }

      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, animMode]);

  const toggleVisibility = (name: string) => {
    setVisibility(prev => ({
      ...prev,
      [name]: prev[name] === false
    }));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setSwingVal(0);
    setTiltVal(0);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-[#08080f] overflow-hidden text-white font-sans">
      
      {/* 3D Viewport Area */}
      <div className="relative flex-1 h-[60vh] md:h-full bg-radial from-[#1e2035] via-[#090a12] to-[#040408]">
        
        {/* Visual Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/60 border border-white/10 backdrop-blur-md">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/90">
              Bottom Hinge Right GLB
            </span>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[10px] font-bold uppercase tracking-wider ${
            correctRigging 
              ? 'bg-emerald-950/70 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-950/70 border-rose-500/30 text-rose-400'
          }`}>
            {correctRigging ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Correct Rigging: Pin Un-parented
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                Raw CAD parenting (Pin Rotates)
              </>
            )}
          </div>
        </div>

        {/* Viewport helper badge */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-4 px-3 py-1.5 rounded-lg bg-black/65 border border-white/5 text-[10px] text-white/50 pointer-events-none">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-yellow-500" />
            <span>Drag to Orbit</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <span>Double Click to Reset View</span>
        </div>

        {/* The 3D Canvas */}
        <Canvas
          shadows
          gl={{ antialias: true }}
          camera={{ position: [3, 2, 14], fov: 40 }}
        >
          <color attach="background" args={['#08080f']} />
          <fog attach="fog" args={['#08080f', 8, 30]} />

          {/* Lighting Rig */}
          <ambientLight intensity={0.45} />
          
          {/* Key light */}
          <directionalLight 
            position={[8, 12, 8]} 
            intensity={2.5} 
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
            color="#fff6ed"
          />
          {/* Fill light */}
          <directionalLight position={[-8, 4, -4]} intensity={1.0} color="#93c5fd" />
          {/* Rim light */}
          <pointLight position={[0, 6, -6]} intensity={1.8} color="#e0f2fe" />

          {/* Load Model to parse structure */}
          <ModelLoader onLoaded={setNodes} />

          {/* Main Hinge Assembly (Close Up) */}
          <group position={[0.7, 0, 0]}>
            <HingeAssembly
              correctRigging={correctRigging}
              swingAngle={swingRad}
              tiltAngle={tiltRad}
              visibility={visibility}
              hoveredNode={hoveredNode}
              coverColor={coverColor}
            />
          </group>

          {/* 3D Window Mockup (shows macro movement) */}
          <WindowMockup swing={swingRad} tilt={tiltRad} />

          {/* Visual Axis Helper at Hinge center */}
          {correctRigging && (
            <mesh position={[0.7, PIN_BASE_Y - HINGE_CENTER_Y, 0]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial color="#eab676" />
            </mesh>
          )}

          {/* Studio floor Grid */}
          <Grid
            position={[0, -4.5, 0]}
            args={[25, 25]}
            cellSize={1.0}
            cellThickness={0.5}
            cellColor="#1e293b"
            sectionSize={5.0}
            sectionThickness={1}
            sectionColor="#334155"
            fadeDistance={18}
            infiniteGrid
          />

          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minDistance={2.0}
            maxDistance={35}
            target={[0, 0, 0]}
          />

          <Environment preset="studio" blur={0.8} />
        </Canvas>
      </div>

      {/* Control Sidebar Panel */}
      <div className="w-full md:w-[380px] shrink-0 border-t md:border-t-0 md:border-l border-white/10 bg-[#0c0d1b]/95 backdrop-blur-xl flex flex-col h-[40vh] md:h-full">
        
        {/* Glassmorphism Header */}
        <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div>
            <h1 className="text-sm font-black tracking-wider text-yellow-500 uppercase">Hinge Inspector</h1>
            <p className="text-[10px] text-white/50 uppercase mt-0.5">Bottom Hinge Right CAD Rig</p>
          </div>
          <button 
            onClick={() => setCorrectRigging(p => !p)} 
            title="Toggle Rigging Mode"
            className={`p-2 rounded-lg border transition-all ${
              correctRigging 
                ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/60' 
                : 'bg-rose-950/50 border-rose-500/30 text-rose-400 hover:bg-rose-900/60'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/5 text-xs text-white/60">
          {[
            { id: 'controls', label: 'Rotations', icon: Compass },
            { id: 'hierarchy', label: 'Parts List', icon: Layers },
            { id: 'explainer', label: 'Explainer', icon: Info },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-3 flex items-center justify-center gap-1.5 border-b-2 font-bold uppercase tracking-wider transition-all ${
                activeTab === t.id 
                  ? 'border-yellow-500 text-yellow-500 bg-white/[0.02]' 
                  : 'border-transparent hover:text-white/90'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'controls' && (
            <div className="space-y-6">
              
              {/* Rotation Sliders */}
              <div className="space-y-4">
                <h3 className="text-[11px] font-black uppercase text-yellow-500 tracking-wider">Test Rotations</h3>
                
                {/* Swing slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70 font-semibold">Opening (Swing)</span>
                    <span className="text-yellow-500 font-bold">{swingVal}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={swingVal}
                    disabled={isPlaying}
                    onChange={e => setSwingVal(Number(e.target.value))}
                    className="w-full accent-yellow-500 bg-white/10 h-1 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-white/30">
                    <span>Closed (0°)</span>
                    <span>Fully Open (90°)</span>
                  </div>
                </div>

                {/* Tilt slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-white/70 font-semibold">Tilting</span>
                    <span className="text-yellow-500 font-bold">{tiltVal}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={tiltVal}
                    disabled={isPlaying}
                    onChange={e => setTiltVal(Number(e.target.value))}
                    className="w-full accent-yellow-500 bg-white/10 h-1 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-white/30">
                    <span>Flat (0°)</span>
                    <span>Max Tilt (15°)</span>
                  </div>
                </div>
              </div>

              {/* Animation controls */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                <h3 className="text-[10px] font-black uppercase text-white/40 tracking-wider">Continuous Testing</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPlaying(p => !p)}
                    className="flex-1 py-2 px-4 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-black" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-black" /> Run Test
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white transition-all"
                    title="Reset angles"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {isPlaying && (
                  <div className="flex justify-between gap-1.5 pt-1.5">
                    {[
                      { id: 'swing', label: 'Swing' },
                      { id: 'tilt', label: 'Tilt' },
                      { id: 'both', label: 'Combined' },
                    ].map(mode => (
                      <button
                        key={mode.id}
                        onClick={() => setAnimMode(mode.id as any)}
                        className={`flex-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          animMode === mode.id 
                            ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-500' 
                            : 'bg-transparent border-white/5 text-white/40 hover:text-white/80'
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Custom Cover Colors */}
              <div className="space-y-3">
                <h3 className="text-[11px] font-black uppercase text-yellow-500 tracking-wider">Plastic Covers Color</h3>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => setCoverColor(preset.hex)}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all text-[9px] font-bold ${
                        coverColor === preset.hex
                          ? 'border-yellow-500 bg-yellow-500/10'
                          : 'border-white/5 bg-transparent hover:bg-white/[0.02]'
                      }`}
                    >
                      <div 
                        className="w-5 h-5 rounded-full border border-white/20 shadow-inner" 
                        style={{ backgroundColor: preset.hex }} 
                      />
                      <span className="text-[8px] text-white/50 text-center truncate w-full">{preset.name.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hierarchy' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-[11px] font-black uppercase text-yellow-500 tracking-wider">GLB Part Nodes</h3>
                <span className="text-[10px] text-white/30 font-mono">{nodes.length} Meshes</span>
              </div>

              {/* Node tree list */}
              <div className="space-y-2">
                {nodes.length === 0 ? (
                  <div className="text-xs text-white/35 py-4 text-center">Loading hierarchy...</div>
                ) : (
                  nodes.map(node => {
                    const isVisible = visibility[node.name] !== false;
                    const isHovered = hoveredNode === node.name;
                    return (
                      <div
                        key={node.name}
                        onMouseEnter={() => setHoveredNode(node.name)}
                        onMouseLeave={() => setHoveredNode(null)}
                        className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                          isHovered 
                            ? 'bg-yellow-500/10 border-yellow-500/30' 
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex flex-col gap-0.5 truncate">
                          <span className={`text-xs font-bold ${isHovered ? 'text-yellow-500' : 'text-white/90'}`}>
                            {node.name}
                          </span>
                          <span className="text-[9px] text-white/40 font-mono truncate">
                            Parent: {correctRigging ? (
                              node.name.toLowerCase().includes('pin') ? 'tiltGroup' :
                              node.name.toLowerCase().includes('cover') && node.name.startsWith('Top') ? 'swingGroup' :
                              node.name.toLowerCase().includes('cover') && node.name.startsWith('Bottom') ? 'staticGroup' :
                              node.name.toLowerCase().includes('anchor') ? 'staticGroup' : node.parent
                            ) : node.parent}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleVisibility(node.name)}
                          className={`p-1.5 rounded transition-colors ${
                            isVisible ? 'text-white/60 hover:text-white' : 'text-rose-500 hover:text-rose-400'
                          }`}
                          title={isVisible ? 'Hide Mesh' : 'Show Mesh'}
                        >
                          {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-[9px] text-white/45 leading-relaxed">
                Hover over parts in the list to highlight them in 3D. Hide the covers to view the pin mechanics underneath!
              </div>
            </div>
          )}

          {activeTab === 'explainer' && (
            <div className="space-y-4 text-xs text-white/70 leading-relaxed">
              <h3 className="text-[11px] font-black uppercase text-yellow-500 tracking-wider">Rigging Protrusion Issue</h3>
              
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-2 text-yellow-200">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="space-y-1">
                  <div className="font-bold text-[10px] uppercase tracking-wider">The CAD File Problem</div>
                  <p className="text-[10px]">
                    In the source file `Bottom hinge right.glb`, `Bottom Pin` is parented under `Top cover` inside Node 2. When the cover swings, the pin swings in a wide arc instead of staying centered, causing collision.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white uppercase text-[10px] tracking-wider">How We Fixed It in WebGL:</div>
                <ul className="list-disc pl-4 space-y-1.5 text-white/60 text-[11px]">
                  <li>
                    <strong className="text-white">Unparenting the Pin:</strong> We pull the `Bottom Pin` out of the `Top cover` hierarchy and attach it to the `tiltGroup` at load time.
                  </li>
                  <li>
                    <strong className="text-white">Defining the Correct Pivot:</strong> We swing the cover around the pin's axis center (<span className="font-mono text-yellow-500">X = 0.89225, Z = 1.05911</span>).
                  </li>
                  <li>
                    <strong className="text-white">Nesting for Tilt:</strong> We mount the swing pivot under the tilt pivot, so that the pin and top cover tilt forward together correctly around the horizontal X-axis (<span className="font-mono text-yellow-500">Y = 0.33</span>).
                  </li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/10 text-emerald-300">
                <div className="font-bold text-[10px] uppercase tracking-wider mb-1">Testing the Fix</div>
                <p className="text-[10px] text-white/60">
                  Toggle rigging mode using the <RefreshCw className="inline-block w-3.5 h-3.5 mx-0.5" /> button. Compare "Raw CAD" (mesh collides and swings away) against "Correct Rigging" (perfect rotation) using the swing slider.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Warning Alert on sidebar base */}
        {!correctRigging && (
          <div className="p-3 bg-rose-950/40 border-t border-rose-500/20 text-rose-300 text-[10px] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
            <span>WARNING: Bottom Pin is colliding with and protruding through the Top Cover!</span>
          </div>
        )}
      </div>
      
    </div>
  );
};
