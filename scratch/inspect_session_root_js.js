import fs from 'fs';
import path from 'path';

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (file.endsWith('.js') && !file.includes('.min.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('class WebARSessionRoot') || content.includes('onApplyPose')) {
        console.log(`Found match in file: ${fullPath}`);
        // Print lines containing onApplyPose or how pose is applied
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (line.includes('onApplyPose') || line.includes('onPlaceScene') || line.includes('updateReticleAndHits')) {
            console.log(`${i + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
}

searchDir('node_modules/@needle-tools/engine');
