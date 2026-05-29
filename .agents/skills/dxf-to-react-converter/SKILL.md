---
name: dxf-to-react-converter
description: Extracts standard and bi-color window profiles from layered DXF files, simplifies the geometry, and converts them to scalable React SVG paths and Three.js ExtrudeGeometry.
---

# DXF to React Converter & 3D Extrusion Pipeline

This skill defines the process for parsing Drutex architectural DXF files and converting them into highly optimized, web-ready components for the React Configurator Engine using Three.js and CSG.

## 1. Naming & Layering Convention

For the script to automatically extract profiles and map them to their correct material/color variants, the CAD engineer must organize the DXF using the following strict layer names:

*   `FRM_EXT`: Exterior Frame Profile (Mapped to `--color-ext`)
*   `FRM_INT`: Interior Frame Profile (Mapped to `--color-int`)
*   `GSK_FRM_EXT`, `GSK_SSH_INT`, etc: Gaskets (Mapped to `--color-gsk`)
*   `SSH_EXT`, `SSH_INT`: Sash Profiles
*   `GLS_EXT`, `GLS_INT`: Glass package representations
*   `BZD`: Glazing Bead

## 2. Geometry Preparation Pipeline (`dxf_prepare_geometry.mjs`)

The core extraction process uses a custom Node.js script located at `scratch/dxf_prepare_geometry.mjs` (or similar path depending on workspace).

**Pipeline Steps:**
1.  **Parse Layers**: Iterates through DXF entities and filters by target layer names.
2.  **Extract Polylines**: Extracts vertices for `LWPOLYLINE`, `LINE`, and `ARC` entities.
3.  **Contour Chaining**: Uses a greedy chaining algorithm to connect detached lines and arcs into closed continuous contours.
4.  **Douglas-Peucker Simplification (CRITICAL)**: Runs the DP algorithm (epsilon = 0.05mm) across all contours to aggressively drop microscopic/redundant vertices. This is mandatory for real-time 3D boolean operations, reducing vertex counts by ~80%.
5.  **Coordinate Normalization**: Translates all coordinates so the bounding box origin is at `(0,0)`.
6.  **JSON Export**: Outputs `SVG` path definitions and raw `points` coordinate arrays for `new THREE.Shape()`.

**Usage:**
```bash
node scratch/dxf_prepare_geometry.mjs "path/to/profile.dxf" --out "src/data/profiles/IGLO5/IG5_F101B.json"
```

## 3. React Three Fiber Architecture & Best Practices

When integrating the generated JSON profiles into the React frontend, you must adhere to the following architectural rules:

### A. The `<FrameSegment>` Component
Instead of building extrusions imperatively, use the existing `<FrameSegment>` abstraction. It takes the 2D JSON vertices, turns them into a `THREE.ExtrudeGeometry`, and uses `three-bvh-csg` to carve precise 45-degree mitre cuts at the ends.

### B. Geometry Caching
**Rule**: Always pass the `layerName` (e.g., `"FRM_EXT"`) and `length` prop down to `<FrameSegment>`. 
`<FrameSegment>` utilizes a global `geometryCache` Map keyed by `[layerName, length]`. Since a window usually has multiple sides of the exact same length, caching guarantees the expensive CSG boolean subtraction runs exactly *once* per layer instead of 4-8 times. This also bypasses the massive performance penalty caused by React 18 Strict Mode double-renders.

### C. React `<Suspense>` Boundaries
**Rule**: Any component rendering the `<Environment>` (HDR lighting) or loading GLTF models/textures asynchronously MUST be wrapped in a `<React.Suspense>` boundary.
Failure to do so will result in React completely unmounting the WebGL canvas, leaving a blank white screen with no console errors.
```tsx
<React.Suspense fallback={null}>
  <Environment preset="studio" />
  <Child1 widthMm={1000} heightMm={1000} />
</React.Suspense>
```
