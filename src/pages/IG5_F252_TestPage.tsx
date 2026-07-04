import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { IG5_F252_Component } from '../components/configurator/IG5_F252/IG5_F252_Component';

export default function IG5_F252_TestPage() {
  const [width, setWidth] = useState(850);
  const [totalHeight, setTotalHeight] = useState(1030);
  const [bottomPartHeight, setBottomPartHeight] = useState(430);
  const [isMirrored, setIsMirrored] = useState(false);
  const [fixedPartPosition, setFixedPartPosition] = useState<'Bottom' | 'Top'>('Bottom');
  const [extColor, setExtColor] = useState('#222222');
  const [intColor, setIntColor] = useState('#ffffff');
  const [windowState, setWindowState] = useState<'Closed' | 'Open' | 'Tilt'>('Closed');

  // Constrain limits
  const MIN_SECTION = 250;
  const safeBottom = Math.min(Math.max(MIN_SECTION, bottomPartHeight), totalHeight - MIN_SECTION);
  const safeTop = totalHeight - safeBottom;

  // Topological mapping to Engine's Sash (Top) and Fixed (Bottom)
  // Engine always builds with Sash on Top and Fixed on Bottom natively.
  // If fixedPartPosition === 'Top', we pass 'Bottom' to OperableSection to flip the window upside down.
  const isEngineFlipped = fixedPartPosition === 'Top';
  const engineTopHeight = !isEngineFlipped ? safeTop : safeBottom;
  const engineBottomHeight = !isEngineFlipped ? safeBottom : safeTop;

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row', backgroundColor: '#f0f0f0' }}>
      
      {/* UI PANEL */}
      <div style={{ width: '300px', padding: '20px', background: '#fff', borderRight: '1px solid #ddd', overflowY: 'auto' }}>
        <h2 style={{ color: 'red' }}>IG5-F252 Controls</h2>
        
        <div style={controlGroupStyle}>
          <label>Total Width (mm)</label>
          <input 
            type="range" 
            min="500" max="2500" 
            value={width} 
            onChange={e => setWidth(Number(e.target.value))} 
          />
          <span>{width} mm</span>
        </div>

        <div style={controlGroupStyle}>
          <label>Total Height (mm)</label>
          <input 
            type="range" 
            min="600" max="3000" 
            value={totalHeight} 
            onChange={e => setTotalHeight(Number(e.target.value))} 
          />
          <span>{totalHeight} mm</span>
        </div>

        <div style={controlGroupStyle}>
          <label>Top Part Height (mm)</label>
          <input 
            type="range" 
            min={MIN_SECTION} max={totalHeight - MIN_SECTION} 
            value={safeTop} 
            onChange={e => setBottomPartHeight(totalHeight - Number(e.target.value))} 
          />
          <span>{safeTop} mm</span>
        </div>

        <div style={controlGroupStyle}>
          <label>Bottom Part Height (mm)</label>
          <input 
            type="range" 
            min={MIN_SECTION} max={totalHeight - MIN_SECTION} 
            value={safeBottom} 
            onChange={e => setBottomPartHeight(Number(e.target.value))} 
          />
          <span>{safeBottom} mm</span>
        </div>

        <div style={controlGroupStyle}>
          <label>
            <input 
              type="checkbox" 
              checked={isMirrored} 
              onChange={e => setIsMirrored(e.target.checked)} 
            />
            Mirrored (Hinge Left)
          </label>
        </div>

        <div style={controlGroupStyle}>
          <label>Fixed Part Position</label>
          <select value={fixedPartPosition} onChange={e => setFixedPartPosition(e.target.value as 'Bottom' | 'Top')}>
            <option value="Bottom">Bottom (Sash Top)</option>
            <option value="Top">Top (Sash Bottom)</option>
          </select>
        </div>

        <div style={controlGroupStyle}>
          <label>Exterior Color</label>
          <input type="color" value={extColor} onChange={e => setExtColor(e.target.value)} />
        </div>

        <div style={controlGroupStyle}>
          <label>Interior Color</label>
          <input type="color" value={intColor} onChange={e => setIntColor(e.target.value)} />
        </div>

        <div style={controlGroupStyle}>
          <label>Window Action</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={btnStyle(windowState === 'Closed')} onClick={() => setWindowState('Closed')}>Close</button>
            <button style={btnStyle(windowState === 'Open')} onClick={() => setWindowState('Open')}>Open</button>
            <button style={btnStyle(windowState === 'Tilt')} onClick={() => setWindowState('Tilt')}>Tilt</button>
          </div>
        </div>

      </div>

      {/* 3D CANVAS */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [400, 500, 1500], fov: 50, near: 0.1, far: 50000 }}>
          <color attach="background" args={['#e0e0e0']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[1000, 1000, 1000]} intensity={1} castShadow />
          <Environment preset="city" />

          
          <group position={[-width/2, -totalHeight / 2, 0]}>
            <IG5_F252_Component 
              W={width}
              TopSectionHeight={engineTopHeight}
              BottomSectionHeight={engineBottomHeight}
              isMirrored={isMirrored}
              OperableSection={!isEngineFlipped ? 'Top' : 'Bottom'}
              EXT_Color={extColor}
              INT_Color={intColor}
              windowState={windowState}
            />
          </group>

          <ContactShadows position={[0, -totalHeight / 2 - 10, 0]} opacity={0.4} scale={2000} blur={2} far={100} />
          <OrbitControls makeDefault />
        </Canvas>
      </div>

    </div>
  );
}

const controlGroupStyle: React.CSSProperties = {
  marginBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const btnStyle = (active: boolean) => ({
  padding: '6px 12px',
  cursor: 'pointer',
  background: active ? '#4CAF50' : '#f0f0f0',
  color: active ? '#fff' : '#333',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontWeight: 'bold',
  transition: 'background 0.2s'
});
