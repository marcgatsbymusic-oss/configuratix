---
name: threejs-ar-configurator
description: Generates perfect mitre-cut 3D window frames using ExtrudeGeometry and CSG, applies Bi-Color materials, and exports to AR via model-viewer.
---

# Three.js AR Configurator Engine

This skill outlines the process of taking 2D window profiles (parsed via `dxf-to-react-converter`) and extruding them into highly accurate 3D geometry with 45-degree corner welds, then rendering them in React Three Fiber (R3F) and exporting to Augmented Reality.

## 1. Bi-Color Material Mapping

To support Bi-Color configurations:
*   The `FRM_EXT` (Exterior) mesh must use `exteriorMaterial` (e.g. `Anthracite` or `Golden Oak`).
*   The `FRM_INT` (Interior) mesh and `BZD` (Bead) mesh must use `interiorMaterial` (e.g. `White`).

## 2. Dynamic Extrusion & Mitre Cuts (CSG)

To avoid terrible overlapping geometry at the corners when using a continuous `THREE.ExtrudeGeometry` path, we must extrude straight pieces and cut them using Constructive Solid Geometry (CSG).

**Dependencies**: `three`, `@react-three/fiber`, `three-bvh-csg` (or similar lightweight CSG library).

**Algorithm for a Frame Component (e.g. `Top Frame`)**:
1.  **Shape Definition**: Create a `THREE.Shape` from the `FRM_EXT` JSON vertices.
2.  **Linear Extrusion**: Extrude linearly along the Z-axis for the required `width`.
3.  **CSG Subtraction**:
    *   Create a 45-degree angled `THREE.BoxGeometry` at `z = 0`.
    *   Create a -45-degree angled `THREE.BoxGeometry` at `z = width`.
    *   Use `CSG.subtract(extrudedMesh, leftBox)` and `CSG.subtract(extrudedMesh, rightBox)`.
4.  **Result**: A mathematically perfect mitre-cut frame section.
5.  Assemble the `Top`, `Bottom`, `Left`, `Right` segments into a `THREE.Group`.

## 3. AR Pipeline

We use Google's `<model-viewer>` component for cross-platform AR.
Because our 3D geometry is generated programmatically on the fly, there is no pre-existing `.glb` file.

**Export Workflow**:
1.  User clicks "View in AR".
2.  Instantiate `THREE.GLTFExporter`.
3.  Run `exporter.parse(sceneGroup, ...)` to generate a binary `.glb` array buffer.
4.  Convert the buffer to a Blob: `new Blob([buffer], { type: 'model/gltf-binary' })`.
5.  Generate a temporary Object URL: `URL.createObjectURL(blob)`.
6.  Pass this URL to `<model-viewer src={blobUrl} ar ar-modes="webxr scene-viewer quick-look">`.
