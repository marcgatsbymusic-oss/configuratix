# F103 Geometry Integration & 3D Visualizer Guide

This document captures the detailed technical knowledge, mathematical transformations, styling rules, and layout optimizations applied during the integration of the **IGLO 5 Typology F103** 3D profile and gasket systems.

---

## 1. Profile Extraction & Slicing Mechanics

The raw profile geometry is extracted from `IGLO 5 Drawing1.dxf` and mapped programmatically in [scratch/create_profile_f103.mjs](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/scratch/create_profile_f103.mjs).

### A. Frame Slicing (`FRM_EXT` & `FRM_INT`)
* **Source Layer**: `50001 - rama 66mm` (Outer boundary polyline)
* **Slicing Rule**: Sliced vertically at `x = 35.0` (middle of the 70mm frame profile) using the Sutherland-Hodgman clipping algorithm.
  * **FRM_EXT** (Left exterior part): Vertices where $x \le 35.0$
  * **FRM_INT** (Right interior part): Vertices where $x \ge 35.0$

### B. Sash Slicing (`SSH_EXT` & `SSH_INT`)
* **Source coordinates**: Sourced from binary ACIS data in F100 (`src/data/profiles/IG5_F100.json`).
* **Translation Offset**: Shifted by translation vectors:
  $$\Delta x = -8037.73, \quad \Delta y = -4546.80$$
* **Adaptive Corner-Rounding**: Splayed/faceted corners are smoothed using quadratic Bezier curve subdivision. For consecutive vertices forming an angle between $10^\circ$ and $80^\circ$, intermediate points are interpolated (3 steps per corner) to match original rounded shoulders.

### C. Gasket Extraction & Resolution Tuning
To maintain 60 FPS performance during real-time 3D CSG cutting operations, vertex densities are configured adaptively:
1. **Frame & Sash Gaskets (`GSK_FRM_EXT`, `GSK_SSH_EXT`)**:
   * Sourced from polyline entities on layer `U-001`.
   * Sampled at **15-degree steps** for curves, yielding ~40–130 vertices.
2. **Sash Bottom Gasket (`GSK_SSH_BTM`)**:
   * Sourced from a `HATCH` entity boundary path on layer `U-002`.
   * Boundary segments (Lines and Arcs) are parsed structurally. Arcs are bulge-interpolated at **15-degree steps** to resolve self-intersection anomalies, yielding exactly 209 vertices.
3. **Glazing Bead Gasket (`GSK_BZD`)**:
   * Sourced from `U- listwy przyszybowej` and sampled at **15-degree steps** (117 vertices).

---

## 2. PBR Material & UV Mapping

The UV coordinates for extruded meshes must be triplanar-mapped in [FrameSegment.tsx](file:///c:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/components/configurator/FrameSegment.tsx) to eliminate CSG-induced texture stretching:
* **End Caps / 45-degree cut planes** ($|n_z| > 0.707$): Project UVs directly using local $x, y$ coordinates:
  $$u = y, \quad v = x$$
* **Side Walls** ($|n_z| \le 0.707$): Map $u$ along the extrusion length $z$ and $v$ along the continuous profile perimeter:
  $$u = u_{\text{offset}} + u_{\text{sign}} \cdot z$$
  $$v = x \cdot 0.707 + y \cdot 0.707$$

---

## 3. Layout & React Three Fiber (R3F) Integration Caveats

### A. Flexbox Canvas Collapsing
* **Symptom**: The 3D canvas is compressed to a tiny horizontal band (e.g. 25px height), rendering the window invisible or flat, and blocking all drag inputs.
* **Cause**: Tailwind's `flex items-center justify-center` on the parent container collapses child containers that lack explicit height. Because `<canvas>` uses a `ResizeObserver` on its parent `div`, the height collapsed to the browser minimum.
* **Fix**: Change the root container `div` of `ThreejsWindowEngine` to `absolute inset-0`. This forces it to span the entire `aspect-square` parent container and provides a stable width and height for the Three.js viewport.

### B. OrbitControls Camera Resets
* **Symptom**: Dragging to rotate the 3D window immediately snaps the view back to the default position.
* **Cause**: Passing inline arrays or objects to `<OrbitControls target={[0, targetY, 0]} />` or `<Canvas camera={{ position: [0, targetY, cameraZ] }} />` recreates array/object references on every render. Parent re-renders in `DebugPricing.tsx` trigger reference differences, resetting the controls.
* **Fix**: Memoize the camera position and target vectors:
  ```typescript
  const controlsTarget = useMemo(() => [0, targetY, 0] as [number, number, number], [targetY]);
  const cameraPosition = useMemo(() => [0, targetY, cameraZ] as [number, number, number], [targetY, cameraZ]);
  ```

---

## 4. Visual Verification Color Matrix (Typology F103 Only)

For typology `F103`, each component uses custom test colors to confirm boundaries:

| Component | Code | Color Name | Hex Code |
| :--- | :--- | :--- | :--- |
| **Frame Exterior** | `FRM_EXT` | Dark Blue | `#1d4ed8` |
| **Frame Interior** | `FRM_INT` | Light Blue | `#60a5fa` |
| **Sash Exterior** | `SSH_EXT` | Dark Red | `#b91c1c` |
| **Sash Interior** | `SSH_INT` | Light Red | `#f87171` |
| **Glazing Bead** | `BZD` | White | `#ffffff` |
| **Glass Spacer** | `SPCR` | Gold/Yellow | `#eab308` |
| **Glass Exterior** | `GLS_EXT` | Transparent Cyan | `#22d3ee` (60% opacity) |
| **Glass Interior** | `GLS_INT` | Transparent Teal | `#0d9488` (60% opacity) |
| **Gasket Frame Ext** | `GSK_FRM_EXT`| Green | `#15803d` |
| **Gasket Sash Btm** | `GSK_SSH_BTM`| Lime Green | `#84cc16` |
| **Gasket Bead** | `GSK_BZD` | Purple | `#7c3aed` |
| **Gasket Sash Ext** | `GSK_SSH_EXT`| Pink | `#db2777` |

---

## 5. Development scripts
* **HATCH boundary parser**: `scratch/parse_hatch.mjs`
* **JSON Profile builder**: `scratch/create_profile_f103.mjs`
* **UI drag simulator test**: `scratch/test_canvas_interactions.mjs`
