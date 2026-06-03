---
name: iglo-slide-modeler
description: Pipeline for extracting, preparing, and rendering 3D horizontal sliding window/door systems (like Iglo Slide SLE201) in React Three Fiber with linear sliding animations.
---

# Iglo Slide 3D Extrusion & Animation Pipeline

This skill defines the process for parsing, preparing, and rendering sliding window and door systems (specifically **IGLO SLIDE / SLE201** series) using Three.js, React Three Fiber, and CSG.

## 1. Sliding-Specific Naming & Layering Convention

In addition to standard window frame layers, sliding systems require distinct layers to accommodate tracks, rollers, meeting stiles, and parallel sliding planes:

*   **`FRM_TRACK_EXT` / `FRM_TRACK_INT`**: Tracks or guiding rails on which the active sash slides.
*   **`SSH_ACTIVE`**: The sliding sash profile (moves horizontally along the track).
*   **`SSH_FIXED`**: The stationary sash profile.
*   **`INT_LOC` (Interlock / Meeting Stile)**: The overlapping middle profile (sometimes called "labirynt") where sashes meet and seal.
*   **`SCHWELLE` (Threshold)**: Aluminum low-threshold profile (often at the bottom, replacing the standard bottom PVC frame).

## 2. Geometry Preparation for Sliding Systems (`dxf_prepare_geometry.mjs`)

When running the DXF prep script, make sure to customize the output mapping for sliding typologies:

```bash
node scratch/dxf_prepare_geometry.mjs "path/to/SLE201.dxf" --out "src/data/profiles/IgloEdge/SLE201.json"
```

### Key Differences in Processing:
1.  **Z-Offset Alignment**: Sliding sashes sit on parallel tracks offset along the Z-axis. Ensure the bounding box calculation captures the relative Z-spacing correctly.
2.  **Simplification Tolerance**: Tracks and gaskets in sliding doors have intricate ridges. Keep Douglas-Peucker `epsilon = 0.05` to retain contact surface geometry while discarding redundant vertices on flat stretches.

## 3. R3F Component Architecture for Sliding Systems

When implementing sliding viewers (e.g., `<SLE201Viewer>`), follow these engineering standards:

### A. Linear Translation Animation
Instead of pivoting on a hinge, the active sash moves along the X-axis:
*   **Animation State**: `'closed'` or `'open'`.
*   **Translation distance ($D_x$)**: Typically calculated as:
    $$D_x = \text{Sash Width} - \text{Overlap Width}$$
*   **Implementation in `useFrame`**:
    ```tsx
    const targetX = windowState === 'open' ? (sashWidthMm - overlapMm) * scale : 0;
    currentX.current = THREE.MathUtils.lerp(currentX.current, targetX, 0.1);
    activeSashRef.current.position.x = currentX.current;
    ```

### B. Joint Alignment (Butt Joints vs. Mitres)
*   Standard PVC sashes use **45° mitre cuts** (handled by `FrameSegment` with default CSG subtractors).
*   Aluminum thresholds and track guides are typically cut at **90° (butt joints)**. Pass the appropriate angle modifier to the segment component to avoid mitre gaps:
    ```tsx
    // For 90-degree cuts: uSign=0 or custom cut offsets
    <FrameSegment uSign={0} ... />
    ```

### C. Z-Index Track Positioning
Ensure the active and fixed sashes are separated on the Z-axis to prevent mesh overlapping:
*   **Track 1 (Exterior)**: Fixed Sash
*   **Track 2 (Interior)**: Active Sliding Sash
*   Always align center depths using the track offsets defined in the DXF file.
