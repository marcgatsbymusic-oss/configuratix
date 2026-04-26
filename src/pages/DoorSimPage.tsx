import { useState } from 'react';
import { DoorCanvasEngine, type DoorConfig } from '../components/doorsim/DoorCanvasEngine';

const DOOR_COLORS = [
  { id: 'c197', name: 'White', hex: '#ffffff' },
  { id: 'c214', name: 'Anthracite', hex: '#3b3c3f' },
  { id: 'c217', name: 'Jet Black', hex: '#0a0a0a' },
  { id: 'c231', name: 'Chocolate Brown', hex: '#3e2b23' },
  { id: 'c205', name: 'Grey', hex: '#878c93' },
  { id: 'c209', name: 'Basalt Grey', hex: '#4f5358' },
  { id: 'c236', name: 'Brilliant Blue', hex: '#163e63' },
  { id: 'c234', name: 'Dark Green', hex: '#0d2d1e' },
  { id: 'c235', name: 'Dark Red', hex: '#461515' }
];

const GLASS_OPTIONS = [
  { id: 'antisol_szary', name: 'Antisol Grey', url: '/doorsim-assets/assets/glass/szyba_antisol_szary.webp' },
  { id: 'antisol_brazowy', name: 'Antisol Brown', url: '/doorsim-assets/assets/glass/szyba_antisol_brazowy.webp' },
  { id: 'matowa', name: 'Matte Foil', url: '/doorsim-assets/assets/glass/szyba_bezpieczna_folia_matowa.webp' },
  { id: 'chinchilla', name: 'Chinchilla', url: '/doorsim-assets/assets/glass/szyba_ornament_chinchilla.webp' }
];

const HANDLE_OPTIONS = [
  { id: 'none', name: 'None', url: null },
  { id: 'klamka_srebrna', name: 'Klamka 30A Srebrna', url: '/doorsim-assets/assets/handles/Klamka-30A-1006-Srebrna.webp' },
  { id: 'klamka_czarna', name: 'Klamka H6S36 Czarna', url: '/doorsim-assets/assets/handles/Klamka-H6S36-szyld-dlogi-34mm-klamka-26mm-czarna.webp' },
  { id: 'pochwyt_p10', name: 'Pochwyt P10D', url: '/doorsim-assets/assets/handles/Pochwyt-P10D-120.webp' },
  { id: 'pochwyt_q10', name: 'Pochwyt Q10', url: '/doorsim-assets/assets/handles/Pochwyt-Q10-120.webp' }
];

const PATTERN_OPTIONS = [
  { id: 'none', name: 'Full Glass', url: null },
  { id: 'alaska1', name: 'Alaska 1', url: '/doorsim-assets/assets/panel/ALASKA_1-3/ALASKA-1-maska-szyby-C.svg' },
  { id: 'alaska2', name: 'Alaska 2', url: '/doorsim-assets/assets/panel/ALASKA_2/ALASKA-2-maska-szyby-C.svg' },
  { id: 'alaska3', name: 'Alaska 3 (Grooves)', url: '/doorsim-assets/assets/panel/ALASKA_1-3/ALASKA-3-panel-frez.svg' }
];

export function DoorSimPage() {
  const [config, setConfig] = useState<DoorConfig>({
    frameColorHex: DOOR_COLORS[1].hex,
    leafColorHex: DOOR_COLORS[1].hex,
    glassUrl: GLASS_OPTIONS[0].url,
    patternMaskUrl: PATTERN_OPTIONS[1].url,
    handleUrl: HANDLE_OPTIONS[1].url
  });

  return (
    <main className="min-h-screen bg-mammut-darker pt-24 pb-12 text-mammut-white flex flex-col lg:flex-row">
      <div className="flex-1 p-6 flex flex-col items-center border-r border-mammut-border">
         <h1 className="text-3xl font-black uppercase tracking-widest text-mammut-gold mb-8">Door Visualizer</h1>
         <div className="w-full max-w-lg aspect-[5/8] shadow-2xl relative">
            <DoorCanvasEngine config={config} />
            <div className="absolute top-4 left-4 right-4 bg-mammut-black/80 backdrop-blur text-xs p-3 border border-white/10 uppercase tracking-widest flex justify-between">
               <span>System: MB-86N SI</span>
               <span className="text-mammut-gold">MVP Preview</span>
            </div>
         </div>
      </div>
      <div className="w-full lg:w-[450px] p-8 overflow-y-auto bg-mammut-black max-h-[calc(100vh-6rem)] custom-scrollbar">
        <h2 className="text-xl font-black uppercase mb-6 border-b border-mammut-border pb-4 tracking-widest">Configuration</h2>
        
        {/* Frame Color */}
        <div className="mb-8">
           <h3 className="text-sm font-semibold uppercase text-mammut-white/70 mb-3 tracking-widest">Frame Color</h3>
           <div className="grid grid-cols-6 gap-2">
              {DOOR_COLORS.map(color => (
                 <button 
                   key={color.id} 
                   onClick={() => setConfig({ ...config, frameColorHex: color.hex })}
                   className={`w-10 h-10 rounded-sm border-2 ${config.frameColorHex === color.hex ? 'border-mammut-gold' : 'border-transparent'} hover:scale-110 transition-transform`}
                   style={{ backgroundColor: color.hex }}
                   title={color.name}
                 />
              ))}
           </div>
        </div>

        {/* Leaf Color */}
        <div className="mb-8">
           <h3 className="text-sm font-semibold uppercase text-mammut-white/70 mb-3 tracking-widest">Leaf Color</h3>
           <div className="grid grid-cols-6 gap-2">
              {DOOR_COLORS.map(color => (
                 <button 
                   key={color.id} 
                   onClick={() => setConfig({ ...config, leafColorHex: color.hex })}
                   className={`w-10 h-10 rounded-sm border-2 ${config.leafColorHex === color.hex ? 'border-mammut-gold' : 'border-transparent'} hover:scale-110 transition-transform`}
                   style={{ backgroundColor: color.hex }}
                   title={color.name}
                 />
              ))}
           </div>
        </div>

        {/* Door Pattern Mask */}
        <div className="mb-8">
           <h3 className="text-sm font-semibold uppercase text-mammut-white/70 mb-3 tracking-widest">Door Pattern</h3>
           <div className="flex flex-col gap-2">
              {PATTERN_OPTIONS.map(pattern => (
                 <button 
                   key={pattern.id}
                   onClick={() => setConfig({ ...config, patternMaskUrl: pattern.url })}
                   className={`text-left px-4 py-3 text-sm border transition-colors ${config.patternMaskUrl === pattern.url ? 'border-mammut-gold text-mammut-gold bg-mammut-gold/10' : 'border-mammut-border text-mammut-white/70 hover:border-mammut-white/30 hover:bg-white/5'}`}
                 >
                   {pattern.name}
                 </button>
              ))}
           </div>
        </div>

        {/* Glass */}
        <div className="mb-8">
           <h3 className="text-sm font-semibold uppercase text-mammut-white/70 mb-3 tracking-widest">Glass Package</h3>
           <div className="flex flex-col gap-2">
              {GLASS_OPTIONS.map(glass => (
                 <button 
                   key={glass.id}
                   onClick={() => setConfig({ ...config, glassUrl: glass.url })}
                   className={`text-left px-4 py-3 text-sm border transition-colors ${config.glassUrl === glass.url ? 'border-mammut-gold text-mammut-gold bg-mammut-gold/10' : 'border-mammut-border text-mammut-white/70 hover:border-mammut-white/30 hover:bg-white/5'}`}
                 >
                   {glass.name}
                 </button>
              ))}
           </div>
        </div>

        {/* Handles */}
        <div className="mb-8">
           <h3 className="text-sm font-semibold uppercase text-mammut-white/70 mb-3 tracking-widest">Hardware / Handle</h3>
           <div className="flex flex-col gap-2">
              {HANDLE_OPTIONS.map(handle => (
                 <button 
                   key={handle.id}
                   onClick={() => setConfig({ ...config, handleUrl: handle.url })}
                   className={`text-left px-4 py-3 text-sm border transition-colors ${config.handleUrl === handle.url ? 'border-mammut-gold text-mammut-gold bg-mammut-gold/10' : 'border-mammut-border text-mammut-white/70 hover:border-mammut-white/30 hover:bg-white/5'}`}
                 >
                   {handle.name}
                 </button>
              ))}
           </div>
        </div>

      </div>
    </main>
  );
}
