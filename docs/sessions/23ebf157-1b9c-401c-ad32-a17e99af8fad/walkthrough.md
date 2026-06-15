# Walkthrough - 3D Window Hinge Tester

We have successfully built a premium, interactive 3D testing environment at `/hinge-tester` to verify the swing and tilt rotations of the bottom-right window hinge model (`Bottom hinge right.glb`). We also resolved the core collision issue where the bottom pin protruded through the cover during opening.

## Changes Completed

We created and modified the following files in the [fantastic-octo-giggle](file:///C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle) workspace:

### 3D Component
- **[HingeTester.tsx](file:///C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/components/configurator/HingeTester.tsx)**: Handles the 3D Canvas, lights, HDRI studio environment, coordinate grids, and OrbitControls. Contains the custom rigging logic (Corrected vs Raw CAD Default), the hierarchy inspector sidebar, preset colors, and the synchronized 3D Window Mockup.

### Pages & Routing
- **[HingeTesterPage.tsx](file:///C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/pages/HingeTesterPage.tsx)**: Standalone wrapper page providing a premium dark layout and navigation back to the main app playground.
- **[App.tsx](file:///C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/App.tsx)**: Added imports and registered the route `/hinge-tester` to load `HingeTesterPage`.
- **[ConfiguratorTestPage.tsx](file:///C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/pages/ConfiguratorTestPage.tsx)**: Added a "Launch Hinge Tester" button in the sidebar to make it easily discoverable.

---

## Technical Analysis of the Rigging Issue

### 1. Bounding Boxes & World coordinates
We ran programmatic analyses on the binary GLB data which revealed the following world geometry:
- **Bottom Pin center**: `X = 0.89225`, `Z = 1.05911`. Spans vertically from `Y = 0.33` to `Y = 5.95` (centimeters).
- **Top Cover center**: `X = 0.89661`, `Z = 1.09680`. Spans vertically from `Y = 1.95` to `Y = 11.15`.
- **Top Cover Parent Node (Node 2) Local Origin**: `X = 1.34005`, `Y = 0.80640`, `Z = 1.05497`.

### 2. The Collision Bug
In the raw CAD file, the `Bottom Pin` was nested under the `Top cover`.
When rotating the parent `Top cover` directly, Three.js rotates the hierarchy around the parent node's local origin (`[1.34005, 0.80640, 1.05497]`).
Because this local origin is offset from the pin's physical center axis (`[0.89225, 1.05911]`), the pin swings in a circle and protrudes through the side of the cover.

```mermaid
graph TD
    subgraph Raw CAD Parenting (Incorrect Swing)
        SceneGLTF[gltf.scene] --> NodeTopCover["Node 2: Top cover<br>(Local origin: 1.34, 0.80, 1.05)"]
        NodeTopCover --> NodeBottomPin["Node 1: Bottom Pin<br>(Swings in a circle around origin)"]
    end
```

### 3. The WebGL Dynamic Rigging Solution (Corrected)
We implement a custom hierarchical joint rig using nested Three.js groups:
- **`staticGroup`**: Stationary parts attached to the window frame:
  - `Bottom anchor plate for frame`
  - `Bottom cover`
  - `Bottom cover.001`
- **`tiltGroup`**: Rotates around the horizontal pivot X-axis at the base of the pin (`Y = 0.33, Z = 1.05911`).
  - `Bottom Pin` (attached here so it tilts but does NOT rotate when swinging)
- **`swingGroup`**: Child of `tiltGroup`, aligned with the pin's Y-axis. Rotates around the Y-axis.
  - `Top cover` (attached here)
  - `Top cover.001` (attached here)

```mermaid
graph TD
    subgraph Corrected Hinge Rigging (Perfect Swing & Tilt)
        SceneRoot[Assembly Root] --> staticGroup[staticGroup<br>Frame elements: static]
        SceneRoot --> tiltGroup["tiltGroup<br>Pivot: X=0.892, Y=0.33, Z=1.059<br>(Rotates around X-axis for TILT)"]
        tiltGroup --> BottomPin["Bottom Pin<br>(Tilts with sash, doesn't swing)"]
        tiltGroup --> swingGroup["swingGroup<br>Pivot: [0,0,0] local to tiltGroup<br>(Rotates around Y-axis for SWING)"]
        swingGroup --> TopCover["Top cover"]
        swingGroup --> TopCover001["Top cover.001"]
    end
```

---

## Verification Results

We verified that:
1. **TypeScript Build**: Running `npx tsc --noEmit` compiled successfully without errors.
2. **Correct Rigging Mode**: Swing slider turns the `Top cover` and `Top cover.001` around the central axis of the pin; the pin remains stationary inside the cover cylinder, showing no protrusion.
3. **CAD Default Mode**: Shows the collision error exactly, demonstrating the pin punching through the side wall of the rotating cover.
4. **Tilting Mode**: Both covers and the bottom pin rotate forward together relative to the anchor plate, matching actual window physics.
5. **Double Viewport**: Rotating controls synchronously rotates both the detailed hinge on the right and the macro window mockup on the left, demonstrating the spatial relationships.

---

## Hinge Visibility & Camera Layout Fixes

We identified and resolved why the hinge was initially invisible:
1. **Camera Scale & Clamping**: The hinge is programmatically sized in coordinate units where height is `9.2`. At a camera distance of `3.5` and a max-clamp of `8`, the camera was placed inside the mesh, rendering a clipped, indistinguishable view. We updated the camera position to `[3, 2, 14]` and increased the OrbitControls max-clamp to `35` to pull the camera back and frame the full assembly.
2. **Hinge Centering**: We offset the root translation in Y by `-5.57` (the average height of the hinge), placing the exact center of the hinge at `[0, 0, 0]`. Orbiting now pivots perfectly around the physical center.
3. **Mockup Proportions**: We scaled up the wireframe window mockup (`4.0 x 6.0`) and offset it to `[-5.5, 0, 0]` so that it sits neatly on the left side of the canvas in the same field of view.
4. **Default Color Contrast**: Changed the default cover color to Satin White (`#f6f6f2`), which stands out with high contrast against the dark background.
5. **Node Graph Matrix Calculation Fix**: Replaced the dynamic `.attach` calls with explicit local position overrides (`position.set`) relative to the nested groups. This bypasses a Three.js limitation where `.attach` computes incorrect local positions on disconnected node hierarchies prior to their addition to the main scene.
