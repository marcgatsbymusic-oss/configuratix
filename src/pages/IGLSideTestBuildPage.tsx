import React, { useState, useEffect, useRef } from 'react';
import { IGLSideTestBuildViewer } from '../components/configurator/IGLSideTestBuildViewer';
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { getAnimationClipsForTypology } from '../utils/arStorage';
import { ColorPaletteOverlay } from '../components/configurator/ColorPaletteOverlay';

export const IGLSideTestBuildPage: React.FC = () => {
  const [width, setWidth] = useState(2200);
  const [height, setHeight] = useState(2100);

  // Quick testing colors
  const colors = [
    { label: 'White / White', ext: '#ffffff', int: '#ffffff' },
    { label: 'White (Catalog) / White (Catalog)', ext: '#f0ece6', int: '#f0ece6' },
    { label: 'Anthracite / White', ext: '#2d2d2d', int: '#f0ece6' },
    { label: 'Golden Oak', ext: '#8B5E2E', int: '#c4955a' },
    { label: 'Black / Black', ext: '#151515', int: '#151515' },
  ];
  
  const [colorExt, setColorExt] = useState('#ffffff');
  const [colorInt, setColorInt] = useState('#ffffff');
  const [colorExtTexture, setColorExtTexture] = useState<string | undefined>(undefined);
  const [colorIntTexture, setColorIntTexture] = useState<string | undefined>(undefined);

  // Roller blind colors
  const blindColors = [
    { label: 'White', hex: '#ffffff' },
    { label: 'Anthracite', hex: '#383e42' },
    { label: 'Gray', hex: '#8a939e' },
    { label: 'Golden Oak', hex: '#a67c45' },
    { label: 'Dark Oak', hex: '#5c4021' },
    { label: 'Deep Black', hex: '#111111' },
  ];
  const [blindColorIdx, setBlindColorIdx] = useState(0); // default White
  const activeBlindColor = blindColors[blindColorIdx];

  const [blindOpenLeft, setBlindOpenLeft] = useState(0.0);
  const [blindOpenRight, setBlindOpenRight] = useState(0.0);
  const [mosquitoOpenRight, setMosquitoOpenRight] = useState(0.0);
  const [invertSides, setInvertSides] = useState(false);

  const [displayMode, setDisplayMode] = useState<'3D' | 'Needle'>('3D');
  const [sceneGroup, setSceneGroup] = useState<THREE.Group | null>(null);
  const [needleModelUrl, setNeedleModelUrl] = useState<string | null>(null);
  const [needleEngineNode, setNeedleEngineNode] = useState<HTMLElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pendingARLaunch, setPendingARLaunch] = useState(false);

  useEffect(() => {
    if (!sceneGroup) return;

    let active = true;
    const timer = setTimeout(() => {
      const clips = getAnimationClipsForTypology('IGLSIDE_TEST_BUILD');
      const exporter = new GLTFExporter();
      exporter.parse(
        sceneGroup,
        (gltf: any) => {
          if (!active) return;
          const blob = new Blob([gltf as ArrayBuffer], { type: 'model/gltf-binary' });
          const url = URL.createObjectURL(blob);
          setNeedleModelUrl(url);
        },
        (err: any) => {
          console.error('[Needle Export] GLTF Export Error:', err);
        },
        { binary: true, animations: clips }
      );
    }, 300);

    return () => {
      active = false;
      clearTimeout(timer);
      setNeedleModelUrl(prev => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [
    sceneGroup,
    width,
    height,
    colorExt,
    colorInt,
    colorExtTexture,
    colorIntTexture,
    blindColorIdx,
    invertSides,
    displayMode
  ]);

  useEffect(() => {
    if (pendingARLaunch && needleModelUrl) {
      setPendingARLaunch(false);
      startNeedleAR();
    }
  }, [needleModelUrl, pendingARLaunch]);

  useEffect(() => {
    const engine = needleEngineNode;
    if (!engine) return;

    let active = true;

    const enforceDarkBg = (ctx: any) => {
      if (!ctx) return;
      ctx.renderer.setClearColor(new THREE.Color('#09090f'), 1);
      
      // Programmatically add lighting to the Needle Engine scene so the object is white/bright
      if (ctx.scene) {
        if (!ctx.scene.getObjectByName('needle-light-setup')) {
          const lightGroup = new THREE.Group();
          lightGroup.name = 'needle-light-setup';

          const ambientLight = new THREE.AmbientLight('#ffffff', 2.0);
          lightGroup.add(ambientLight);

          const dirLight1 = new THREE.DirectionalLight('#ffffff', 3.5);
          dirLight1.position.set(5, 10, 5);
          lightGroup.add(dirLight1);

          const dirLight2 = new THREE.DirectionalLight('#38bdf8', 1.5);
          dirLight2.position.set(-5, 5, -5);
          lightGroup.add(dirLight2);

          ctx.scene.add(lightGroup);
        }
      }
    };

    const run = async () => {
      try {
        const { Context } = await import('@needle-tools/engine');
        const ctx = (engine as any).context || Context.Current;
        if (ctx) {
          enforceDarkBg(ctx);
          ctx.addEventListener('context-loaded', () => {
            if (active) enforceDarkBg(ctx);
          });
        }
      } catch (err) {
        console.warn('[Needle Inline] Could not configure background:', err);
      }
    };
    run();

    return () => {
      active = false;
    };
  }, [needleEngineNode]);

  const startNeedleAR = async () => {
    try {
      const { WebXR, Context } = await import('@needle-tools/engine');
      const ctx = (needleEngineNode as any)?.context || Context.Current;
      if (ctx) {
        const xr = ctx.scene?.getComponent(WebXR);
        if (xr) {
          await xr.enterAR();
        } else {
          const newXr = ctx.scene?.addComponent(WebXR);
          if (newXr) {
            newXr.createARButton = false;
            newXr.createVRButton = false;
            await newXr.enterAR();
          } else {
            throw new Error("Could not find or add WebXR component");
          }
        }
      } else {
        throw new Error("Needle Context is not active");
      }
    } catch (err) {
      console.error("Failed to start Needle AR:", err);
      alert("AR is not supported on this device/browser.");
      setPendingARLaunch(false);
    }
  };

  const handleStartARClick = () => {
    if (displayMode === 'Needle') {
      startNeedleAR();
    } else {
      setPendingARLaunch(true);
      setDisplayMode('Needle');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#09090f] overflow-hidden font-sans">
      {/* 3D Viewport - fills the complete screen */}
      <div className="absolute inset-0 w-full h-full z-0">
        <IGLSideTestBuildViewer
          width={width}
          height={height}
          colorExt={colorExt}
          colorInt={colorInt}
          colorExtTexture={colorExtTexture}
          colorIntTexture={colorIntTexture}
          colorBlind={activeBlindColor.hex}
          invertSides={invertSides}
          onDimensionChange={(w, h) => { setWidth(w); setHeight(h); }}
          activeLimits={{ minWidth: 1000, maxWidth: 3000, minHeight: 1000, maxHeight: 3000 }}
          blindOpenLeft={blindOpenLeft}
          blindOpenRight={blindOpenRight}
          mosquitoOpenRight={mosquitoOpenRight}
          onBlindOpenLeftChange={setBlindOpenLeft}
          onBlindOpenRightChange={setBlindOpenRight}
          onMosquitoOpenRightChange={setMosquitoOpenRight}
          isNeedleMode={displayMode === 'Needle'}
          needleEngineNode={needleEngineNode}
          onSceneReady={setSceneGroup}
        />

        {displayMode === 'Needle' && (
          /* Needle Engine sits in z-0 as a passive environment/AR backdrop.
             Pointer events are disabled so the R3F canvas (z-10) on top
             receives all orbit-control and hotspot interactions. */
          <div className="absolute inset-0 flex items-center justify-center bg-[#09090f] z-0 pointer-events-none">
            {needleModelUrl &&
              React.createElement('needle-engine', {
                ref: setNeedleEngineNode,
                src: needleModelUrl,
                style: {
                  width: '100%',
                  height: '100%',
                  display: 'block',
                  backgroundColor: '#09090f',
                  pointerEvents: 'none', // never steal events from R3F layer
                },
                'camera-position': '0 0.9 2.5',
                'camera-target': '0 0.6 0',
                'background-color': '#09090f',
                'loading-background': '#09090f'
              })
            }
          </div>
        )}
      </div>

      {/* Floating Start AR button / Loader Overlay (visible on both tabs) */}
      {!needleModelUrl ? (
        <div 
          className="absolute z-40 text-[#eab676] font-bold p-3 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-center animate-pulse font-sans text-xs md:text-sm whitespace-nowrap"
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Generating Needle 3D Model...
        </div>
      ) : (
        <button
          id="mammut-start-ar"
          onClick={handleStartARClick}
          onPointerDown={(e) => e.stopPropagation()}
          className="absolute z-40 px-6 py-2.5 bg-[#eab676] text-black rounded-full font-bold shadow-lg hover:bg-[#eab676]/90 transition-all flex items-center gap-2 text-xs md:text-sm active:scale-95 cursor-pointer uppercase tracking-wider font-sans border-none"
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'auto',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          Start AR
        </button>
      )}

      {/* Floating Control Menu in Top Right */}
      <div 
        className="absolute top-4 right-4 z-40 flex gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10 shadow-lg"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setDisplayMode('3D')}
          onPointerDown={(e) => e.stopPropagation()}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer border-none ${
            displayMode === '3D' 
              ? 'bg-[#eab676] text-black shadow' 
              : 'text-white/60 hover:text-white bg-transparent'
          }`}
        >
          3D Canvas
        </button>
        <button
          onClick={() => setDisplayMode('Needle')}
          onPointerDown={(e) => e.stopPropagation()}
          className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer border-none ${
            displayMode === 'Needle' 
              ? 'bg-[#eab676] text-black shadow' 
              : 'text-white/60 hover:text-white bg-transparent'
          }`}
        >
          Needle Engine
        </button>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onPointerDown={(e) => e.stopPropagation()}
          className="px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-lg bg-black/40 text-[#eab676] border border-[#eab676]/30 hover:bg-[#eab676]/10 transition-all cursor-pointer flex items-center gap-1.5"
        >
          {isSidebarOpen ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Close
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 12h9.75M10.5 18h9.75M3.75 6h.008v.008H3.75V6zm0 6h.008v.008H3.75V12zm0 6h.008v.008H3.75V18z" />
              </svg>
              Configure
            </>
          )}
        </button>
      </div>

      {/* Floating Color Palette Overlay widget in the bottom right corner */}
      <ColorPaletteOverlay
        colorExt={colorExt}
        colorInt={colorInt}
        onChangeExt={(col) => {
          setColorExt(col.hex);
          setColorExtTexture(col.image || undefined);
        }}
        onChangeInt={(col) => {
          setColorInt(col.hex);
          setColorIntTexture(col.image || undefined);
        }}
        className="absolute bottom-4 right-4 z-40"
      />

      {/* Control Sidebar overlay */}
      <div
        className="flex flex-col gap-6 p-6 overflow-y-auto h-full shadow-2xl transition-transform duration-300 ease-in-out z-50"
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: 290,
          background: 'rgba(8, 8, 15, 0.96)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676] mb-1">Sliding System</div>
            <div className="text-lg font-bold text-white tracking-tight">IGLSIDE_TEST_BUILD</div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            onPointerDown={(e) => e.stopPropagation()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/75 hover:text-white transition-colors cursor-pointer border-none flex items-center justify-center"
            title="Close sidebar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Dimension Controls */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676] mb-3">Frame Dimensions</div>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Width (W)', value: width, max: 3000, min: 1000, set: (v: number) => setWidth(v) },
              { label: 'Height (H)', value: height, max: 3000, min: 1000, set: (v: number) => setHeight(v) },
            ].map(({ label, value, min, max, set }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] text-white/50">
                  <span>{label}</span>
                  <span className="text-[#eab676] font-bold">{value} mm</span>
                </div>
                <input
                  type="range" 
                  min={min} 
                  max={max} 
                  step={10} 
                  value={value}
                  onChange={e => set(Number(e.target.value))}
                  className="w-full accent-[#eab676] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Color Presets */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676] mb-3">Color Scheme</div>
          <div className="flex flex-col gap-2">
            {colors.map((col, i) => {
              const isSelected = colorExt === col.ext && colorInt === col.int;
              return (
                <button
                  key={col.label}
                  onClick={() => {
                    setColorExt(col.ext);
                    setColorInt(col.int);
                    setColorExtTexture(undefined);
                    setColorIntTexture(undefined);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer hover:bg-white/5 w-full border-none"
                  style={{
                    background: isSelected ? 'rgba(234, 182, 118, 0.12)' : 'transparent',
                    border: `1px solid ${isSelected ? 'rgba(234, 182, 118, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
                  }}
                >
                  <div className="flex gap-0.5 shrink-0">
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20"
                      style={{ background: col.ext }}
                    />
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20 -ml-1"
                      style={{ background: col.int }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-white/70">{col.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Door Position / Invert Sides */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676] mb-3">Door Position</div>
          <button
            onClick={() => setInvertSides(!invertSides)}
            className="flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer hover:bg-white/5 w-full border-none"
            style={{
              background: invertSides ? 'rgba(234, 182, 118, 0.12)' : 'transparent',
              border: `1px solid ${invertSides ? 'rgba(234, 182, 118, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
            }}
          >
            <span className="text-xs font-semibold text-white/70">Invert Sides</span>
            <div 
              className="w-8 h-4 rounded-full p-0.5 transition-all duration-300"
              style={{
                background: invertSides ? '#eab676' : 'rgba(255,255,255,0.15)',
              }}
            >
              <div 
                className="w-3 h-3 rounded-full bg-[#09090f] transition-all duration-300"
                style={{
                  transform: invertSides ? 'translateX(16px)' : 'none',
                }}
              />
            </div>
          </button>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Blind Color Presets */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676] mb-3">Blind Color</div>
          <div className="flex flex-col gap-2 max-h-[140px] overflow-y-auto pr-1">
            {blindColors.map((col, i) => (
              <button
                key={col.label}
                onClick={() => setBlindColorIdx(i)}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer hover:bg-white/5 w-full border-none"
                style={{
                  background: blindColorIdx === i ? 'rgba(234, 182, 118, 0.12)' : 'transparent',
                  border: `1px solid ${blindColorIdx === i ? 'rgba(234, 182, 118, 0.35)' : 'rgba(255, 255, 255, 0.05)'}`,
                }}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/20"
                  style={{ background: col.hex }}
                />
                <span className="text-xs font-semibold text-white/70">{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Blinds & Mosquito Controls */}
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676] mb-3">Blinds & Mosquito</div>
          
          {/* Quick presets */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setBlindOpenLeft(1.0);
                setBlindOpenRight(1.0);
              }}
              className="flex-1 text-center py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white transition-all cursor-pointer border-none"
            >
              OPEN BLINDS
            </button>
            <button
              onClick={() => {
                setBlindOpenLeft(0.0);
                setBlindOpenRight(0.0);
              }}
              className="flex-1 text-center py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white transition-all cursor-pointer border-none"
            >
              CLOSE BLINDS
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {/* Left Blind Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-white/50">
                <span>Left Blind (Fixed)</span>
                <span className="text-[#eab676] font-bold">{Math.round(blindOpenLeft * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={blindOpenLeft}
                onChange={(e) => setBlindOpenLeft(parseFloat(e.target.value))}
                className="w-full accent-[#eab676] cursor-pointer"
              />
            </div>

            {/* Right Blind Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-white/50">
                <span>Right Blind (Sliding)</span>
                <span className="text-[#eab676] font-bold">{Math.round(blindOpenRight * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={blindOpenRight}
                onChange={(e) => setBlindOpenRight(parseFloat(e.target.value))}
                className="w-full accent-[#eab676] cursor-pointer"
              />
            </div>

            {/* Right Mosquito Net Slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[11px] text-white/50">
                <span>Right Mosquito Net</span>
                <span className="text-[#eab676] font-bold">{Math.round(mosquitoOpenRight * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={mosquitoOpenRight}
                onChange={(e) => setMosquitoOpenRight(parseFloat(e.target.value))}
                className="w-full accent-[#eab676] cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-white/5" />

        {/* Assembly Rules Explanation */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#eab676]">Assembly Specifications</div>
          <ul className="text-[10px] text-white/40 list-disc pl-4 flex flex-col gap-1.5 leading-relaxed">
            <li>Aluminium tracks are placed only on bottom, right, and top sides.</li>
            <li>Tracks start short of <span className="text-white/60">34.87 mm</span> from the left edge.</li>
            <li>45-degree mitre cuts align horizontal segments to the vertical segment at the right corners.</li>
          </ul>
        </div>

        {/* Footer info */}
        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div className="text-[9px] text-white/25 leading-relaxed">
            Profile contours generated from<br />
            IGLS_OPENING_DOOR_SECTION_AND_FRAME.json
          </div>
        </div>
      </div>
    </div>
  );
};
