import fs from 'fs';

const logPath = 'C:\\Users\\Shadow\\.gemini\\antigravity\\brain\\9af80de1-8f28-4297-8cb7-4eddce15c82b\\.system_generated\\logs\\transcript.jsonl';

const lines = fs.readFileSync(logPath, 'utf8').split('\n');
for (const line of lines) {
  if (!line.trim()) continue;
  if (line.includes('handleZ')) {
    try {
      const data = JSON.parse(line);
      console.log(`Step ${data.step_index}:`);
      const idx = line.indexOf('handleZ');
      console.log(`  Snippet: ...${line.substring(idx - 100, idx + 200)}...`);
    } catch (e) {
      console.log(`Step Parse Error:`);
      const idx = line.indexOf('handleZ');
      console.log(`  Snippet: ...${line.substring(Math.max(0, idx - 100), Math.min(line.length, idx + 200))}...`);
    }
  }
}
