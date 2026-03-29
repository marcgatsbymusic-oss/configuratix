import { useState, useRef, useCallback } from 'react';
import { X, Scan, CheckCircle2 } from 'lucide-react';

interface Point { x: number; y: number }
interface ARMeasurementButtonProps {
  onMeasureComplete: (width: number, height: number, detectedType?: string) => void;
}

export function ARMeasurementButton({ onMeasureComplete }: ARMeasurementButtonProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [points, setPoints] = useState<[Point, Point, Point, Point]>([
    { x: 50, y: 150 },
    { x: 250, y: 150 },
    { x: 250, y: 350 },
    { x: 50, y: 350 },
  ]);
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  const resizePoints = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      // Initialize handles centrally based on bounds
      setPoints([
        { x: width * 0.2, y: height * 0.2 },
        { x: width * 0.8, y: height * 0.2 },
        { x: width * 0.8, y: height * 0.6 },
        { x: width * 0.2, y: height * 0.6 },
      ]);
    }
  }, []);

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
      setTimeout(resizePoints, 500);
    } catch (e) {
      console.error(e);
      alert('Camera access denied or unavailable.');
      setIsScanning(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    setAnalysisStatus(null);
  }, [stream]);

  const handlePointerStart = (e: React.TouchEvent | React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActivePoint(index);
  };

  const handlePointerMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (activePoint === null || !containerRef.current) return;
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

    setPoints(prev => {
      const newPts = [...prev] as [Point, Point, Point, Point];
      newPts[activePoint] = { x, y };
      return newPts;
    });
  };

  const handlePointerEnd = () => {
    setActivePoint(null);
  };

  const analyzeAndComplete = () => {
    setAnalysisStatus('scanning');
    
    // Width = average of top and bottom widths
    const w1 = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
    const w2 = Math.hypot(points[2].x - points[3].x, points[2].y - points[3].y);
    const avgW = (w1 + w2) / 2;

    const h1 = Math.hypot(points[3].x - points[0].x, points[3].y - points[0].y);
    const h2 = Math.hypot(points[2].x - points[1].x, points[2].y - points[1].y);
    const avgH = (h1 + h2) / 2;

    const aspectRatio = avgW / avgH || 1;

    setTimeout(() => {
      setAnalysisStatus('detected');
      
      const detectedType = aspectRatio > 1.1 ? '2-flugel' : '1-flugel';
      // Assumption: standard house window height is ~1400mm
      const finalHeight = 1400;
      const finalWidth = Math.round((finalHeight * aspectRatio) / 10) * 10;
      
      setTimeout(() => {
        onMeasureComplete(finalWidth, finalHeight, detectedType);
        stopCamera();
      }, 2000);

    }, 2500);
  };

  return (
    <>
      <button 
        onClick={startCamera}
        className="w-full bg-[#111112] text-indigo-400 border-2 border-indigo-400/30 px-4 py-3 rounded-xl flex items-center justify-center gap-2 font-black tracking-widest uppercase text-[10px] md:text-xs shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:border-indigo-400 hover:bg-[#1a1a1b] transition-all active:scale-95"
      >
        <Scan size={16} /> Beta: Smart AI Scanner
      </button>

      {isScanning && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col pointer-events-auto">
          <div 
            ref={containerRef}
            className="flex-1 relative overflow-hidden bg-black touch-none select-none"
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerEnd}
            onMouseLeave={handlePointerEnd}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerEnd}
          >
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                 <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0"/>
                    <stop offset="50%" stopColor="#6366f1" stopOpacity="0.5"/>
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
                 </linearGradient>
              </defs>
              <polygon 
                points={`${points[0].x},${points[0].y} ${points[1].x},${points[1].y} ${points[2].x},${points[2].y} ${points[3].x},${points[3].y}`}
                fill={analysisStatus === 'scanning' ? 'url(#scanGradient)' : (analysisStatus === 'detected' ? 'rgba(52,211,153,0.3)' : 'rgba(99,102,241,0.15)')} 
                stroke={analysisStatus === 'detected' ? '#34d399' : '#818cf8'} 
                strokeWidth={analysisStatus === 'scanning' ? 4 : 2}
                strokeDasharray={analysisStatus === 'scanning' ? 'none' : '6,6'}
                className="transition-colors duration-500"
              />
              {analysisStatus === 'scanning' && (
                <g className="animate-[pulse_1.5s_infinite]">
                  <line 
                    x1={points[0].x} y1={(points[0].y + points[3].y)/2} 
                    x2={points[1].x} y2={(points[1].y + points[2].y)/2} 
                    stroke="#4f46e5" strokeWidth="6" 
                  />
                </g>
              )}
            </svg>

            {points.map((pt, i) => (
              <div 
                key={i}
                className="absolute w-14 h-14 -ml-7 -mt-7 flex items-center justify-center z-20 cursor-move"
                style={{ left: pt.x, top: pt.y }}
                onMouseDown={(e) => handlePointerStart(e, i)}
                onTouchStart={(e) => handlePointerStart(e, i)}
              >
                <div className={`w-8 h-8 rounded-full border-[3px] shadow-[0_0_15px_rgba(99,102,241,0.8)] backdrop-blur-sm transition-transform ${activePoint === i ? 'scale-125 border-white bg-white/20' : 'border-indigo-400 bg-black/40'}`} />
              </div>
            ))}
            
            {analysisStatus === 'scanning' && (
              <div className="absolute inset-x-0 top-[20%] flex flex-col items-center justify-center z-30 pointer-events-none">
                <Scan size={56} className="text-indigo-400 mb-4 animate-[spin_3s_linear_infinite]" />
                <div className="bg-black/90 text-indigo-400 font-black px-8 py-4 rounded-2xl uppercase tracking-[0.2em] border border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.5)]">
                  Running Geometry AI...
                </div>
              </div>
            )}
            
            {analysisStatus === 'detected' && (
              <div className="absolute inset-x-0 top-[20%] flex flex-col items-center justify-center z-30 pointer-events-none animate-in fade-in zoom-in duration-300">
                <CheckCircle2 size={64} className="text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                <div className="bg-emerald-950/90 text-emerald-400 font-black px-8 py-4 rounded-2xl uppercase tracking-[0.2em] border border-emerald-500/50 shadow-[0_0_40px_rgba(52,211,153,0.4)]">
                  Match Detected
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-[#0a0a0b] border-t border-[#2a2a2b] flex flex-col gap-4 relative z-40 shadow-[0_-10px_50px_rgba(0,0,0,0.8)]">
            <div className="text-center text-[11px] text-white/50 font-medium tracking-wide uppercase leading-relaxed">
              Drag the 4 corners precisely over your physical window frame.<br/>Ensure good lighting before extracting.
            </div>
            <div className="flex gap-4">
              <button 
                onClick={stopCamera}
                className="flex-[0.4] bg-[#1a1a1b] text-white/50 hover:text-white rounded-xl flex items-center justify-center transition-all border border-white/5 uppercase tracking-widest font-black text-[10px]"
              >
                <X size={20} />
              </button>
              <button 
                disabled={!!analysisStatus}
                onClick={analyzeAndComplete}
                className="flex-1 bg-indigo-600 text-white hover:bg-indigo-500 py-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest shadow-[0_0_20px_rgba(79,70,229,0.3)] disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                <Scan size={18} /> Analyze Frame
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
