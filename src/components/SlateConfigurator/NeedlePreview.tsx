import React, { useEffect, useRef } from 'react';
import type { ConfiguratorState } from './types';
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

  return (
    <div className="w-full h-full relative bg-[#111112]">
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
