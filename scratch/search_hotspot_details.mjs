import fs from 'fs';

const logPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  if (line.includes('Html position') || line.includes('onUserInteraction') || line.includes('setLeftState') || line.includes('setRightState')) {
    try {
      const data = JSON.parse(line);
      console.log(`Step ${data.step_index}:`);
      const idx = line.indexOf('Html position');
      if (idx !== -1) {
        console.log(`  Html Snippet: ...${line.substring(idx - 150, idx + 400)}...`);
      } else {
        const idx2 = line.indexOf('onUserInteraction');
        if (idx2 !== -1) {
          console.log(`  onUserInteraction Snippet: ...${line.substring(idx2 - 100, idx2 + 400)}...`);
        } else {
          console.log(`  Other: ...${line.substring(0, 300)}...`);
        }
      }
    } catch (e) {
      // ignore
    }
  }
}
