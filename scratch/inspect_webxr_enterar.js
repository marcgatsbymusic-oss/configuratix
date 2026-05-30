import fs from 'fs';

const file = 'node_modules/@needle-tools/engine/lib/engine-components/webxr/WebXR.js';
if (fs.existsSync(file)) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    if (line.includes('enterAR')) {
      console.log(`Found enterAR at line ${i + 1}`);
      for (let j = i - 5; j < i + 15; j++) {
        if (lines[j]) {
          console.log(`${j + 1}: ${lines[j]}`);
        }
      }
    }
  });
} else {
  console.error("File not found");
}
