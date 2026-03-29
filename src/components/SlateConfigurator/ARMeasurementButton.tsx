import { useState } from 'react';
import { Maximize, Camera, X } from 'lucide-react';

interface ARMeasurementButtonProps {
  onMeasureComplete: (width: number, height: number) => void;
}

export function ARMeasurementButton({ onMeasureComplete }: ARMeasurementButtonProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const startScan = () => {
    setIsScanning(true);
    setScanStep(0);
    // Simulate finding a plane
    setTimeout(() => setScanStep(1), 2000);
  };

  const handleTap = () => {
    if (scanStep === 1) {
      setScanStep(2); // Top left placed
    } else if (scanStep === 2) {
      setScanStep(3); // Bottom right placed
      // Mock measurement calculation based on user tap
      const mockW = 1200 + Math.floor(Math.random() * 400 - 200);
      const mockH = 1400 + Math.floor(Math.random() * 400 - 200);
      
      setTimeout(() => {
        onMeasureComplete(mockW, mockH);
        setIsScanning(false);
      }, 1500);
    }
  };

  return (
    <>
      <button 
        onClick={startScan}
        className="w-full bg-[#111112] text-[#eab676] border-2 border-[#eab676]/30 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest uppercase text-[10px] md:text-xs shadow-[0_0_15px_rgba(234,182,118,0.1)] hover:border-[#eab676] hover:bg-[#1a1a1b] transition-all active:scale-95"
      >
        <Camera size={16} /> Beta: AR Measurement
      </button>

      {isScanning && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col pointer-events-auto backdrop-blur-md">
          <div className="flex-1 relative overflow-hidden flex items-center justify-center border-b border-[#2a2a2b]">
            {/* Fake Camera Viewport Placeholder */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-[#1a1a1b] to-black opacity-50" 
              onClick={handleTap}
            />
            
            {/* Visual Indicators */}
            {scanStep === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 animate-pulse pointer-events-none">
                <Maximize size={48} className="text-[#eab676]/50" />
                <p className="text-[#eab676] font-bold uppercase tracking-widest text-sm">Detecting Wall Surface...</p>
              </div>
            )}
            
            {scanStep === 1 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="w-16 h-16 border-2 border-dashed border-[#eab676] rounded-full animate-[spin_4s_linear_infinite]" />
                <p className="text-white mt-8 font-bold uppercase py-2 px-4 bg-black/50 rounded-lg">Tap top-left corner of window</p>
              </div>
            )}

            {scanStep === 2 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_red] ring-4 ring-white/20" />
                <p className="text-white mt-8 font-bold uppercase py-2 px-4 bg-black/50 rounded-lg">Tap bottom-right corner</p>
              </div>
            )}

            {scanStep === 3 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-red-500 rounded-full" />
                <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-red-500 rounded-full" />
                <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
                  <line x1="25%" y1="25%" x2="75%" y2="75%" stroke="#eab676" strokeWidth="2" strokeDasharray="5,5" />
                </svg>
                <p className="text-emerald-400 font-black text-xl uppercase py-2 px-4 bg-black/80 rounded-lg mt-4 w-auto z-20 shadow-lg shadow-emerald-500/20 border border-emerald-500/30">Calculating Area...</p>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-[#111112] flex items-center justify-between">
            <div className="text-xs uppercase font-bold text-white/50 tracking-widest">WebXR Hit Test Mockup</div>
            <button 
              onClick={() => setIsScanning(false)}
              className="w-12 h-12 bg-[#1a1a1b] text-white/50 hover:text-white rounded-full flex items-center justify-center shadow-lg transition-colors border border-white/5"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
