# Interactive 3D Hinge Tester and Rotation Visualizer

This plan outlines the integration and testing of the bottom-right window hinge model (`Bottom hinge right.glb`). We will create a premium, interactive web application to visualize, test, and verify the hinge's swing (opening) and tilt rotations, demonstrating the CAD hierarchy issue (pin protrusion) and our Three.js un-parenting solution.

## User Review Required

> [!IMPORTANT]
> - **Hinge Model**: Sourced from `public/models/Bottom_hinge_right.glb`.
> - **Hierarchy Adjustment**: In the raw CAD file, `Bottom Pin` is parented under `Top cover`. If rotated directly, the pin rotates with the cover, causing collision and protrusion. We introduce a "Correct Rigging" mode that un-parents the pin (reattaching it to the static frame) during swing, and pivots the top cover exactly around the pin's center vertical axis.
> - **Route Location**: The new interactive interface will be accessible at the route `/hinge-tester`.

## Proposed Changes

We will create a component, a page, and update the router to include `/hinge-tester`.

---

### Components

#### [NEW] [HingeTester.tsx](file:///C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/components/configurator/HingeTester.tsx)
This component will render:
1. **Three.js Canvas**:
   - Close-up 3D view of the hinge model.
   - Grid floor, shadows, premium lighting, and orbit controls.
   - Custom coordinate axes and pivot point indicator (glowing sphere at the pin center).
   - Inset 3D view showing a simplified wireframe window frame and sash to show the relation between window opening/tilting and hinge movements.
2. **Dual-Rigging Modes**:
   - **Incorrect CAD Parenting**: Rotate `Top cover` directly. Because `Bottom Pin` is a child, it swings off-axis and protrudes.
   - **Corrected Rigging**: Re-parent `Bottom Pin` to a static group. Position a `Swing Pivot Group` exactly at the pin axis center (`[0.89225, Y, 1.05911]`), attach `Top cover` and `Top cover.001` to it, and rotate around Y. For tilting, tilt the entire sash and pin together around the bottom X axis (`Y = 0.33, Z = 1.05911`).
3. **Interactive Side Control Panel**:
   - **State Controls**: Sliders for Swing angle (0° to 90°) and Tilt angle (0° to 15°).
   - **Animation Controls**: Play/pause buttons to run cyclic opening/tilting animations.
   - **Rigging Toggle**: Switch between "Correct Rigging (Un-parent Pin)" and "CAD Default (Incorrect)".
   - **Hinge Parts Hierarchy Inspector**: Interactive list of all 6 parts in the GLB. Toggles visibility for each part, highlights hovered parts, and lists world translations and parentage.
   - **Explainer Panel**: Detailed, visually rich explanation of the protrusion bug and the mathematical fix.

---

### Pages

#### [NEW] [HingeTesterPage.tsx](file:///C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/pages/HingeTesterPage.tsx)
A full-screen standalone page hosting the `HingeTester` component. It will feature a sleek dark mode header and layout matching the Mammut premium design guidelines.

---

### Router & Layout

#### [MODIFY] [App.tsx](file:///C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/App.tsx)
Add the `/hinge-tester` route pointing to `HingeTesterPage`.

#### [MODIFY] [ConfiguratorTestPage.tsx](file:///C:/Users/Shadow/.gemini/antigravity/scratch/fantastic-octo-giggle/src/pages/ConfiguratorTestPage.tsx)
Add a button or link pointing to `/hinge-tester` to make it easily discoverable during testing.

## Verification Plan

### Manual Verification
1. Run `npm run dev` to start the local Vite server.
2. Navigate to `http://localhost:5173/hinge-tester` in the browser.
3. Test **Swing Rotation** slider in "Correct Rigging" mode: Verify the `Top cover` rotates smoothly around the pin, and the `Bottom Pin` remains perfectly stationary and centered inside.
4. Test **Swing Rotation** slider in "Incorrect CAD Parenting" mode: Verify that the `Bottom Pin` swings in a circle and visibly collides/protrudes through the side of the `Top cover`.
5. Test **Tilt Rotation** slider: Verify that the sash parts (`Top cover`, `Top cover.001`) and the `Bottom Pin` tilt forward together around the horizontal X-axis, while the frame parts (`Bottom anchor plate`, `Bottom cover`) remain static.
6. Verify visibility toggles: Hide the covers (Top/Bottom) to inspect the pin's rotation and orientation in wireframe or outline.
