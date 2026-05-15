import React, { useState } from 'react';
import { SvgWindowEngine } from '../components/configurator/SvgWindowEngine';

export const ConfiguratorTestPage: React.FC = () => {
  const [width, setWidth] = useState(1500);
  const [height, setHeight] = useState(1200);
  const [colorExt, setColorExt] = useState('#4B4B4D'); // Anthracite
  const [colorInt, setColorInt] = useState('#FFFFFF'); // White

  const presetColors = [
    { name: 'Anthracite', hex: '#4B4B4D' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Golden Oak', hex: '#8B5A2B' },
    { name: 'Black', hex: '#111111' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
        
        {/* Controls Sidebar */}
        <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-2xl shadow-xl flex flex-col gap-6">
          <h2 className="text-2xl font-bold tracking-tight">IGLO 5 (F104) Configurator</h2>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-400">Width (mm): {width}</label>
            <input 
              type="range" 
              min="500" max="3000" step="10" 
              value={width} 
              onChange={e => setWidth(Number(e.target.value))}
              className="accent-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-400">Height (mm): {height}</label>
            <input 
              type="range" 
              min="500" max="3000" step="10" 
              value={height} 
              onChange={e => setHeight(Number(e.target.value))}
              className="accent-blue-500"
            />
          </div>

          <div className="w-full h-px bg-gray-700 my-2" />

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-400">Exterior Color (FRM_EXT)</label>
            <div className="flex gap-2">
              {presetColors.map(c => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setColorExt(c.hex)}
                  className={`w-8 h-8 rounded-full border-2 ${colorExt === c.hex ? 'border-white' : 'border-transparent'} hover:scale-110 transition-transform`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <label className="text-sm font-semibold text-gray-400">Interior Color (FRM_INT)</label>
            <div className="flex gap-2">
              {presetColors.map(c => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setColorInt(c.hex)}
                  className={`w-8 h-8 rounded-full border-2 ${colorInt === c.hex ? 'border-white' : 'border-transparent'} hover:scale-110 transition-transform`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Visualizer Area */}
        <div className="w-full md:w-2/3 flex items-center justify-center bg-gray-800 rounded-2xl shadow-xl p-12 overflow-hidden relative">
           
           {/* Grid background for technical feel */}
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

           <div className="relative w-full h-full max-h-[70vh] flex items-center justify-center">
             <SvgWindowEngine 
               width={width}
               height={height}
               system="IG5"
               type="F104"
               colorExt={colorExt}
               colorInt={colorInt}
               frameThickness={70} // Standard Iglo 5 frame depth
             />
           </div>

        </div>
      </div>
    </div>
  );
};
