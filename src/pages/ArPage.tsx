import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import '@needle-tools/engine';

/**
 * Full-screen Needle Engine AR page for Android.
 */
export function ArPage() {
  const engineRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    let active = true;

    const enforceWhiteBg = (ctx: any) => {
      if (!ctx) return;
      if (ctx.renderer) {
        ctx.renderer.setClearColor(0xffffff, 1);
      }
      if (ctx.scene) {
        const whiteColor = new THREE.Color(0xffffff);
        if (ctx.scene.background !== whiteColor) {
          try {
            ctx.scene.background = whiteColor;
          } catch (e) {
            ctx.scene.background = whiteColor;
          }
        }
        ctx.scene.traverse((child: any) => {
          if (child.name && (
            child.name.toLowerCase().includes('sky') || 
            child.name.toLowerCase().includes('dome') || 
            child.name.toLowerCase().includes('skybox') || 
            child.name.toLowerCase().includes('environment') || 
            child.name.toLowerCase().includes('backdrop') || 
            child.name.toLowerCase().includes('background') || 
            child.name.toLowerCase().includes('scenery') || 
            child.name.toLowerCase().includes('studio')
          )) {
            if (child.visible) {
              child.visible = false;
            }
          }
        });
      }
    };

    const runSetup = async (ctx: any) => {
      try {
        const { WebXR, WebARSessionRoot } = await import('@needle-tools/engine');
        if (!active) return;

        // Override the WebARSessionRoot prototype to support wall and floor placement
        if (WebARSessionRoot) {
          (WebARSessionRoot.prototype as any).applyViewBasedTransform = function (reticle: any) {
            if (!reticle) return;
            const camera = this.context.mainCamera;
            if (!camera) return;

            const camPos = new THREE.Vector3();
            camera.getWorldPosition(camPos);

            const reticlePos = new THREE.Vector3();
            reticle.getWorldPosition(reticlePos);

            // Get surface normal from the reticle's quaternion (where Y+ is normal)
            const normal = new THREE.Vector3(0, 1, 0).applyQuaternion(reticle.quaternion).normalize();
            const isHorizontal = Math.abs(normal.y) > 0.7;

            if (isHorizontal) {
              // Floor: face camera, lock Y upright
              const dirToCam = new THREE.Vector3().subVectors(camPos, reticlePos);
              dirToCam.y = 0;
              dirToCam.normalize();
              if (dirToCam.lengthSq() === 0) {
                dirToCam.set(0, 0, 1);
              }
              const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), dirToCam, new THREE.Vector3(0, 1, 0));
              reticle.quaternion.setFromRotationMatrix(m);
            } else {
              // Wall: align flush to the wall, lock Y upright
              const wallNormal = normal.clone();
              wallNormal.y = 0;
              wallNormal.normalize();
              if (wallNormal.lengthSq() === 0) {
                wallNormal.set(0, 0, 1);
              }
              const m = new THREE.Matrix4().lookAt(new THREE.Vector3(0, 0, 0), wallNormal, new THREE.Vector3(0, 1, 0));
              reticle.quaternion.setFromRotationMatrix(m);
            }
          };
        }

        enforceWhiteBg(ctx);

        const xr = ctx.scene?.getComponent(WebXR) || ctx.scene?.addComponent(WebXR);
        if (xr) {
          xr.createARButton = false;
          xr.createVRButton = false;
          console.log('[ArPage] WebXR component injected (button hidden)');
        }
      } catch (err) {
        console.warn('[ArPage] Could not inject WebXR component:', err);
      }
    };

    const cleanNeedleUIAndBackground = () => {
      // 1. Force attributes on needle-engine DOM nodes (bypasses React attribute-binding issues)
      const engines = document.querySelectorAll('needle-engine');
      engines.forEach((eng: any) => {
        if (eng.getAttribute('background-color') !== '#ffffff') {
          eng.setAttribute('background-color', '#ffffff');
        }
        if (eng.getAttribute('loading-background') !== '#ffffff') {
          eng.setAttribute('loading-background', '#ffffff');
        }
      });

      // 2. Helper to check if text or element matches our targets (inside/outside view, tap hints, etc.)
      const isTargetElement = (el: HTMLElement) => {
        // Skip structural elements
        const tagName = el.tagName.toLowerCase();
        if (['body', 'html', 'main', 'section', 'article', 'form'].includes(tagName) || el.id === 'root') {
          return false;
        }

        // Never hide our custom buttons or widgets
        if (el.id === 'mammut-start-ar' || el.className?.includes?.('bg-mammut-gold') || el.closest?.('#mammut-start-ar')) {
          return false;
        }

        // Only target leaves or actual buttons/links
        const isInteractive = tagName === 'button' || tagName === 'a' || el.getAttribute('role') === 'button' || el.className?.includes?.('btn');
        const isLeaf = el.children.length === 0;

        if (!isLeaf && !isInteractive) {
          return false;
        }

        const text = el.textContent?.trim().toLowerCase() || '';
        if (!text) return false;
        
        // Match exact text for inside/outside buttons
        const matchesInsideOutside = ['inside', 'outside', 'interior', 'exterior', 'innen', 'außen'].includes(text);
        if (matchesInsideOutside) return true;

        // Match hint text or instructions containing "tap" or "start ar" or "place the window"
        const matchesHint = text.includes('tap') || text.includes('start ar') || text.includes('place the window') || text.includes('place window');
        if (matchesHint) return true;

        if (isInteractive) {
          return ['inside', 'outside', 'interior', 'exterior', 'innen', 'außen'].some(word => 
            text === word || text.includes(' ' + word) || text.includes(word + ' ')
          );
        }

        return false;
      };

      // 3. Recursive DOM and Shadow DOM cleaner
      const recurse = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          const tagName = el.tagName.toLowerCase();

          // Skip core structural wrappers
          if (tagName === 'body' || tagName === 'html' || el.id === 'root') {
            node.childNodes.forEach(child => recurse(child));
            return;
          }

          if (isTargetElement(el)) {
            el.style.setProperty('display', 'none', 'important');
            return;
          }

          // Check ID or class names for inside/outside
          const id = el.getAttribute('id')?.toLowerCase() || '';
          const className = typeof el.className === 'string' ? el.className.toLowerCase() : '';
          if (id.includes('inside') || id.includes('outside') || className.includes('inside') || className.includes('outside')) {
            el.style.setProperty('display', 'none', 'important');
          }

          // Recurse into shadow DOM
          if (el.shadowRoot) {
            // Inject white styling sheet if not present
            if (!el.shadowRoot.querySelector('#mammut-needle-styles')) {
              const style = document.createElement('style');
              style.id = 'mammut-needle-styles';
              style.textContent = `
                :host, .loading, #loading, [part="canvas"], canvas {
                  background-color: #ffffff !important;
                  background: #ffffff !important;
                }
                div, section, main, article {
                  background-color: transparent !important;
                }
              `;
              el.shadowRoot.appendChild(style);
            }
            recurse(el.shadowRoot);
          }
        }
        node.childNodes.forEach(child => recurse(child));
      };

      recurse(document.body);
    };

    // Continuous tick loop
    const tick = () => {
      if (!active) return;
      const ctx = (engine as any).context;
      if (ctx) {
        enforceWhiteBg(ctx);
      }
      cleanNeedleUIAndBackground();
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    // Call setup immediately if context exists
    const existingCtx = (engine as any).context;
    if (existingCtx) {
      runSetup(existingCtx);
    }

    const onReady = (e: Event) => {
      const ctx = (e as CustomEvent).detail?.context;
      if (ctx) {
        runSetup(ctx);
      }
    };

    engine.addEventListener('ready', onReady);
    engine.addEventListener('load', onReady);

    return () => {
      active = false;
      engine.removeEventListener('ready', onReady);
      engine.removeEventListener('load', onReady);
    };
  }, []);

  const startNeedleAR = async () => {
    try {
      const { WebXR, Context } = await import('@needle-tools/engine');
      const ctx = (Context as any).Current;
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
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#ffffff', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        padding: '0 16px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 100,
      }}>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#c88a3e', fontFamily: 'sans-serif' }}>
          AR Preview
        </span>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            fontFamily: 'sans-serif',
          }}
        >
          ← Back
        </button>
      </div>

      {/* Needle Engine full screen */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {React.createElement('needle-engine', {
          ref: engineRef,
          src: '/models/window-scene.glb',
          style: { width: '100%', height: '100%', display: 'block', backgroundColor: '#ffffff' },
          'camera-position': '0 0.9 2.5',
          'camera-target': '0 0.6 0',
          'background-color': '#ffffff',
          'loading-background': '#ffffff'
        })}
      </div>

      {/* Control overlay */}
      <button
        id="mammut-start-ar"
        onClick={startNeedleAR}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 110,
          padding: '12px 32px',
          backgroundColor: '#c88a3e',
          color: '#000000',
          borderRadius: '999px',
          fontWeight: 900,
          border: 'none',
          boxShadow: '0 10px 25px rgba(200, 138, 62, 0.4)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          fontSize: '13px',
          cursor: 'pointer',
          fontFamily: 'sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ width: '16px', height: '16px' }}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
        Start AR
      </button>

      {/* Hint removed */}
    </div>
  );
}
