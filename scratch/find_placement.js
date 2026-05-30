import fs from 'fs';

const file = 'node_modules/@needle-tools/engine/dist/needle-engine.d.ts';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  console.log(`Loaded ${lines.length} lines`);
  
  lines.forEach((line, i) => {
    const l = line.toLowerCase();
    if (l.includes('place') || l.includes('hittest') || l.includes('raycast')) {
      if (line.includes('export') || line.includes('class ') || line.includes('function ') || line.includes('interface ')) {
        console.log(`${i + 1}: ${line.trim()}`);
      }
    }
  });
} else {
  console.error("File not found");
}
