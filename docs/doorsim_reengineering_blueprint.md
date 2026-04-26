# Engineering Mode: Drutex Door Configurator Re-engineering Blueprint

As a Senior Web Architect, I have analyzed the live structure of `https://wizualizator.drutex.pl/` and formulated the complete technical strategy required to clone, scrape, and re-assemble the door configurator experience.

---

## Phase 1: Architectural Deconstruction

### 1. Framework Analysis
- **Frontend Stack:** Vue 3 combined with Naive UI (identifiable via DOM classes like `n-button`, `n-radio`, `n-base-selection`).
- **Rendering Engine:** It does **not** use static SVG compositions or simple CSS-stacked `<img>` tags. Instead, it utilizes **Fabric.js** to draw elements directly onto a `<canvas>` element dynamically. The background environment (the house facade) is rendered as a standard `<img>` directly beneath the transparent canvas.
- **Backend Stack:** Spring Boot (Java).

### 2. The Configuration Logic Engine
- **Asset Origin:** All resources are localized under `/assets/`. 
- **State Logic Manifest:** The core configuration tree (handling incompatibilities, handles, and dimensions) is retrieved via an XHR call to the Spring Boot backend. However, direct access to `/assets/config.json` or standard API endpoints returns a `401 Unauthorized` without a valid session.
- **Intercepting the Manifest:** 
  1. Open Chrome DevTools > Network tab.
  2. Filter by `Fetch/XHR`.
  3. Reload the page and look for the first POST or GET request that returns a massive JSON tree. 
  4. Right-click the request -> `Copy` -> `Copy as cURL (bash)` or `Copy as Node.js fetch` to replicate the required headers (User-Agent, Cookies, CSRF tokens) locally.

---

## Phase 2: Asset Scraping & URL Pattern Mapping

Because the manifest requires session headers, we will use Playwright in Python to automate a real browser, bypass anti-bot protections, intercept the JSON manifest, and recursively download every permutation of the transparent door assets.

```python
import os
import json
import time
from playwright.sync_api import sync_playwright

BASE_URL = "https://wizualizator.drutex.pl"
OUTPUT_DIR = "./assets/scraped_doors/"

def intercept_assets():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False) # Headless=False bypasses basic bot checks
        page = browser.new_page(user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        # We will store the intercepted JSON logic here
        config_manifest = None

        def handle_response(response):
            nonlocal config_manifest
            # Identify the JSON configuration payload
            if "api/config" in response.url or response.headers.get("content-type", "").startswith("application/json"):
                if response.status == 200 and response.request.method == "GET":
                    try:
                        data = response.json()
                        if "models" in data or "doors" in data:
                            config_manifest = data
                            print("✅ Intercepted Configuration Manifest!")
                    except Exception:
                        pass

            # Identify image assets loaded by Fabric.js
            if response.url.endswith(".png") and "/assets/img" in response.url:
                os.makedirs(os.path.dirname(OUTPUT_DIR + response.url.split(BASE_URL)[-1]), exist_ok=True)
                with open(OUTPUT_DIR + response.url.split(BASE_URL)[-1], "wb") as f:
                    f.write(response.body())
                    print(f"⬇️ Downloaded: {response.url.split('/')[-1]}")

        # Attach the network listener
        page.on("response", handle_response)
        
        print(f"Navigating to {BASE_URL}...")
        page.goto(BASE_URL, wait_until="networkidle")
        
        # Simulate user interaction to force lazy-loaded assets to download
        # E.g. Click through all color options, all handles, all models
        # page.click(".n-base-selection") -> Loop through UI
        
        time.sleep(10) # Wait for initial batch
        browser.close()

if __name__ == "__main__":
    intercept_assets()
```

---

## Phase 3: Extracting the Sidebar and UI/UX

To replicate the Sidebar 1:1 using React and Tailwind CSS, we need a responsive `ConfiguratorContainer`. Active states use precise gold/blue hex codes.

```tsx
import React from 'react';

const ConfiguratorSidebar = () => {
  const activeColorHex = "#1a1a1a"; // Active state gray
  const highlightHex = "#eab676"; // Mammut Gold highlight
  
  return (
    <div className="w-full lg:w-96 bg-white border-l border-gray-200 h-full overflow-y-auto shadow-2xl flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-2xl font-black uppercase text-black">Configuration</h2>
        <p className="text-gray-500 text-sm mt-1">Select your door specifications</p>
      </div>

      {/* Option Group Example: Material */}
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">1. Material System</h3>
        <div className="grid grid-cols-2 gap-3">
           <button className="flex flex-col items-center justify-center p-4 border-2 border-mammut-gold bg-gray-50 rounded-lg transition-all hover:shadow-md">
             <span className="font-bold text-sm text-black">Aluminium</span>
           </button>
           <button className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg transition-all hover:border-gray-400">
             <span className="font-bold text-sm text-gray-500">PVC</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export const ConfiguratorContainer = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full h-screen bg-gray-100">
      {/* Left: Canvas Preview Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 lg:p-10">
        <div className="w-full max-w-4xl aspect-[3/4] bg-white rounded-2xl shadow-xl overflow-hidden relative">
           {/* Canvas Component Goes Here */}
           <div className="absolute inset-0 bg-[url('/assets/room-bg.jpg')] bg-cover bg-center opacity-50" />
        </div>
      </div>
      
      {/* Right: Sidebar */}
      <ConfiguratorSidebar />
    </div>
  );
};
```

---

## Phase 4: Re-building the Logic Engine (Zustand)

The "Brain" of the application requires a robust state manager that intercepts incompatible choices (e.g., you cannot put a specific INOX handle on a basic PVC door without a structural conflict).

```typescript
import { create } from 'zustand';

interface DoorState {
  system: 'alu' | 'pvc' | 'wood';
  modelId: string;
  frameColor: string;
  leafColor: string;
  handleId: string;
  glassType: string;
  
  // Actions
  setSystem: (sys: 'alu' | 'pvc' | 'wood') => void;
  setModel: (modelId: string) => void;
  setColor: (part: 'frame' | 'leaf', colorId: string) => void;
  setHandle: (handleId: string) => void;
}

export const useDoorConfigurator = create<DoorState>((set, get) => ({
  system: 'alu',
  modelId: 'MB-86N',
  frameColor: 'RAL7016',
  leafColor: 'RAL7016',
  handleId: 'Q10',
  glassType: 'clear',

  setSystem: (sys) => {
    // If we switch to PVC, we might need to reset incompatible handles
    set({ system: sys, modelId: sys === 'pvc' ? 'IGLO-Energy' : 'MB-86N' });
  },
  
  setModel: (modelId) => set({ modelId }),
  
  setColor: (part, colorId) => {
    if (part === 'frame') set({ frameColor: colorId });
    if (part === 'leaf') set({ leafColor: colorId });
  },

  setHandle: (handleId) => {
    const { system } = get();
    // Hardware Compatibility Rule Engine
    if (system === 'pvc' && handleId.startsWith('P45')) {
      console.warn("Handle P45 is incompatible with PVC systems. Reverting to QA45.");
      set({ handleId: 'QA45' });
    } else {
      set({ handleId });
    }
  }
}));

// Asset URL Generator Utility
export const generateAssetURLs = (state: DoorState) => {
  const base = '/assets/scraped_doors';
  return {
    frame: `${base}/frames/${state.system}_${state.modelId}_${state.frameColor}.png`,
    leaf: `${base}/leaves/${state.system}_${state.modelId}_${state.leafColor}.png`,
    glass: `${base}/glass/${state.modelId}_${state.glassType}.png`,
    handle: `${base}/handles/${state.handleId}.png`
  };
};
```

---

## Phase 5: The "100% Replication" Assembly (Fabric.js & Framer Motion)

By stacking transparent PNGs sequentially onto a Fabric.js `<canvas>`, we achieve the exact rendering engine logic used by Drutex. We wrap it in Framer Motion to handle opacity transitions during loading states.

```tsx
import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import { motion, AnimatePresence } from 'framer-motion';
import { useDoorConfigurator, generateAssetURLs } from './store';

export const DoorCanvasRenderer = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  
  const state = useDoorConfigurator();
  const urls = generateAssetURLs(state);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 1200,
      selection: false // Disable dragging layers
    });
    setFabricCanvas(canvas);
    
    return () => { canvas.dispose(); };
  }, []);

  // Render Layers sequentially
  useEffect(() => {
    if (!fabricCanvas) return;
    
    const renderLayers = async () => {
      setIsRendering(true);
      fabricCanvas.clear();
      
      const loadLayer = (url: string, zIndex: number): Promise<fabric.Image> => {
        return new Promise((resolve) => {
          fabric.Image.fromURL(url, (img) => {
            img.set({ selectable: false, evented: false });
            resolve(img);
          });
        });
      };

      try {
        // Load in strict Z-Index order: Frame -> Glass -> Leaf -> Handle
        const layers = await Promise.all([
          loadLayer(urls.frame, 1),
          loadLayer(urls.glass, 2),
          loadLayer(urls.leaf, 3),
          loadLayer(urls.handle, 4)
        ]);

        layers.forEach(layer => fabricCanvas.add(layer));
        fabricCanvas.renderAll();
      } catch (err) {
        console.error("Failed to load asset layers", err);
      } finally {
        setIsRendering(false);
      }
    };

    renderLayers();
  }, [urls.frame, urls.leaf, urls.glass, urls.handle, fabricCanvas]);

  return (
    <div className="relative w-full h-full flex justify-center items-center">
      {/* Loading Overlay Transition */}
      <AnimatePresence>
        {isRendering && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-sm"
          >
            <div className="w-8 h-8 border-4 border-mammut-gold border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
      
      <canvas ref={canvasRef} className="shadow-2xl rounded" />
    </div>
  );
};
```
