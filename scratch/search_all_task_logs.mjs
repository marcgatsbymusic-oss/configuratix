import fs from 'fs';
import path from 'path';

const taskLogsDir = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\tasks';

const files = fs.readdirSync(taskLogsDir);
for (const file of files) {
  if (file.endsWith('.log')) {
    const filePath = path.join(taskLogsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('getHandleHeightFromBottom') || content.includes('clonedHandleLeft') || content.includes('leftHandleRef')) {
      console.log(`Found match in task log: ${file} (size: ${content.length} bytes)`);
      // Print some lines around it
      const idx = content.indexOf('clonedHandleLeft');
      if (idx !== -1) {
        console.log(`  Snippet: ...${content.substring(Math.max(0, idx - 100), Math.min(content.length, idx + 300))}...`);
      }
    }
  }
}
