# Web Configurator Graphics Strategy: React/CSS Overlays

## Background
Based on our research into the Cantor ERP database (`cantor_graphics_research.md`), Cantor does not store pre-rendered SVGs or PNG files for window configurations. Instead, it uses a proprietary CAD vector format (`CXFFILE`) that is rendered on-the-fly by an internal C++/Delphi graphics engine or the Cantor Web Service API.

Because we are building an independent Node.js/React configurator and want to avoid the heavy dependency and latency of hitting a proprietary Web Service for every dimension tweak, we have adopted a hybrid approach.

## Strategy: Hybrid Static Imagery + Dynamic React Overlays

Instead of generating raw SVGs from scratch, we will use a layered composition technique in React.

### 1. The Base Layer: Static Typology Graphics
We will utilize the high-resolution, static window and balcony types previously uploaded (e.g., F100, F200, UR, DK openings) as the base `background-image` or `<img />`.
- These images clearly show the profile, mullions, and opening line directions (the triangular lines).
- This ensures a high-quality, premium look without complex vector math.

### 2. The Dynamic Layer: CSS/SVG Overlays
We need to be able to adjust dimensions dynamically (e.g., when the user types `1200` into the width field, the measurement line on the graphic should reflect this). We will achieve this by absolutely positioning standard HTML/SVG elements over the base image.

**Implementation Concept:**
```tsx
<div className="relative w-full max-w-lg aspect-square border border-gray-300">
  {/* Base Image */}
  <img 
    src="/assets/typologies/F200_DK_DK.png" 
    alt="Double Sash Window"
    className="w-full h-full object-contain"
  />
  
  {/* Dynamic Width Dimension Line */}
  <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
    <div className="w-full border-b border-black relative mx-8">
      <div className="absolute top-1/2 left-0 w-2 h-2 border-l border-black -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-2 h-2 border-r border-black -translate-y-1/2"></div>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-bold">
        {dimensions.width} mm
      </span>
    </div>
  </div>

  {/* Dynamic Height Dimension Line */}
  <div className="absolute top-0 bottom-0 left-4 flex flex-col items-center justify-center">
    <div className="h-full border-l border-black relative my-8">
      <div className="absolute top-0 left-1/2 w-2 h-2 border-t border-black -translate-x-1/2"></div>
      <div className="absolute bottom-0 left-1/2 w-2 h-2 border-b border-black -translate-x-1/2"></div>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs font-bold -rotate-90">
        {dimensions.height} mm
      </span>
    </div>
  </div>
</div>
```

## Future Implementation Steps
When we are ready to implement this, we will:
1. Standardize the padding/margins of the static typology images so the physical window frame aligns predictably within the container.
2. Build a reusable `<WindowPreview dimensions={{width, height}} typology="F200" />` component.
3. Calculate percentage-based offsets for mullions (e.g., if a 2-sash window is selected, place a vertical dimension line showing `width / 2` for each sash).
4. Integrate this preview component into the left-hand visualizer panel of the configurator UI.
