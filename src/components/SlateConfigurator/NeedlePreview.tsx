import React, { useEffect, useRef } from 'react';
import type { ConfiguratorState } from './types';
import * as THREE from 'three';
import '@needle-tools/engine'; // Ensure needle-engine WebComponent is registered


interface NeedlePreviewProps {
  state: ConfiguratorState;
}

export const NeedlePreview: React.FC<NeedlePreviewProps> = ({ state }) => {
  const engineRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Whenever the ConfiguratorState changes, we dispatch an event to the needle engine
    // so scripts inside the Unity/Blender WebXR project can react to it.
    if (engineRef.current) {
      engineRef.current.dispatchEvent(new CustomEvent('config-updated', { 
        detail: state,
        bubbles: true 
      }));
    }
  }, [state]);

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

    const runSetup = (ctx: any) => {
      if (!ctx) return;

      if (ctx.renderer) {
        ctx.renderer.setClearColor(0xffffff, 1);
        ctx.renderer.shadowMap.enabled = true;
        ctx.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        ctx.renderer.shadowMap.needsUpdate = true;
      }

      enforceWhiteBg(ctx);

      if (ctx.scene) {
        // Traverse to enable shadows
        let hasDirectionalLight = false;
        ctx.scene.traverse((child: any) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (child.isLight) {
            child.castShadow = true;
            if (child.shadow) {
              child.shadow.mapSize.width = 2048;
              child.shadow.mapSize.height = 2048;
              child.shadow.bias = -0.0005;
              child.shadow.camera.near = 0.5;
              child.shadow.camera.far = 15;
              if (child.isDirectionalLight) {
                hasDirectionalLight = true;
                child.shadow.camera.left = -3;
                child.shadow.camera.right = 3;
                child.shadow.camera.top = 3;
                child.shadow.camera.bottom = -3;
              }
            }
          }
        });

        // Add a default casting light if none present to guarantee shadows
        if (!hasDirectionalLight) {
          const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
          dirLight.position.set(3, 4, 3);
          dirLight.castShadow = true;
          dirLight.shadow.mapSize.width = 2048;
          dirLight.shadow.mapSize.height = 2048;
          dirLight.shadow.camera.near = 0.5;
          dirLight.shadow.camera.far = 15;
          dirLight.shadow.camera.left = -3;
          dirLight.shadow.camera.right = 3;
          dirLight.shadow.camera.top = 3;
          dirLight.shadow.camera.bottom = -3;
          dirLight.shadow.bias = -0.0005;
          ctx.scene.add(dirLight);
        }

        // Check if ground exists, if not add a shadow plane
        let hasGround = false;
        ctx.scene.traverse((child: any) => {
          if (child.isMesh && child.name && (
            child.name.toLowerCase().includes('ground') || 
            child.name.toLowerCase().includes('floor') || 
            child.name.toLowerCase().includes('plane')
          )) {
            hasGround = true;
          }
        });

        if (!hasGround) {
          const geometry = new THREE.PlaneGeometry(100, 100);
          const material = new THREE.ShadowMaterial({ opacity: 0.15 });
          const floor = new THREE.Mesh(geometry, material);
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = 0; // bottom of the window
          floor.receiveShadow = true;
          ctx.scene.add(floor);
        }
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

    // Periodic check instead of every frame
    const tick = () => {
      if (!active) return;
      const ctx = (engine as any).context;
      if (ctx) {
        enforceWhiteBg(ctx);
      }
      cleanNeedleUIAndBackground();
    };
    const interval = setInterval(tick, 1000);

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
      clearInterval(interval);
      engine.removeEventListener('ready', onReady);
      engine.removeEventListener('load', onReady);
    };
  }, []);

  return (
    <div className="w-full h-full relative bg-white">
      {/* 
        This is the actual Needle Engine container.
        We point it to the .glb web project that should be generated via Unity/Blender.
      */}
      {React.createElement('needle-engine', {
        ref: engineRef,
        src: '/models/window-scene.glb',
        style: { width: '100%', height: '100%', display: 'block', backgroundColor: '#ffffff' },
        'background-color': '#ffffff',
        'loading-background': '#ffffff'
      })}
    </div>
  );
};
