import fs from 'fs';

const file = 'node_modules/@needle-tools/engine/lib/engine-components/webxr/WebARSessionRoot.js';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`Loaded ${lines.length} lines`);
  
  for (let i = 240; i < 480; i++) {
    if (lines[i] !== undefined) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
} else {
  console.error("File not found");
}
