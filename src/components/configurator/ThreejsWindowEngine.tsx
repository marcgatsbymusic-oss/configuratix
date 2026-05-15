import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';

// We import the specific JSON payload for the F104. 
// In a dynamic app, this would be fetched via API based on the selected typology.
import IG5_F104 from '../../data/profiles/IG5_F104.json';

interface ThreejsWindowEngineProps {
  width: number;
  height: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  onSceneReady?: (data: any) => void;
}

const WindowAssembly = ({ width, height, colorExt, colorInt, colorExtTexture, colorIntTexture, onSceneReady }: ThreejsWindowEngineProps) => {
  const [groupObj, setGroupObj] = React.useState<THREE.Group | null>(null);
  const [extMap, setExtMap] = React.useState<THREE.Texture | null>(null);
  const [intMap, setIntMap] = React.useState<THREE.Texture | null>(null);

  React.useEffect(() => {
    if (groupObj && onSceneReady) {
      // Force state update by passing a new object with timestamp
      onSceneReady({ group: groupObj, ts: Date.now() } as any);
    }
  }, [groupObj, onSceneReady, extMap, intMap, colorExt, colorInt]);

  React.useEffect(() => {
    if (colorExtTexture) {
      new THREE.TextureLoader().load(colorExtTexture, (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.005, 0.005);
        
        // Woodgrain runs vertically in the source image (along V). 
        // ExtrudeGeometry maps U along the extrusion path. 
        // Rotating the texture 90deg aligns the grain with the length of the profile.
        tex.center.set(0.5, 0.5);
        tex.rotation = Math.PI / 2;

        tex.colorSpace = THREE.SRGBColorSpace;
        setExtMap(tex);
      });
    } else {
      setExtMap(null);
    }
  }, [colorExtTexture]);

  React.useEffect(() => {
    if (colorIntTexture) {
      new THREE.TextureLoader().load(colorIntTexture, (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(0.005, 0.005);

        tex.center.set(0.5, 0.5);
        tex.rotation = Math.PI / 2;

        tex.colorSpace = THREE.SRGBColorSpace;
        setIntMap(tex);
      });
    } else {
      setIntMap(null);
    }
  }, [colorIntTexture]);

  const extMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: colorExtTexture ? 0xffffff : colorExt, // if texture exists, use white base to show texture true color
    map: extMap,
    roughness: 0.6, 
    metalness: 0.1 
  }), [colorExt, extMap, colorExtTexture]);
  
  const intMaterial = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: colorIntTexture ? 0xffffff : colorInt, 
    map: intMap,
    roughness: 0.6, 
    metalness: 0.1 
  }), [colorInt, intMap, colorIntTexture]);

  const frmExt = IG5_F104.profiles.FRM_EXT.vertices;
  const frmInt = IG5_F104.profiles.FRM_INT.vertices;
  const bzd = IG5_F104.profiles.BZD.vertices;

  // Compute common origin for all parts so they don't lose relative positioning!
  const commonOrigin = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    const allVerts = [...frmExt, ...frmInt, ...bzd];
    for (const v of allVerts) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
    }
    return { x: minX, y: minY };
  }, [frmExt, frmInt, bzd]);

  // CAD profiles are often huge (e.g. 1 unit = 1mm). 
  // We must scale down by 0.001 so 1 unit = 1 meter in the final exported GLTF,
  // which is exactly what AR viewers expect for real-world physical sizing.
  const scale = 0.001;

  return (
    <group ref={setGroupObj}>
      <group position={[-width * scale / 2, -height * scale / 2, 0]}>
        {/* Bottom Segment */}
        <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={width} vertices={frmExt} material={extMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={width} vertices={frmInt} material={intMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={width} vertices={bzd} material={intMaterial} origin={commonOrigin} />
          </group>
        </group>

        {/* Right Segment */}
        <group position={[width * scale, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={height} vertices={frmExt} material={extMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={height} vertices={frmInt} material={intMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={height} vertices={bzd} material={intMaterial} origin={commonOrigin} />
          </group>
        </group>

        {/* Top Segment */}
        <group position={[width * scale, height * scale, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={width} vertices={frmExt} material={extMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={width} vertices={frmInt} material={intMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={width} vertices={bzd} material={intMaterial} origin={commonOrigin} />
          </group>
        </group>

        {/* Left Segment */}
        <group position={[0, height * scale, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={height} vertices={frmExt} material={extMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={height} vertices={frmInt} material={intMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={height} vertices={bzd} material={intMaterial} origin={commonOrigin} />
          </group>
        </group>

        {/* Glass Pane */}
        <mesh position={[width * scale / 2, height * scale / 2, -40 * scale]}>
          <boxGeometry args={[(width - 100) * scale, (height - 100) * scale, 24 * scale]} />
          <meshStandardMaterial 
             color="#88ccff" 
             opacity={0.4} 
             metalness={0.8} 
             roughness={0.1} 
             transparent 
          />
        </mesh>
      </group>
    </group>
  );
};

export const ThreejsWindowEngine: React.FC<ThreejsWindowEngineProps> = (props) => {
  return (
    <div className="w-full h-full relative cursor-move touch-pan-y">
      <Canvas shadows camera={{ position: [0, 0, 3], fov: 45 }}>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        <Environment preset="city" />
        
        <WindowAssembly {...props} />
        
        <OrbitControls makeDefault enablePan={true} enableZoom={true} />
        <ContactShadows position={[0, -props.height * 0.001 / 2 - 0.1, 0]} opacity={0.4} scale={5} blur={2} far={10} />
      </Canvas>
    </div>
  );
};
