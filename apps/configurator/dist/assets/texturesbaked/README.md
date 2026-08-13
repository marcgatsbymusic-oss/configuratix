# Texture Baking Workflow for Three.js Configurator

To achieve a photorealistic, premium appearance in WebGL (Three.js), we use physical-based rendering (PBR) workflows. Below is the guide to baking, optimizing, and structuring textures in this folder.

---

## 1. Directory Structure

Place your baked textures here using the following structure for each color/material:

```text
public/assets/texturesbaked/
├── README.md
├── wood_winchester/
│   ├── diffuse.jpg         # Base Color / Albedo map (sRGB)
│   ├── normal.jpg          # Normal map (Linear/Non-Color)
│   └── orm.png             # Packed ORM map (Linear/Non-Color)
├── anthracite_matte/
│   ├── diffuse.jpg
│   ├── normal.jpg
│   └── orm.png
```

---

## 2. The ORM Texture Packing Standard

To maximize GPU performance and reduce HTTP request overhead, we pack three separate grayscale maps into a single **RGB image** (usually a PNG or WebP):

| Channel | Map Type | Description | Three.js Usage |
| :--- | :--- | :--- | :--- |
| **Red** | **Ambient Occlusion (AO)** | Shadows in cracks and crevices | `MeshStandardMaterial.aoMap` |
| **Green** | **Roughness** | Surface shininess (black is shiny, white is matte) | `MeshStandardMaterial.roughnessMap` |
| **Blue** | **Metalness** | Metallic reflection (black is dielectric, white is metal) | `MeshStandardMaterial.metalnessMap` |

---

## 3. How to Bake in Blender

For realistic window frames, textures must be **seamless and tileable** since the profiles are dynamically extruded in the configurator.

### For Tileable Materials (Veneers):
1. **Diffuse (Albedo):** Ensure no lighting shadows or bright specular highlights are painted into the texture. It should represent pure surface color.
2. **Normal Map:** Generate this from high-poly detail or height maps. Set the color space to **Non-Color** in Blender/Three.js. Use the **OpenGL standard** (+Y up) for Three.js.
3. **Roughness Map:** Bake/generate a map where wood grain pores are rougher (lighter) and polished finishes are smoother (darker).
4. **AO Map:** For tileable textures, a flat white or very subtle noise AO map is used.

### For Static Components (Handles, Accessories):
If you have static 3D models (like the DUBLIN handle or hinges), you can bake static lighting/shadows directly onto their UV maps:
1. **Smart UV Project** the model in Blender.
2. Create a new image texture (e.g. 2048x2048).
3. In **Cycles Render Properties**, scroll down to **Bake**.
4. Set **Bake Type** to **Ambient Occlusion** or **Combined** (for lightmaps).
5. Click **Bake** and save the resulting image as `ao.jpg` or `lightmap.jpg`.

---

## 4. Integration in Three.js

When loading these maps in your Three.js engine (`ThreejsWindowEngine.tsx`), configure them as follows:

```typescript
import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// 1. Load the Diffuse Map (sRGB Color Space)
const diffuseMap = textureLoader.load('/assets/texturesbaked/wood_winchester/diffuse.jpg');
diffuseMap.colorSpace = THREE.SRGBColorSpace;
diffuseMap.wrapS = THREE.RepeatWrapping;
diffuseMap.wrapT = THREE.RepeatWrapping;

// 2. Load the Normal Map (Linear Color Space)
const normalMap = textureLoader.load('/assets/texturesbaked/wood_winchester/normal.jpg');
normalMap.colorSpace = THREE.NoColorSpace; // Non-Color
normalMap.wrapS = THREE.RepeatWrapping;
normalMap.wrapT = THREE.RepeatWrapping;

// 3. Load the packed ORM Map (Linear Color Space)
const ormMap = textureLoader.load('/assets/texturesbaked/wood_winchester/orm.png');
ormMap.colorSpace = THREE.NoColorSpace; // Non-Color
ormMap.wrapS = THREE.RepeatWrapping;
ormMap.wrapT = THREE.RepeatWrapping;

// 4. Apply to MeshStandardMaterial
const material = new THREE.MeshStandardMaterial({
  map: diffuseMap,
  normalMap: normalMap,
  normalScale: new THREE.Vector2(1.0, 1.0),
  
  // Packings applied to their respective channels:
  aoMap: ormMap,
  roughnessMap: ormMap,
  metalnessMap: ormMap,
  
  // Optional tuning factors:
  roughness: 1.0, // multiplier
  metalness: 1.0, // multiplier
});
```

---

## 5. Web Performance Tips
* **Format:** Use `.jpg` or `.webp` for Diffuse/Normal maps to keep file sizes under 200KB. Use `.png` or lossless `.webp` for ORM maps to avoid compression artifacts in the green/blue channels.
* **Resolution:** 1024x1024 is usually sufficient for window profile textures. Use 2048x2048 only if the grain is highly detailed.
* **Anisotropy:** Enable `texture.anisotropy = renderer.capabilities.getMaxAnisotropy()` to prevent textures from turning blurry at sharp viewing angles.

---

## 6. Automated Packing Script

We have provided a Python script under `scripts/pack_textures.py` to automate this workflow.

### Prerequisite
Install Pillow (the standard Python Image Library):
```bash
pip install Pillow
```

### Usage
1. Place your raw textures in a folder named `textures_raw` in the root of the project, organized by material name:
   ```text
   textures_raw/
   └── wood_winchester/
       ├── basecolor.jpg
       ├── roughness.png
       ├── normal.jpg
       └── ao.jpg
   ```
2. Run the script:
   ```bash
   python scripts/pack_textures.py
   ```
3. The script will automatically match base colors, normal maps, and pack the ORM map, saving them directly into `public/assets/texturesbaked/wood_winchester/` with correct file formats (`diffuse.jpg`, `normal.jpg`, `orm.png`).
