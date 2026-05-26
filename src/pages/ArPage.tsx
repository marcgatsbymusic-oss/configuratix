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

    const onReady = async (e: Event) => {
      try {
        const { WebXR, Context, WebARSessionRoot } = await import('@needle-tools/engine');
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

        const ctx = (e as CustomEvent).detail?.context ?? (Context as any).Current;
        if (ctx) {
          // Set clear color and background color to white
          if (ctx.renderer) {
            ctx.renderer.setClearColor(0xffffff, 1);
          }
          if (ctx.scene) {
            const whiteColor = new THREE.Color(0xffffff);
            try {
              Object.defineProperty(ctx.scene, 'background', {
                get: () => whiteColor,
                set: () => {},
                configurable: true
              });
            } catch (err) {
              ctx.scene.background = whiteColor;
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
                child.visible = false;
              }
            });
          }
          const xr = ctx.scene.getComponent(WebXR) || ctx.scene.addComponent(WebXR);
          if (xr) {
            xr.createARButton = false;
            xr.createVRButton = false;
            console.log('[ArPage] WebXR component injected (button hidden)');
          }
        }
      } catch (err) {
        console.warn('[ArPage] Could not inject WebXR component:', err);
      }
    };

    engine.addEventListener('ready', onReady);
    return () => {
      active = false;
      engine.removeEventListener('ready', onReady);
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
        })}
      </div>

      {/* Control overlay */}
      <button
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

      {/* Hint */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        color: '#666666',
        fontSize: 10,
        textAlign: 'center',
        pointerEvents: 'none',
        fontFamily: 'sans-serif',
        whiteSpace: 'nowrap',
        backgroundColor: 'rgba(0,0,0,0.05)',
        padding: '6px 12px',
        borderRadius: '999px',
        border: '1px solid rgba(0,0,0,0.08)',
        zIndex: 110,
      }}>
        Tap "Start AR" to place the window
      </div>
    </div>
  );
}
