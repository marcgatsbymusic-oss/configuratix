import { useDoorConfigurator } from '../store/doorSimStore';
import { DoorCanvasEngine } from '../components/doorsim/DoorCanvasEngine';

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
  { id: 'antisol_szary', name: 'Antisol Grey' },
  { id: 'antisol_brazowy', name: 'Antisol Brown' },
  { id: 'matowa', name: 'Matte Foil' },
  { id: 'chinchilla', name: 'Chinchilla' }
];

const HANDLE_OPTIONS = [
  { id: 'none', name: 'None' },
  { id: 'klamka_srebrna', name: 'Klamka 30A Srebrna' },
  { id: 'klamka_czarna', name: 'Klamka H6S36 Czarna' },
  { id: 'pochwyt_p10', name: 'Pochwyt P10D' },
  { id: 'pochwyt_q10', name: 'Pochwyt Q10' }
];

const PATTERN_OPTIONS = [
  { id: 'none', name: 'Full Glass' },
  { id: 'alaska1', name: 'Alaska 1' },
  { id: 'alaska2', name: 'Alaska 2' },
  { id: 'alaska3', name: 'Alaska 3 (Grooves)' }
];

export function DoorSimPage() {
  const { 
    system, modelId, frameColor, leafColor, handleId, glassType, patternMaskId,
    setSystem, setColor, setHandle, setGlass, setPatternMask
  } = useDoorConfigurator();

  return (
    <main className="min-h-screen bg-mammut-darker pt-24 pb-12 text-mammut-white flex flex-col lg:flex-row">
      <div className="flex-1 p-6 flex flex-col items-center border-r border-mammut-border">
         <h1 className="text-3xl font-black uppercase tracking-widest text-mammut-gold mb-8">Door Visualizer</h1>
         <div className="w-full max-w-lg aspect-[5/8] shadow-2xl relative">
            <DoorCanvasEngine />
            <div className="absolute top-4 left-4 right-4 bg-mammut-black/80 backdrop-blur text-xs p-3 border border-white/10 uppercase tracking-widest flex justify-between">
               <span>System: {modelId}</span>
               <span className="text-mammut-gold">MVP Preview</span>
            </div>
         </div>
      </div>
      <div className="w-full lg:w-[450px] p-8 overflow-y-auto bg-mammut-black max-h-[calc(100vh-6rem)] custom-scrollbar">
        <h2 className="text-xl font-black uppercase mb-6 border-b border-mammut-border pb-4 tracking-widest">Configuration</h2>
        
        {/* System Selection */}
        <div className="mb-8 border-b border-mammut-border pb-8">
           <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">1. Material System</h3>
           <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setSystem('alu')}
                className={`flex flex-col items-center justify-center p-4 border transition-all hover:shadow-md ${system === 'alu' ? 'border-mammut-gold bg-mammut-gold/10 text-mammut-gold' : 'border-mammut-border text-gray-400'}`}
              >
                <span className="font-bold text-sm">Aluminium</span>
              </button>
              <button 
                onClick={() => setSystem('pvc')}
                className={`flex flex-col items-center justify-center p-4 border transition-all hover:shadow-md ${system === 'pvc' ? 'border-mammut-gold bg-mammut-gold/10 text-mammut-gold' : 'border-mammut-border text-gray-400'}`}
              >
                <span className="font-bold text-sm">PVC</span>
              </button>
           </div>
        </div>

        {/* Frame Color */}
        <div className="mb-8">
           <h3 className="text-sm font-semibold uppercase text-mammut-white/70 mb-3 tracking-widest">Frame Color</h3>
           <div className="grid grid-cols-6 gap-2">
              {DOOR_COLORS.map(color => (
                 <button 
                   key={color.id} 
                   onClick={() => setColor('frame', color.id)}
                   className={`w-10 h-10 rounded-sm border-2 ${frameColor === color.id ? 'border-mammut-gold' : 'border-transparent'} hover:scale-110 transition-transform`}
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
                   onClick={() => setColor('leaf', color.id)}
                   className={`w-10 h-10 rounded-sm border-2 ${leafColor === color.id ? 'border-mammut-gold' : 'border-transparent'} hover:scale-110 transition-transform`}
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
                   onClick={() => setPatternMask(pattern.id)}
                   className={`text-left px-4 py-3 text-sm border transition-colors ${patternMaskId === pattern.id ? 'border-mammut-gold text-mammut-gold bg-mammut-gold/10' : 'border-mammut-border text-mammut-white/70 hover:border-mammut-white/30 hover:bg-white/5'}`}
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
                   onClick={() => setGlass(glass.id)}
                   className={`text-left px-4 py-3 text-sm border transition-colors ${glassType === glass.id ? 'border-mammut-gold text-mammut-gold bg-mammut-gold/10' : 'border-mammut-border text-mammut-white/70 hover:border-mammut-white/30 hover:bg-white/5'}`}
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
                   onClick={() => setHandle(handle.id)}
                   className={`text-left px-4 py-3 text-sm border transition-colors ${handleId === handle.id ? 'border-mammut-gold text-mammut-gold bg-mammut-gold/10' : 'border-mammut-border text-mammut-white/70 hover:border-mammut-white/30 hover:bg-white/5'}`}
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
