# Drutex Door Simulator Architecture & Configuration

This document serves as the master reference for replicating the Drutex Door Visualizer (https://wizualizator.drutex.pl/) within the Mammut portal at `/doorsim`.

## 1. Architectural Strategy
The original visualizer is a Vue 3 Single Page Application that utilizes **Fabric.js** (an HTML5 canvas library) to composite doors dynamically. Instead of pre-rendering millions of permutations, the visualizer overlays transparent PNG components onto a canvas.

Our implementation will replicate this using:
- **React (Vite)** for the UI and state management.
- **Fabric.js** (or native Canvas API) for the rendering engine.
- A **layered rendering pipeline** that stacks the background, frame, leaf (wing), glass/infill, handles, and accessories based on user selections.

## 2. Configuration Schema & Options

### 2.1 Door Systems (Material)
- **ALUMINIUM**: MB-86N SI, MB-79N SI+, MB-104 Passive, etc.
- **ArtLine**: Specialized hidden-frame systems.
- **PVC**: IGLO Energy, IGLO 5.
- **DREWNO (Wood)**: Softline 68, Softline 78, Softline 88.

### 2.2 Design Patterns (Wzory Wypełnień)
The core visual character of the door.
- **Inox Series**: Alaska, Arizona, California, Colorado, Florida, Hawaii, Montana, Nebraska, New Jersey, Ohio, Pennsylvania, Texas.
- **DX Series**: DX 01 through DX 36 (geometric and modern overlays).
- **Wood/Classic Series**: Montana Wood, Texas Wood, Washington (Pocket, Zero, Wood), Straight Line 1-6.

### 2.3 Colors & Finishes
Colors can be applied independently to the **Frame (Rama)** and the **Wing/Leaf (Skrzydło)**.
- **Default**: RAL-7016 (Anthracite grey).
- **Options**: The standard palette mapped from `productDetails.ts` (Wood effects, Solids, Metallic).

### 2.4 Glazing & Spacers
- **Glass Types**: Clear, Antisol (Brown, Blue, Gray, Green), Frosted (Folia Matowa), Ornaments (Chinchilla, Delta, Master Carre, Silvit).
- **Spacers**: Swisspacer Ultimate (Gray, Black, Brown).

### 2.5 Hardware / Handles (Pochwyty)
- **Pull Handles**: P45, P10D, Q10, QA45, KA1.
- **Finishes**: Standard INOX, Frappuccino, Maraqina, Black, Silver, Gold.

### 2.6 Dimensions & Add-ons
- **Base Size**: Default 107 cm width x 220 cm height.
- **Side/Top Lights (Doświetla)**: Modular extensions (Top, Left, Right).

## 3. Rendering Layers (Z-Index Hierarchy)
To achieve the exact same visual composite, the canvas must stack images in this order (bottom to top):
1. Background Scene (House facade or uploaded image)
2. Shadow/Ambient Occlusion layer (optional for realism)
3. Frame (colored dynamically)
4. Sidelights / Toplights (if configured)
5. Glass / Infill panels
6. Door Leaf / Wing (colored dynamically)
7. Decorative Inox/DX appliqués
8. Handles and Locks

## 4. Asset Acquisition Strategy
To fully power this visualizer, we will need to execute a scraping script against `wizualizator.drutex.pl` to extract the transparent PNGs for all handles, frames, and patterns. 
*Pending: A Node.js Puppeteer script to intercept the visualizer's API calls and automatically download the asset library.*
