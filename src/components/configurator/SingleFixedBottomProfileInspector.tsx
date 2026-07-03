import React, { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import profileDataRaw from '../../data/profiles/IGLO5/single_fixed_bottom.json';

// --- Types ---
interface Point { x: number; y: number; }
interface Contour { id: string; points: Point[]; pointCount: number; svgPath: string; }
interface LayerData { group: string; contours: Contour[]; }
interface ProfileData {
  meta: {
    system: string;
    type: string;
    bounds: { normalised: { minX: number; maxX: number; minY: number; maxY: number } };
  };
  layers: Record<string, LayerData>;
}

const profileData = profileDataRaw as unknown as ProfileData;
const MM = 0.001; // Scale factor: CAD mm to three.js meters

// Meta description for each layer for clean inspector UI
const LAYER_METADATA: Record<string, { name: string; desc: string; matType: string; color: string }> = {
  FRM_EXT: { name: 'Frame Exterior Shell', desc: 'Outer main frame PVC profile exposed to the exterior.', matType: 'pvc', color: '#e8e0d4' },
  FRM_INT: { name: 'Frame Interior Shell', desc: 'Inner main frame PVC profile facing the interior room.', matType: 'pvc', color: '#f0ece6' },
  GSK_FRM_EXT: { name: 'Frame Exterior Gasket', desc: 'EPDM weather seal mounted on the outer frame rebate.', matType: 'gasket', color: '#1c1c1c' },
  SSH_EXT: { name: 'Sash Exterior Shell', desc: 'Outer sash PVC profile holding the glazing unit from outside.', matType: 'pvc', color: '#e8e0d4' },
  SSH_INT: { name: 'Sash Interior Shell', desc: 'Inner sash PVC profile facing the room.', matType: 'pvc', color: '#f0ece6' },
  GSK_SSH_EXT: { name: 'Sash Exterior Gasket', desc: 'EPDM seal between sash and outer glass face.', matType: 'gasket', color: '#1c1c1c' },
  GSK_SSH_INT: { name: 'Sash Interior Gasket', desc: 'EPDM compression seal sealing sash against the frame rebate.', matType: 'gasket', color: '#1c1c1c' },
  BZD: { name: 'Glazing Bead', desc: 'Decorative clip-in profile securing the glass pane from inside.', matType: 'pvc', color: '#f0ece6' },
  GSK_BZD: { name: 'Glazing Bead Gasket', desc: 'Inner glass wedge gasket holding the glass pane tight.', matType: 'gasket', color: '#1c1c1c' },
  SPACER: { name: 'Glazing Spacer Bar', desc: 'Warm-edge plastic/aluminum spacers holding triple glass panes apart.', matType: 'spacer', color: '#4B4B4D' },
  GLS_EXT: { name: 'Glass Pane - Exterior', desc: 'Outer 4mm tempered glass sheet.', matType: 'glass', color: '#88ccff' },
  GLS_MD: { name: 'Glass Pane - Middle', desc: 'Middle 4mm float glass sheet.', matType: 'glass', color: '#88ccff' },
  GLS_INT: { name: 'Glass Pane - Interior', desc: 'Inner 4mm float glass sheet.', matType: 'glass', color: '#88ccff' },
  POST_EXT: { name: 'Transom Exterior Shell', desc: 'Outer shell of the mullion/transom profile.', matType: 'pvc', color: '#e8e0d4' },
  POST_INT: { name: 'Transom Interior Shell', desc: 'Inner shell of the mullion/transom profile.', matType: 'pvc', color: '#f0ece6' },
};

// Material shader parameters
const PVC_MATERIAL_EXT = new THREE.MeshStandardMaterial({ color: '#e8e0d4', roughness: 0.45, metalness: 0.05 });
const PVC_MATERIAL_INT = new THREE.MeshStandardMaterial({ color: '#f0ece6', roughness: 0.45, metalness: 0.05 });
const GASKET_MATERIAL = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.8, metalness: 0.0 });
const SPACER_MATERIAL = new THREE.MeshStandardMaterial({ color: '#4b4b4d', roughness: 0.5, metalness: 0.6 });
const GLASS_MATERIAL = new THREE.MeshPhysicalMaterial({
  color: '#e0f2fe',
  roughness: 0.05,
  metalness: 0.0,
  transmission: 0.9,
  ior: 1.5,
  thickness: 0.005,
  transparent: true,
  opacity: 0.45,
});

// Helper to determine center of a layer for explode directions
const getLayerCenter = (contours: Contour[]) => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  let count = 0;
  for (const c of contours) {
    for (const p of c.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      count++;
    }
  }
  return {
    x: count > 0 ? (minX + maxX) / 2 : 0,
    y: count > 0 ? (minY + maxY) / 2 : 0,
    width: count > 0 ? (maxX - minX) : 0,
    height: count > 0 ? (maxY - minY) : 0,
  };
};

export const SingleFixedBottomProfileInspector: React.FC = () => {
  const [layoutMode, setLayoutMode] = useState<'assembled' | 'grid'>('assembled');
  const [explodeValue, setExplodeValue] = useState(0); // 0 to 100
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null);
  const [pvcColor, setPvcColor] = useState<string>('#e8e0d4'); // Active Ext PVC Color

  // Visibility states
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    Object.keys(profileData.layers).forEach((key) => { init[key] = true; });
    return init;
  });

  const layersList = useMemo(() => Object.keys(profileData.layers), []);

  // Shared origin (normalize bottom-left coordinates)
  const commonOrigin = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    Object.values(profileData.layers).forEach((layer) => {
      layer.contours.forEach((c) => {
        c.points.forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
        });
      });
    });
    return { x: minX, y: minY };
  }, []);

  // Center of the entire cross-section
  const sectionCenter = useMemo(() => {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    Object.values(profileData.layers).forEach((layer) => {
      layer.contours.forEach((c) => {
        c.points.forEach((p) => {
          if (p.x < minX) minX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.x > maxX) maxX = p.x;
          if (p.y > maxY) maxY = p.y;
        });
      });
    });
    return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
  }, []);

  // Compute centers and bounds for each layer
  const layerCenters = useMemo(() => {
    const centers: Record<string, { x: number; y: number; width: number; height: number }> = {};
    Object.entries(profileData.layers).forEach(([name, data]) => {
      centers[name] = getLayerCenter(data.contours);
    });
    return centers;
  }, []);

  // Preset quick filters
  const toggleGroup = (group: string, visible: boolean) => {
    setVisibleLayers((prev) => {
      const updated = { ...prev };
      Object.entries(profileData.layers).forEach(([name, data]) => {
        if (data.group === group) updated[name] = visible;
      });
      return updated;
    });
  };

  const toggleMaterialType = (matType: string, visible: boolean) => {
    setVisibleLayers((prev) => {
      const updated = { ...prev };
      Object.entries(LAYER_METADATA).forEach(([key, val]) => {
        if (val.matType === matType) updated[key] = visible;
      });
      return updated;
    });
  };

  // Profile element 3D block component
  const ProfileBlock = ({ name, data }: { name: string; data: LayerData }) => {
    const center = layerCenters[name];
    const isSelected = selectedLayer === name;
    const isHovered = hoveredLayer === name;

    // Build extruded geometry
    const geometry = useMemo(() => {
      const groupGeo = new THREE.Group();
      data.contours.forEach((contour) => {
        if (contour.points.length === 0) return;
        const shape = new THREE.Shape();
        
        // Offset shape relative to the common origin
        shape.moveTo((contour.points[0].x - commonOrigin.x) * MM, (contour.points[0].y - commonOrigin.y) * MM);
        for (let i = 1; i < contour.points.length; i++) {
          shape.lineTo((contour.points[i].x - commonOrigin.x) * MM, (contour.points[i].y - commonOrigin.y) * MM);
        }
        shape.closePath();

        const extrudeSettings = {
          depth: 0.25, // 250mm solid block depth
          bevelEnabled: false,
        };

        const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geom.center(); // Center local bounds of the geometry
        groupGeo.add(new THREE.Mesh(geom));
      });
      return groupGeo;
    }, [data, commonOrigin]);

    // Material matching
    const material = useMemo(() => {
      const meta = LAYER_METADATA[name] || { matType: 'pvc', color: '#ffffff' };
      let baseMat: THREE.Material;

      if (meta.matType === 'glass') baseMat = GLASS_MATERIAL.clone();
      else if (meta.matType === 'gasket') baseMat = GASKET_MATERIAL.clone();
      else if (meta.matType === 'spacer') baseMat = SPACER_MATERIAL.clone();
      else if (name.includes('EXT')) {
        baseMat = PVC_MATERIAL_EXT.clone();
        (baseMat as THREE.MeshStandardMaterial).color.set(pvcColor);
      } else {
        baseMat = PVC_MATERIAL_INT.clone();
      }

      // Selection feedback
      if (isSelected) {
        (baseMat as any).emissive = new THREE.Color('#eab676');
        (baseMat as any).emissiveIntensity = 0.35;
      } else if (isHovered) {
        (baseMat as any).emissive = new THREE.Color('#ffffff');
        (baseMat as any).emissiveIntensity = 0.15;
      }

      return baseMat;
    }, [name, isSelected, isHovered, pvcColor]);

    // Calculate transformations
    const position = useMemo((): [number, number, number] => {
      if (layoutMode === 'grid') {
        const index = layersList.indexOf(name);
        const col = index % 4;
        const row = Math.floor(index / 4);
        return [(col - 1.5) * 0.25, (row - 1.5) * 0.22, 0];
      }

      // Explode displacement vector (outward from section center)
      const dirX = center.x - sectionCenter.x;
      const dirY = center.y - sectionCenter.y;
      const len = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
      const explodeFactor = (explodeValue / 100) * 0.18; // Max 180mm separation

      // Original relative position
      const origX = (center.x - commonOrigin.x) * MM;
      const origY = (center.y - commonOrigin.y) * MM;

      return [
        origX + (dirX / len) * explodeFactor,
        origY + (dirY / len) * explodeFactor,
        0,
      ];
    }, [layoutMode, name, center, explodeValue, sectionCenter, commonOrigin]);

    if (!visibleLayers[name]) return null;

    return (
      <group
        position={position}
        onClick={(e: any) => {
          e.stopPropagation();
          setSelectedLayer(name);
        }}
        onPointerOver={(e: any) => {
          e.stopPropagation();
          setHoveredLayer(name);
        }}
        onPointerOut={() => setHoveredLayer(null)}
      >
        {geometry.children.map((child: any, idx) => (
          <mesh
            key={idx}
            geometry={child.geometry}
            material={material}
            castShadow
            receiveShadow
          />
        ))}
      </group>
    );
  };

  const selectedMeta = selectedLayer ? LAYER_METADATA[selectedLayer] : null;
  const selectedData = selectedLayer ? profileData.layers[selectedLayer] : null;
  const selectedCenter = selectedLayer ? layerCenters[selectedLayer] : null;

  return (
    <div className="absolute inset-0 flex bg-[#08080f] font-sans">
      {/* 3D Canvas Area */}
      <div className="flex-1 relative h-full">
        <Canvas shadows camera={{ position: [0, 0.2, 0.45], fov: 50 }}>
          <ambientLight intensity={0.55} />
          <directionalLight
            position={[5, 12, 8]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          <directionalLight position={[-5, 5, -8]} intensity={0.4} />
          <spotLight position={[0, 8, 0]} intensity={0.8} angle={Math.PI / 4} penumbra={1} castShadow />

          <group position={[0, -0.05, 0]}>
            {Object.entries(profileData.layers).map(([name, data]) => (
              <ProfileBlock key={name} name={name} data={data} />
            ))}
          </group>

          <Grid
            position={[0, -0.08, 0]}
            args={[2, 2]}
            cellSize={0.05}
            cellThickness={0.5}
            cellColor="#1a1c30"
            sectionSize={0.2}
            sectionThickness={1}
            sectionColor="#2a2d48"
            fadeDistance={1.5}
          />

          <OrbitControls makeDefault enableDamping minDistance={0.1} maxDistance={2} />
          <Environment preset="city" />
        </Canvas>

        {/* Hover / Highlight Tooltip Overlay */}
        {hoveredLayer && (
          <div className="absolute top-4 left-4 bg-[#0d0e17]/85 border border-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-xl pointer-events-none transition-all">
            <span className="text-[9px] text-yellow-500 font-extrabold uppercase tracking-widest block">
              Hovering Layer
            </span>
            {LAYER_METADATA[hoveredLayer]?.name || hoveredLayer}
          </div>
        )}
      </div>

      {/* Control Panel / Sidebar */}
      <div className="w-[380px] bg-[#0c0d18] border-l border-white/5 flex flex-col z-10 shrink-0 text-white overflow-y-auto">
        {/* Header Section */}
        <div className="p-5 border-b border-white/5 bg-[#0e101f]">
          <span className="text-[10px] font-black uppercase text-yellow-500 tracking-[0.25em] block mb-1">
            Cantor 3D Sandbox
          </span>
          <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
            IGLO 5 <span className="bg-white/5 border border-white/10 text-white/50 text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">SINGLE FIXED BOTTOM</span>
          </h2>
          <p className="text-white/40 text-xs mt-1.5 leading-relaxed">
            Inspection of solid extruded profile layers from the DXF conversion payload.
          </p>
        </div>

        {/* Interactive Sliders / Display modes */}
        <div className="p-5 border-b border-white/5 space-y-5">
          {/* Mode Selector */}
          <div>
            <label className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-2">
              Viewing Arrangement
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setLayoutMode('assembled'); setExplodeValue(0); }}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  layoutMode === 'assembled'
                    ? 'bg-yellow-500 border-yellow-500 text-black shadow-md'
                    : 'bg-white/[0.01] border-white/5 text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                Assembled Section
              </button>
              <button
                onClick={() => setLayoutMode('grid')}
                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all ${
                  layoutMode === 'grid'
                    ? 'bg-yellow-500 border-yellow-500 text-black shadow-md'
                    : 'bg-white/[0.01] border-white/5 text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                Layer Grid / Gallery
              </button>
            </div>
          </div>

          {/* Explode Slider */}
          {layoutMode === 'assembled' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                  Explode Profile
                </span>
                <span className="font-bold text-yellow-500">{explodeValue}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={explodeValue}
                onChange={(e) => setExplodeValue(parseInt(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-yellow-500 focus:outline-none"
              />
              <span className="text-[9px] text-white/30 leading-snug block">
                Separates frame, sash, gaskets and spacers along their outward normals to check matching bounds.
              </span>
            </div>
          )}

          {/* Colorizer for PVC */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">
              Exterior PVC Swatch
            </span>
            <div className="flex gap-2">
              {[
                { hex: '#e8e0d4', name: 'White' },
                { hex: '#2c302e', name: 'Anthracite' },
                { hex: '#48443b', name: 'Basalt' },
                { hex: '#8b5a2b', name: 'Golden Oak' }
              ].map((c) => (
                <button
                  key={c.hex}
                  onClick={() => setPvcColor(c.hex)}
                  className={`w-7 h-7 rounded-full border transition-all relative ${
                    pvcColor === c.hex ? 'border-yellow-500 scale-110 shadow-lg' : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {pvcColor === c.hex && (
                    <div className="absolute inset-0.5 rounded-full border border-black/20" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Layer Inspector Details */}
        <div className="p-5 border-b border-white/5 bg-[#0a0b12]">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">
            Layer Geometry Inspector
          </span>

          {selectedLayer && selectedMeta && selectedData && selectedCenter ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">{selectedMeta.name}</h3>
                  <span className="text-[9px] font-extrabold uppercase text-yellow-500 tracking-wider">
                    {selectedLayer} ({selectedData.group})
                  </span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded font-black uppercase bg-white/5 border border-white/10 text-white/60">
                  {selectedMeta.matType}
                </span>
              </div>

              <p className="text-white/60 text-xs leading-relaxed">
                {selectedMeta.desc}
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-white/[0.02] border border-white/5 p-2 rounded">
                  <span className="text-white/30 block text-[9px] uppercase font-sans">Contours count</span>
                  <span className="font-bold text-white/80">{selectedData.contours.length}</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-2 rounded">
                  <span className="text-white/30 block text-[9px] uppercase font-sans">Total points</span>
                  <span className="font-bold text-white/80">
                    {selectedData.contours.reduce((acc, c) => acc + c.pointCount, 0)}
                  </span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-2 rounded">
                  <span className="text-white/30 block text-[9px] uppercase font-sans">CAD Width (X)</span>
                  <span className="font-bold text-white/80">{selectedCenter.width.toFixed(1)} mm</span>
                </div>
                <div className="bg-white/[0.02] border border-white/5 p-2 rounded">
                  <span className="text-white/30 block text-[9px] uppercase font-sans">CAD Height (Y)</span>
                  <span className="font-bold text-white/80">{selectedCenter.height.toFixed(1)} mm</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-white/30 border border-dashed border-white/5 rounded-lg">
              Click any 3D element in the canvas to inspect its geometry contours.
            </div>
          )}
        </div>

        {/* Global Group filters & full visibility list */}
        <div className="p-5 flex-1 flex flex-col min-h-[250px]">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block mb-3">
            Layer Visibility & Hierarchy
          </span>

          {/* Quick filter buttons */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <button
              onClick={() => toggleGroup('FRM', true)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-semibold transition-all"
            >
              + All Frame
            </button>
            <button
              onClick={() => toggleGroup('FRM', false)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-semibold transition-all"
            >
              - Hide Frame
            </button>
            <button
              onClick={() => toggleGroup('SSH', true)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-semibold transition-all"
            >
              + All Sash
            </button>
            <button
              onClick={() => toggleGroup('SSH', false)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-semibold transition-all"
            >
              - Hide Sash
            </button>
            <button
              onClick={() => toggleMaterialType('gasket', false)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-semibold transition-all"
            >
              Hide Gaskets
            </button>
            <button
              onClick={() => toggleMaterialType('glass', false)}
              className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] font-semibold transition-all"
            >
              Hide Glass
            </button>
          </div>

          {/* Layer List with Checkboxes */}
          <div className="space-y-1.5 flex-1">
            {layersList.map((name) => {
              const meta = LAYER_METADATA[name] || { name, desc: '', matType: 'pvc' };
              const isSelected = selectedLayer === name;
              return (
                <div
                  key={name}
                  onClick={() => setSelectedLayer(name)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-white'
                      : 'bg-white/[0.01] border-transparent hover:bg-white/[0.03] text-white/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={visibleLayers[name] !== false}
                      onChange={(e) => {
                        e.stopPropagation();
                        setVisibleLayers((prev) => ({ ...prev, [name]: e.target.checked }));
                      }}
                      className="w-3.5 h-3.5 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500 accent-yellow-500 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold leading-tight">
                        {meta.name}
                      </span>
                      <span className="text-[8.5px] font-mono opacity-40 leading-none">
                        {name} ({meta.matType})
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold opacity-35">
                    {profileData.layers[name].contours.length} c
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
