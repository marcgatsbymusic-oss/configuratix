import { useState, useRef, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ARButton, XR, useHitTest, Interactive } from '@react-three/xr';
import * as THREE from 'three';
import { X, Check } from 'lucide-react';

interface PointProps { position: THREE.Vector3 }

function Marker({ position }: PointProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshBasicMaterial color="#34d399" />
    </mesh>
  );
}

function MeasuringLine({ points }: { points: THREE.Vector3[] }) {
  const lineObj = useMemo(() => {
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x6366f1, linewidth: 5 });
    return new THREE.Line(geometry, material);
  }, [points]);

  if (points.length < 2) return null;

  return <primitive object={lineObj} />;
}

function Scene({
  points,
  onPlacePoint
}: {
  points: THREE.Vector3[];
  onPlacePoint: (p: THREE.Vector3) => void;
}) {
  const reticleRef = useRef<THREE.Mesh>(null);

  useHitTest((hitMatrix) => {
    if (reticleRef.current) {
      hitMatrix.decompose(
        reticleRef.current.position,
        reticleRef.current.quaternion,
        reticleRef.current.scale
      );
      reticleRef.current.visible = true;
    }
  });

  return (
    <>
      <ambientLight intensity={1} />
      <Interactive onSelect={() => {
        if (reticleRef.current && reticleRef.current.visible) {
          onPlacePoint(reticleRef.current.position.clone());
        }
      }}>
        <mesh ref={reticleRef} visible={false} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[0.04, 0.05, 32]} />
          <meshBasicMaterial color="#6366f1" />
        </mesh>
      </Interactive>

      {points.map((p, i) => (
        <Marker key={i} position={p} />
      ))}
      <MeasuringLine points={points} />
    </>
  );
}

interface WebXRScannerProps {
  onMeasureComplete: (width: number, height: number, detectedType?: string) => void;
  onClose: () => void;
}

export function WebXRScanner({ onMeasureComplete, onClose }: WebXRScannerProps) {
  const [points, setPoints] = useState<THREE.Vector3[]>([]);
  
  const handlePlacePoint = (p: THREE.Vector3) => {
    if (points.length < 4) {
      setPoints(prev => [...prev, p]);
    }
  };

  const handleFinish = () => {
    if (points.length >= 2) {
      // Basic 2-point width/height estimation for simple workflow
      const dist = points[0].distanceTo(points[1]);
      
      // If 4 points physically dropped, calculate true Width and Height
      let widthMetres = dist;
      let heightMetres = dist; // Fallback to square if 2 points
      
      if (points.length === 4) {
        widthMetres = points[0].distanceTo(points[1]);
        heightMetres = points[1].distanceTo(points[2]);
      } else if (points.length >= 2) {
        // If they only put 2 points, assume it's Width
        widthMetres = points[0].distanceTo(points[1]);
        heightMetres = widthMetres * 1.2; // Guess height proportionally
      }

      // Convert from exact Meters into Millimeters
      const finalWidth = Math.round(widthMetres * 1000);
      const finalHeight = Math.round(heightMetres * 1000);
      
      const aspectRatio = finalWidth / finalHeight;
      const detectedType = aspectRatio > 1.1 ? '2-flugel' : '1-flugel';

      onMeasureComplete(finalWidth, finalHeight, detectedType);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-mammut-black">
      <div className="absolute top-4 left-4 z-50 pointer-events-auto">
        <button 
          onClick={onClose}
          className="bg-mammut-black/50 p-3 rounded-full text-mammut-white backdrop-blur border border-white/10"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="absolute top-4 right-4 z-50 pointer-events-auto">
        <ARButton 
          sessionInit={{ requiredFeatures: ['hit-test'] }}
          className="!bg-indigo-600 !text-mammut-white !font-black !px-6 !py-3 !rounded-xl !tracking-widest !uppercase !text-xs !border-0"
        >
          START SLAM
        </ARButton>
      </div>

      <div className="absolute bottom-6 inset-x-4 z-50 flex flex-col items-center gap-4 pointer-events-auto">
        <div className="bg-mammut-black/70 backdrop-blur-md px-6 py-3 rounded-xl border border-white/5 text-center shadow-xl">
          <h4 className="text-mammut-white font-black uppercase tracking-widest text-xs mb-1">
            Pins placed: <span className="text-emerald-400">{points.length}/4</span>
          </h4>
          <p className="text-mammut-white/50 text-[10px]">Tap the blue ring on your wall to drop physical anchor pins.</p>
        </div>
        
        {points.length >= 2 && (
          <button 
            onClick={handleFinish}
            className="w-full bg-emerald-600 text-mammut-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-[0_10px_30px_rgba(52,211,153,0.3)] flex items-center justify-center gap-2"
          >
            <Check size={18} /> Confirm Dimensions
          </button>
        )}
      </div>

      <Canvas style={{ width: '100vw', height: '100vh' }}>
        <XR>
          <Scene points={points} onPlacePoint={handlePlacePoint} />
        </XR>
      </Canvas>
    </div>
  );
}
