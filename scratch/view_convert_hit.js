import fs from 'fs';

const file = 'node_modules/@needle-tools/engine/lib/engine/xr/NeedleXRSession.js';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 870; i < 910; i++) {
    if (lines[i] !== undefined) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
} else {
  console.error("File not found");
}
