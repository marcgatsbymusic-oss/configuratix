import { useState } from 'react';
import cantorMatrices from '../data/cantorPricingMatrices.json';
import { calculatePrice, resolveOpeningClass } from '../utils/pricingEngine';

export function DebugPricing() {
  const [profile, setProfile] = useState('p5');
  const [typology, setTypology] = useState('F104');
  const [width, setWidth] = useState(2000);
  const [height, setHeight] = useState(1200);

  // Replicate React Configurator Translation exactly:
  let sashOpenings = ['o3']; // Default 1-sash DK
  if (typology.toUpperCase() === 'F104') sashOpenings = ['o1']; // Forced FIX
  else if (typology.toUpperCase().startsWith('F2')) sashOpenings = ['o3', 'o2']; // 2-sash

  // Translate sash codes to Cantor Hardware Matrix Class
  const resolvedOpeningClass = resolveOpeningClass(sashOpenings);
  
  // Call full pricing engine, allowing rule iterations
  const breakdown = calculatePrice(
    profile, 
    resolvedOpeningClass, 
    width, 
    height, 
    '2-24', // Glazing
    'c197', // Interior white
    'c197', // Exterior white
    []      // Addons
  );

  const price = breakdown.frame; // Frame now includes base + iterative linearly mapped surcharges!

  const matrixKeyMap: Record<string, string> = {
    'p5': 'iglo5',
  };
  const mappedProfileId = matrixKeyMap[profile] || profile;

  // @ts-ignore
  const hasMatrix = !!cantorMatrices[mappedProfileId];

  return (
    <div className="min-h-screen bg-black text-white p-10 pt-32">
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Left Col: Engine Control */}
        <div className="bg-[#111] p-8 rounded-xl border border-gray-800 shadow-2xl flex flex-col gap-6">
          <h1 className="text-3xl font-bold text-[#eab676]">Pricing Engine Sandbox</h1>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Profile ID <span className="text-gray-500 font-normal">(p5)</span></label>
              <input className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={profile} onChange={e => setProfile(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Window Typology <span className="text-gray-500 font-normal">(F104)</span></label>
              <input className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none uppercase"
                value={typology} onChange={e => setTypology(e.target.value.toUpperCase())} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Width (mm)</label>
              <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={width} onChange={e => setWidth(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Height (mm)</label>
              <input type="number" className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-[#eab676] focus:outline-none"
                value={height} onChange={e => setHeight(Number(e.target.value))} />
            </div>
          </div>

          <div className="p-6 bg-[#1a1a1b] rounded-xl border border-[#2a2a2b]">
            <h2 className="text-sm uppercase tracking-widest text-gray-500 font-bold mb-4">Diagnostics</h2>
            <div className="grid grid-cols-2 gap-4 text-sm font-mono mb-4">
              <div className="bg-black p-3 rounded border border-gray-800">
                <div className="text-gray-500 text-xs mb-1">Database Key</div>
                <div className="text-[#eab676] font-bold">{mappedProfileId}</div>
              </div>
              <div className="bg-black p-3 rounded border border-gray-800">
                <div className="text-gray-500 text-xs mb-1">Hardware Class</div>
                <div className="text-[#eab676] font-bold">{resolvedOpeningClass}</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">Database Payload Injected? <strong className="text-green-400">{hasMatrix ? 'YES' : 'NO'}</strong></div>
          </div>

          <div className="p-6 bg-gradient-to-br from-gray-900 to-black rounded-xl border border-[#eab676]/30 font-mono shadow-lg mt-auto">
            <div className="flex justify-between items-center mb-3 text-gray-500 text-xs">
              <span>(Includes dynamic logic rules from JSON extraction DB proxy)</span>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-800">
              <span className="text-white font-bold tracking-widest uppercase">Target Unit Base:</span>
              <span className="text-3xl text-emerald-400 font-black">€{price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Virtual Cantor Ticket Mock */}
        <div className="bg-white text-black p-8 rounded-xl shadow-2xl font-mono text-xs overflow-y-auto max-h-[80vh]">
          <div className="border-b-2 border-black pb-2 mb-4">
            <h2 className="text-xl font-bold uppercase tracking-tighter">Cantor Output Parity Ticket</h2>
            <div className="text-gray-500 mt-1">Generated dynamically from state</div>
          </div>

          <table className="w-full text-left border-collapse mb-4">
            <tbody>
              <tr className="border-b border-gray-200"><th className="py-1 w-1/3">Product Code</th><td>{typology}</td><td className="text-gray-500">1-chamber window</td></tr>
              <tr className="border-b border-gray-200"><th className="py-1">Product type</th><td>1100</td><td className="text-gray-500">IGLO 5 - windows</td></tr>
              <tr className="border-b border-gray-200"><th className="py-1">Frame measurement</th><td colSpan={2} className="font-bold text-blue-600">{width} x {height}</td></tr>
              <tr className="border-b border-gray-200"><th className="py-1">Color</th><td>W-W</td><td className="text-gray-500">OUT: White / IN: White</td></tr>
              <tr className="border-b border-gray-200"><th className="py-1">U-Value</th><td colSpan={2} className="font-bold">1.28</td></tr>
            </tbody>
          </table>

          <div className="font-bold bg-gray-200 p-1 mb-2">Hardware</div>
          <table className="w-full text-left border-collapse mb-4">
            <tbody>
              <tr className="border-b border-gray-200"><th className="py-1 w-1/3">Hardware type</th><td>STANDARD</td></tr>
              <tr className="border-b border-gray-200"><th className="py-1">Field 1</th><td className="text-red-600 font-bold">{resolvedOpeningClass === 'F' ? 'FIX' : resolvedOpeningClass}</td></tr>
            </tbody>
          </table>

          <div className="font-bold bg-gray-200 p-1 mb-2">Glass/Insert</div>
          <table className="w-full text-left border-collapse mb-4">
            <tbody>
              <tr><th className="py-1 w-1/3">Glass Structure</th><td>4-16-4</td></tr>
              <tr><th className="py-1">Product</th><td>2-24</td></tr>
            </tbody>
          </table>

          <div className="text-gray-500 ml-4 mb-4">
            <div>Outside: FL4</div>
            <div>Spacer: S16 (Steel 16mm)</div>
            <div>Gas: Ar (Argon)</div>
            <div>Inside: T4</div>
          </div>

          <div className="font-bold bg-gray-200 p-1 mb-2">Unit Options</div>
          <table className="w-full text-left border-collapse mb-4">
            <tbody>
               <tr><th className="py-1 w-1/3">Ug factor</th><td>1.10</td></tr>
               <tr><th className="py-1">Acoustic properties</th><td>35 (-2,-5)</td></tr>
               <tr><th className="py-1">Article 54123</th><td className="font-bold text-orange-600">Transport strip - Length: {width}mm</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
