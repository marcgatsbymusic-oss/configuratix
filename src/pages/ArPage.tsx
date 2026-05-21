import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '@needle-tools/engine';

/**
 * Full-screen Needle Engine AR page for Android.
 *
 * Why this exists:
 *  - model-viewer's WebXR triggers Chromium 147+ XRProjectionLayer regression → jitter, no model
 *  - blob: URLs can't be fetched by native Scene Viewer app
 *  - This page runs inside the Vite bundle, so `@needle-tools/engine` resolves correctly
 *  - Needle Engine manages its own XR session lifecycle (uses XRWebGLLayer, not XRProjectionLayer)
 *    which avoids the Chromium regression entirely
 */
export function ArPage() {
  const engineRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const onReady = async (e: Event) => {
      try {
        const { WebXR, Context } = await import('@needle-tools/engine');
        const ctx = (e as CustomEvent).detail?.context ?? (Context as any).Current;
        if (ctx?.scene) {
          const xr = ctx.scene.addComponent(WebXR);
          if (xr) {
            xr.createARButton = true;
            xr.createVRButton = false;
            console.log('[ArPage] WebXR component injected — AR button should appear');
          }
        }
      } catch (err) {
        console.warn('[ArPage] Could not inject WebXR component:', err);
        // Needle Engine may still expose AR button via its built-in UI
      }
    };

    engine.addEventListener('ready', onReady);
    return () => engine.removeEventListener('ready', onReady);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0a0a0b', display: 'flex', flexDirection: 'column', zIndex: 9999 }}>
      {/* Header */}
      <div style={{
        background: 'rgba(10,10,11,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '0 16px',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 100,
      }}>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#eab676', fontFamily: 'sans-serif' }}>
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
          style: { width: '100%', height: '100%', display: 'block' },
          'camera-position': '0 0.9 2.5',
          'camera-target': '0 0.6 0',
        })}
      </div>

      {/* Hint */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        color: 'rgba(255,255,255,0.45)',
        fontSize: 11,
        textAlign: 'center',
        pointerEvents: 'none',
        fontFamily: 'sans-serif',
        whiteSpace: 'nowrap',
      }}>
        Tap "Enter AR" to place the window
      </div>
    </div>
  );
}
