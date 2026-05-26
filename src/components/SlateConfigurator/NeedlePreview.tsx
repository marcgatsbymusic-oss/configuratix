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

    const onReady = (e: Event) => {
      const ctx = (e as CustomEvent).detail?.context;
      if (ctx) {
        // Set WebGLRenderer to support shadows and white background
        if (ctx.renderer) {
          ctx.renderer.setClearColor(0xffffff, 1);
          ctx.renderer.shadowMap.enabled = true;
          ctx.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          ctx.renderer.shadowMap.needsUpdate = true;
        }

        if (ctx.scene) {
          // Force scene background to always be white
          const whiteColor = new THREE.Color(0xffffff);
          try {
            Object.defineProperty(ctx.scene, 'background', {
              get: () => whiteColor,
              set: () => {},
              configurable: true
            });
          } catch (e) {
            ctx.scene.background = whiteColor;
          }

          // Traverse to enable shadows and hide skybox/backdrop meshes
          let hasDirectionalLight = false;
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
      }
    };

    engine.addEventListener('ready', onReady);
    return () => engine.removeEventListener('ready', onReady);
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
        style: { width: '100%', height: '100%', display: 'block' }
      })}
    </div>
  );
};
