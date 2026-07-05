import * as THREE from 'three';

export function createSlatTextures() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Color map: gradient faking ambient occlusion at bottom of slat
  const colorGradient = ctx.createLinearGradient(0, 0, 0, size);
  colorGradient.addColorStop(0, '#ffffff');
  colorGradient.addColorStop(0.8, '#f5f5f5');
  colorGradient.addColorStop(1, '#a0a0a0'); // darker at the bottom lip
  ctx.fillStyle = colorGradient;
  ctx.fillRect(0, 0, size, size);
  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(0.01, 1/37); // slat pitch is ~37mm

  // Normal map: faking a slight outward ridge
  const normCanvas = document.createElement('canvas');
  normCanvas.width = size;
  normCanvas.height = size;
  const normCtx = normCanvas.getContext('2d')!;
  
  const imgData = normCtx.createImageData(size, size);
  const data = imgData.data;

  for (let y = 0; y < size; y++) {
    // Normal map vertical curve (-1 to 1)
    // Ridge in the middle pushes normal up/down
    let ny = Math.cos((y / size) * Math.PI * 2);
    // reduce intensity
    ny *= 0.5;
    
    // convert to RGB [0..255]
    const r = 128; // nx = 0
    const g = Math.min(255, Math.max(0, Math.floor((ny * 0.5 + 0.5) * 255)));
    const b = 255; // nz ~ 1.0

    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = 255;
    }
  }
  
  normCtx.putImageData(imgData, 0, 0);
  const normalMap = new THREE.CanvasTexture(normCanvas);
  normalMap.wrapS = THREE.RepeatWrapping;
  normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(0.01, 1/37);

  return { colorMap, normalMap };
}
