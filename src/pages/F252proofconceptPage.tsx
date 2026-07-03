import React from 'react';
import { F252proofconcept } from '../components/configurator/F252proofconcept';

export function F252proofconceptPage() {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black flex flex-col relative">
      {/* Test Controls/UI overlay can go here if needed */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 p-4 rounded-xl text-white">
        <h1 className="text-xl font-bold">F252 Proof of Concept</h1>
        <p className="text-sm opacity-70">Tilt-and-turn top sash, fixed bottom, one transom.</p>
      </div>
      
      <div className="flex-1 w-full h-full">
        <F252proofconcept />
      </div>
    </div>
  );
}
