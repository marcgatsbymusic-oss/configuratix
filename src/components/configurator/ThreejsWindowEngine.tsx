import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';

// We import the specific JSON payloads. 
// In a dynamic app, this would be fetched via API based on the selected typology.
import IG5_F104 from '../../data/profiles/IG5_F104.json';
import IG5_F100 from '../../data/profiles/IG5_F100.json';


interface ThreejsWindowEngineProps {
  width: number;
  height: number;
  colorExt?: string;
  colorInt?: string;
  colorExtTexture?: string;
  colorIntTexture?: string;
  spacerColor?: string;
  onSceneReady?: (data: any) => void;
  arPlacement?: 'wall' | 'floor';
  typology?: string;
  sealColor?: string;
}

const WindowAssembly = ({ 
  width, 
  height, 
  colorExt, 
  colorInt, 
  colorExtTexture, 
  colorIntTexture, 
  spacerColor = '#b0b5b9', 
  onSceneReady,
  typology = 'F104',
  sealColor = '',
}: ThreejsWindowEngineProps) => {
  const [groupObj, setGroupObj] = React.useState<THREE.Group | null>(null);

  // Packed PBR maps (diffuse, normal, ORM) for exterior and interior
  const [extMaps, setExtMaps] = React.useState<{
    diffuse: THREE.Texture | null;
    normal: THREE.Texture | null;
    orm: THREE.Texture | null;
  }>({ diffuse: null, normal: null, orm: null });

  const [intMaps, setIntMaps] = React.useState<{
    diffuse: THREE.Texture | null;
    normal: THREE.Texture | null;
    orm: THREE.Texture | null;
  }>({ diffuse: null, normal: null, orm: null });

  React.useEffect(() => {
    if (groupObj && onSceneReady) {
      // Force state update by passing a new object with timestamp
      onSceneReady({ group: groupObj, ts: Date.now() } as any);
    }
  }, [groupObj, onSceneReady, extMaps, intMaps, colorExt, colorInt]);

  // Helper to extract the texture folder name and build PBR asset paths
  const resolveBakedPaths = (texturePath: string) => {
    console.log("[ThreejsWindowEngine] resolveBakedPaths input:", texturePath);
    if (!texturePath) return null;
    const match = texturePath.match(/\/([^\/]+)\.(jpg|png|webp|jpeg)$/i);
    if (!match) {
      console.warn("[ThreejsWindowEngine] resolveBakedPaths: No filename match for regex in:", texturePath);
      return null;
    }
    const materialName = match[1];
    const resolved = {
      diffuse: `/assets/texturesbaked/${materialName}/diffuse.jpg`,
      normal: `/assets/texturesbaked/${materialName}/normal.jpg`,
      orm: `/assets/texturesbaked/${materialName}/orm.png`
    };
    console.log("[ThreejsWindowEngine] resolveBakedPaths output:", resolved);
    return resolved;
  };

  // Helper to load all three PBR maps synchronously
  const loadPBRMaps = (texturePath: string, callback: (maps: { diffuse: THREE.Texture | null; normal: THREE.Texture | null; orm: THREE.Texture | null }) => void) => {
    const paths = resolveBakedPaths(texturePath);
    if (!paths) {
      callback({ diffuse: null, normal: null, orm: null });
      return;
    }

    const loader = new THREE.TextureLoader();
    let loadedDiffuse: THREE.Texture | null = null;
    let loadedNormal: THREE.Texture | null = null;
    let loadedORM: THREE.Texture | null = null;
    
    let count = 0;
    const total = 3;
    
    const checkDone = () => {
      count++;
      if (count === total) {
        callback({ diffuse: loadedDiffuse, normal: loadedNormal, orm: loadedORM });
      }
    };

    const configureTexture = (tex: THREE.Texture, colorSpace: THREE.ColorSpace) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(1.0, 1.0);
      tex.colorSpace = colorSpace;
      tex.anisotropy = 8;
    };

    // Load Diffuse (sRGB)
    console.log("[ThreejsWindowEngine] Loading diffuse:", paths.diffuse);
    loader.load(paths.diffuse, 
      (tex) => {
        console.log("[ThreejsWindowEngine] Successfully loaded diffuse:", paths.diffuse, tex.image ? `${tex.image.width}x${tex.image.height}` : 'no image');
        configureTexture(tex, THREE.SRGBColorSpace);
        loadedDiffuse = tex;
        checkDone();
      },
      undefined,
      (err) => {
        console.error("[ThreejsWindowEngine] Error loading diffuse:", paths.diffuse, err);
        loadedDiffuse = null;
        checkDone();
      }
    );

    // Load Normal (NoColor / Linear)
    console.log("[ThreejsWindowEngine] Loading normal:", paths.normal);
    loader.load(paths.normal, 
      (tex) => {
        console.log("[ThreejsWindowEngine] Successfully loaded normal:", paths.normal, tex.image ? `${tex.image.width}x${tex.image.height}` : 'no image');
        configureTexture(tex, THREE.NoColorSpace);
        loadedNormal = tex;
        checkDone();
      },
      undefined,
      (err) => {
        console.error("[ThreejsWindowEngine] Error loading normal:", paths.normal, err);
        loadedNormal = null;
        checkDone();
      }
    );

    // Load ORM (NoColor / Linear)
    console.log("[ThreejsWindowEngine] Loading ORM:", paths.orm);
    loader.load(paths.orm, 
      (tex) => {
        console.log("[ThreejsWindowEngine] Successfully loaded ORM:", paths.orm, tex.image ? `${tex.image.width}x${tex.image.height}` : 'no image');
        configureTexture(tex, THREE.NoColorSpace);
        loadedORM = tex;
        checkDone();
      },
      undefined,
      (err) => {
        console.error("[ThreejsWindowEngine] Error loading ORM:", paths.orm, err);
        loadedORM = null;
        checkDone();
      }
    );
  };



  React.useEffect(() => {
    if (colorExtTexture) {
      loadPBRMaps(colorExtTexture, (loaded) => {
        setExtMaps(loaded);
      });
    } else {
      setExtMaps({ diffuse: null, normal: null, orm: null });
    }
  }, [colorExtTexture]);

  React.useEffect(() => {
    if (colorIntTexture) {
      loadPBRMaps(colorIntTexture, (loaded) => {
        setIntMaps(loaded);
      });
    } else {
      setIntMaps({ diffuse: null, normal: null, orm: null });
    }
  }, [colorIntTexture]);

  const extMaterial = useMemo(() => {
    if (extMaps.diffuse) {
      return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: extMaps.diffuse,
        normalMap: extMaps.normal || null,
        aoMap: extMaps.orm || null,
        roughnessMap: extMaps.orm || null,
        metalnessMap: extMaps.orm || null,
        roughness: 1.0,
        metalness: 1.0
      });
    }
    return new THREE.MeshStandardMaterial({
      color: colorExt || '#ffffff',
      roughness: 0.6,
      metalness: 0.1
    });
  }, [colorExt, extMaps]);
  
  const intMaterial = useMemo(() => {
    if (intMaps.diffuse) {
      return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: intMaps.diffuse,
        normalMap: intMaps.normal || null,
        aoMap: intMaps.orm || null,
        roughnessMap: intMaps.orm || null,
        metalnessMap: intMaps.orm || null,
        roughness: 1.0,
        metalness: 1.0
      });
    }
    return new THREE.MeshStandardMaterial({
      color: colorInt || '#ffffff',
      roughness: 0.6,
      metalness: 0.1
    });
  }, [colorInt, intMaps]);

  const glassMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({ 
     color: "#aaccff", 
     transparent: true,
     opacity: 0.4, 
     roughness: 0.05,
     metalness: 0.1,
     transmission: 0.9,
     thickness: 0.004,
     ior: 1.5,
  }), []);

  const spacerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: spacerColor,
    roughness: 0.8,
    metalness: 0.6
  }), [spacerColor]);

  const profileData = useMemo(() => {
    return typology === 'F100' ? IG5_F100 : IG5_F104;
  }, [typology]);

  const frmExt = profileData.profiles.FRM_EXT?.vertices || [];
  const frmInt = profileData.profiles.FRM_INT?.vertices || [];
  const bzd = (profileData.profiles as any).BZD?.vertices || [];
  const sshExt = (profileData.profiles as any).SSH_EXT?.vertices || [];
  const sshInt = (profileData.profiles as any).SSH_INT?.vertices || [];
  const glsExt = profileData.profiles.GLS_EXT?.vertices || [];
  const glsInt = profileData.profiles.GLS_INT?.vertices || [];
  const spacer1 = profileData.profiles.SPACER1?.vertices || [];

  // Helper to get bounds of a profile
  const getBounds = (verts: any[]) => {
    if (!verts || verts.length === 0) return null;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const v of verts) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }
    return { minX, maxX, minY, maxY };
  };

  const extBounds = getBounds(glsExt);
  const intBounds = getBounds(glsInt);

  // Compute common origin for all parts so they don't lose relative positioning!
  const commonOrigin = useMemo(() => {
    let minX = Infinity, minY = Infinity;
    const allVerts = [...frmExt, ...frmInt, ...bzd, ...sshExt, ...sshInt, ...glsExt, ...glsInt, ...spacer1];
    for (const v of allVerts) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
    }
    return { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY };
  }, [frmExt, frmInt, bzd, sshExt, sshInt, glsExt, glsInt, spacer1]);

  // CAD profiles are often huge (e.g. 1 unit = 1mm). 
  // We must scale down by 0.001 so 1 unit = 1 meter in the final exported GLTF,
  // which is exactly what AR viewers expect for real-world physical sizing.
  const scale = 0.001;

  const W = width * scale;
  const H = height * scale;

  // Pivot strategy:
  // X: centered horizontally (-W/2 to +W/2 → center at 0)
  // Y: bottom edge at 0 (0 to +H). For floor placement, model sits ON the floor.
  //    For wall placement, model-viewer rotates it, so Y=0 becomes the bottom of the wall anchor.
  // Z: back face at 0 (back of frame flush with the anchor plane).
  //    For wall placement, the model projects outward from Z=0 into the room.

  return (
    <group ref={setGroupObj}>
      {/* Shift so: X centered, Y bottom at origin, Z back-face at origin */}
      <group position={[-W / 2, 0, 0]}>
        {/* Bottom Segment */}
        <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={width} vertices={frmExt} material={extMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={width} vertices={frmInt} material={intMaterial} origin={commonOrigin} />
            {bzd.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={bzd} material={intMaterial} origin={commonOrigin} />}
            {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshExt} material={extMaterial} origin={commonOrigin} />}
            {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshInt} material={intMaterial} origin={commonOrigin} />}
            {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={spacer1} material={spacerMaterial} origin={commonOrigin} />}
          </group>
        </group>

        {/* Right Segment */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={height} vertices={frmExt} material={extMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={height} vertices={frmInt} material={intMaterial} origin={commonOrigin} />
            {bzd.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={bzd} material={intMaterial} origin={commonOrigin} />}
            {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshExt} material={extMaterial} origin={commonOrigin} />}
            {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshInt} material={intMaterial} origin={commonOrigin} />}
            {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={spacer1} material={spacerMaterial} origin={commonOrigin} />}
          </group>
        </group>

        {/* Top Segment */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={width} vertices={frmExt} material={extMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={width} vertices={frmInt} material={intMaterial} origin={commonOrigin} />
            {bzd.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={bzd} material={intMaterial} origin={commonOrigin} />}
            {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshExt} material={extMaterial} origin={commonOrigin} />}
            {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshInt} material={intMaterial} origin={commonOrigin} />}
            {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={spacer1} material={spacerMaterial} origin={commonOrigin} />}
          </group>
        </group>

        {/* Left Segment */}
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={height} vertices={frmExt} material={extMaterial} origin={commonOrigin} />
            <FrameSegment scaleFactor={scale} length={height} vertices={frmInt} material={intMaterial} origin={commonOrigin} />
            {bzd.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={bzd} material={intMaterial} origin={commonOrigin} />}
            {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshExt} material={extMaterial} origin={commonOrigin} />}
            {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshInt} material={intMaterial} origin={commonOrigin} />}
            {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={spacer1} material={spacerMaterial} origin={commonOrigin} />}
          </group>
        </group>

        {/* Solid Glass Panes */}
        {extBounds && (
          <mesh 
            position={[
              W / 2, 
              H / 2, 
              -(((extBounds.minX + extBounds.maxX) / 2) - commonOrigin.x) * scale
            ]}
          >
            <boxGeometry args={[
              (width - 2 * (extBounds.minY - commonOrigin.y)) * scale, 
              (height - 2 * (extBounds.minY - commonOrigin.y)) * scale, 
              (extBounds.maxX - extBounds.minX) * scale
            ]} />
            <primitive object={glassMaterial} attach="material" />
          </mesh>
        )}
        
        {intBounds && (
          <mesh 
            position={[
              W / 2, 
              H / 2, 
              -(((intBounds.minX + intBounds.maxX) / 2) - commonOrigin.x) * scale
            ]}
          >
            <boxGeometry args={[
              (width - 2 * (intBounds.minY - commonOrigin.y)) * scale, 
              (height - 2 * (intBounds.minY - commonOrigin.y)) * scale, 
              (intBounds.maxX - intBounds.minX) * scale
            ]} />
            <primitive object={glassMaterial} attach="material" />
          </mesh>
        )}

      </group>
    </group>
  );
};

export const ThreejsWindowEngine: React.FC<ThreejsWindowEngineProps> = (props) => {
  const targetY = (props.height * 0.001) / 2;
  const maxDim = Math.max(props.width, props.height) * 0.001;
  // Dynamic camera distance to frame the window perfectly regardless of size
  const cameraZ = Math.max(1.2, maxDim * 1.35);

  return (
    <div className="w-full h-full relative cursor-move touch-pan-y">
      <Canvas shadows camera={{ position: [0, targetY, cameraZ], fov: 45 }}>
        <color attach="background" args={['#1a1a1a']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        <Environment preset="city" />
        
        <WindowAssembly {...props} />
        
        <OrbitControls makeDefault enablePan={true} enableZoom={true} target={[0, targetY, 0]} />
        <ContactShadows position={[0, -0.001, 0]} opacity={0.4} scale={5} blur={2} far={10} />
      </Canvas>
    </div>
  );
};
