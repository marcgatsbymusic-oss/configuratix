// @ts-nocheck
import React, { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { buildF252 } from './f252_assembly';
import { PROFILES } from './f252_profiles';
import { HANDLE } from './f252_handle';

const COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Anthracite', hex: '#373E43' },
  { name: 'Golden Oak', hex: '#8C5A2B' },
  { name: 'Winchester', hex: '#A87B4F' },
];

function F252Model({ extColor, intColor, H, W, tAxis, isOpen }) {
  const materials = useMemo(() => {
    return {
      'pvc_ext': new THREE.MeshStandardMaterial({ color: extColor, roughness: 0.4 }),
      'pvc_int': new THREE.MeshStandardMaterial({ color: intColor, roughness: 0.4 }),
      'glass': new THREE.MeshPhysicalMaterial({ color: 0x88ccff, transmission: 0.9, opacity: 1, transparent: true, roughness: 0.1, ior: 1.5, thickness: 2 }),
      'gasket': new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.8 }),
      'hardware': new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.2 })
    };
  }, [extColor, intColor]);

  const f252 = useMemo(() => {
    console.log("Building F252 with PROFILES:", !!PROFILES, "HANDLE:", !!HANDLE);
    try {
      const model = buildF252(THREE, PROFILES, HANDLE, {
        W, H, TAXIS: tAxis, materials
      });
      console.log("Model built successfully", model);
      return model;
    } catch (e) {
      console.error("Error building model:", e);
      return new THREE.Group();
    }
  }, [W, H, tAxis, materials]);

  useFrame((state, delta) => {
    if (f252 && f252.userData.sashGroup) {
      const targetAngle = isOpen ? Math.PI / 4 : 0;
      f252.userData.sashGroup.rotation.y = THREE.MathUtils.lerp(
        f252.userData.sashGroup.rotation.y,
        -targetAngle,
        delta * 5
      );
      
      const handlePart = f252.userData.parts.find(p => p.role === 'hardware');
      if (handlePart && handlePart.mesh) {
          const targetHandleRot = isOpen ? Math.PI / 2 : 0;
          handlePart.mesh.rotation.z = THREE.MathUtils.lerp(
              handlePart.mesh.rotation.z,
              targetHandleRot,
              delta * 5
          );
      }
    }
  });

  return <primitive object={f252} />;
}

export default function F252_V2_04_07_2026() {
  const [extColor, setExtColor] = useState(COLORS[0].hex);
  const [intColor, setIntColor] = useState(COLORS[0].hex);
  
  const [H, setH] = useState(1500);
  const [W, setW] = useState(1000);
  const [topHeight, setTopHeight] = useState(500);
  const [isOpen, setIsOpen] = useState(false);

  // Bottom height is just H - topHeight.
  // The transom axis (TAXIS) is measured from the bottom.
  // So TAXIS = H - topHeight.
  const bottomHeight = H - topHeight;
  const tAxis = bottomHeight;

  const handleTopHeightChange = (val) => {
    let newTop = Number(val);
    if (newTop < 300) newTop = 300;
    if (newTop > H - 200) newTop = H - 200;
    setTopHeight(newTop);
  };

  const handleBottomHeightChange = (val) => {
    let newBot = Number(val);
    if (newBot < 200) newBot = 200;
    if (newBot > H - 300) newBot = H - 300;
    setTopHeight(H - newBot);
  };

  return (
    <div className="w-full h-screen flex relative text-white bg-gray-900 font-sans">
      <div className="w-80 bg-gray-800 p-6 flex flex-col gap-6 shadow-xl z-10 overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold mb-4">F252 Configurator</h2>
          <button 
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Close Window' : 'Open Window'}
          </button>
        </div>

        <div>
          <h3 className="font-semibold text-gray-300 mb-2">Dimensions (mm)</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-400">Total Height: {H}</label>
              <input type="range" min="1000" max="2500" value={H} onChange={e => {
                  const newH = Number(e.target.value);
                  setH(newH);
                  if (topHeight > newH - 300) setTopHeight(newH - 300);
              }} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-400">Total Width: {W}</label>
              <input type="range" min="600" max="2000" value={W} onChange={e => setW(Number(e.target.value))} className="w-full accent-blue-500" />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-400">Top Part Height</label>
              <input 
                type="number" 
                value={topHeight} 
                onChange={e => handleTopHeightChange(e.target.value)} 
                className="w-full bg-gray-700 rounded px-3 py-2 text-white border border-gray-600 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-400">Bottom Part Height</label>
              <input 
                type="number" 
                value={bottomHeight} 
                onChange={e => handleBottomHeightChange(e.target.value)} 
                className="w-full bg-gray-700 rounded px-3 py-2 text-white border border-gray-600 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-300 mb-2">External Color</h3>
          <div className="grid grid-cols-2 gap-2">
            {COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setExtColor(c.hex)}
                className={`py-2 px-1 rounded text-xs text-center border-2 transition-colors ${extColor === c.hex ? 'border-blue-500' : 'border-transparent bg-gray-700 hover:bg-gray-600'}`}
              >
                <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: c.hex }}></div>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-300 mb-2">Internal Color</h3>
          <div className="grid grid-cols-2 gap-2">
            {COLORS.map(c => (
              <button
                key={c.name}
                onClick={() => setIntColor(c.hex)}
                className={`py-2 px-1 rounded text-xs text-center border-2 transition-colors ${intColor === c.hex ? 'border-blue-500' : 'border-transparent bg-gray-700 hover:bg-gray-600'}`}
              >
                <div className="w-full h-4 rounded mb-1" style={{ backgroundColor: c.hex }}></div>
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-gray-800">
        <Canvas camera={{ position: [0, 0, 3000], fov: 45, near: 10, far: 10000 }}>
          <Environment preset="city" />
          <ambientLight intensity={0.5} />
          <directionalLight position={[2000, 2000, 3000]} intensity={1} />
          
          <group position={[-W/2, -H/2, 0]}>
            <F252Model extColor={extColor} intColor={intColor} H={H} W={W} tAxis={tAxis} isOpen={isOpen} />
          </group>

          <ContactShadows position={[0, -H/2 - 100, 0]} opacity={0.5} scale={5000} blur={2} far={2000} />
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}
