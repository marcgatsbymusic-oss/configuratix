import fs from 'fs';

const file = 'node_modules/@needle-tools/engine/dist/needle-engine.d.ts';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  for (let i = 21839; i < 21970; i++) {
    if (lines[i]) {
      console.log(`${i + 1}: ${lines[i]}`);
    }
  }
} else {
  console.error("File not found");
}
