import fs from 'fs';

const logPath = 'C:\\Users\\Shadow\\...'; // we will write the search directly
// wait, the path of the current log is:
const logPath2 = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath2, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  if (line.includes('sashExtMinX') || line.includes('gskFrmExtMinX')) {
    try {
      const data = JSON.parse(line);
      console.log(`Step ${data.step_index}:`);
      const idx = line.indexOf('sashExtMinX');
      if (idx !== -1) {
        console.log(`  Snippet: ...${line.substring(idx - 100, idx + 200)}...`);
      } else {
        const idx2 = line.indexOf('gskFrmExtMinX');
        console.log(`  Snippet: ...${line.substring(idx2 - 100, idx2 + 200)}...`);
      }
    } catch (e) {
      console.log(`Step Parse Error:`);
      const idx = line.indexOf('sashExtMinX');
      if (idx !== -1) {
        console.log(`  Snippet: ...${line.substring(Math.max(0, idx - 100), Math.min(line.length, idx + 200))}...`);
      }
    }
  }
}
