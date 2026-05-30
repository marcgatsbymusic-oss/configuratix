import fs from 'fs';

const file = 'node_modules/@needle-tools/engine/lib/engine-components/webxr/WebXR.js';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`Loaded ${lines.length} lines`);
  
  lines.forEach((line, i) => {
    if (line.includes('usePlacementReticle') || line.includes('usePlacementAdjustment') || line.includes('autoPlace')) {
      console.log(`${i + 1}: ${line.trim()}`);
    }
  });
} else {
  console.error("File not found");
}
