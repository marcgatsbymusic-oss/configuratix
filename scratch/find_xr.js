import fs from 'fs';
import path from 'path';

const file = 'node_modules/@needle-tools/engine/dist/needle-engine.d.ts';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`Loaded ${lines.length} lines`);
  
  // Search for lines containing WebXR or NeedleXRSession
  lines.forEach((line, i) => {
    if (line.includes('WebXR') || line.includes('XRSession') || line.includes('XRApi')) {
      console.log(`${i + 1}: ${line.trim()}`);
    }
  });
} else {
  console.error("File not found");
}
