import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { FrameSegment } from './FrameSegment';
import { useThemeStore } from '../../store/useThemeStore';

// We import the specific JSON payloads. 
// In a dynamic app, this would be fetched via API based on the selected typology.
import IG5_F104 from '../../data/profiles/IG5_F104.json';
import IG5_F100 from '../../data/profiles/IG5_F100.json';
import IG5_F103 from '../../data/profiles/IG5_F103.json';


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
  scenery?: string;
  customBackground?: string;
}

const DEFAULT_MAPS = { diffuse: null, normal: null, orm: null };

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
  sealColor,
  scenery = 'studio-grey',
  customBackground = '',
}: ThreejsWindowEngineProps) => {
  const [groupObj, setGroupObj] = React.useState<THREE.Group | null>(null);

  // Packed PBR maps (diffuse, normal, ORM) for exterior and interior
  const [extMaps, setExtMaps] = React.useState<{
    diffuse: THREE.Texture | null;
    normal: THREE.Texture | null;
    orm: THREE.Texture | null;
  }>(DEFAULT_MAPS);

  const [intMaps, setIntMaps] = React.useState<{
    diffuse: THREE.Texture | null;
    normal: THREE.Texture | null;
    orm: THREE.Texture | null;
  }>(DEFAULT_MAPS);

  React.useEffect(() => {
    if (groupObj && onSceneReady) {
      onSceneReady(groupObj);
    }
  }, [groupObj, onSceneReady]);

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
      // Since UVs are in meters, repeat.set(1.5, 1.5) provides a realistic texture scale (repeating every 66cm)
      tex.repeat.set(1.5, 1.5);
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
      setExtMaps(DEFAULT_MAPS);
    }
  }, [colorExtTexture]);

  React.useEffect(() => {
    if (colorIntTexture) {
      loadPBRMaps(colorIntTexture, (loaded) => {
        setIntMaps(loaded);
      });
    } else {
      setIntMaps(DEFAULT_MAPS);
    }
  }, [colorIntTexture]);

  const [wallTexture, setWallTexture] = React.useState<THREE.Texture | null>(null);
  const [backdropTexture, setBackdropTexture] = React.useState<THREE.Texture | null>(null);

  React.useEffect(() => {
    let isCurrent = true;
    let wallUrl = '';
    let backdropUrl = '';

    if (scenery === 'custom' && customBackground) {
      backdropUrl = customBackground;
    } else if (scenery === 'modern-minimalist') {
      wallUrl = '/assets/scenery/concrete_wall.png';
      backdropUrl = '/assets/scenery/garden_backdrop.png';
    } else if (scenery === 'warm-nordic') {
      wallUrl = '/assets/scenery/wood_wall.png';
      backdropUrl = '/assets/scenery/forest_backdrop.png';
    } else if (scenery === 'industrial-loft') {
      wallUrl = '/assets/scenery/brick_wall.png';
      backdropUrl = '/assets/scenery/skyline_backdrop.png';
    } else if (scenery === 'suburban-garden') {
      backdropUrl = '/assets/scenery/garden_backdrop.png';
    } else if (scenery === 'nordic-forest') {
      backdropUrl = '/assets/scenery/forest_backdrop.png';
    } else if (scenery === 'urban-skyline') {
      backdropUrl = '/assets/scenery/skyline_backdrop.png';
    } else if (scenery === 'coastal-mediterranean') {
      backdropUrl = '/assets/scenery/coastal_backdrop.png';
    }

    const loader = new THREE.TextureLoader();

    if (wallUrl) {
      loader.load(wallUrl, (tex) => {
        if (!isCurrent) {
          tex.dispose();
          return;
        }
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(3, 2.5); // Adjust repeat tiling scale for wall texture
        setWallTexture(tex);
      });
    } else {
      setWallTexture(null);
    }

    if (backdropUrl) {
      loader.load(backdropUrl, (tex) => {
        if (!isCurrent) {
          tex.dispose();
          return;
        }
        setBackdropTexture(tex);
      });
    } else {
      setBackdropTexture(null);
    }

    return () => {
      isCurrent = false;
      setWallTexture(prev => {
        if (prev) prev.dispose();
        return null;
      });
      setBackdropTexture(prev => {
        if (prev) prev.dispose();
        return null;
      });
    };
  }, [scenery, customBackground]);


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
     color: "#ffffff", 
     roughness: 0.0,
     metalness: 0.0,
     transmission: 1.0,
     ior: 1.5,
     thickness: 0.01,
     transparent: false,
     opacity: 1.0,
  }), []);

  const spacerMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: spacerColor,
    roughness: 0.8,
    metalness: 0.6
  }), [spacerColor]);

  // F103 color overrides & gasket materials
  const finalFrmExtMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.6, metalness: 0.1 });
    }
    return extMaterial;
  }, [typology, extMaterial]);

  const finalFrmIntMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#60a5fa', roughness: 0.6, metalness: 0.1 });
    }
    return intMaterial;
  }, [typology, intMaterial]);

  const finalSshExtMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.6, metalness: 0.1 });
    }
    return extMaterial;
  }, [typology, extMaterial]);

  const finalSshIntMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#f87171', roughness: 0.6, metalness: 0.1 });
    }
    return intMaterial;
  }, [typology, intMaterial]);

  const finalBzdMat = intMaterial;

  const finalSpacerMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.8, metalness: 0.6 });
    }
    return spacerMaterial;
  }, [typology, spacerMaterial]);

  const finalGlsExtMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshPhysicalMaterial({
        color: "#22d3ee",
        roughness: 0.0,
        metalness: 0.0,
        transmission: 1.0,
        ior: 1.5,
        thickness: 0.01,
        transparent: true,
        opacity: 0.6,
      });
    }
    return glassMaterial;
  }, [typology, glassMaterial]);

  const finalGlsIntMat = useMemo(() => {
    if (typology === 'F103') {
      return new THREE.MeshPhysicalMaterial({
        color: "#0d9488",
        roughness: 0.0,
        metalness: 0.0,
        transmission: 1.0,
        ior: 1.5,
        thickness: 0.01,
        transparent: true,
        opacity: 0.6,
      });
    }
    return glassMaterial;
  }, [typology, glassMaterial]);

  const gskFrmExtMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: typology === 'F103' ? '#15803d' : (sealColor || '#1a1a1a'),
    roughness: 0.9,
    metalness: 0.1
  }), [typology, sealColor]);

  const gskSshBtmMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: typology === 'F103' ? '#84cc16' : (sealColor || '#1a1a1a'),
    roughness: 0.9,
    metalness: 0.1
  }), [typology, sealColor]);

  const gskBzdMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: typology === 'F103' ? '#7c3aed' : (sealColor || '#1a1a1a'),
    roughness: 0.9,
    metalness: 0.1
  }), [typology, sealColor]);

  const gskSshExtMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: typology === 'F103' ? '#db2777' : (sealColor || '#1a1a1a'),
    roughness: 0.9,
    metalness: 0.1
  }), [typology, sealColor]);

  const profileData = useMemo(() => {
    if (typology === 'F104') return IG5_F104;
    if (typology === 'F103') return IG5_F103;
    return IG5_F100;
  }, [typology]);

  const frmExt = profileData.profiles.FRM_EXT?.vertices || [];
  const frmInt = profileData.profiles.FRM_INT?.vertices || [];
  const bzd = (profileData.profiles as any).BZD?.vertices || [];
  const sshExt = (profileData.profiles as any).SSH_EXT?.vertices || [];
  const sshInt = (profileData.profiles as any).SSH_INT?.vertices || [];
  const glsExt = profileData.profiles.GLS_EXT?.vertices || [];
  const glsInt = profileData.profiles.GLS_INT?.vertices || [];
  const spacer1 = (profileData.profiles as any).SPACER1?.vertices || (profileData.profiles as any).SPCR?.vertices || [];

  const gskFrmExt = (profileData.profiles as any).GSK_FRM_EXT?.vertices || [];
  const gskSshBtm = (profileData.profiles as any).GSK_SSH_BTM?.vertices || [];
  const gskBzd = (profileData.profiles as any).GSK_BZD?.vertices || [];
  const gskSshExt = (profileData.profiles as any).GSK_SSH_EXT?.vertices || [];

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
    const allVerts = [
      ...frmExt,
      ...frmInt,
      ...bzd,
      ...sshExt,
      ...sshInt,
      ...glsExt,
      ...glsInt,
      ...spacer1,
      ...gskFrmExt,
      ...gskSshBtm,
      ...gskBzd,
      ...gskSshExt
    ];
    for (const v of allVerts) {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
    }
    return { x: minX === Infinity ? 0 : minX, y: minY === Infinity ? 0 : minY };
  }, [frmExt, frmInt, bzd, sshExt, sshInt, glsExt, glsInt, spacer1, gskFrmExt, gskSshBtm, gskBzd, gskSshExt]);

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
      {/* Rotated 180 degrees around Y so the Interior view is presented first by default */}
      <group rotation={[0, Math.PI, 0]}>
        {/* Shift so: X centered, Y bottom at origin, Z back-face at origin */}
        <group position={[-W / 2, 0, 0]}>
        {/* Bottom Segment */}
        <group position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={width} vertices={frmExt} material={finalFrmExtMat} origin={commonOrigin} uSign={1} uOffset={0} />
            <FrameSegment scaleFactor={scale} length={width} vertices={frmInt} material={finalFrmIntMat} origin={commonOrigin} uSign={1} uOffset={0} />
            {bzd.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={bzd} material={finalBzdMat} origin={commonOrigin} uSign={1} uOffset={0} />}
            {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshExt} material={finalSshExtMat} origin={commonOrigin} uSign={1} uOffset={0} />}
            {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshInt} material={finalSshIntMat} origin={commonOrigin} uSign={1} uOffset={0} />}
            {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={spacer1} material={finalSpacerMat} origin={commonOrigin} uSign={1} uOffset={0} />}
            {gskFrmExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskFrmExt} material={gskFrmExtMaterial} origin={commonOrigin} uSign={1} uOffset={0} />}
            {gskSshBtm.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskSshBtm} material={gskSshBtmMaterial} origin={commonOrigin} uSign={1} uOffset={0} />}
            {gskBzd.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskBzd} material={gskBzdMaterial} origin={commonOrigin} uSign={1} uOffset={0} />}
            {gskSshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskSshExt} material={gskSshExtMaterial} origin={commonOrigin} uSign={1} uOffset={0} />}
          </group>
        </group>

        {/* Right Segment */}
        <group position={[W, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={height} vertices={frmExt} material={finalFrmExtMat} origin={commonOrigin} uSign={-1} uOffset={W} />
            <FrameSegment scaleFactor={scale} length={height} vertices={frmInt} material={finalFrmIntMat} origin={commonOrigin} uSign={-1} uOffset={W} />
            {bzd.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={bzd} material={finalBzdMat} origin={commonOrigin} uSign={-1} uOffset={W} />}
            {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshExt} material={finalSshExtMat} origin={commonOrigin} uSign={-1} uOffset={W} />}
            {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshInt} material={finalSshIntMat} origin={commonOrigin} uSign={-1} uOffset={W} />}
            {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={spacer1} material={finalSpacerMat} origin={commonOrigin} uSign={-1} uOffset={W} />}
            {gskFrmExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskFrmExt} material={gskFrmExtMaterial} origin={commonOrigin} uSign={-1} uOffset={W} />}
            {gskSshBtm.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskSshBtm} material={gskSshBtmMaterial} origin={commonOrigin} uSign={-1} uOffset={W} />}
            {gskBzd.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskBzd} material={gskBzdMaterial} origin={commonOrigin} uSign={-1} uOffset={W} />}
            {gskSshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskSshExt} material={gskSshExtMaterial} origin={commonOrigin} uSign={-1} uOffset={W} />}
          </group>
        </group>

        {/* Top Segment */}
        <group position={[W, H, 0]} rotation={[0, 0, Math.PI]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={width} vertices={frmExt} material={finalFrmExtMat} origin={commonOrigin} uSign={1} uOffset={W - H} />
            <FrameSegment scaleFactor={scale} length={width} vertices={frmInt} material={finalFrmIntMat} origin={commonOrigin} uSign={1} uOffset={W - H} />
            {bzd.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={bzd} material={finalBzdMat} origin={commonOrigin} uSign={1} uOffset={W - H} />}
            {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshExt} material={finalSshExtMat} origin={commonOrigin} uSign={1} uOffset={W - H} />}
            {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={sshInt} material={finalSshIntMat} origin={commonOrigin} uSign={1} uOffset={W - H} />}
            {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={spacer1} material={finalSpacerMat} origin={commonOrigin} uSign={1} uOffset={W - H} />}
            {gskFrmExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskFrmExt} material={gskFrmExtMaterial} origin={commonOrigin} uSign={1} uOffset={W - H} />}
            {gskSshBtm.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskSshBtm} material={gskSshBtmMaterial} origin={commonOrigin} uSign={1} uOffset={W - H} />}
            {gskBzd.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskBzd} material={gskBzdMaterial} origin={commonOrigin} uSign={1} uOffset={W - H} />}
            {gskSshExt.length > 0 && <FrameSegment scaleFactor={scale} length={width} vertices={gskSshExt} material={gskSshExtMaterial} origin={commonOrigin} uSign={1} uOffset={W - H} />}
          </group>
        </group>

        {/* Left Segment */}
        <group position={[0, H, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <group rotation={[0, Math.PI / 2, 0]}>
            <FrameSegment scaleFactor={scale} length={height} vertices={frmExt} material={finalFrmExtMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />
            <FrameSegment scaleFactor={scale} length={height} vertices={frmInt} material={finalFrmIntMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />
            {bzd.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={bzd} material={finalBzdMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />}
            {sshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshExt} material={finalSshExtMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />}
            {sshInt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={sshInt} material={finalSshIntMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />}
            {spacer1.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={spacer1} material={finalSpacerMat} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />}
            {gskFrmExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskFrmExt} material={gskFrmExtMaterial} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />}
            {gskSshBtm.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskSshBtm} material={gskSshBtmMaterial} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />}
            {gskBzd.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskBzd} material={gskBzdMaterial} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />}
            {gskSshExt.length > 0 && <FrameSegment scaleFactor={scale} length={height} vertices={gskSshExt} material={gskSshExtMaterial} origin={commonOrigin} uSign={-1} uOffset={2 * W - H} />}
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
            material={finalGlsExtMat}
          >
            <boxGeometry args={[
              (width - 2 * (extBounds.minY - commonOrigin.y)) * scale, 
              (height - 2 * (extBounds.minY - commonOrigin.y)) * scale, 
              (extBounds.maxX - extBounds.minX) * scale
            ]} />
          </mesh>
        )}
        
        {intBounds && (
          <mesh 
            position={[
              W / 2, 
              H / 2, 
              -(((intBounds.minX + intBounds.maxX) / 2) - commonOrigin.x) * scale
            ]}
            material={finalGlsIntMat}
          >
            <boxGeometry args={[
              (width - 2 * (intBounds.minY - commonOrigin.y)) * scale, 
              (height - 2 * (intBounds.minY - commonOrigin.y)) * scale, 
              (intBounds.maxX - intBounds.minX) * scale
            ]} />
          </mesh>
        )}

        </group>
      </group>

      {/* Landscape Backdrop Plane */}
      {backdropTexture && (
        <mesh position={[0, H / 2, -3.0]}>
          <planeGeometry args={[16, 12]} />
          <meshBasicMaterial map={backdropTexture} toneMapped={false} />
        </mesh>
      )}

      {/* Wall Fragment (Inside-Looking-Out) */}
      {wallTexture && (
        <mesh position={[0, 0, -0.04]} castShadow receiveShadow>
          <extrudeGeometry args={[
            // Shape
            (() => {
              const shape = new THREE.Shape();
              const wallW = 8;
              const wallH = 6;
              // Center the wall around the window's vertical center (H / 2)
              shape.moveTo(-wallW / 2, -wallH / 2 + H / 2);
              shape.lineTo(wallW / 2, -wallH / 2 + H / 2);
              shape.lineTo(wallW / 2, wallH / 2 + H / 2);
              shape.lineTo(-wallW / 2, wallH / 2 + H / 2);
              shape.closePath();

              // Cutout hole centered vertically and horizontally
              const hole = new THREE.Path();
              hole.moveTo(-W / 2, 0);
              hole.lineTo(W / 2, 0);
              hole.lineTo(W / 2, H);
              hole.lineTo(-W / 2, H);
              hole.closePath();
              shape.holes.push(hole);

              return shape;
            })(),
            // Extrude settings
            {
              depth: 0.08,
              bevelEnabled: false
            }
          ]} />
          <meshStandardMaterial 
            map={wallTexture} 
            roughness={0.95} 
            metalness={0.0} 
          />
        </mesh>
      )}

    </group>
  );
};

export const ThreejsWindowEngine: React.FC<ThreejsWindowEngineProps> = (props) => {
  const { theme } = useThemeStore();
  const isLight = theme === 'light';

  const targetY = (props.height * 0.001) / 2;
  const maxDim = Math.max(props.width, props.height) * 0.001;
  // Dynamic camera distance to frame the window perfectly regardless of size
  const cameraZ = Math.max(1.2, maxDim * 1.35);

  const controlsTarget = useMemo(() => [0, targetY, 0] as [number, number, number], [targetY]);
  const cameraPosition = useMemo(() => [0, targetY, cameraZ] as [number, number, number], [targetY, cameraZ]);

  const getEnvFiles = (scenery: string) => {
    switch (scenery) {
      case 'custom':
        return '/assets/hdri/lebombo_1k.hdr';
      case 'studio-grey':
        return '/assets/hdri/studio_small_03_1k.hdr';
      case 'studio-dark':
        return '/assets/hdri/dikhololo_night_1k.hdr';
      case 'modern-minimalist':
        return '/assets/hdri/lebombo_1k.hdr';
      case 'warm-nordic':
        return '/assets/hdri/st_fagans_interior_1k.hdr';
      case 'industrial-loft':
        return '/assets/hdri/empty_warehouse_01_1k.hdr';
      case 'suburban-garden':
        return '/assets/hdri/rooitou_park_1k.hdr';
      case 'nordic-forest':
        return '/assets/hdri/forest_slope_1k.hdr';
      case 'urban-skyline':
        return '/assets/hdri/venice_sunset_1k.hdr';
      case 'coastal-mediterranean':
        return '/assets/hdri/potsdamer_platz_1k.hdr';
      default:
        return '/assets/hdri/lebombo_1k.hdr';
    }
  };

  const getBgColor = (scenery: string) => {
    if (isLight && (scenery === 'studio-grey' || scenery === 'custom')) {
      return '#ffffff';
    }
    switch (scenery) {
      case 'custom':
        return '#f1f5f9';
      case 'studio-grey':
        return '#f1f5f9';
      case 'studio-dark':
        return '#111112';
      case 'modern-minimalist':
        return '#f8fafc';
      case 'warm-nordic':
        return '#2d241e';
      case 'industrial-loft':
        return '#1e1b18';
      case 'suburban-garden':
        return '#dbeafe';
      case 'nordic-forest':
        return '#1e293b';
      case 'urban-skyline':
        return '#3b0764';
      case 'coastal-mediterranean':
        return '#bae6fd';
      default:
        return '#f8fafc';
    }
  };

  const activeScenery = props.scenery || 'studio-grey';

  return (
    <div className="absolute inset-0 cursor-move touch-pan-y">
      <Canvas shadows camera={{ position: cameraPosition, fov: 45 }} gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={[getBgColor(activeScenery)]} />
        <ambientLight intensity={0.15} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={0.4} 
          castShadow 
          shadow-mapSize-width={2048} 
          shadow-mapSize-height={2048} 
          shadow-bias={-0.0001} 
        />
        <Environment 
          files={getEnvFiles(activeScenery)} 
          background={activeScenery !== 'studio-grey' && activeScenery !== 'studio-dark' && activeScenery !== 'custom'} 
        />
        
        <WindowAssembly {...props} />
        
        <OrbitControls makeDefault enablePan={true} enableZoom={true} target={controlsTarget} />
        <ContactShadows position={[0, -0.001, 0]} opacity={0.4} scale={5} blur={2.0} far={10} />
      </Canvas>
    </div>
  );
};
